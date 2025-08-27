import axios from 'axios'
import React, { useState } from 'react'
import { MdDriveFileRenameOutline } from 'react-icons/md'
import Modal from "react-modal"
import KanbanPage from '../../pages/PagesMainPage/KanbanPage'
import ColorWheel from '../ColorWheel/ColorWheel'

const CartsModal = ({setColumns,pages,isCartsModalOpen,selectedCard , darkMode ,fetchColumns , selectedColumn,setIsCartsModalOpen , selectedPageId}) => {
  const [title , setTitle]=useState("")
  const [description , setDiscription]=useState("")
  const [priority , setPriority]=useState("")
  const [selectedCardColor , setSelectedCardColor]=useState('#000000')
  const kanbanPage = pages.find(page => page._id === selectedPageId)
  if (!kanbanPage) return console.error("Todo page not found")

    const addCard = async(columnId) => {
      const card = {
        _id: crypto.randomUUID(),
        title,
        description,
        priority,
        color: selectedCardColor
      }
    
      try {
        setColumns(prev =>prev.map(col =>col._id === columnId? { ...col, cards: [...col.cards, card] }: col));
        setIsCartsModalOpen(false)
        setTitle("")
        setDiscription("")
        setPriority("")
        const response = await axios.post(
          `http://localhost:8000/addCard/${kanbanPage._id}/${columnId}`, 
          { card }  // Send as { card: card }
        );
        
      } catch(error) {
        console.log(error);
      }
    }
  return (
 <Modal
        isOpen={isCartsModalOpen}
        onRequestClose={() =>{ 
            setIsCartsModalOpen(false)  // Close the select box when modal closes
        }}
        className={`w-[95vw] sm:w-[90vw] md:w-180 h-auto max-h-[90vh] hide-scrollbar ${darkMode?"bg-gray-800 text-white":'bg-white'} p-4 sm:p-6 rounded-xl shadow-xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 outline-none mx-2 sm:mx-0 overflow-y-auto`}
        overlayClassName="fixed inset-0 bg-gray-500/50 z-50 flex justify-center items-center px-2 sm:px-0"
        shouldCloseOnOverlayClick={true}
        shouldCloseOnEsc={true}
        >
            <div className='w-full h-full flex flex-col'>

              <div className="w-full flex flex-col lg:flex-row gap-4 lg:gap-0">
                  <div className="w-full lg:w-[50%] lg:pr-4">
                    {/* Title */}
                    <div className="text-sm sm:text-base font-medium mb-2">Title</div>
                      <div className='w-full h-10 sm:h-12 rounded-md flex border border-neutral-400 mb-4'>
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
                      <div className='text-sm sm:text-base font-medium mb-2'>Description</div>
                      <div className='w-full h-32 sm:h-40 rounded-md border border-neutral-400 mb-4 lg:mb-0'>
                          <textarea
                              placeholder='description'
                              value={description}
                              onChange={({ target }) => setDiscription(target.value)}
                              className='w-full h-full overflow-auto hide-scrollbar outline-none rounded-md p-2 resize-none text-sm sm:text-base'
                          ></textarea>
                      </div>
                  </div>


                    <div className="flex flex-col w-full lg:w-[50%] items-center lg:pl-4">
                      <div className='text-sm sm:text-base font-medium mb-3 sm:mb-5'>
                        Priority
                      </div>

                      <div className='w-full max-w-xs h-auto lg:h-32 flex flex-col justify-center mb-4 sm:mb-5 items-center gap-2 sm:gap-3'>
                        <div 
                        onClick={()=>{
                          setPriority("low")
                        }}
                        className={`w-full sm:w-40 h-8 sm:h-10 font-semibold rounded-md border flex cursor-pointer ${priority==="low"?"border-black":"border-neutral-400"} justify-center items-center text-sm sm:text-base hover:bg-gray-50 ${darkMode ? 'hover:bg-gray-700' : ''} transition-all duration-200`}>
                          Low
                        </div>
                        <div 
                        onClick={()=>{
                          setPriority("medium")
                        }}
                        className={`w-full sm:w-40 h-8 sm:h-10 font-semibold rounded-md border flex cursor-pointer ${priority==="medium"?"border-black":"border-neutral-400"} justify-center items-center text-sm sm:text-base hover:bg-gray-50 ${darkMode ? 'hover:bg-gray-700' : ''} transition-all duration-200`}>
                          Medium
                        </div>
                        <div 
                        onClick={()=>{
                          setPriority("high")
                        }}
                        className={`w-full sm:w-40 h-8 sm:h-10 font-semibold rounded-md border flex cursor-pointer ${priority==="high"?"border-black":"border-neutral-400"} justify-center items-center text-sm sm:text-base hover:bg-gray-50 ${darkMode ? 'hover:bg-gray-700' : ''} transition-all duration-200`}>
                          High
                        </div>
                      </div>
                    </div>
              </div>




                <div className='text-sm sm:text-base font-medium mt-4 sm:mt-5 mb-2'>
                  Card Color
                </div>

                <div className='flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10 mt-2 mb-4'>
                  <div className='flex items-center justify-center order-2 sm:order-1'>
                    <ColorWheel type="card" selectedCardColor={selectedCardColor} setSelectedCardColor={setSelectedCardColor}/>
                  </div>

                  <div 
                  style={{backgroundColor:selectedCardColor}}
                  className='h-10 sm:h-12 w-full sm:w-40 max-w-xs rounded-md border border-gray-300 order-1 sm:order-2'>

                  </div>
                </div>


          
                <div className='w-full flex justify-center mt-4 sm:mt-5 items-center h-auto'>
                        <div 
                        onClick={()=>{
                            addCard(selectedColumn._id)
                        }}
                        className='w-full sm:w-40 h-10 sm:h-12 font-semibold cursor-pointer flex justify-center items-center rounded-md transform hover:scale-105 transition-all duration-200 bg-blue-500 text-white text-sm sm:text-base'>
                          Add Card
                        </div>
                </div>
            </div>
        </Modal>
  )
}

export default CartsModal