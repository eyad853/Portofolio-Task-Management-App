import React, { useState } from 'react'
import { FaUser } from "react-icons/fa";
import { FaAngleDoubleLeft } from "react-icons/fa";
import { CiSearch } from "react-icons/ci";
import { MdOutlineNotificationsActive } from "react-icons/md";
import { FaCalendarAlt } from "react-icons/fa";
import { IoIosSettings } from "react-icons/io";
import { FaAngleDown } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import axios from 'axios';
import { FcTodoList } from "react-icons/fc";
import { FaRegCalendarAlt } from "react-icons/fa";
import { MdOutlineViewKanban } from "react-icons/md";
import { FaNoteSticky } from "react-icons/fa6";
import { hover, motion } from 'framer-motion';
import { MdDashboard } from "react-icons/md";
import { IoSunnyOutline, IoMoonOutline } from "react-icons/io5";

const Sidebar = ({
    setContent,
    setCustomContent,
    isSideBarOpen,
    setIsSideBarOpen,
    setIsPagesOpen,
    setRoute,
    pages,
    darkMode,
    setDarkMode,
    user,
    setPages,
    setSelectedPageId
}) => {
    const [avatar, setAvatar] = useState("")
    const [name, setName] = useState("")
    const [email, setemail] = useState("")
    const [numbersOfNotifications, setNumbersOfNotifications] = useState("")
    const [filter, setFilter] = useState('')
    
    const filteredPages = pages.filter(page => {
        if (!filter) return true; // Show all if filter is empty

        const lowerFilter = filter.toLowerCase();
        const words = page.name.toLowerCase().split(/\s+/); // split by spaces

        // Check if any word starts with the filter string
        return words.some(word => word.startsWith(lowerFilter));
    });

    const iconMap = {
        todo: <FcTodoList size={18} />,
        calendar: <FaRegCalendarAlt size={18} />,
        kanban: <MdOutlineViewKanban size={18} />,
        notes: <FaNoteSticky size={18} />
    };

    const handlePageSelect = (page) => {
        setContent(page.type);
        setRoute(page.name);
        setCustomContent(page.content);
        // Close sidebar on mobile
        if (window.innerWidth < 1024) {
            setIsSideBarOpen(false)
        }
    }

    const handleDeletePage = async (id) => {
        try {
            setPages(pages.filter(page => page._id !== id))
            await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/deletePage/${id}`)
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <>
            {/* Mobile Overlay */}
            {isSideBarOpen && (
                <div 
                    className="fixed inset-0 bg-gray-500/50 bg-opacity-50 z-30 lg:hidden"
                    onClick={() => setIsSideBarOpen(false)}
                />
            )}
            
            <motion.div 
                initial={{ x: '-100%' }}
                animate={{ 
                    x: isSideBarOpen ? '0%' : '-100%'
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className={`
                    h-screen border-r fixed z-40
                    ${darkMode ? " bg-gray-900 border-gray-700 text-white" : "bg-neutral-200  border-gray-300"} 
                    transition-all duration-300 flex flex-col
                    w-80 lg:w-1/5
                    lg:translate-x-0
                `}
            >
                {/* Header with close button */}
                <div className='w-full h-7 flex justify-between px-3 items-center relative z-50'>
                    <FaAngleDoubleLeft 
                        onClick={() => setIsSideBarOpen(prev => !prev)}
                        className='cursor-pointer hover:text-blue-500 transition-colors duration-200'
                        size={16}
                    />
                    {/* Mobile close button */}
                    <button
                        onClick={() => setIsSideBarOpen(false)}
                        className="lg:hidden p-1 rounded-md hover:bg-gray-700 text-gray-400"
                    >
                        ✕
                    </button>
                </div>

                {/* User Profile Section */}
                <div className="w-full px-2 sm:px-3">
                    <div className={`
                        w-full h-12 sm:h-14 flex items-center 
                        ${darkMode ? "bg-gray-950 text-white" : "bg-white"}  
                        transition-all duration-300 rounded-xl sm:rounded-2xl
                        px-2 sm:px-3
                    `}>
                        {/* Avatar */}
                        <div className={`
                            h-8 w-8 sm:h-10 sm:w-10 
                            ${darkMode ? "bg-white" : "bg-black text-white"} 
                            overflow-hidden border-2 border-neutral-300 rounded-full
                            flex-shrink-0
                        `}>
                            {user && user?.avatar ? (
                                <img 
                                    src={user && user.avatar} 
                                    className='w-full rounded-full h-full object-cover'
                                    alt="User Avatar"
                                />
                            ) : (
                                <div className={`
                                    w-full ${darkMode ? "bg-gray-950 " : ""} 
                                    overflow-hidden flex items-end justify-center h-full
                                    text-2xl sm:text-3xl
                                `}>
                                    <FaUser />
                                </div>
                            )}
                        </div>

                        {/* User Info */}
                        <div className='flex-1 min-w-0 ml-2 sm:ml-3'>
                            <div className='font-bold text-sm sm:text-base line-clamp-1'>
                                {user && user.username}
                            </div>
                            <div className='text-gray-500 text-xs line-clamp-1'>
                                {user && user.email}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Menu Section */}
                <div className='w-full flex flex-col mt-3 px-2 sm:px-3'>
                    <div className='h-8 sm:h-10 text-sm text-gray-400 font-bold flex items-center'>
                        <div className='ml-1 sm:ml-3'>
                            Main menu
                        </div>
                    </div>

                    <div className='flex mt-2 flex-col justify-center gap-1'>
                        {/* Search */}
                        <div className='w-full h-8 sm:h-10 transition-all duration-200 flex items-center px-2'>
                            <div className='text-lg sm:text-xl flex-shrink-0'>
                                <CiSearch />
                            </div>
                            <div className='flex-1 ml-2 sm:ml-3'>
                                <input 
                                    type="text" 
                                    value={filter}
                                    onChange={({target}) => {
                                        setFilter(target.value)
                                    }}
                                    className={`
                                        outline-none w-full text-sm sm:text-base
                                        ${darkMode ? "text-white placeholder:text-gray-400 bg-transparent" : "bg-transparent"} 
                                    `} 
                                    placeholder='Search ...'  
                                />
                            </div>
                        </div>

                        {/* Dashboard */}
                        <div 
                            onClick={() => {
                                setContent("Dashboard")
                                setRoute("")
                                // Close sidebar on mobile
                                if (window.innerWidth < 1024) {
                                    setIsSideBarOpen(false)
                                }
                            }}
                            className={`
                                w-full h-8 sm:h-10 
                                hover:${darkMode ? "bg-gray-950" : "bg-gray-300"} 
                                rounded-lg sm:rounded-xl transition-all duration-200 
                                flex items-center cursor-pointer px-2
                            `}
                        >
                            <div className='text-lg sm:text-xl flex-shrink-0'>
                                <MdDashboard />
                            </div>
                            <div className='ml-2 sm:ml-3 text-sm sm:text-base'>Dashboard</div>
                        </div>

                        {/* Settings */}
                        <div 
                            onClick={() => {
                                setContent("Settings")
                                setRoute("Settings")
                                // Close sidebar on mobile
                                if (window.innerWidth < 1024) {
                                    setIsSideBarOpen(false)
                                }
                            }}
                            className={`
                                w-full h-8 sm:h-10 
                                hover:${darkMode ? "bg-gray-950" : "bg-gray-300"} 
                                rounded-lg sm:rounded-xl transition-all duration-200 
                                flex items-center cursor-pointer px-2
                            `}
                        >
                            <div className='text-lg sm:text-xl flex-shrink-0'>
                                <IoIosSettings />
                            </div>
                            <div className='ml-2 sm:ml-3 text-sm sm:text-base'>Settings</div>
                        </div>
                    </div>
                </div>

                {/* My Pages Section */}
                <div className='w-full mt-4 flex items-center justify-between px-3 sm:px-4'>
                    <div className='text-sm text-gray-400 font-bold'>
                        My pages
                    </div>
                    <div className='cursor-pointer'>
                        <FaAngleDown size={14} />
                    </div>
                </div>

                {/* Create Page Button */}
                <div className="mx-2 sm:mx-3 mt-2">
                    <div 
                        onClick={() => setIsPagesOpen(true)}
                        className={`
                            w-full h-8 sm:h-10 flex items-center 
                            hover:${darkMode ? "bg-gray-950" : "bg-gray-300"} 
                            rounded-lg sm:rounded-xl transition-all duration-200 
                            justify-center cursor-pointer
                        `}
                    >
                        <div className='text-xs sm:text-sm text-gray-400 font-bold items-center gap-2 sm:gap-3 flex'>
                            <div><FaPlus size={12} /></div>
                            <div>Create a Page</div>
                        </div>
                    </div>
                </div>

                {/* Pages List */}
                {filteredPages.length > 0 ? (
                    <div className="w-full flex-1 pt-2 overflow-y-auto hide-scrollbar mt-2 px-2 sm:px-3">
                        {filteredPages.map((page, index) => (
                            <div
                                key={page._id}
                                onClick={() => {
                                    handlePageSelect(page)
                                    setSelectedPageId(page._id)
                                }}
                                className={`
                                    w-full h-8 sm:h-10 flex items-center 
                                    hover:${darkMode ? "bg-gray-950" : "bg-gray-300"} 
                                    rounded-lg sm:rounded-xl transition-all duration-200 
                                    justify-between cursor-pointer px-2 mb-1
                                `}
                            >
                                <div className="flex items-center flex-1 min-w-0">
                                    <div className="flex-shrink-0">
                                        {page.type ? (
                                            iconMap[page.type] || (
                                                <div className="w-3 h-3 rounded-full bg-black" />
                                            )
                                        ) : (
                                            <div className="w-3 h-3 rounded-full bg-black" />
                                        )}
                                    </div>
                                    <div className="text-xs sm:text-sm font-semibold ml-2 sm:ml-3 truncate">
                                        {page.name}
                                    </div>
                                </div>
                                <div 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeletePage(page._id)
                                    }}
                                    className='flex-shrink-0 cursor-pointer hover:text-red-600 transition-all duration-200 p-1'
                                >
                                    <FaTrash size={12} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className='w-full h-32 sm:h-44 mb-4 flex justify-center items-center font-semibold text-sm sm:text-base px-4'>
                        <div className="text-center text-gray-500">
                            <div className="text-2xl mb-2">📄</div>
                            <div>No Pages yet</div>
                            <div className="text-xs mt-1">Create your first page to get started</div>
                        </div>
                    </div>
                )}
            </motion.div>
        </>
    )
}

export default Sidebar