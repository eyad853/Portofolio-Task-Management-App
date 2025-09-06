import React, { useEffect, useRef, useState } from 'react'
import { FaAngleDown } from 'react-icons/fa6'
import { MdDriveFileRenameOutline } from 'react-icons/md'
import Modal from "react-modal"
import axios from 'axios'
import { FaTasks } from 'react-icons/fa'

const UpdateTodoModal = ({
    isUpdateTodoModal,
    name ,
    setTasks,
    tasks,
    setName,
    discription ,
    setDiscription,
    estimation,
    setEstimation,
    priority ,
    setPriority,
    setOpenTodoId,
    task,
    darkMode,
    todoPage,
    fetchTodos,
    selectedPageId,
    setIsUpdateTodoModal}) => {
        const [isSelectBoxOpen , setISSelectBoxOpen]=useState(false)
        const estimationRef = useRef(null);
        const [editedName , setEditedName]=useState('')
        const [editedDescription , setEditedDescription]=useState("")
        const [editedEstimation , setEditedEstimation]=useState("")
        const [editedPriority , setEditedPriority]=useState("")

        useEffect(()=>{
          setEditedName(name||'')
          setEditedDescription(discription||"")
          setEditedEstimation(estimation||'')
          setEditedPriority(priority||'')
        },[name , discription , priority , estimation])

        const formatEstimation = (rawValue) => {
          const digits = rawValue.replace(/\D/g, "").slice(0, 16);
          let result = "";
        
          for (let i = 0; i < digits.length; i++) {
            result += digits[i];
        
            if (i === 1 || i === 3) result += "/";
            if (i === 7) result += " - ";
            if (i === 9 || i === 11) result += "/";
          }
        
          return result;
        };

      const updateTodoFields = async (todoId) => {
        const updatedFields = {};
      
        if (editedName !== name) {
          updatedFields.name = editedName;
        }
      
        if (editedDescription !== discription) {
          updatedFields.discription = editedDescription;
        }
      
        if (editedEstimation !== estimation) {
          updatedFields.estimation = editedEstimation;
        }
      
        if (editedPriority !== priority) {
          updatedFields.priority = editedPriority;
        }
      
        if (Object.keys(updatedFields).length === 0) {
          console.log("No fields were changed.");
          return; // Don't send request if nothing changed
        }

        try {
          setTasks(prevTasks =>prevTasks.map(task =>  task._id === todoId ? { ...task, ...updatedFields } : task));
          setIsUpdateTodoModal(false)
          const response = await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/updateItem/${todoPage._id}/${todoId}`,updatedFields );
            if(response){
              setEditedName(name||'')
              setEditedDescription(discription||"")
              setEditedEstimation(estimation||'')
              setEditedPriority(priority||'')
            }
          console.log("Update successful:", response.data);
        } catch (error) {
          console.error("Update failed:", error);
        }
      };
  return (
    <Modal
    isOpen={isUpdateTodoModal}
    onRequestClose={() =>{ 
        setIsUpdateTodoModal(false)  // Close the select box when modal closes
        setOpenTodoId(null)
    }}
    className={`w-[95vw] sm:w-[90vw] md:w-150 h-auto max-h-[90vh] ${darkMode?"bg-gray-800 text-white":"bg-white"} p-4 sm:p-6 rounded-xl shadow-xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 outline-none mx-2 sm:mx-0 overflow-y-auto`}
    overlayClassName="fixed inset-0 bg-gray-500/50 z-50 flex justify-center items-center px-2 sm:px-0"
    shouldCloseOnOverlayClick={true}
    shouldCloseOnEsc={true}>
        <div className='w-full h-full flex flex-col'>
        
                <div className='text-lg sm:text-xl font-medium mb-2'>Todo Name :</div>
                <div className='flex w-full h-10 sm:h-12 rounded-md mb-4 sm:mb-5 border border-gray-300'>
                    <div className="w-8 sm:w-10 rounded-l-md h-full flex justify-center items-center text-sm sm:text-base">
                        < MdDriveFileRenameOutline/>
                    </div>
                    <div className="h-full flex-1 rounded-r-md">
                        <input 
                        type="text" 
                        className='w-full rounded-r-md h-full outline-none text-sm sm:text-base px-2' 
                        placeholder='name'
                        value={editedName}
                        onChange={({target})=>{
                        setEditedName(target.value)
                        }}
                        />
                    </div>
                </div>
        
                <div className='text-lg sm:text-xl font-medium mb-2'>Description :</div>
                <div className='flex w-full h-16 sm:h-20 border border-gray-300 rounded-md mb-4 sm:mb-5'>
                    <div className="w-8 sm:w-10 rounded-l-md h-full flex justify-center items-start pt-2 text-sm sm:text-base">
                        < MdDriveFileRenameOutline/>
                    </div>
                      <div className="h-full flex-1 rounded-r-md">
                        <textarea 
                        className='w-full h-full outline-none overflow-auto hide-scrollbar text-sm sm:text-base p-2 resize-none'
                        placeholder='Task description...'
                        value={editedDescription}
                        onChange={({target})=>{
                          setEditedDescription(target.value)
                        }}
                        />
                      </div>
                  </div>
        
                  <div className='text-lg sm:text-xl font-medium mb-2'>Estimation :</div>
                  <div className='flex w-full border border-gray-300 h-10 sm:h-12 rounded-md mb-4 sm:mb-5'>
                      <div className="w-8 sm:w-10 rounded-l-md h-full flex justify-center items-center text-sm sm:text-base">
                        < MdDriveFileRenameOutline/>
                      </div>
                      <div className="h-full flex-1 rounded-r-md">
                        <input 
                        type="text" 
                        ref={estimationRef}
                        className='w-full h-full outline-none text-sm sm:text-base px-2' 
                        placeholder='DD/MM/YYYY - DD/MM/YYYY'
                        value={editedEstimation}
                        onChange={(e) => {
                          const rawValue = e.target.value;
                          const formatted = formatEstimation(rawValue);
                          setEditedEstimation(formatted);
                        
                          // move cursor after auto-formatting
                          const input = estimationRef.current;
                          if (input) {
                            const newPos = formatted.length;
                            input.setSelectionRange(newPos, newPos);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace') {
                            const input = estimationRef.current;
                            const pos = input.selectionStart;
                          
                            // Prevent stopping at "/" or "-"
                            const prevChar = estimation[pos - 1];
                            if (prevChar === "/" || prevChar === " " || prevChar === "-") {
                              e.preventDefault();
                              input.setSelectionRange(pos - 1, pos - 1);
                            }
                          }
                        }}
                        onPaste={(e) => e.preventDefault()}
                      />
                      </div>
                  </div>
        
                  <div className='text-lg sm:text-xl font-medium mb-2'>Priority :</div>
                  <div className='flex w-full border border-gray-300 h-10 sm:h-12 rounded-md mb-4 sm:mb-5'>
                      <div className="w-8 sm:w-10 rounded-l-md h-full flex justify-center items-center text-sm sm:text-base">
                        < MdDriveFileRenameOutline/>
                      </div>
                      <div className="h-full flex-1 rounded-r-md">
                          <div 
                          onClick={()=>{
                            setISSelectBoxOpen(prev => !prev)
                          }}
                          className='w-full h-full relative flex justify-between items-center px-2 cursor-pointer text-sm sm:text-base'>
                            {editedPriority}
                            <div className='mr-1 sm:mr-2'>
                              <FaAngleDown />
                            </div>
                              {isSelectBoxOpen&&(
                                <div className={`absolute w-full flex flex-col ${darkMode?"bg-gray-900":"bg-white"} border border-gray-300 h-32 sm:h-36 -bottom-32 sm:-bottom-34 rounded-md right-0 sm:right-3.5 z-10 text-sm sm:text-base`}>
                                  <div 
                                    onClick={()=>{
                                      setEditedPriority("low")
                                    }}
                                    className={`flex ${darkMode?"bg-gray-900 hover:bg-gray-950":"bg-white hover:bg-neutral-300"} cursor-pointer transition-all duration-200 border-b border-gray-300 justify-center h-1/3 items-center w-full`}>
                                    low
                                  </div>
                                  <div 
                                  onClick={()=>{
                                    setEditedPriority("medium")
                                  }}
                                  className={`flex ${darkMode?"bg-gray-900 hover:bg-gray-950":"bg-white hover:bg-neutral-300"} cursor-pointer transition-all duration-200 border-b border-gray-300 justify-center h-1/3 items-center w-full`}>
                                    medium
                                  </div>
                                  <div 
                                  onClick={()=>{
                                    setEditedPriority("high")
                                  }}
                                  className={`flex ${darkMode?"bg-gray-900 hover:bg-gray-950":"bg-white hover:bg-neutral-300"} cursor-pointer transition-all duration-200 justify-center items-center h-1/3 w-full`}>
                                    high
                                  </div>
                              </div>)}
                          </div>
                      </div>
                  </div>
        
                <div className="flex flex-col sm:flex-row justify-center sm:justify-around items-center mx-auto w-full sm:w-80 gap-3 sm:gap-0 h-auto sm:h-10">
                    <div 
                    onClick={() => {
                      console.log(task._id);
                      console.log(todoPage._id);
                    updateTodoFields(task._id)
                  }}
                    className="w-full sm:w-32 h-10 sm:h-full cursor-pointer bg-blue-600 text-white flex justify-center items-center rounded-md transform hover:scale-105 transition-all duration-200 font-semibold text-sm sm:text-base">Save</div>
                    <div 
                    onClick={()=>{
                        setIsUpdateTodoModal(false);
                        setOpenTodoId(null);
                        setName(task.name);
                        setDiscription(task.discription);
                        setEstimation(task.estimation);
                        setPriority(task.priority);
                    }}
                    className="w-full sm:w-32 h-10 sm:h-full cursor-pointer bg-red-600 text-white flex justify-center items-center rounded-md transform hover:scale-105 transition-all duration-200 font-semibold text-sm sm:text-base">Cancel</div>
                </div>
            </div>
    </Modal>
  )
}

export default UpdateTodoModal