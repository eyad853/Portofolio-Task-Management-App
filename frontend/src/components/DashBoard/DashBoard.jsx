import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';
import { CheckSquare, Calendar, FileText, Layout } from 'lucide-react';
import axios from 'axios';
import { PiEmptyBold } from 'react-icons/pi';
import { MdOutlinePriorityHigh, MdPeopleAlt, MdTaskAlt } from 'react-icons/md';
import { FaPlus, FaTasks } from 'react-icons/fa';

const DashBoard = ({ darkMode, user }) => {

  // --- States for holding your data ---

  // For all items (used for overall analytics and totals)
  const [allTodos, setAllTodos] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [allColumns, setAllColumns] = useState([]); // Kanban columns
  const [allNotes, setAllNotes] = useState([]);

  // For the last 10 items (used for "Recent" lists)
  const [lastTodos, setLastTodos] = useState([]);
  const [loading, setLoading] = useState(false)

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL; // Adjust this based on your server's port

  const fetchData = async (endpoint, setDataState) => {
    try {
      const response = await axios.get(`${API_BASE_URL}${endpoint}`, { withCredentials: true });

      if (!response.data.error) {
        // Find the key in the response data that holds the array (e.g., 'todos', 'events')
        const dataKey = Object.keys(response.data).find(key => Array.isArray(response.data[key]));
        if (dataKey) {
          setDataState(response.data[dataKey]);
        } else {
          console.warn(`[fetchData] No array found in response for ${endpoint}:`, response.data);
          setDataState([]);
        }
      } else {
        console.error(`[fetchData] Backend error for ${endpoint}:`, response.data.err);
        setDataState([]);
      }
    } catch (err) {
      console.error(`[fetchData] Network or server error fetching data from ${endpoint}:`, err);
      setDataState([]);
    }
  };

  // --- Data Transformation Functions for Charts ---

  const getTodoPieChartData = () => {
    const completed = allTodos.filter(task => task.done === true).length;
    const inProgress = allTodos.filter(task => task.onProgress === true).length;
    const pending = allTodos.filter(task => !task.done && !task.onProgress).length;
    const others = allTodos.length - (completed + inProgress + pending);

    return [
      { name: 'Completed', value: completed, color: '#22C55E' }, // Green
      { name: 'In Progress', value: inProgress, color: '#3B82F6' }, // Blue
      { name: 'Pending', value: pending, color: '#F97316' }, // Orange
      ...(others > 0 ? [{ name: 'Others', value: others, color: '#6B7280' }] : [])
    ].filter(item => item.value > 0);
  };

  const getEventBarChartData = () => {
    const dailyCounts = {};
    allEvents.forEach(event => {
      if (event.date) {
        const eventDate = new Date(event.date);
        if (!isNaN(eventDate.getTime())) {
          const dayOfWeek = eventDate.toLocaleString('en-US', { weekday: 'short' });
          dailyCounts[dayOfWeek] = (dailyCounts[dayOfWeek] || 0) + 1;
        }
      }
    });

    const daysOrder = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return daysOrder.map(day => ({
      day: day,
      events: dailyCounts[day] || 0,
    }));
  };

  const getNotesAreaChartData = () => {
    const monthlyData = {};
    allNotes.forEach(note => {
      if (note.createdAt) {
        const createdAt = new Date(note.createdAt);
        if (!isNaN(createdAt.getTime())) {
          const monthYear = `${createdAt.getFullYear()}-${createdAt.getMonth() + 1}`;

          if (!monthlyData[monthYear]) {
            monthlyData[monthYear] = { created: 0 };
          }
          monthlyData[monthYear].created += 1;
        }
      }
    });

    const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
      const [yearA, monthA] = a.split('-').map(Number);
      const [yearB, monthB] = b.split('-').map(Number);
      return new Date(yearA, monthA - 1) - new Date(yearB, monthB - 1);
    });

    return sortedMonths.map(month => ({
      month: month,
      created: monthlyData[month].created,
    }));
  };

  const getKanbanBarChartData = () => {
    const stageCounts = {};
    allColumns.forEach(column => {
      const columnName = column.name || 'Untitled Stage';
      stageCounts[columnName] = (stageCounts[columnName] || 0) + (column.cards ? column.cards.length : 0);
    });

    return Object.keys(stageCounts).map(stage => ({
      stage: stage,
      tasks: stageCounts[stage],
    }));
  };

  const fetchAllTheData = async () => {
    setLoading(true)
    await fetchData('/getAllTodos', setAllTodos);
    await fetchData('/getAllEvents', setAllEvents);
    await fetchData('/getAllColumns', setAllColumns);
    await fetchData('/getAllNotes', setAllNotes);
    await fetchData('/getLastTodos', setLastTodos);
    setLoading(false)
  }

  useEffect(() => {
    fetchAllTheData()
  }, [user]);

  // Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 rounded-lg shadow-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} border`}>
          <p className="font-semibold">{`${label}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex justify-center items-center">
        <div className="w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 rounded-full border-y-2 border-blue-500 animate-spin"></div>
      </div>
    )
  }

  return (
    <div className={`w-full ${darkMode ? "text-white bg-gray-800" : "bg-gray-50"} transition-all duration-300 h-full px-3 sm:px-6  pt-4 sm:pt-6  pb-5`}>
      
      {/* Stats Cards */}
      <div className="w-full mb-6 sm:mb-8">
        <h1 className={`text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Dashboard Overview
        </h1>
        
        {/* Responsive Grid for Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Todos Card */}
          <div className={`h-24 sm:h-28 lg:h-32 flex flex-col justify-center items-center rounded-md ${darkMode ? "bg-gray-900" : 'bg-white shadow-md'} p-3 sm:p-4`}>
            <div className="border-l-4 flex justify-between items-center border-blue-900 w-full h-3/5">
              <div className="h-full flex-1 flex flex-col pl-3 sm:pl-4">
                <div className="text-neutral-500 font-bold text-xs sm:text-sm">Todos</div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold">{allTodos.length}</div>
              </div>
              <div className="h-full w-8 sm:w-10 flex justify-center items-start pt-1 sm:pt-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-md bg-blue-900/50 flex justify-center items-center text-white">
                  <CheckSquare size={window.innerWidth < 640 ? 12 : 16} />
                </div>
              </div>
            </div>
            <div className="h-2/5 bg-gradient-to-r from-blue-400 to-blue-600 w-full rounded-b"></div>
          </div>

          {/* Calendar Card */}
          <div className={`h-24 sm:h-28 lg:h-32 flex flex-col justify-center items-center rounded-md ${darkMode ? "bg-gray-900" : 'bg-white shadow-md'} p-3 sm:p-4`}>
            <div className="border-l-4 flex justify-between items-center border-cyan-600 w-full h-3/5">
              <div className="h-full flex-1 flex flex-col pl-3 sm:pl-4">
                <div className="text-neutral-500 font-bold text-xs sm:text-sm">Events</div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold">{allEvents.length}</div>
              </div>
              <div className="h-full w-8 sm:w-10 flex justify-center items-start pt-1 sm:pt-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-md bg-cyan-600/50 flex justify-center items-center text-white">
                  <Calendar size={window.innerWidth < 640 ? 12 : 16} />
                </div>
              </div>
            </div>
            <div className="h-2/5 bg-gradient-to-r from-cyan-400 to-cyan-600 w-full rounded-b"></div>
          </div>

          {/* Notes Card */}
          <div className={`h-24 sm:h-28 lg:h-32 flex flex-col justify-center items-center rounded-md ${darkMode ? "bg-gray-900" : 'bg-white shadow-md'} p-3 sm:p-4`}>
            <div className="border-l-4 flex justify-between items-center border-purple-800 w-full h-3/5">
              <div className="h-full flex-1 flex flex-col pl-3 sm:pl-4">
                <div className="text-neutral-500 font-bold text-xs sm:text-sm">Notes</div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold">{allNotes.length}</div>
              </div>
              <div className="h-full w-8 sm:w-10 flex justify-center items-start pt-1 sm:pt-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-md bg-purple-800/50 flex justify-center items-center text-white">
                  <FileText size={window.innerWidth < 640 ? 12 : 16} />
                </div>
              </div>
            </div>
            <div className="h-2/5 bg-gradient-to-r from-purple-400 to-purple-600 w-full rounded-b"></div>
          </div>

          {/* Kanban Card */}
          <div className={`h-24 sm:h-28 lg:h-32 flex flex-col justify-center items-center rounded-md ${darkMode ? "bg-gray-900" : 'bg-white shadow-md'} p-3 sm:p-4`}>
            <div className="border-l-4 flex justify-between items-center border-yellow-600 w-full h-3/5">
              <div className="h-full flex-1 flex flex-col pl-3 sm:pl-4">
                <div className="text-neutral-500 font-bold text-xs sm:text-sm">Kanban</div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold">{allColumns.length}</div>
              </div>
              <div className="h-full w-8 sm:w-10 flex justify-center items-start pt-1 sm:pt-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-md bg-yellow-600/50 flex justify-center items-center text-white">
                  <Layout size={window.innerWidth < 640 ? 12 : 16} />
                </div>
              </div>
            </div>
            <div className="h-2/5 bg-gradient-to-r from-yellow-400 to-yellow-600 w-full rounded-b"></div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Todo Pie Chart */}
        <div className={`lg:col-span-2 h-72 sm:h-80 lg:h-96 rounded-lg ${darkMode ? "bg-gray-900" : 'bg-white shadow-md'} p-4 sm:p-6`}>
          <div className="text-lg sm:text-xl font-bold mb-4">Todo Status Distribution</div>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={getTodoPieChartData()}
                cx="50%"
                cy="50%"
                innerRadius={window.innerWidth < 640 ? 30 : 40}
                outerRadius={window.innerWidth < 640 ? 80 : window.innerWidth < 1024 ? 100 : 120}
                paddingAngle={5}
                dataKey="value"
              >
                {getTodoPieChartData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Calendar Bar Chart */}
        <div className={`lg:col-span-3 h-72 sm:h-80 lg:h-96 rounded-lg ${darkMode ? "bg-gray-900" : 'bg-white shadow-md'} p-4 sm:p-6`}>
          <h3 className="text-lg sm:text-xl font-bold mb-4">Weekly Calendar Activity</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={getEventBarChartData()}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
              <XAxis 
                dataKey="day" 
                stroke={darkMode ? '#9CA3AF' : '#6B7280'} 
                fontSize={window.innerWidth < 640 ? 10 : 12}
              />
              <YAxis 
                stroke={darkMode ? '#9CA3AF' : '#6B7280'} 
                fontSize={window.innerWidth < 640 ? 10 : 12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="events" fill="#06B6D4" name="Events" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Todos List */}
      <div className={`${darkMode ? "bg-gray-900" : 'bg-white shadow-md'} rounded-2xl overflow-hidden`}>
        <div className="p-4 sm:p-6">
          <div className="text-lg sm:text-xl font-bold mb-4">Recent Todos</div>
        </div>
        
        {lastTodos && lastTodos.length && lastTodos.filter(task => !task.onProgress && !task.done).length > 0 ? (
          <>
            {/* Desktop Table View - Hidden on mobile */}
            <div className="hidden lg:block">
              <div className='w-full grid grid-cols-[20%_30%_20%_15%_15%] auto-rows-[44px] overflow-auto hide-scrollbar'>
                {/* HEADER */}
                <div className="flex items-center justify-start border-b border-gray-300 border-r">
                  <div className={`ml-3 flex items-center gap-1 ${darkMode ? "text-white" : "text-gray-600"} font-semibold`}>
                    <MdTaskAlt />
                    Task Name
                  </div>
                </div>
                <div className="flex items-center justify-start border-b border-gray-300 border-r">
                  <div className={`ml-3 flex items-center gap-1 ${darkMode ? "text-white" : "text-gray-600"} font-semibold`}>
                    <FaTasks />
                    Description
                  </div>
                </div>
                <div className="flex items-center justify-start border-b border-gray-300 border-r">
                  <div className={`ml-3 flex items-center gap-1 ${darkMode ? "text-white" : "text-gray-600"} font-semibold`}>
                    Estimation
                  </div>
                </div>
                <div className="flex items-center justify-start border-b border-gray-300 border-r">
                  <div className={`ml-1 flex items-center gap-1 ${darkMode ? "text-white" : "text-gray-600"} font-semibold`}>
                    <MdPeopleAlt />
                    People
                  </div>
                </div>
                <div className="flex items-center justify-start border-b border-gray-300">
                  <div className={`flex items-center ${darkMode ? "text-white" : "text-gray-600"} font-semibold`}>
                    <MdOutlinePriorityHigh />
                    Priority
                  </div>
                </div>

                {/* Tasks */}
                {lastTodos
                  .filter(task => !task.onProgress && !task.done)
                  .map((task, index) => (
                    <React.Fragment key={task._id || index}>
                      <div className="flex px-2 overflow-hidden cursor-pointer items-center justify-start border-b border-r border-gray-300">
                        <div className='font-semibold truncate w-full'>
                          {task.name || 'Untitled Task'}
                        </div>
                      </div>
                      <div className="flex px-2 overflow-hidden cursor-pointer items-center justify-start border-b border-r border-gray-300">
                        <div className='font-semibold truncate w-full'>
                          {task.description || "No Description"}
                        </div>
                      </div>
                      <div className="flex px-2 items-center justify-start border-b border-r border-gray-300">
                        <div className='font-semibold'>
                          {task.estimation || "N/A"}
                        </div>
                      </div>
                      <div className={`flex items-center justify-center border-b border-r border-gray-300`}>
                        {task.people && task.people.avatar ? (
                          <div className='w-full h-full flex items-center justify-center'>
                            <img src={task.people.avatar} alt="Assigned User Avatar" className="w-8 h-8 rounded-full object-cover" />
                          </div>
                        ) : (
                          <div className='w-full h-full flex justify-center items-center'>
                            <PiEmptyBold className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-center border-b border-gray-300">
                        <span
                          className={`px-2 py-1 text-xs rounded-md ${
                            task.priority === "high"
                              ? "bg-red-100 text-red-600"
                              : task.priority === "medium"
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {task.priority || 'N/A'}
                        </span>
                      </div>
                    </React.Fragment>
                  ))}
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4 p-4 max-h-96 overflow-y-auto">
              {lastTodos
                .filter(task => !task.onProgress && !task.done)
                .map((task, index) => (
                  <div key={task._id || index} className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg p-4 space-y-3`}>
                    {/* Task Name */}
                    <div className="flex items-start gap-2">
                      <MdTaskAlt className={`mt-1 flex-shrink-0 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Task Name</div>
                        <div className="font-semibold">{task.name || 'Untitled Task'}</div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="flex items-start gap-2">
                      <FaTasks className={`mt-1 flex-shrink-0 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Description</div>
                        <div className="text-sm">{task.description || "No Description"}</div>
                      </div>
                    </div>

                    {/* Bottom Row - Estimation, People, Priority */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Estimation</div>
                        <div className="text-sm font-medium">{task.estimation || "N/A"}</div>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <div className="text-xs text-gray-500 mb-1">People</div>
                        {task.people && task.people.avatar ? (
                          <img src={task.people.avatar} alt="Assigned User" className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                          <PiEmptyBold className="text-gray-400 text-lg" />
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <div className="text-xs text-gray-500 mb-1">Priority</div>
                        <span
                          className={`px-2 py-1 text-xs rounded-md ${
                            task.priority === "high"
                              ? "bg-red-100 text-red-600"
                              : task.priority === "medium"
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {task.priority || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </>
        ) : (
          <div className="w-full h-32 flex flex-col justify-center items-center text-gray-500 p-8">
            <div className="text-4xl mb-2">📋</div>
            <div className="font-semibold">No Recent Pending Todos Yet</div>
            <div className="text-sm text-center mt-1">Create some todos to see them here</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashBoard;