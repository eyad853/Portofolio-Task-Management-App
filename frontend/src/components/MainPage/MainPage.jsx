import React, { useState } from 'react';
import TodoPage from '../../pages/PagesMainPage/TodoPage';
import CalendarPage from '../../pages/PagesMainPage/CalendarPage ';
import KanbanPage from '../../pages/PagesMainPage/KanbanPage';
import NotesPage from '../../pages/PagesMainPage/NotesPage';
import { motion } from 'framer-motion';
import DashBoard from '../DashBoard/DashBoard';
import Notifications from '../../pages/PagesMainPage/Notifications';
import SettingsPage from '../../pages/PagesMainPage/Settings';
import NotificationsPage from '../../pages/PagesMainPage/Notifications';

const MainPage = ({ 
  content, 
  pages,
  setDarkMode,
  socket,
  selectedPageId,
  selectedTeamMates,
  customContent, 
  isTodosModalOpen, 
  setIsTodosModalOpen,
  isFriendsModalOpen, 
  setIsFriendsModalOpen,
  isSideBarOpen,
  darkMode,
  user,
  tasks,
  setUser,
  setTasks,
}) => {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const [monNum, setMonNum] = useState(0);
  const [year, setYear] = useState(2025);
  const [selectedModule, setSelectedModule] = useState("Month");

  return (
    <motion.div 
      className={`
        w-full min-h-screen 
        ${darkMode ? "bg-gray-800" : "bg-white"} 
        transition-all duration-300 
        p-3 sm:p-4 md:p-6
        overflow-auto
      `}
      animate={{ width: '100%' }}
      transition={{ duration: 0.5 }}
    >
      {(() => {  
        switch (content) {
          case "Notifications": 
            return (
              <div className="w-full max-w-7xl mx-auto">
                <NotificationsPage 
                  user={user}
                  socket={socket}
                  darkMode={darkMode}
                />
              </div>
            );
          case "Settings": 
            return (
              <div className="w-full max-w-4xl mx-auto">
                <SettingsPage 
                  user={user}
                  darkMode={darkMode}
                  setUser={setUser}
                  setDarkMode={setDarkMode}
                />
              </div>
            );
          case "todo":
            return (
              <div className="w-full max-w-7xl mx-auto">
                <TodoPage
                  pages={pages}
                  setIsTodosModalOpen={setIsTodosModalOpen} 
                  isTodosModalOpen={isTodosModalOpen} 
                  isFriendsModalOpen={isFriendsModalOpen} 
                  setIsFriendsModalOpen={setIsFriendsModalOpen}
                  selectedTeamMates={selectedTeamMates}
                  isSideBarOpen={isSideBarOpen}
                  darkMode={darkMode}
                  selectedPageId={selectedPageId}
                  tasks={tasks}
                  setTasks={setTasks}
                  user={user}
                />
              </div>
            );
          case "calendar":
            return (
              <div className="w-full max-w-7xl mx-auto">
                <CalendarPage
                  pages={pages} 
                  isSideBarOpen={isSideBarOpen}
                  darkMode={darkMode}
                  selectedPageId={selectedPageId}
                />
              </div>
            );
          case "kanban":
            return (
              <div className="w-full max-w-7xl mx-auto">
                <KanbanPage
                  pages={pages} 
                  isFriendsModalOpen={isFriendsModalOpen}
                  setIsFriendsModalOpen={setIsFriendsModalOpen}
                  isSideBarOpen={isSideBarOpen}
                  selectedPageId={selectedPageId}
                  darkMode={darkMode}
                />
              </div>
            );
          case "notes":
            return (
              <div className="w-full max-w-4xl mx-auto">
                <NotesPage
                  pages={pages} 
                  isSideBarOpen={isSideBarOpen}
                  darkMode={darkMode}
                  selectedPageId={selectedPageId}
                />
              </div>
            );
          case "Dashboard":
            return (
              <div className="w-full max-w-7xl mx-auto">
                <DashBoard 
                  user={user} 
                  darkMode={darkMode}
                />
              </div>
            );
          default:
            return (
              <div className="w-full max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
                <div className={`text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <div className="text-4xl mb-4">📋</div>
                  <div className="text-xl font-semibold mb-2">Welcome to Task Management</div>
                  <div className="text-sm">Select a page from the sidebar to get started</div>
                </div>
              </div>
            );
        }
      })()}
    </motion.div>
  );
};

export default MainPage;