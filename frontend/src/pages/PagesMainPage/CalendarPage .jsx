import React, { useState } from 'react'
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'
import Calendar from '../../components/Calendar/Calendar'

const CalendarPage = ({pages, darkMode, selectedPageId}) => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    
    const [monNum, setMonNum] = useState(0)
    const [year, setYear] = useState(2025)
    const [selectedModule, setSelectedModule] = useState("Month")
    const [loading, setLoading] = useState(false)

    return (
        <div className={`w-full h-full flex flex-col px-3 sm:px-6 lg:px-10 ${darkMode ? "text-white" : ""} transition-all duration-300`}>
            
            {/* Page Header */}
            <div className='w-full h-12 sm:h-16 flex justify-between items-center'>
                <div className='text-2xl sm:text-3xl font-bold mt-2 border-b border-gray-300 pb-1'>
                    Calendar
                </div>
            </div>

            <div className='w-full flex-1 flex flex-col'>
                
                {/* Month Navigation and Module Selection */}
                <div className='w-full h-auto sm:h-16 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 py-4'>
                    
                    {/* Month/Year Navigation */}
                    <div className='h-12 w-full sm:w-auto flex justify-center sm:justify-start items-center'>
                        <div className='flex items-center gap-4 sm:gap-6'>
                            {/* Previous Button */}
                            <button
                                onClick={() => {
                                    if (selectedModule === "Month") {
                                        setMonNum(prev => (prev === 0 ? 11 : prev - 1));
                                    } else if (selectedModule === "Year") {
                                        setYear(prev => prev - 1)
                                    }
                                }}
                                className={`w-8 h-8 sm:w-10 sm:h-10 flex justify-center items-center border ${darkMode ? "border-white hover:bg-white hover:text-black" : "border-gray-300 hover:bg-gray-300"} rounded-md transition-all duration-300 cursor-pointer`}
                            >
                                <FaArrowLeft size={window.innerWidth < 640 ? 12 : 14} />
                            </button>

                            {/* Month/Year Display */}
                            <div className='font-bold text-lg sm:text-xl lg:text-2xl flex whitespace-nowrap'>
                                <span className="hidden sm:inline">{months[monNum]}</span>
                                <span className="sm:hidden">{months[monNum].substring(0, 3)}</span>
                                <span className="mx-1 sm:mx-2">,</span>
                                <span>{year}</span>
                            </div>

                            {/* Next Button */}
                            <button
                                onClick={() => {
                                    if (selectedModule === "Month") {
                                        setMonNum(prev => (prev === 11 ? 0 : prev + 1));
                                    } else if (selectedModule === "Year") {
                                        setYear(prev => prev + 1)
                                    }
                                }}
                                className={`w-8 h-8 sm:w-10 sm:h-10 flex justify-center items-center border ${darkMode ? "border-white hover:bg-white hover:text-black" : "border-gray-300 hover:bg-gray-300"} rounded-md transition-all duration-300 cursor-pointer`}
                            >
                                <FaArrowRight size={window.innerWidth < 640 ? 12 : 14} />
                            </button>
                        </div>
                    </div>

                    {/* Module Selection (Month/Year) */}
                    <div className='w-full sm:w-auto h-12 sm:h-16 flex items-center justify-center'>
                        <div className='flex border rounded-md overflow-hidden'>
                            {["Month", "Year"].map((module) => (
                                <button
                                    onClick={() => {
                                        setSelectedModule(module)
                                    }}
                                    key={module}
                                    className={`px-4 sm:px-6 py-2 sm:py-3 border-r last:border-r-0 transform hover:scale-105 transition-all duration-200 text-sm sm:text-base font-medium ${
                                        selectedModule === module 
                                            ? darkMode 
                                                ? 'bg-white text-black border-white' 
                                                : 'bg-black text-white border-black'
                                            : darkMode 
                                                ? 'border-gray-600 text-white hover:bg-gray-800' 
                                                : 'border-gray-300 text-black hover:bg-gray-100'
                                    }`}
                                >
                                    {module}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendar Container */}
            <div className='w-full flex-1 min-h-0'>
                <Calendar
                    month={monNum}
                    year={year}
                    pages={pages}
                    darkMode={darkMode}
                    selectedPageId={selectedPageId}
                    setLoading={setLoading}
                />
            </div>
        </div>
    )
}

export default CalendarPage