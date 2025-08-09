import React, { useState, useEffect } from 'react'
import Modal from "react-modal"
import axios from 'axios'

const ViewModal = ({setNotes,viewNote,notesPage, setViewNote, darkMode, selectedNote, fetchNotes}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [editedCategory, setEditedCategory] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedNote) {
      setEditedTitle(selectedNote.title || '');
      setEditedContent(selectedNote.content || '');
      setEditedCategory(selectedNote.category || []);
    }
  }, [selectedNote]);

  const handleAddCategory = () => {
    if (newCategory.trim() && !editedCategory.includes(newCategory.trim())) {
      setEditedCategory([...editedCategory, newCategory.trim()]);
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (categoryToRemove) => {
    setEditedCategory(editedCategory.filter(cat => cat !== categoryToRemove));
  };

  const handleSaveChanges = async () => {
    if (!selectedNote) return; 
    
    setLoading(true);
    try {
      await axios.put(`http://localhost:8000/updateItem/${notesPage._id}/${selectedNote._id}`, {
        title: editedTitle,
        content: editedContent,
        category: editedCategory
      });
      
      setIsEditing(false);
      fetchNotes();
      setViewNote(false);
    } catch (error) {
      console.error("Failed to update note:", error);
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = () => {
    if (!selectedNote) return false;
    
    return (
      editedTitle !== selectedNote.title ||
      editedContent !== selectedNote.content ||
      JSON.stringify(editedCategory) !== JSON.stringify(selectedNote.category)
    );
  };

  const updateNote = async (noteId) => {
    const updatedFields = {};
  
    if (editedTitle !== selectedNote.title) {
      updatedFields.title = editedTitle;
    }
  
    if (editedContent !== selectedNote.content) {
      updatedFields.content = editedContent;
    }
  
    if (JSON.stringify(editedCategory) !== JSON.stringify(selectedNote.category)) {
      updatedFields.category = editedCategory;
    }
  
    if (Object.keys(updatedFields).length === 0) {
      console.log("No fields were changed.");
      return;
    }
  
    setLoading(true);
    try {
      setNotes(prev=>prev.map(note=>note._id===noteId?{...note , ...updatedFields} :note))
      setViewNote(false);
      const response = await axios.patch(
        `http://localhost:8000/updateItem/${notesPage._id}/${noteId}`, updatedFields);
  
      if (response) {
        setIsEditing(false);
      }
  
      console.log("Update successful:", response.data);
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={viewNote}
      onRequestClose={() => { 
        setViewNote(false);
        setIsEditing(false);
      }}
      className={`w-[95vw] sm:w-[90vw] md:w-140 h-auto max-h-[90vh] ${darkMode ? "bg-gray-800 text-white" : "bg-white"} p-4 sm:p-6 rounded-xl shadow-xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 outline-none mx-2 sm:mx-0 overflow-y-auto`}
      overlayClassName="fixed inset-0 bg-gray-500/50 z-50 flex justify-center items-center px-2 sm:px-0"
      shouldCloseOnOverlayClick={true}
      shouldCloseOnEsc={true}
    >
      <div className='w-full h-full flex flex-col'>
        {/* Title */}
        <div className='w-full mb-3 sm:mb-4'>
          {isEditing ? (
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className={`w-full p-2 sm:p-3 text-lg sm:text-xl outline-none font-bold rounded border ${darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
            />
          ) : (
            <div className='w-full min-h-10 text-xl sm:text-2xl md:text-3xl flex-wrap break-all flex items-center font-bold leading-tight'>
              {selectedNote?.title}
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className='w-full mb-4'>
          {isEditing ? (
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className={`w-full p-2 sm:p-3 outline-none min-h-32 sm:min-h-40 hide-scrollbar rounded border text-sm sm:text-base ${darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
            />
          ) : (
            <div className='w-full h-auto max-h-48 sm:max-h-60 overflow-y-scroll hide-scrollbar mt-2 sm:mt-2.5 font-semibold text-sm sm:text-base leading-relaxed'>
              {selectedNote?.content}
            </div>
          )}
        </div>
        
        {/* Categories */}
        <div className='w-full mb-4 sm:mb-6'>
          {isEditing ? (
            <div className='mb-2'>
              <div className='flex flex-wrap items-center'>
                {editedCategory.map(cat => (
                  <div 
                    key={cat} 
                    className={`px-2 sm:px-3 mr-2 mb-2 py-1 sm:py-2 flex items-center ${darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"} text-xs sm:text-sm rounded-md border`}
                  >
                    <span className="mr-1 sm:mr-2">{cat}</span>
                    <button 
                      onClick={() => handleRemoveCategory(cat)}
                      className="text-red-500 hover:text-red-700 text-sm sm:text-base font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className='flex'>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Add category"
                  className={`flex-grow p-2 sm:p-3 outline-none rounded-l border text-sm sm:text-base ${darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"}`}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                />
                <button
                  onClick={handleAddCategory}
                  className={`px-3 sm:px-4 py-2 sm:py-3 rounded-r text-sm sm:text-base ${darkMode ? "bg-gray-600 hover:bg-gray-500" : "bg-gray-200 hover:bg-gray-300"}`}
                >
                  Add
                </button>
              </div>
            </div>
          ) : (
            <div className='w-full min-h-8 sm:min-h-10 mt-2 sm:mt-2.5 overflow-x-scroll flex items-center hide-scrollbar gap-2'>
              {selectedNote?.category && selectedNote.category.length > 0 && (
                selectedNote.category.map(cat => (
                  <div key={cat} className={`px-2 sm:px-3 py-1 sm:py-2 whitespace-nowrap ${darkMode ? "bg-gray-900 border-white" : "bg-gray-100 border-gray-300"} text-xs sm:text-sm rounded-md border border-gray-300`}>
                    {cat}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        
        {/* Action buttons */}
        <div className='w-full flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 sm:space-x-0'>
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className={`w-full sm:w-auto px-4 py-2 sm:py-2 rounded text-sm sm:text-base order-2 sm:order-1 ${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"}`}
              >
                Cancel
              </button>
              <button
                onClick={()=>{
                handleSaveChanges()
                updateNote(selectedNote._id)
              }}
                disabled={!hasChanges() || loading}
                className={`w-full sm:w-auto px-4 py-2 sm:py-2 rounded text-white text-sm sm:text-base order-1 sm:order-2 ${
                  hasChanges() && !loading 
                    ? "bg-blue-600 hover:bg-blue-700" 
                    : "bg-blue-400 cursor-not-allowed"
                }`}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className={`w-full sm:w-auto px-4 py-2 sm:py-2 rounded text-sm sm:text-base ${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"}`}
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default ViewModal