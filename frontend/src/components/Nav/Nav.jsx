import React from 'react'
import { IoSearchOutline } from "react-icons/io5";
import { MdKeyboardArrowRight } from "react-icons/md";
import { IoHomeOutline } from "react-icons/io5";
import { FaChevronRight } from "react-icons/fa";

const Nav = ({route, isSideBarOpen, setIsSideBarOpen, darkMode, setContent}) => {
  return (
    <div className={`h-16 sm:h-20 flex flex-col w-full ${darkMode ? "bg-gray-900 text-white" : "bg-neutral-200"} transition-all duration-300`}>
        
        {/* Top Section - App Title */}
        <div className='w-full flex items-center justify-start h-3/5 border-b border-gray-300 px-3 sm:px-4'>
            {!isSideBarOpen && (
                <div className='flex items-center mr-3 sm:mr-4'>
                    <FaChevronRight  
                        onClick={() => {
                            setIsSideBarOpen(true)
                        }}
                        className='cursor-pointer hover:text-blue-500 transition-colors duration-200'
                        size={window.innerWidth < 640 ? 16 : 20}
                    />
                </div>
            )}
            <div className='font-semibold text-sm sm:text-base truncate'>
                Task Management web
            </div>
        </div>
        
        {/* Bottom Section - Breadcrumb */}
        <div className='w-full flex items-center h-2/5 border-b border-gray-300 px-3 sm:px-4'>
            <div className='flex items-center gap-1 sm:gap-2 text-xs sm:text-sm overflow-x-auto whitespace-nowrap'>
                {/* Home Icon */}
                <div className='flex-shrink-0'>
                    <IoHomeOutline size={window.innerWidth < 640 ? 12 : 15}/>
                </div>
                
                {/* Arrow */}
                <div className='flex-shrink-0'>
                    <MdKeyboardArrowRight size={window.innerWidth < 640 ? 14 : 16} />
                </div>
                
                {/* Dashboard Link */}
                <div 
                    onClick={() => {
                        window.location.reload();
                    }}
                    className='cursor-pointer hover:text-blue-500 transition-colors duration-200 flex-shrink-0'
                >
                    Dashboard
                </div>
                
                {/* Current Route */}
                {route && (
                    <div className='flex items-center gap-1 sm:gap-2 flex-shrink-0'>
                        <div>
                            <MdKeyboardArrowRight size={window.innerWidth < 640 ? 14 : 16} />
                        </div>
                        <div
                            onClick={() => {
                                setContent(route)
                            }}
                            className='cursor-pointer hover:text-blue-500 transition-colors duration-200 truncate max-w-32 sm:max-w-none'
                        >
                            {route}
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  )
}

export default Nav