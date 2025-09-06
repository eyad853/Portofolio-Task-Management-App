import React, { useEffect, useRef, useState } from 'react'
import { FaPlus } from "react-icons/fa6";
import { FaChevronDown, FaChevronRight, FaTasks, FaUser } from "react-icons/fa";
import axios from 'axios';
import { FaEllipsis } from "react-icons/fa6";
import { PiEmptyBold, PiTabsDuotone } from "react-icons/pi";
import { MdOutlinePriorityHigh, MdPeopleAlt, MdTaskAlt } from 'react-icons/md';
import TodoSettings from '../../components/TodoSettings/TodoSettings';
import { LuListTodo } from "react-icons/lu";
import UpdateTodoModal from '../../components/Modals/UpdateTodoModal';
import FriendsModal from '../../components/Modals/FriendsModal';

const TodoPage = ({
    pages,
    selectedTeamMates,
    isTodosModalOpen,
    isFriendsModalOpen,
    selectedPageId,
    setIsFriendsModalOpen,
    setIsTodosModalOpen,
    darkMode,
    tasks,
    user,
    setTasks
}) => {
    const [openTodoId, setOpenTodoId] = useState(null);
    const [onProgressTasks, setOnProgressTasks] = useState([]);
    const [doneTasks, setDoneTasks] = useState([]);
    const [collapsedSections, setCollapsedSections] = useState({
        todo: false,
        progress: false,
        done: false
    });

    const settingsRef = useRef(null);
    const [showNoTasks, setShowNoTasks] = useState(false);
    const [isUpdateTodoModal, setIsUpdateTodoModal] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0 });
    
    // Update todo state
    const [name, setName] = useState("");
    const [discription, setDiscription] = useState();
    const [estimation, setEstimation] = useState("");
    const [priority, setPriority] = useState("");
    const [selectedTask, setSelectedTask] = useState(null);
    const [invitePopUp, setInvitePopUp] = useState(false);
    const [loading, setLoading] = useState(false);

    const todoPage = pages.find(page => page._id === selectedPageId);

    const toggleSection = (section) => {
        setCollapsedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const fetchTodos = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/getSpecificPage/${todoPage._id}`);
            if (response.data && response.data.page && response.data.page.content) {
                const allTasks = response.data.page.content.tasks || [];

                const todosOnly = allTasks.filter(task => !task.onProgress && !task.done);
                const onProgressOnly = allTasks.filter(task => task.onProgress);
                const doneOnly = allTasks.filter(task => task.done);

                setTasks(todosOnly);
                setOnProgressTasks(onProgressOnly);
                setDoneTasks(doneOnly);
            }
        } catch (error) {
            console.error("Failed to fetch tasks:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (pages.length === 0) return;
        if (!todoPage) return;

        fetchTodos();

        const timeoutId = setTimeout(() => {
            setShowNoTasks(true);
        }, 200);

        return () => clearTimeout(timeoutId);
    }, [selectedPageId]);

    useEffect(() => {
        setTasks([]);
        setOnProgressTasks([]);
        setDoneTasks([]);
    }, [selectedPageId]);

    const deleteTodo = async (todoId) => {
        try {
            setTasks(tasks.filter(task => task._id !== todoId));
            const response = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/deleteItem/${todoPage._id}/${todoId}`);
        } catch (error) {
            console.error("Failed to delete todo:", error);
        }
    };

    const handleEllipsisClick = (e, task) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        const top = rect.bottom + window.scrollY;
        setDropdownPosition({ top });
        setOpenTodoId(task._id);
        setSelectedTask(task);
        setName(task.name);
        setDiscription(task.discription);
        setEstimation(task.estimation);
        setPriority(task.priority);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (settingsRef.current &&
                !settingsRef.current.contains(event.target) &&
                !isUpdateTodoModal) {
                setOpenTodoId(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isUpdateTodoModal]);

    useEffect(() => {
        if (!isUpdateTodoModal && openTodoId !== null) {
            setOpenTodoId(null);
        }
    }, [isUpdateTodoModal]);

    const onProgressTodo = async (todoId) => {
        const taskFromTasks = tasks.find(t => t._id === todoId);
        const taskFromDone = doneTasks.find(t => t._id === todoId);
        const taskToMove = taskFromTasks || taskFromDone;

        if (!taskToMove) return;

        const updatedTasks = tasks.filter(t => t._id !== todoId);
        const updatedDoneTasks = doneTasks.filter(t => t._id !== todoId);
        const updatedOnProgress = [...onProgressTasks, { ...taskToMove, onProgress: true, done: false }];

        setTasks(updatedTasks);
        setDoneTasks(updatedDoneTasks);
        setOnProgressTasks(updatedOnProgress);

        try {
            await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/updateItem/${todoPage._id}/${todoId}`, {
                onProgress: true,
                done: false
            });
        } catch (error) {
            console.error("Error setting todo to on progress:", error);
            fetchTodos();
        } finally {
            window.processingTodos?.delete(todoId);
        }
    };

    const doneTodo = async (todoId, isCurrentlyDone) => {
        try {
            if (window.processingTodos?.has(todoId)) return;

            if (!window.processingTodos) window.processingTodos = new Set();
            window.processingTodos.add(todoId);

            let taskToMove = null;
            let sourceArraySetter = null;
            let targetDoneState = !isCurrentlyDone;

            if (tasks.some(t => t._id === todoId)) {
                taskToMove = tasks.find(t => t._id === todoId);
                sourceArraySetter = setTasks;
            } else if (onProgressTasks.some(t => t._id === todoId)) {
                taskToMove = onProgressTasks.find(t => t._id === todoId);
                sourceArraySetter = setOnProgressTasks;
            } else if (doneTasks.some(t => t._id === todoId)) {
                taskToMove = doneTasks.find(t => t._id === todoId);
                sourceArraySetter = setDoneTasks;
            }

            if (!taskToMove) {
                console.warn("Task not found for doneTodo:", todoId);
                return;
            }

            sourceArraySetter(prev => prev.filter(task => task._id !== todoId));
            if (targetDoneState) {
                setDoneTasks(prev => [...prev, { ...taskToMove, done: true, onProgress: false }]);
            } else {
                setTasks(prev => [...prev, { ...taskToMove, done: false, onProgress: false }]);
            }

            const response = await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/updateItem/${todoPage._id}/${todoId}`, {
                done: targetDoneState,
                onProgress: false
            });

        } catch (error) {
            console.error("Error changing done status of todo:", error);
            fetchTodos();
        } finally {
            window.processingTodos?.delete(todoId);
        }
    };

    // Render task table for desktop
    const renderTaskTable = (taskList, sectionName) => (
        <div className='w-full flex-1 hidden lg:grid lg:grid-cols-[5%_20%_25%_20%_12.5%_12.5%_5%] auto-rows-[44px] hide-scrollbar overflow-y-scroll'>
            {/* Desktop Table Header */}
            <div className='flex justify-center items-center border-b border-r border-gray-300'>
                <input type="checkbox" disabled />
            </div>
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
            <div className="flex items-center justify-start border-b border-gray-300 border-r">
                <div className={`flex items-center ${darkMode ? "text-white" : "text-gray-600"} font-semibold`}>
                    <MdOutlinePriorityHigh />
                    Priority
                </div>
            </div>
            <div
                onClick={() => { setIsTodosModalOpen(true) }}
                className={`flex items-center cursor-pointer justify-center border-b border-gray-300 ${darkMode ? "text-white" : "text-gray-600"}`}>
                <FaPlus />
            </div>

            {/* Desktop Task Rows */}
            {taskList.map((task, index) => (
                <React.Fragment key={index}>
                    <div className="flex items-center justify-center border-b border-r border-gray-300">
                        <input
                            type="checkbox"
                            checked={task.done}
                            onChange={() => { doneTodo(task._id, task.done) }}
                            className="cursor-pointer" />
                    </div>
                    <div className="flex px-2 flex-wrap overflow-y-scroll hide-scrollbar cursor-pointer items-center justify-start border-b border-r border-gray-300">
                        <div className='font-semibold break-words w-full'>
                            {task.name}
                        </div>
                    </div>
                    <div className="flex px-2 flex-wrap overflow-y-scroll hide-scrollbar cursor-pointer items-center justify-start border-b border-r border-gray-300">
                        <div className='font-semibold break-words w-full'>
                            {task.discription || "No Description"}
                        </div>
                    </div>
                    <div className="flex px-2 items-center justify-start border-b border-r border-gray-300">
                        <div className='font-semibold'>
                            {task.estimation || "N/A"}
                        </div>
                    </div>
                    <div className={`flex items-center justify-start transition-all hover:${darkMode ? "bg-gray-950" : "bg-gray-300"} duration-200 border-b border-r border-gray-300`}>
                        {task.people?.length > 0 ? (
                            <div className='w-full h-full flex items-center'>
                                <div>
                                    <img src={task.people.avatar} alt="" />
                                </div>
                            </div>
                        ) : (
                            <div className='w-full h-full flex justify-center items-center'>
                                <PiEmptyBold />
                            </div>
                        )}
                    </div>
                    <div className="flex items-center justify-center border-b border-r border-gray-300">
                        <span
                            className={`px-2 py-1 text-xs rounded-md ${task.priority === "high"
                                ? "bg-red-100 text-red-600"
                                : task.priority === "medium"
                                    ? "bg-yellow-100 text-yellow-600"
                                    : "bg-blue-100 text-blue-600"
                                }`}>
                            {task.priority}
                        </span>
                    </div>
                    <div className={`flex items-center justify-center border-b border-gray-300 ${darkMode ? "text-white" : "text-gray-600"}`}>
                        <FaEllipsis
                            onClick={(e) => {
                                handleEllipsisClick(e, task);
                                setName(task.name);
                                setDiscription(task.discription);
                                setEstimation(task.estimation);
                                setPriority(task.priority);
                            }}
                            className="cursor-pointer" />
                    </div>
                </React.Fragment>
            ))}
        </div>
    );

    // Render task cards for mobile/tablet
    const renderTaskCards = (taskList, sectionName) => (
        <div className='lg:hidden space-y-4 p-4 max-h-80 overflow-y-auto'>
            {taskList.map((task, index) => (
                <div key={index} className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg p-4 relative`}>
                    {/* Task Header */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={task.done}
                                onChange={() => { doneTodo(task._id, task.done) }}
                                className="cursor-pointer"
                            />
                            <div className="font-semibold text-base truncate max-w-40">
                                {task.name}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span
                                className={`px-2 py-1 text-xs rounded-md ${task.priority === "high"
                                    ? "bg-red-100 text-red-600"
                                    : task.priority === "medium"
                                        ? "bg-yellow-100 text-yellow-600"
                                        : "bg-blue-100 text-blue-600"
                                    }`}>
                                {task.priority}
                            </span>
                            <FaEllipsis
                                onClick={(e) => {
                                    handleEllipsisClick(e, task);
                                    setName(task.name);
                                    setDiscription(task.discription);
                                    setEstimation(task.estimation);
                                    setPriority(task.priority);
                                }}
                                className={`cursor-pointer ${darkMode ? "text-white" : "text-gray-600"}`}
                            />
                        </div>
                    </div>

                    {/* Task Details */}
                    <div className="space-y-2">
                        <div>
                            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Description</div>
                            <div className="text-sm">
                                {task.discription || "No Description"}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Estimation</div>
                                <div className="text-sm font-medium">
                                    {task.estimation || "N/A"}
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>People</div>
                                {task.people?.length > 0 ? (
                                    <img src={task.people.avatar} alt="" className="w-6 h-6 rounded-full" />
                                ) : (
                                    <PiEmptyBold className="text-gray-400 text-lg" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    // Render section (todo/progress/done)
    const renderSection = (title, taskList, sectionKey, sectionName) => (
        <div className='w-full h-auto lg:h-[45vh] flex flex-col rounded-t-2xl mb-4 lg:mb-0'>
            {/* Section Header */}
            <div
                className={`w-full ${darkMode ? "bg-gray-950" : "bg-neutral-100"} flex justify-start items-center h-12 rounded-t-2xl cursor-pointer`}
                onClick={() => toggleSection(sectionKey)}
            >
                <div className='flex gap-5 items-center ml-3 font-bold'>
                    <div className={`mt-1 transition-transform duration-300 ${collapsedSections[sectionKey] ? 'rotate-0' : 'rotate-90'}`}>
                        <FaChevronRight size={10} />
                    </div>
                    <div className='text-lg'>
                        {title} ({taskList.length})
                    </div>
                </div>
            </div>

            {/* Section Content */}
            {!collapsedSections[sectionKey] && (
                taskList && taskList.length > 0 ? (
                    <>
                        {renderTaskTable(taskList, sectionName)}
                        {renderTaskCards(taskList, sectionName)}
                    </>
                ) : (
                    showNoTasks && (
                        <div className='w-full h-40 lg:h-full flex flex-col text-gray-500 justify-center items-center font-semibold'>
                            <div className='text-3xl lg:text-5xl mb-2'>
                                <LuListTodo />
                            </div>
                            <div className="text-base lg:text-xl">No tasks yet</div>
                            <div className="text-sm lg:text-base text-center">Click "Add new task" to create your first task</div>
                        </div>
                    )
                )
            )}
        </div>
    );

    return (
        <div className={`w-full h-full px-3 sm:px-6 lg:px-10 pb-5 ${darkMode ? "text-white" : "text-black"}`}>
            {/* Page Header */}
            <div className='w-full h-auto lg:h-16 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-0 py-4'>
                <div className='text-2xl lg:text-3xl font-bold border-b border-gray-300 pb-2 lg:pb-0 lg:border-b-0 lg:mt-2'>
                    {todoPage?.name}
                </div>
                <div
                    onClick={() => { setIsTodosModalOpen(true) }}
                    className={`w-full sm:w-40 lg:w-36 transform hover:scale-105 cursor-pointer transition-all duration-300 rounded-md h-10 ${darkMode ? "bg-white text-black" : "bg-black text-white"} font-bold flex gap-3 justify-center items-center text-sm`}>
                    <FaPlus />
                    <span className="hidden sm:inline">Add new task</span>
                    <span className="sm:hidden">Add task</span>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="w-full h-64 flex justify-center items-center">
                    <div className="w-16 h-16 rounded-full border-y-2 border-blue-500 animate-spin"></div>
                </div>
            )}

            {/* Tasks Sections */}
            {!loading && (
                <div className='flex flex-col space-y-4 lg:space-y-0'>
                    {renderSection('To-do', tasks, 'todo', 'todo')}
                    {renderSection('In Progress', onProgressTasks, 'progress', 'onprogress')}
                    {renderSection('Done', doneTasks, 'done', 'done')}
                </div>
            )}

            {/* Dropdown Settings */}
            {openTodoId && (
                <div
                    ref={settingsRef}
                    className="absolute z-50"
                    style={{
                        top: `${dropdownPosition.top}px`,
                        right: "5px"
                    }}
                >
                    <TodoSettings
                        setOpenTodoId={setOpenTodoId}
                        todoId={openTodoId}
                        deleteTodo={deleteTodo}
                        setIsUpdateTodoModal={setIsUpdateTodoModal}
                        darkMode={darkMode}
                        onProgressTodo={onProgressTodo}
                        fetchTodos={fetchTodos}
                        sectionGrid="todo"
                    />

                    <UpdateTodoModal
                        task={selectedTask}
                        isUpdateTodoModal={isUpdateTodoModal}
                        setIsUpdateTodoModal={setIsUpdateTodoModal}
                        setOpenTodoId={setOpenTodoId}
                        name={name}
                        setName={setName}
                        discription={discription}
                        setDiscription={setDiscription}
                        estimation={estimation}
                        setEstimation={setEstimation}
                        priority={priority}
                        setPriority={setPriority}
                        darkMode={darkMode}
                        todoPage={todoPage}
                        fetchTodos={fetchTodos}
                        setTasks={setTasks}
                    />
                </div>
            )}

            {/* Modals */}
            <FriendsModal
                isFriendsModalOpen={isFriendsModalOpen}
                setIsFriendsModalOpen={setIsFriendsModalOpen}
                darkMode={darkMode}
                todoPage={todoPage}
                setInvitePopUp={setInvitePopUp}
                user={user}
            />

            {invitePopUp && (
                <div className="fixed bottom-4 right-4 w-48 sm:w-60 h-24 sm:h-32 rounded-md bg-green-400 p-4 shadow-lg z-50">
                    {/* Your invite popup content here */}
                </div>
            )}
        </div>
    )
}

export default TodoPage