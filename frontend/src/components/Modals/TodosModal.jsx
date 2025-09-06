import React, { useEffect, useRef, useState } from 'react'
import Modal from 'react-modal'
import { MdDriveFileRenameOutline } from "react-icons/md";
import { FaAngleDown } from "react-icons/fa";
import axios from 'axios';

const TodosModal = ({
  isTodosModalOpen , 
  pages , 
  setPages , 
  setIsTodosModalOpen ,
  isFriendsModalOpen , 
  setIsFriendsModalOpen,
  selectedPageId,
  darkMode,
  setTasks
}) => {
    const [isSelectBoxOpen , setISSelectBoxOpen]=useState(false)

    const [name , setName]=useState("")
    const [discription , setDiscription]=useState("")
    const [estimation, setEstimation]=useState("")
    const estimationRef = useRef(null);
    const priorityRef = useRef(null)
    const [priority , setPriority]=useState("medium")

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


    const handleAddTodo = async () => {
      const todoPage = pages.find(page => page._id === selectedPageId)
      if (!todoPage) return console.error("Todo page not found")
    
      const task = {
        _id: crypto.randomUUID(),
        name,
        discription,
        estimation,
        priority,
        people:[],
        done:false,
        onProgress:false,
        createdAt: new Date()
      }
    
      try {
        setTasks(prev => [...prev, task])
        setIsTodosModalOpen(false);
        setName("");
        setDiscription("");
        setEstimation("");
        setPriority("");
        const response =await axios.put(`${import.meta.env.VITE_BACKEND_URL}/updatePage/${todoPage._id}`, {
          task
        })
      } catch (error) {
        console.error(error)
      }
    }

    useEffect(() => {
      // Don't return early - instead, only add the listener when needed
      if (isTodosModalOpen) {
        const clickOutSide = (e) => {
          if (priorityRef.current && !priorityRef.current.contains(e.target)) {
            setISSelectBoxOpen(false);
          }
        };
    
        document.addEventListener("mousedown", clickOutSide);
    
        return () => {
          document.removeEventListener("mousedown", clickOutSide);
        };
      }
      // Empty return function when modal is not open
      return () => {};
    }, [isTodosModalOpen]); // Always include isTodosModalOpen in dependency array
  return (
    <Modal
    isOpen={isTodosModalOpen}
    onRequestClose={() =>{ 
      setIsTodosModalOpen(false)
      setISSelectBoxOpen(false)  // Close the select box when modal closes
    }}
    className={`w-[95vw] sm:w-[90vw] md:w-150 h-auto max-h-[95vh] ${darkMode?"bg-gray-800 text-white":"bg-white"} p-4 sm:p-6 rounded-xl shadow-xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 outline-none mx-2 sm:mx-0 `}
    overlayClassName="fixed inset-0 bg-gray-500/50 z-50 flex justify-center items-center px-2 sm:px-0"
    shouldCloseOnOverlayClick={true}
    shouldCloseOnEsc={true}
    >
        <div className='w-full h-full flex flex-col'>

          <div className='text-lg sm:text-xl font-medium mb-2'>Todo Name :</div>
          <div className={`flex w-full h-10 sm:h-12 ${darkMode?"bg-gray-900":"bg-white"} rounded-md mb-4 sm:mb-5 border border-gray-300`}>
            <div className="w-8 sm:w-10 rounded-l-md h-full flex justify-center items-center text-sm sm:text-base">
              < MdDriveFileRenameOutline/>
            </div>
            <div className="h-full flex-1 rounded-r-md">
              <input 
              type="text" 
              className={`w-full rounded-r-md h-full outline-none text-sm sm:text-base px-2`}
              placeholder='name'
              value={name}
              onChange={({target})=>{
                setName(target.value)
              }}
              />
            </div>
          </div>

          <div className='text-lg sm:text-xl font-medium mb-2'>Description :</div>
          <div className={`flex w-full h-16 sm:h-20 ${darkMode?"bg-gray-900":"bg-white"} border border-gray-300 rounded-md mb-4 sm:mb-5`}>
              <div className="w-8 sm:w-10 rounded-l-md h-full flex justify-center items-start pt-2 text-sm sm:text-base">
                < MdDriveFileRenameOutline/>
              </div>
              <div className="h-full flex-1 rounded-r-md">
                <textarea 
                className='w-full h-full outline-none overflow-auto hide-scrollbar text-sm sm:text-base p-2 resize-none'
                placeholder='Task description...'
                value={discription}
                onChange={({target})=>{
                  setDiscription(target.value)
                }}
                />
              </div>
          </div>

          <div className='text-lg sm:text-xl font-medium mb-2'>Estimation :</div>
          <div className={`flex w-full border ${darkMode?"bg-gray-900":"bg-white"} border-gray-300 h-10 sm:h-12 rounded-md mb-4 sm:mb-5`}>
              <div className="w-8 sm:w-10 rounded-l-md h-full flex justify-center items-center text-sm sm:text-base">
                < MdDriveFileRenameOutline/>
              </div>
              <div className="h-full flex-1 rounded-r-md">
              <input 
              type="text" 
              ref={estimationRef}
              className={`w-full h-full outline-none text-sm sm:text-base px-2`} 
              placeholder='DD/MM/YYYY - DD/MM/YYYY'
              value={estimation}
              onChange={(e) => {
                const rawValue = e.target.value;
                const formatted = formatEstimation(rawValue);
                setEstimation(formatted);
              
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
          <div className={`flex w-full border ${darkMode?"bg-gray-900":"bg-white"} border-gray-300 h-10 sm:h-12 rounded-md mb-4 sm:mb-5`}>
              <div className="w-8 sm:w-10 rounded-l-md h-full flex justify-center items-center text-sm sm:text-base">
                < MdDriveFileRenameOutline/>
              </div>
              <div className="h-full flex-1 rounded-r-md">
                  <div 
                  onClick={()=>{
                    setISSelectBoxOpen(prev => !prev)
                  }}
                  ref={priorityRef}
                  className='w-full h-full relative flex justify-between items-center px-2 cursor-pointer text-sm sm:text-base'>
                    {priority}
                    <div className='mr-1 sm:mr-2'>
                      <FaAngleDown />
                    </div>
                      {isSelectBoxOpen&&(<div className={`absolute w-full flex flex-col border border-gray-300 h-32 sm:h-36 -bottom-32 sm:-bottom-34 rounded-md right-0 sm:right-3.5 ${darkMode?"bg-gray-900":"bg-white"} z-10 text-sm sm:text-base`}>
                          <div 
                            onClick={()=>{
                              setPriority("low")
                            }}
                            className={`flex ${darkMode?"bg-gray-900 hover:bg-gray-950":"bg-white hover:bg-neutral-300"} cursor-pointer transition-all duration-200 border-b border-gray-300 justify-center h-1/3 items-center w-full`}>
                            low
                          </div>
                          <div 
                          onClick={()=>{
                            setPriority("medium")
                          }}
                          className={`flex ${darkMode?"bg-gray-900 hover:bg-gray-950":"bg-white hover:bg-neutral-300"} cursor-pointer transition-all duration-200 border-b border-gray-300 justify-center h-1/3 items-center w-full`}>
                            medium
                          </div>
                          <div 
                          onClick={()=>{
                            setPriority("high")
                          }}
                          className={`flex ${darkMode?"bg-gray-900 hover:bg-gray-950":"bg-white hover:bg-neutral-300"} cursor-pointer transition-all duration-200 justify-center items-center h-1/3 w-full`}>
                            high
                          </div>
                      </div>)}
                  </div>
              </div>
          </div>

          <div 
          onClick={()=>{
            handleAddTodo()
          }}
          className='w-full sm:w-80 mx-auto cursor-pointer h-10 sm:h-12 mt-2 sm:mt-3 flex justify-center items-center bg-gradient-to-b from-blue-500 to-blue-600 rounded-xl transform hover:scale-105 transition-all duration-300 text-sm sm:text-base font-medium text-white'>
            Add Task
          </div>

        </div>
    </Modal>
  )
}

export default TodosModal