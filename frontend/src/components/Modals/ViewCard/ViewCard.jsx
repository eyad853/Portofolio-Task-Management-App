import React, { useState, useEffect, useRef } from 'react';
import Modal from 'react-modal';
import axios from 'axios';

const ViewCard = ({fetchColumns,column,setColumns, card, isOpen,kanbanPage, setIsOpen, darkMode }) => {
  // No onUpdate for now - we'll just modify the component to match your structure
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(card?.title || '');
  const [editedDescription, setEditedDescription] = useState(card?.description || '');
  const [editedPriority , setEditedPriority]=useState(card.priority||"")
  const [isEdittinPriorityOpen , setIsEdittingPriorityOpen]=useState(false)
  const edittingProiorityRef = useRef(null)
  useEffect(()=>{
    const handleClickOutside = (e)=>{
      if(edittingProiorityRef.current && !edittingProiorityRef.current.contains(e.target)){
        setIsEdittingPriorityOpen(false)
      }
    }

    document.addEventListener('mousedown' , handleClickOutside)

    return document.removeEventListener('mousedown' , handleClickOutside)
  })

  // Reset form state when modal opens with new card
  useEffect(() => {
    if (card) {
      setEditedTitle(card.title || '');
      setEditedDescription(card.description || '');
      setEditedPriority(card.priority ||"")
    }
  }, [card, isOpen]);

  // Direct close function
  const closeModal = () => {
    setIsOpen(false);
    setIsEditing(false);
  };

  // If modal is placed inside SortableCard, we need to be extra careful about event handling
  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  if (!isOpen || !card) return null;

  const updateCard = async (cardId) => {
    const updatedFields = {};
  
    if(editedTitle!==card.title){
      updatedFields.title=editedTitle
    }
    if(editedDescription!==card.description){
      updatedFields.description=editedDescription
    }
    if(editedPriority!==card.priority){
      updatedFields.priority=editedPriority
    }
  
    if (Object.keys(updatedFields).length === 0) {
      console.log("No fields were changed.");
      return; // Don't send request if nothing changed
    }
  
    try {
      setColumns(prev =>prev.map(col =>col._id === column._id? {...col,cards: col.cards.map(c =>c._id === cardId ? { ...c, ...updatedFields } : c)}: col));
      setIsOpen(false)
      setIsEditing(false)
      const response = await axios.patch(
        `http://localhost:8000/updateItem/${kanbanPage._id}/${cardId}`,updatedFields );
        if(response){
          setEditedTitle(card.title || '');
          setEditedDescription(card.description || '');
          setEditedPriority(card.priority ||"")
        }
      console.log("Update successful:", response.data);
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={(e)=>{
        e.stopPropagation()
        closeModal()
        setIsEdittingPriorityOpen(false)
      }}
      className={`w-[95vw] sm:w-[90vw] md:w-140 h-auto max-h-[90vh] ${darkMode ? "bg-gray-800 text-white" : "bg-white"} p-4 sm:p-6 rounded-xl shadow-xl opacity-100 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 outline-none mx-2 sm:mx-0 overflow-y-auto`}
      overlayClassName="fixed inset-0 bg-gray-500/50 z-50 flex justify-center items-center px-2 sm:px-0"
      shouldCloseOnOverlayClick={true}
      shouldCloseOnEsc={true}
      ariaHideApp={false}
      contentLabel="Card Details"
      parentSelector={() => document.body} // Force the modal to be a child of body
      onClick={stopPropagation} // Stop click events from bubbling to parent components
    >
      <div className="w-full h-full flex flex-col" onClick={stopPropagation}>
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <div className="text-lg sm:text-xl md:text-2xl font-bold">Card Details</div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              closeModal();
            }}
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full hover:${darkMode?"bg-gray-950":"bg-gray-300"} transition-all duration-400 flex items-center justify-center text-sm sm:text-base`}
          >
            X
          </button>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div className="space-y-2">
            <div className="font-medium text-gray-500 dark:text-gray-400 text-sm sm:text-base">Title</div>
            {isEditing ? (
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className={`w-full outline-none p-2 sm:p-3 rounded-md border text-sm sm:text-base ${
                  darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"
                }`}
                onClick={stopPropagation}
              />
            ) : (
              <div className="text-base sm:text-lg font-semibold break-words">{card.title}</div>
            )}
          </div>

          <div className="space-y-2">
            <div className="font-medium text-gray-500 dark:text-gray-400 text-sm sm:text-base">Description</div>
            {isEditing ? (
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className={`w-full outline-none p-2 sm:p-3 hide-scrollbar rounded-md border min-h-20 sm:min-h-24 text-sm sm:text-base resize-none ${
                  darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"
                }`}
                onClick={stopPropagation}
              />
            ) : (
              <div className="text-sm sm:text-base max-h-32 sm:max-h-40 whitespace-pre-wrap overflow-y-scroll hide-scrollbar break-words">{card.description}</div>
            )}
          </div>

          <div className="space-y-2">
            {editedPriority&&<div className="font-medium text-gray-500 dark:text-gray-400 text-sm sm:text-base">Priority</div>}
            <div 
            onClick={()=>{
              setIsEdittingPriorityOpen(prev=>!prev)
            }}
            className="flex relative cursor-pointer items-center">
              {editedPriority&&<div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full mr-2 ${editedPriority?.toLowerCase() === 'high' ? 'bg-red-500' : editedPriority?.toLowerCase() === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>}
              <div className="capitalize font-semibold text-sm sm:text-base">{editedPriority}</div>
              {isEdittinPriorityOpen&&(
                <div ref={edittingProiorityRef} className='absolute w-32 sm:w-40 h-24 sm:h-28 -left-8 sm:-left-10 -bottom-24 sm:-bottom-28 flex-col rounded-2xl flex items-center border border-gray-300 shadow-lg'>
                  <div 
                  onClick={()=>{
                    setEditedPriority("low")
                  }}
                  className={`w-full h-1/3 border-b border-neutral-300 flex rounded-t-md justify-center ${darkMode?"bg-gray-900 hover:bg-gray-950":"bg-white hover:bg-neutral-300"} transition-all duration-300 items-center text-xs sm:text-sm cursor-pointer`}>low</div>
                  <div 
                  onClick={()=>{
                    setEditedPriority("medium")
                  }}
                  className={`w-full h-1/3 border-b border-neutral-300 flex justify-center ${darkMode?"bg-gray-900 hover:bg-gray-950":"bg-white hover:bg-neutral-300"} transition-all duration-300 items-center text-xs sm:text-sm cursor-pointer`}>medium</div>
                  <div 
                  onClick={()=>{
                    setEditedPriority("high")
                  }}
                  className={`w-full h-1/3 flex rounded-b-md justify-center ${darkMode?"bg-gray-900 hover:bg-gray-950":"bg-white hover:bg-neutral-300"} transition-all duration-300 items-center text-xs sm:text-sm cursor-pointer`}>high</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-end gap-2 sm:gap-0">
          {isEditing ? (
            <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2 sm:space-y-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(false);
                }}
                className={`w-full sm:w-auto px-4 py-2 rounded-md text-sm sm:text-base order-2 sm:order-1 ${
                  darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateCard(card._id)
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-sm sm:text-base order-1 sm:order-2"
              >
                Save
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className={`w-full sm:w-auto px-4 py-2 rounded-md text-sm sm:text-base ${
                darkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-500 hover:bg-blue-600"
              } text-white`}
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ViewCard