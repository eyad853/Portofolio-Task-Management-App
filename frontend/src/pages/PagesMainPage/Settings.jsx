import React, { useState } from 'react';
import { FaUser } from 'react-icons/fa';
import { MdEdit } from 'react-icons/md';
import axios from 'axios';
import Modal from 'react-modal';
import ChangeNameModal from '../../components/Modals/ChangeNameModal/ChangeNameModal';
import ChangeEmailModal from '../../components/Modals/ChangeEmailModal/ChangeEmailModal';
import ChangePasswordModal from '../../components/Modals/ChangePasswordModal/ChangePasswordModal';
import { useNavigate } from 'react-router-dom';

const SettingsPage = ({ darkMode, setUser, user, setDarkMode }) => {
    const [isNameModalOpen, setIsNameModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [isMessageVisible, setIsMessageVisible] = useState(false);
    const navigate = useNavigate();

    // Function to display messages
    const showMessage = (msg) => {
        setMessage(msg);
        setIsMessageVisible(true);
        setTimeout(() => {
            setIsMessageVisible(false);
            setMessage('');
        }, 3000);
    };

    // Handle profile image upload
    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/settings/updateUserInfo`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true,
            });
            setUser(prevUser => ({ ...prevUser, avatar: response.data.user.avatar }));
            showMessage('Profile image updated successfully!');
        } catch (error) {
            console.error('Error updating profile image:', error);
            showMessage(`Error updating profile image: ${error.response?.data?.message || error.message}`);
        }
    };

    // Handle delete account
    const handleDeleteAccount = async () => {
        try {
            setUser(null);
            setDarkMode(false);
            await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/settings/deleteAccount`, { withCredentials: true });
            showMessage('Account deleted successfully!');
            navigate('/signup')
        } catch (error) {
            console.error('Error deleting account:', error);
            showMessage(`Error deleting account: ${error.response?.data?.message || error.message}`);
        }
    };

    // Handle logout
    const handleLogout = async () => {
        try {
            setUser(null);
            setDarkMode(false);
            await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/settings/logoutAccount`, { withCredentials: true });
            showMessage('Logged out successfully!');
            navigate('/login')
        } catch (error) {
            console.error('Error logging out:', error);
            showMessage(`Error logging out: ${error.response?.data?.message || error.message}`);
        }
    };

    // Handle dark mode toggle
    const handleDarkModeToggle = async () => {
        const newDarkModeState = !darkMode;
        try {
            setDarkMode(prev => !prev);
            showMessage(`Dark mode ${newDarkModeState ? 'enabled' : 'disabled'}`);
            await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/settings/darkMode`, { darkMode: newDarkModeState }, { withCredentials: true });
        } catch (error) {
            console.error('Error updating dark mode:', error);
            showMessage(`Error updating dark mode: ${error.response?.data?.message || error.message}`);
        }
    };

    return (
        <div className={`w-full min-h-screen ${darkMode ? 'text-white bg-gray-800' : 'bg-gray-50'} transition-all duration-300`}>
            {/* Success/Error Message */}
            {isMessageVisible && (
                <div className="fixed top-4 sm:top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50 text-sm sm:text-base max-w-xs sm:max-w-sm text-center">
                    {message}
                </div>
            )}

            <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                        Settings
                    </h1>
                    <p className={`text-sm sm:text-base ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Manage your account and preferences
                    </p>
                </div>

                {/* Main Settings Container */}
                <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-xl shadow-lg overflow-hidden`}>
                    
                    {/* Account Settings Section */}
                    <div className="p-6 sm:p-8">
                        <div className="mb-8">
                            <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
                                Account Settings
                            </h2>

                            {/* Profile Picture */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-8">
                                <div className="flex-shrink-0">
                                    <div className={`w-24 h-24 sm:w-32 sm:h-32 cursor-pointer rounded-full relative border-2 ${darkMode ? 'border-gray-600' : 'border-gray-300'} overflow-hidden group`}>
                                        <input
                                            type="file"
                                            name="avatar"
                                            className='absolute inset-0 opacity-0 cursor-pointer z-10'
                                            onChange={handleImageChange}
                                            accept="image/*"
                                        />
                                        {user && user?.avatar ? (
                                            <>
                                                <img 
                                                    src={user.avatar} 
                                                    className='w-full h-full object-cover transition-opacity duration-200 group-hover:opacity-75' 
                                                    alt="User Avatar" 
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black bg-opacity-50">
                                                    <span className="text-white text-xs sm:text-sm font-medium">Change Photo</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className={`w-full h-full flex justify-center items-center ${darkMode ? 'text-gray-400' : 'text-gray-500'} group-hover:bg-gray-100 dark:group-hover:bg-gray-700 transition-colors duration-200`}>
                                                <FaUser size={window.innerWidth < 640 ? 40 : 60} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="text-center sm:text-left">
                                    <h3 className={`text-lg sm:text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                                        Profile Picture
                                    </h3>
                                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Click the image to upload a new profile picture
                                    </p>
                                </div>
                            </div>

                            {/* User Information */}
                            <div className="space-y-6">
                                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                                    User Information
                                </h3>
                                
                                {/* Username */}
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                    <div className="flex items-center gap-3 flex-1">
                                        <span className={`text-sm sm:text-base font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} min-w-20`}>
                                            Username:
                                        </span>
                                        <span className={`text-sm sm:text-base text-blue-600 dark:text-blue-400 font-medium truncate`}>
                                            {user?.username}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setIsNameModalOpen(true)}
                                        className={`w-10 h-10 flex justify-center items-center rounded-full transition-all duration-200 ${
                                            darkMode 
                                                ? 'hover:bg-gray-700 text-gray-300 hover:text-white' 
                                                : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
                                        } flex-shrink-0 self-start sm:self-center`}
                                        title="Edit username"
                                    >
                                        <MdEdit size={18} />
                                    </button>
                                </div>

                                {/* Email */}
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                    <div className="flex items-center gap-3 flex-1">
                                        <span className={`text-sm sm:text-base font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} min-w-20`}>
                                            Email:
                                        </span>
                                        <span className={`text-sm sm:text-base text-blue-600 dark:text-blue-400 font-medium truncate`}>
                                            {user?.email}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setIsEmailModalOpen(true)}
                                        className={`w-10 h-10 flex justify-center items-center rounded-full transition-all duration-200 ${
                                            darkMode 
                                                ? 'hover:bg-gray-700 text-gray-300 hover:text-white' 
                                                : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
                                        } flex-shrink-0 self-start sm:self-center`}
                                        title="Edit email"
                                    >
                                        <MdEdit size={18} />
                                    </button>
                                </div>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                                    {/* Change Password */}
                                    <button
                                        onClick={() => setIsPasswordModalOpen(true)}
                                        className="w-full h-12 flex justify-center items-center cursor-pointer transform hover:scale-105 transition-all duration-200 hover:bg-blue-600 hover:text-white border-2 border-blue-600 rounded-lg text-blue-600 font-medium text-sm sm:text-base"
                                    >
                                        Change Password
                                    </button>

                                    {/* Delete Account */}
                                    <button
                                        onClick={handleDeleteAccount}
                                        className="w-full h-12 flex justify-center items-center cursor-pointer transform hover:scale-105 transition-all duration-200 hover:bg-red-600 hover:text-white border-2 border-red-600 rounded-lg text-red-600 font-medium text-sm sm:text-base"
                                    >
                                        Delete Account
                                    </button>

                                    {/* Logout */}
                                    <button
                                        onClick={handleLogout}
                                        className="w-full h-12 flex justify-center items-center cursor-pointer transform hover:scale-105 transition-all duration-200 hover:bg-red-600 hover:text-white border-2 border-red-600 rounded-lg text-red-600 font-medium text-sm sm:text-base sm:col-span-2 lg:col-span-1"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>

                    {/* Display Settings Section */}
                    <div className="p-6 sm:p-8">
                        <div className="mb-6">
                            <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
                                Display Settings
                            </h2>

                            {/* Dark Mode Toggle */}
                            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-lg ${!darkMode ?  'bg-gray-50 border-gray-200' : 'bg-gray-800 border-gray-700'} border`}>
                                <div>
                                    <h3 className={`text-base sm:text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                                        Dark Mode
                                    </h3>
                                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Toggle between light and dark appearance
                                    </p>
                                </div>
                                
                                {/* Toggle Switch */}
                                <div className="flex items-center gap-3">
                                    <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                        {darkMode ? 'Dark' : 'Light'}
                                    </span>
                                    <button
                                        onClick={handleDarkModeToggle}
                                        className={`relative w-14 sm:w-16 h-7 sm:h-8 rounded-full border-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 ${
                                            darkMode 
                                                ? 'bg-blue-600 border-blue-600' 
                                                : 'bg-gray-300 border-gray-300'
                                        }`}
                                    >
                                        <div
                                            className={`absolute top-1/2 transform -translate-y-1/2 w-5 sm:w-6 h-5 sm:h-6 bg-white rounded-full shadow-lg transition-all duration-300 ${
                                                darkMode 
                                                    ? 'translate-x-7 sm:translate-x-8' 
                                                    : 'translate-x-1'
                                            }`}
                                        ></div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional spacing for mobile */}
                <div className="h-20 sm:h-0"></div>
            </div>

            {/* Modals */}
            <ChangeNameModal 
                isOpen={isNameModalOpen} 
                setUser={setUser} 
                setIsOpen={setIsNameModalOpen} 
                darkMode={darkMode} 
                showMessage={showMessage} 
            />
            <ChangeEmailModal 
                isOpen={isEmailModalOpen} 
                setUser={setUser} 
                setIsOpen={setIsEmailModalOpen} 
                darkMode={darkMode} 
                showMessage={showMessage} 
            />
            <ChangePasswordModal 
                user={user} 
                isOpen={isPasswordModalOpen} 
                setUser={setUser} 
                setIsOpen={setIsPasswordModalOpen} 
                darkMode={darkMode} 
                showMessage={showMessage} 
            />
        </div>
    );
};

export default SettingsPage;