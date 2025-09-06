import React, { useState } from 'react'
import Modal from "react-modal"
import { IoMdCheckmark } from "react-icons/io";
import { FcTodoList } from "react-icons/fc";
import { FaRegCalendarAlt } from "react-icons/fa";
import { MdDriveFileRenameOutline, MdOutlineViewKanban } from "react-icons/md";
import { FaNoteSticky } from "react-icons/fa6";
import axios from 'axios';

const PagesModal = ({
  isPagesOpen , 
  setIsPagesOpen,
  name,
  setName,
  type,
  setType,
  icon,
  setIcon,
  color,
  setColor,
  darkMode,
  fetchPages,
  pages,
  setPages
}) => {

  const handleSubmit = async () => {
    const tempId = Date.now().toString(); // simple and fast
    const newPage = {
      _id: tempId, // temporary
      name,
      type,
      icon,
      color
    }
  
    try {
      setPages(prev=>[...prev , newPage])
      setName("")
      setType("")
      setIcon("")
      setColor("")
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/createPage`, newPage , {withCredentials:true})
  
      const realPage = response.data.newPage;
      setPages(prev =>prev.map(p => p._id === tempId ? realPage : p));
    } catch (error) {
      console.log(error)
    }
  }


  return (
<Modal
  isOpen={isPagesOpen}
  onRequestClose={() => setIsPagesOpen(false)}
  className={`w-[90vw] sm:w-96 md:w-111 h-auto max-h-[90vh] ${darkMode?"bg-gray-800 text-white":"bg-white"} p-4 sm:p-6 rounded-xl shadow-xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 outline-none mx-4 sm:mx-0 overflow-y-auto`}
  overlayClassName="fixed inset-0 bg-gray-500/50 z-50 flex justify-center items-center px-4 sm:px-0"
  shouldCloseOnOverlayClick={true}
  shouldCloseOnEsc={true}
>
  <div className='w-full h-full flex flex-col'>
    {/* name */}
    <div className='w-full flex h-10 sm:h-12 rounded-md mt-3 sm:mt-5 border border-gray-400'>
      <div className='h-full w-12 sm:w-16 flex justify-center items-center text-lg sm:text-xl'>
          < MdDriveFileRenameOutline/>
      </div>
      <input 
      type="text" 
      className={`flex-1 h-full rounded-md text-sm sm:text-base ${darkMode?"bg-gray-800":""}  outline-none px-2`} 
      value={name}
      onChange={({target})=>{
        setName(target.value)
      }}
      placeholder='Page Name ...'/>
    </div>

    {/* type */}
    <div className='flex flex-col mt-4 sm:mt-3'>
      <div className='w-full flex items-center justify-start gap-3 sm:gap-4 h-10 sm:h-12'>
        <div 
        onClick={()=>{
          setType("todo")
        }}
        className={`w-4 h-4 sm:w-5 sm:h-5 rounded-md  ${type === "todo"? "bg-blue-600 text-white" : "border border-gray-700 text-black"} transition-all duration-200 flex justify-center items-center cursor-pointer`}>{type==="todo"?(
          <IoMdCheckmark className="text-xs sm:text-sm" />
        ):null}</div>
        <div className='font-bold text-sm sm:text-base'>Todo</div>
      </div>
      <div className='w-full flex items-center justify-start gap-3 sm:gap-4 h-10 sm:h-12'>
        <div 
        onClick={()=>{
          setType("calendar")
        }}
        className={`w-4 h-4 sm:w-5 sm:h-5 rounded-md  ${type === "calendar"? "bg-blue-600 text-white" : "border border-gray-700 text-black"} transition-all duration-200 flex justify-center items-center cursor-pointer`}>{type==="calendar"?(
          <IoMdCheckmark className="text-xs sm:text-sm" />
        ):null}</div>
        <div className='font-bold text-sm sm:text-base'>Calendar</div>
      </div>
      <div className='w-full flex items-center justify-start gap-3 sm:gap-4 h-10 sm:h-12'>
        <div 
        onClick={()=>{
          setType("kanban")
        }}
        className={`w-4 h-4 sm:w-5 sm:h-5 rounded-md  ${type === "kanban"? "bg-blue-600 text-white" : "border border-gray-700 text-black"} transition-all duration-200 flex justify-center items-center cursor-pointer`}>{type==="kanban"?(
          <IoMdCheckmark className="text-xs sm:text-sm" />
        ):null}</div>
        <div className='font-bold text-sm sm:text-base'>Kanban</div>
      </div>
      <div className='w-full flex items-center justify-start gap-3 sm:gap-4 h-10 sm:h-12'>
        <div 
        onClick={()=>{
          setType("notes")
        }}
        className={`w-4 h-4 sm:w-5 sm:h-5 rounded-md  ${type === "notes"? "bg-blue-600 text-white" : "border border-gray-700 text-black"} transition-all duration-200 flex justify-center items-center cursor-pointer`}>{type==="notes"?(
          <IoMdCheckmark className="text-xs sm:text-sm" />
        ):null}</div>
        <div className='font-bold text-sm sm:text-base'>Notes</div>
      </div>
    </div>

    {/*icon  */}
    {/* submit */}
    <div 
    onClick={()=>{
      handleSubmit()
      setIsPagesOpen(false)
    }}
    className='w-full mt-6 sm:mt-10 h-10 sm:h-12 text-base sm:text-xl font-bold text-white transform hover:scale-105 transition-all duration-200 bg-blue-600 rounded-md flex justify-center items-center cursor-pointer'>
        Create Page
    </div>
  </div>
</Modal>
  )
}

export default PagesModal