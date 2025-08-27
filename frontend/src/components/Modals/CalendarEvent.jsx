import React, { useState } from 'react';
import { MdDriveFileRenameOutline } from 'react-icons/md';
import { BsCalendarEvent } from 'react-icons/bs';
import { IoLocationOutline } from 'react-icons/io5';
import { IoArrowBackOutline } from 'react-icons/io5';
import Modal from "react-modal";
import axios from "axios";

const CalendarEvent = ({setEvents,AllEvents, isOpen, pages, fetchEvents, darkMode, setIsOpen, selectedDate, calendarPage, events=[] }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState('');
  const [startAMPM, setStartAMPM] = useState("am");
  const [endAMPM, setEndAMPM] = useState("pm");
  const [view, setView] = useState("add"); // "add", "view", or "detail"
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedEvent , setSelectedEvent]=useState({})
  const [isEditing, setIsEditing] = useState(false);
  const [detailEvent, setDetailEvent] = useState(null); // Store the event being viewed in detail

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleTimeInput = (input, setFunc) => {
    const numbers = input.replace(/\D/g, "");
  
    if (numbers.length <= 2) {
      setFunc(numbers);
    } else if (numbers.length <= 4) {
      const hours = numbers.slice(0, 2);
      const minutes = numbers.slice(2, 4);
      setFunc(`${hours} : ${minutes}`);
    }
  };

  const handleCreateEvent = async() => {
    if (!calendarPage) return console.error("calendar page not found");

    const event = {
      _id: crypto.randomUUID(),
      title,
      description,
      location,
      date: selectedDate,
      startTime,
      endTime,
      startAMPM,
      endAMPM,
      createdAt: new Date()
    };

    try {
      setEvents(prev=>[...prev , event])
      setIsOpen(false);
      const response = await axios.put(`http://localhost:8000/updatePage/${calendarPage._id}`, {
        event
      });
      if(response) {
        resetForm();
      }
    } catch(error) {
      console.log(error);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setLocation("");
    setStartTime("");
    setEndTime("");
    setStartAMPM("am");
    setEndAMPM("pm");
    setView("add");
    setIsOpen(false);
  };

  const handleDeleteEvent = async(eventId) => {
    if (!calendarPage) return console.error("calendar page not found");

    try {
      setEvents(prev=>prev.filter(e=>e._id!==eventId))
      const response = await axios.delete(`http://localhost:8000/deleteItem/${calendarPage._id}/${eventId}`);
      if(response) {
        // If we're deleting the currently viewed event, go back to the list view
        if (detailEvent && detailEvent._id === eventId) {
          setView("view");
          setDetailEvent(null);
        }
      }
    } catch(error) {
      console.log(error);
    }
  };

  const handleEditEvent = (event) => {
    setTitle(event.title);
    setDescription(event.description || '');
    setLocation(event.location || '');
    setStartTime(event.startTime || '');
    setEndTime(event.endTime || '');
    setStartAMPM(event.startAMPM || 'am');
    setEndAMPM(event.endAMPM || 'pm');
    setView('add');
    setIsEditing(true);
  };

  const handleUpdateEvent = async(event, eventId) => {
    const updatedFields ={}

    if(title !==event.title){
      updatedFields.title=title
    }
    if(description !==event.description){
      updatedFields.description=description
    }
    if(location !==event.location){
      updatedFields.location=location
    }
    if(startTime !==event.startTime){
      updatedFields.startTime=startTime
    }
    if(endTime !==event.endTime){
      updatedFields.endTime=endTime
    }
    if(startAMPM !==event.startAMPM){
      updatedFields.startAMPM=startAMPM
    }
    if(endAMPM !==event.endAMPM){
      updatedFields.endAMPM=endAMPM
    }

    try {
      setEvents(prev => prev.map(e => e._id === eventId ? { ...e, ...updatedFields } : e));
      const response = await axios.patch(`http://localhost:8000/updateItem/${calendarPage._id}/${eventId}`, updatedFields);
      if (response) {
        setIsEditing(false);
        setTitle("");
        setDescription("");
        setLocation("");
        setStartTime("");
        setEndTime("");
        setStartAMPM("am");
        setEndAMPM("pm");
        setView("view");
      }
    } catch(error) {
      console.log(error);
    }
  };

  // New function to show event details
  const showEventDetails = (event) => {
    setDetailEvent(event);
    setView("detail");
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => { 
        resetForm();
        setIsEditing(false);
      }}
      className={`w-[95vw] sm:w-[90vw] md:w-140 h-[90vh] sm:h-130 ${darkMode ? "bg-gray-800 text-white" : 'bg-white'} p-4 sm:p-6 rounded-xl shadow-xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 outline-none mx-2 sm:mx-0`}
      overlayClassName="fixed inset-0 bg-gray-500/50 z-50 flex justify-center items-center px-2 sm:px-0"
      shouldCloseOnOverlayClick={true}
      shouldCloseOnEsc={true}
    >
      <div className='w-full h-full flex flex-col'>
        {/* Date display */}
        <div className="mb-3 sm:mb-4 text-center font-semibold text-lg sm:text-xl">{formatDate(selectedDate)}</div>
        
        {/* Toggle between view events and add event */}
        {view !== "detail" && (
          <div className="flex mb-3 sm:mb-4 border-b border-gray-300">
            <div 
              onClick={() => setView("view")}
              className={`px-3 sm:px-4 py-2 cursor-pointer text-sm sm:text-base ${view === "view" ? "border-b-2 border-blue-600 text-blue-600" : ""}`}
            >
              View Events ({events.length})
            </div>
            <div 
              onClick={() => setView("add")}
              className={`px-3 sm:px-4 py-2 cursor-pointer text-sm sm:text-base ${view === "add" ? "border-b-2 border-blue-600 text-blue-600" : ""}`}
            >
              Add Event
            </div>
          </div>
        )}

        {/* Detail View */}
        {view === "detail" && detailEvent && (
          <div className="flex-1 flex flex-col">
            <div className="flex items-center mb-3 sm:mb-4">
              <button 
                onClick={() => setView("view")}
                className="flex items-center text-blue-600 hover:text-blue-800 text-sm sm:text-base"
              >
                <IoArrowBackOutline className="mr-1" /> Back to events
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto hide-scrollbar">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 break-words">{detailEvent.title}</h2>
              
              <div className={`flex items-center ${darkMode ? "text-white" : "text-gray-600"} mb-2 sm:mb-3 text-sm sm:text-base`}>
                <BsCalendarEvent className="mr-2 flex-shrink-0" />
                <span>{detailEvent.startTime} {detailEvent.startAMPM} - {detailEvent.endTime} {detailEvent.endAMPM}</span>
              </div>
              
              {detailEvent.location && (
                <div className={`flex items-start ${darkMode ? "text-white" : "text-gray-600"} mb-3 sm:mb-4 text-sm sm:text-base`}>
                  <IoLocationOutline className="mr-2 mt-1 flex-shrink-0" />
                  <span className="break-words">{detailEvent.location}</span>
                </div>
              )}
              
              {detailEvent.description && (
                <div className="mb-4 sm:mb-6">
                  <h3 className="font-semibold mb-2 text-sm sm:text-base">Description:</h3>
                  <div className={`whitespace-pre-wrap max-h-40 sm:max-h-52 overflow-y-scroll hide-scrollbar break-words text-sm sm:text-base ${darkMode ? "text-white" : "text-gray-700"}`}>
                    {detailEvent.description}
                  </div>
                </div>
              )}
              
              <div className="mt-auto flex flex-col sm:flex-row gap-2 sm:gap-4 justify-end">
                <button 
                  onClick={() => {
                    handleEditEvent(detailEvent);
                    setSelectedEventId(detailEvent._id);
                    setSelectedEvent(detailEvent)
                  }}
                  className="w-full sm:w-auto px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-200 text-sm sm:text-base order-1 sm:order-1"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteEvent(detailEvent._id)}
                  className="w-full sm:w-auto px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm sm:text-base order-2 sm:order-2"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Event List View */}
        {view === "view" && (
          <div className="flex-1 overflow-y-auto hide-scrollbar">
            {events.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {events.map((event, index) => (
                  <div 
                    key={index} 
                    className={`border border-gray-300 rounded-md p-3 sm:p-4 cursor-pointer hover:bg-${darkMode ? "gray-700" : "gray-100"} transition-colors`}
                    onClick={() => showEventDetails(event)}
                  >
                    <div className="font-semibold text-base sm:text-lg break-words">{event.title}</div>
                    <div className={`flex items-center ${darkMode ? "text-white" : "text-gray-600"} mt-2 text-xs sm:text-sm`}>
                      <BsCalendarEvent className="mr-2 flex-shrink-0" />
                      <span>{event.startTime} {event.startAMPM} - {event.endTime} {event.endAMPM}</span>
                    </div>
                    {event.location && (
                      <div className={`flex items-start ${darkMode ? "text-white" : "text-gray-600"} mt-1 text-xs sm:text-sm`}>
                        <IoLocationOutline className="mr-2 mt-1 flex-shrink-0" />
                        <span className="break-words">{event.location}</span>
                      </div>
                    )}
                    {event.description && (
                      <div className={`mt-2 line-clamp-2 break-words text-xs sm:text-sm ${darkMode ? "text-white" : "text-gray-700"}`}>
                        {event.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 mt-8 text-sm sm:text-base">
                No events scheduled for this date
              </div>
            )}
          </div>
        )}

        {/* Add/Edit Event View */}
        {view === "add" && (
          <>
            {/* title */}
            <div className={`w-full h-10 sm:h-12 flex border cursor-pointer ${darkMode ? "border-white" : "border-neutral-400"} rounded-md mb-3 sm:mb-4`}>
              <div className="w-8 sm:w-10 rounded-l-md h-full flex justify-center items-center text-sm sm:text-base">
                <MdDriveFileRenameOutline/>
              </div>
              <div className="h-full flex-1 rounded-r-md">
                <input 
                  type="text" 
                  className={`w-full rounded-r-md h-full outline-none px-2 text-sm sm:text-base ${darkMode ? "bg-gray-800 text-white" : ""}`}  
                  placeholder='Title'
                  value={title}
                  onChange={({target}) => {
                    setTitle(target.value);
                  }}
                />
              </div>
            </div>
            
            {/* description */}
            <div className={`w-full h-16 sm:h-20 mb-3 sm:mb-4 flex border ${darkMode ? "border-white" : "border-neutral-400"} rounded-md`}>
              <textarea 
                className={`w-full h-full outline-none overflow-auto hide-scrollbar rounded-md p-2 text-sm sm:text-base resize-none ${darkMode ? "bg-gray-800 text-white" : ""}`}
                value={description}
                onChange={({target}) => {
                  setDescription(target.value);
                }}
                placeholder='Description'
              ></textarea>
            </div>

            {/* start/end time */}
            <div className='w-full flex flex-col gap-3 sm:gap-4 mb-3 sm:mb-4'>
              {/* start time */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-0">
                <div className={`flex items-center ${darkMode ? "text-white" : "text-neutral-600"} text-sm sm:text-base min-w-20 sm:min-w-24`}>
                  Start Time:
                </div>
                <input
                  className={`w-full sm:w-32 md:w-40 outline-none h-10 border ${darkMode ? "bg-gray-800 text-white border-white" : "text-neutral-600 border-neutral-400"} font-semibold sm:ml-2.5 rounded-md px-2 text-sm sm:text-base`} 
                  type="text"
                  value={startTime}
                  onChange={(e) => handleTimeInput(e.target.value, setStartTime)}
                  placeholder='00:00'
                  maxLength={7}
                />

                <div className='w-full sm:w-20 md:w-24 sm:ml-4 h-8 sm:h-10 flex gap-1 sm:gap-2'>
                  <div 
                    onClick={() => {
                      setStartAMPM("am");
                    }}
                    className={`flex-1 sm:w-10 md:w-12 h-full border flex justify-center items-center rounded-md transition-all duration-200 cursor-pointer text-xs sm:text-sm
                      ${startAMPM === "am" ? darkMode ? "border-white bg-gray-700" : "border-neutral-700 bg-gray-100" : darkMode ? "border-gray-600" : "border-neutral-400"}`}
                  >
                    AM
                  </div>
                  <div 
                    onClick={() => {
                      setStartAMPM("pm");
                    }}
                    className={`flex-1 sm:w-10 md:w-12 h-full border flex justify-center items-center rounded-md transition-all duration-200 cursor-pointer text-xs sm:text-sm
                      ${startAMPM === "pm" ? darkMode ? "border-white bg-gray-700" : "border-neutral-700 bg-gray-100" : darkMode ? "border-gray-600" : "border-neutral-400"}`}
                  >
                    PM
                  </div>
                </div>
              </div>
              
              {/* end time */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-0">
                <div className={`flex items-center ${darkMode ? "text-white" : "text-neutral-600"} text-sm sm:text-base min-w-20 sm:min-w-24`}>
                  End Time:
                </div>
                <input
                  className={`w-full sm:w-32 md:w-40 outline-none h-10 border ${darkMode ? "bg-gray-800 text-white border-white" : "text-neutral-600 border-neutral-400"} font-semibold sm:ml-4 rounded-md px-2 text-sm sm:text-base`}
                  type="text"
                  placeholder='00:00'
                  value={endTime}
                  onChange={(e) => handleTimeInput(e.target.value, setEndTime)}
                  maxLength={7}
                />
                <div className='w-full sm:w-20 md:w-24 sm:ml-4 h-8 sm:h-10 flex gap-1 sm:gap-2'>
                  <div 
                    onClick={() => {
                      setEndAMPM("am");
                    }}
                    className={`flex-1 sm:w-10 md:w-12 h-full border flex justify-center items-center rounded-md transition-all duration-200 cursor-pointer text-xs sm:text-sm
                      ${endAMPM === "am" ? darkMode ? "border-white bg-gray-700" : "border-neutral-700 bg-gray-100" : darkMode ? "border-gray-600" : "border-neutral-400"}`}
                  >
                    AM
                  </div>
                  <div 
                    onClick={() => {
                      setEndAMPM("pm");
                    }}
                    className={`flex-1 sm:w-10 md:w-12 h-full border flex justify-center items-center rounded-md transition-all duration-200 cursor-pointer text-xs sm:text-sm
                      ${endAMPM === "pm" ? darkMode ? "border-white bg-gray-700" : "border-neutral-700 bg-gray-100" : darkMode ? "border-gray-600" : "border-neutral-400"}`}
                  >
                    PM
                  </div>
                </div>
              </div>
            </div>

            {/* location */}
            <div className='w-full h-10 sm:h-12 mb-4 sm:mb-5'>
              <input 
                value={location}
                onChange={({target}) => {
                  setLocation(target.value);
                }}
                type="text" 
                placeholder='Location' 
                className={`w-full h-full rounded-md border ${darkMode ? "bg-gray-800 text-white border-white" : "text-neutral-500 border-neutral-400"} outline-none px-2 text-sm sm:text-base`}
              />
            </div>
            
            {/* button */}
            <div 
              onClick={() => {
                if(isEditing === false) {
                  handleCreateEvent();
                } else if(isEditing === true) {
                  handleUpdateEvent( selectedEvent,selectedEventId);
                }
              }}
              className='w-full sm:w-44 md:w-46 h-10 sm:h-12 mx-auto flex justify-center rounded-md transform hover:scale-105 transition-all duration-200 items-center font-semibold text-base sm:text-lg md:text-2xl bg-blue-600 text-white cursor-pointer'
            >
              {isEditing ? "Update" : "Add Event"}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default CalendarEvent;