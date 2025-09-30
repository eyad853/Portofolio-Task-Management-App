import React, { useEffect, useState } from 'react';
import CalendarEvent from '../Modals/CalendarEvent';
import axios from 'axios';

const Calendar = ({ month, year, pages, darkMode, selectedPageId, setLoading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getStartDay = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const totalDays = getDaysInMonth(month, year);
  const startDay = getStartDay(month, year);

  const days = [];

  // Fill in blanks before the 1st of the month (previous month)
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = startDay - 1; i >= 0; i--) {
    days.push({
      value: prevMonthDays - i,
      isCurrentMonth: false,
    });
  }

  // Fill in current month days
  for (let i = 1; i <= totalDays; i++) {
    days.push({
      value: i,
      isCurrentMonth: true,
    });
  }

  // Fill in remaining cells from next month to complete calendar grid
  while (days.length % 7 !== 0 || days.length < 35) {
    days.push({
      value: days.length - totalDays - startDay + 1,
      isCurrentMonth: false,
    });
  }

  const calendarPage = pages.find(page => page._id === selectedPageId);
  
  const fetchEvents = async() => {
    if (!calendarPage) return;


    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/getSpecificPage/${calendarPage._id}`);
      if (response.data && response.data.page && response.data.page.content.events) {
        console.log(response.data.page.content.events);
        setEvents(response.data.page.content.events || []);
      } else {
        console.log("no events");
      }
    } catch(error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setEvents([]);
  }, [selectedPageId]);

  // Check if a date has events
  const hasEvents = (day, isCurrentMonth) => {
    if (!events.length) return false;
    
    let checkMonth = month;
    let checkYear = year;
    
    if (!isCurrentMonth) {
      if (day > 20) { // Previous month
        checkMonth = month === 0 ? 11 : month - 1;
        checkYear = month === 0 ? year - 1 : year;
      } else { // Next month
        checkMonth = month === 11 ? 0 : month + 1;
        checkYear = month === 11 ? year + 1 : year;
      }
    }
    
    return events.some(event => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === checkMonth &&
        eventDate.getFullYear() === checkYear
      );
    });
  };
  
  // Get events for selected date
  const getEventsForDate = (date) => {
    if (!events.length) return [];
    
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  useEffect(() => {
    try {
      fetchEvents();
    } catch(error) {
      console.log(error);
    }
  }, [selectedPageId]);

  // Update selected date events when selection changes
  useEffect(() => {
    if (selectedDate) {
      setSelectedDateEvents(getEventsForDate(selectedDate));
    }
  }, [selectedDate, events]);

  return (
    <div className='w-full h-full flex flex-col overflow-hidden'>
      
      {/* Calendar Header - Day Names */}
      <div className={`grid grid-cols-7 ${darkMode ? "bg-gray-700" : "bg-neutral-300"} transition-all duration-300 text-center font-semibold rounded-t-md`}>
        {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(day => (
          <div key={day} className="py-2 sm:py-3 text-xs sm:text-sm lg:text-base">
            {/* Show abbreviated day names on mobile */}
            <span className="sm:hidden">{day.substring(0, 3)}</span>
            <span className="hidden sm:inline lg:hidden">{day.substring(0, 3)}</span>
            <span className="hidden lg:inline">{day}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className={`grid flex-1 grid-cols-7 border ${darkMode ? "border-gray-700" : "border-gray-400"} transition-all duration-300 overflow-auto`}>
        {days.map((day, idx) => {
          const hasEvent = hasEvents(day.value, day.isCurrentMonth);
          
          return (
            <div 
              key={idx} 
              onClick={() => {
                let clickedMonth = month;
                let clickedYear = year;
              
                if (!day.isCurrentMonth) {
                  if (idx < startDay) {
                    // previous month
                    clickedMonth = month === 0 ? 11 : month - 1;
                    clickedYear = month === 0 ? year - 1 : year;
                  } else {
                    // next month
                    clickedMonth = month === 11 ? 0 : month + 1;
                    clickedYear = month === 11 ? year + 1 : year;
                  }
                }
              
                const clickedDate = new Date(clickedYear, clickedMonth, day.value);
                setSelectedDate(clickedDate);
                setIsOpen(true);
              }}
              className={`
                flex flex-col p-1 sm:p-2 cursor-pointer border border-gray-400 
                transition-all duration-300 hover:bg-opacity-80 min-h-16 sm:min-h-20 lg:min-h-24
                ${day.isCurrentMonth 
                  ? darkMode 
                    ? 'bg-gray-950 hover:bg-gray-900' 
                    : "bg-neutral-200 hover:bg-neutral-300" 
                  : darkMode 
                    ? 'bg-gray-900 hover:bg-gray-850' 
                    : "bg-neutral-100 hover:bg-neutral-200"
                }
              `}
            >
              {/* Date Number */}
              <div className='flex justify-end w-full'>
                <div className={`
                  relative rounded-full transition-all duration-300 
                  w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10
                  flex justify-center items-center text-xs sm:text-sm lg:text-base
                  hover:bg-purple-600 hover:text-white cursor-pointer
                  ${hasEvent 
                    ? darkMode 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-blue-200 text-blue-900' 
                    : day.isCurrentMonth
                      ? darkMode
                        ? 'text-white'
                        : 'text-gray-900'
                      : darkMode
                        ? 'text-gray-500'
                        : 'text-gray-500'
                  }
                `}>
                  {day.value}
                  
                  {/* Event Indicator Dot */}
                  {hasEvent && (
                    <div className="absolute -bottom-0.5 sm:-bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 sm:w-2 sm:h-2 bg-red-500 rounded-full"></div>
                  )}
                </div>
              </div>

              {/* Event Preview on larger screens */}
              <div className="hidden lg:block flex-1 mt-1 overflow-hidden">
                {hasEvent && (
                  <div className="space-y-1">
                    {getEventsForDate(new Date(
                      day.isCurrentMonth ? year : 
                      (idx < startDay ? (month === 0 ? year - 1 : year) : (month === 11 ? year + 1 : year)),
                      day.isCurrentMonth ? month :
                      (idx < startDay ? (month === 0 ? 11 : month - 1) : (month === 11 ? 0 : month + 1)),
                      day.value
                    )).slice(0, 2).map((event, eventIdx) => (
                      <div 
                        key={eventIdx}
                        className={`text-xs px-1 py-0.5 rounded truncate ${
                          darkMode 
                            ? 'bg-blue-800 text-blue-100' 
                            : 'bg-blue-100 text-blue-800'
                        }`}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                    {getEventsForDate(new Date(
                      day.isCurrentMonth ? year : 
                      (idx < startDay ? (month === 0 ? year - 1 : year) : (month === 11 ? year + 1 : year)),
                      day.isCurrentMonth ? month :
                      (idx < startDay ? (month === 0 ? 11 : month - 1) : (month === 11 ? 0 : month + 1)),
                      day.value
                    )).length > 2 && (
                      <div className={`text-xs px-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        +{getEventsForDate(new Date(
                          day.isCurrentMonth ? year : 
                          (idx < startDay ? (month === 0 ? year - 1 : year) : (month === 11 ? year + 1 : year)),
                          day.isCurrentMonth ? month :
                          (idx < startDay ? (month === 0 ? 11 : month - 1) : (month === 11 ? 0 : month + 1)),
                          day.value
                        )).length - 2} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Event Modal */}
      <CalendarEvent 
        isOpen={isOpen} 
        setIsOpen={setIsOpen}
        pages={pages}
        selectedDate={selectedDate}
        fetchEvents={fetchEvents}
        events={selectedDateEvents}
        darkMode={darkMode}
        calendarPage={calendarPage}
        setEvents={setEvents}
        AllEvents={events}
      />
    </div>
  );
};

export default Calendar;