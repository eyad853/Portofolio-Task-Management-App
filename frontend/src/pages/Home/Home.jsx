import { useEffect, useState } from 'react';
import Sidebar from '../../components/SIdebar/Sidebar';
import MainPage from '../../components/MainPage/MainPage';
import Nav from '../../components/Nav/Nav';
import PagesModal from '../../components/Modals/PagesModal';
import axios from 'axios';
import TodosModal from '../../components/Modals/TodosModal';
import FriendsModal from '../../components/Modals/FriendsModal';
import { io } from 'socket.io-client';
import AuthModal from '../../components/Modals/AuthModal/AuthModal';

const Home = ({trigger}) => {
  const [isSideBarOpen, setIsSideBarOpen] = useState(window.innerWidth >= 1024);
  const [content, setContent] = useState("Dashboard");
  const [route, setRoute] = useState("");
  const [isPagesOpen, setIsPagesOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [icon, setIcon] = useState("");
  const [color, setColor] = useState("");
  const [pages, setPages] = useState([]);
  const [customContent, setCustomContent] = useState("");
  const [isTodosModalOpen, setIsTodosModalOpen] = useState(false);
  const [isFriendsModalOpen, setIsFriendsModalOpen] = useState(false);
  const [selectedTeamMates, setSelectedTeamMates] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [selectedPageId, setSelectedPageId] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);


  const socket = io(import.meta.env.VITE_BACKEND_URL, {
    transports: ['websocket'],
    withCredentials: true
  });

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
    });

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('disconnect');
    };
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSideBarOpen(true);
      } else {
        setIsSideBarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/user`, { withCredentials: true })
      .then(response => {
        if (!response.data.error) {
          setUser(response.data.user);
          console.log(response.data.user || "no data");
        }
      })
      .catch(error => {
        setUser(null)
      });
  }, [trigger]);

  const fetchPages = async () => {
    if(!user)return
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/getPages`, { withCredentials: true });
      if (res) {
        setPages(res.data.pages);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchPages();
  }, [selectedPageId , user]);

  return (
    <div className='min-h-screen flex w-full overflow-hidden'>
      <Sidebar
        setIsPagesOpen={setIsPagesOpen}
        setRoute={setRoute}
        setContent={setContent}
        pages={pages}
        setPages={setPages}
        fetchPages={fetchPages}
        setCustomContent={setCustomContent}
        isSideBarOpen={isSideBarOpen}
        setIsSideBarOpen={setIsSideBarOpen}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        user={user}
        setSelectedPageId={setSelectedPageId}
        setShowAuthModal={setShowAuthModal}
      />

      {/* Main Content Area */}
      <div className={`
        flex flex-col flex-1 transition-all duration-500
        ${isSideBarOpen && window.innerWidth >= 1024 ? 'lg:pl-[20%]' : ''}
        w-full min-w-0
      `}>
        <Nav
          route={route}
          isSideBarOpen={isSideBarOpen}
          setIsSideBarOpen={setIsSideBarOpen}
          darkMode={darkMode}
          setContent={setContent}
        />

        {/* MainPage takes the remaining space */}
        <div className="flex-1 overflow-auto">
          <MainPage
            pages={pages}
            content={content}
            customContent={customContent}
            isTodosModalOpen={isTodosModalOpen}
            setIsTodosModalOpen={setIsTodosModalOpen}
            isFriendsModalOpen={isFriendsModalOpen}
            setIsFriendsModalOpen={setIsFriendsModalOpen}
            selectedTeamMates={selectedTeamMates}
            isSideBarOpen={isSideBarOpen}
            setIsSideBarOpen={setIsSideBarOpen}
            darkMode={darkMode}
            user={user}
            selectedPageId={selectedPageId}
            tasks={tasks}
            setDarkMode={setDarkMode}
            setTasks={setTasks}
            setUser={setUser}
            socket={socket}
          />
        </div>
      </div>

      <PagesModal
        isPagesOpen={isPagesOpen}
        setIsPagesOpen={setIsPagesOpen}
        name={name}
        setName={setName}
        type={type}
        setType={setType}
        icon={icon}
        setIcon={setIcon}
        color={color}
        setColor={setColor}
        fetchPages={fetchPages}
        darkMode={darkMode}
        pages={pages}
        setPages={setPages}
      />

      <TodosModal
        isTodosModalOpen={isTodosModalOpen}
        setIsTodosModalOpen={setIsTodosModalOpen}
        isFriendsModalOpen={isFriendsModalOpen}
        setIsFriendsModalOpen={setIsFriendsModalOpen}
        pages={pages}
        setPages={setPages}
        darkMode={darkMode}
        selectedPageId={selectedPageId}
        setTasks={setTasks}
      />
      <AuthModal showModal={showAuthModal} setShowModal={setShowAuthModal}/>
    </div>
  );
};

export default Home;