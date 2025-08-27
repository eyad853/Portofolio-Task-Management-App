import axios from 'axios'
import React, { useState } from 'react'
import { FaPlus } from 'react-icons/fa'
import { MdDriveFileRenameOutline } from 'react-icons/md'
import Modal from "react-modal"

const NotesModal = ({
    isNotesModalOpen,
    setIsNotesModalOpen,
    pages,
    fetchNotes,
    darkMode,
    selectedPageId,
    setNotes
}) => {
    const [title , setTitle]=useState("")
    const [content , setContent]=useState("")
    const [category , setCategory]=useState([])
    const [categoryInput, setCategoryInput] = useState("")

    const handleAddCategory = () => {
        if (categoryInput.trim() !== "") {
            setCategory(prev => [...prev, categoryInput.trim()])
            setCategoryInput("") // clear input after adding
        }
    }

    const handleSubmit = async()=>{
        const notesPage =  pages.find(page => page._id === selectedPageId)
        if (!notesPage) return console.error("notes page not found")
        const note = {
            _id:crypto.randomUUID(),
            title,
            content,
            category,
            createdAt: new Date()

        }
        try{
            setNotes(prev=>[...prev , note])
            setIsNotesModalOpen(false)
            const response = await axios.put(`http://localhost:8000/updatePage/${notesPage._id}`, {
                note
        })
        if(response){
            setTitle("")
            setContent("")
            setCategory([])
            setCategoryInput("")
        }
        }catch(error){
            console.log(error);
        }
    }

  return (
     <Modal
        isOpen={isNotesModalOpen}
        onRequestClose={() =>{ 
            setIsNotesModalOpen(false)  // Close the select box when modal closes
        }}
        className={`w-[95vw] sm:w-[90vw] md:w-140 h-[90vh] sm:h-140 ${darkMode?"bg-gray-800 text-white":"bg-white"} p-4 sm:p-6 rounded-xl shadow-xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 outline-none mx-2 sm:mx-0`}
        overlayClassName="fixed inset-0 bg-gray-500/50 z-50 flex justify-center items-center px-2 sm:px-0"
        shouldCloseOnOverlayClick={true}
        shouldCloseOnEsc={true}
        >
            <div className='w-full h-full flex flex-col'>
                {/* Title */}
                <div className={`w-full h-10 sm:h-12 rounded-md flex border ${darkMode?" border-white":"border-neutral-400"} mb-3 sm:mb-0`}>
                    <div className="w-8 sm:w-10 rounded-l-md h-full flex justify-center items-center text-sm sm:text-base">
                        <MdDriveFileRenameOutline />
                    </div>
                    <div className="h-full flex-1">
                        <input
                            type="text"
                            className='w-full h-full outline-none rounded-r-md px-2 text-sm sm:text-base'
                            placeholder='title'
                            value={title}
                            onChange={({ target }) => setTitle(target.value)}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className={`w-full flex-1 mt-3 sm:mt-5 rounded-md border ${darkMode?" border-white":"border-neutral-400"} mb-3 sm:mb-1`}>
                    <textarea
                        placeholder='content'
                        value={content}
                        onChange={({ target }) => setContent(target.value)}
                        className='w-full h-full outline-none rounded-md p-2 sm:p-3 resize-none text-sm sm:text-base'
                    ></textarea>
                </div>

                {/* Category */}
                <div className='h-auto sm:h-16 flex flex-col sm:flex-row gap-2 sm:gap-0 justify-between items-start sm:items-center mb-3 sm:mb-0'>
                    <div className='w-full sm:w-auto h-10 flex gap-1.5'>
                        <input
                            type="text"
                            value={categoryInput}
                            onChange={(e) => setCategoryInput(e.target.value)}
                            className={`flex-1 sm:w-auto border h-full ${darkMode?"bg-gray-900 border-white":"bg-gray-100 border-neutral-400"} outline-none rounded-md px-2 text-sm sm:text-base`}
                            placeholder='Add category'
                        />
                        <div 
                        onClick={handleAddCategory}
                        className={`w-12 sm:w-16 h-10 border ${darkMode?"border-white bg-gray-900 text-white":"border-neutral-400 text-gray-400"} hover:scale-105 transition-all duration-200 flex justify-center items-center rounded-md cursor-pointer`}>
                            <FaPlus className="text-xs sm:text-sm" />
                        </div>
                    </div>
                    <div className='flex flex-1 w-full sm:w-auto overflow-x-auto hide-scrollbar gap-1 sm:gap-0'>
                    {category.map((cat, i) => (
                            <div key={i} className={`px-2 py-1 ml-0 sm:ml-2 whitespace-nowrap ${darkMode?"bg-gray-900 border-white":"bg-gray-100 border-gray-300"} text-xs sm:text-sm rounded-md border`}>
                                {cat}
                            </div>
                        ))}
                    </div>
                </div>
                <div className='w-full flex justify-center items-center h-10 sm:h-12 mt-2 sm:mt-0'>
                        <div 
                        onClick={()=>{
                            handleSubmit()
                        }}
                        className='w-full sm:w-40 cursor-pointer h-full flex justify-center items-center rounded-md font-semibold transform hover:scale-105 transition-all duration-200 bg-blue-500 text-white text-sm sm:text-base'>Save</div>
                </div>
            </div>
        </Modal>
  )
}

export default NotesModal