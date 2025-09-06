import React, { useEffect, useState } from 'react'
import Modal from "react-modal"
import { CiSearch } from "react-icons/ci";
import axios from 'axios';
import { FaUser } from 'react-icons/fa';

const FriendsModal = ({todoPage,isFriendsModalOpen,user, darkMode, setIsFriendsModalOpen,setInvitePopUp}) => {
    const [searchTerm, setSearchTerm] = useState("")
    const [users, setUsers] = useState([]);
    const [invitedUsers, setInvitedUsers] = useState([]);
    const [invitedUsersIds , setInvitedUsersIds]=useState([])
    const [currentPage, setCurrentPage] = useState("all users");

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/getAllUsers`)
                const data = response.data
                if (data) {
                    setUsers(data.users.filter(u=>u._id!==user._id));
                }
            } catch (error) {
                console.log(error);
            }
        }

        fetchUsers();
    }, [])

    const handleInviteUser = (user) => {
        // Check if user is already invited
        const isAlreadyInvited = invitedUsers.some(invitedUser => invitedUser._id === user._id);
        
        if (!isAlreadyInvited) {
            setInvitedUsers(prev => [...prev, user]);
            setInvitedUsersIds(prev => [...prev, user._id]);
        }
    };

    const handleRemoveInvite = (userId) => {
        setInvitedUsers(prev => prev.filter(user => user._id !== userId));
        setInvitedUsersIds(prev => prev.filter(id => id !== userId));
    };

    const isUserInvited = (userId) => {
        return invitedUsers.some(invitedUser => invitedUser._id === userId);
    };

    const usersToDisplay = currentPage === "all users" ? users : invitedUsers;

    const handleInviteUsers = async()=>{
        const body ={
            pageId:todoPage._id,
            receiverIds:invitedUsersIds
        }
        try{
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/invite/sendInvites` , body , {withCredentials:true})
        }catch(err){
            console.log(err);
        }
    }

    return (
        <Modal
            isOpen={isFriendsModalOpen}
            onRequestClose={() => setIsFriendsModalOpen(false)}
            className={`w-150 h-140 ${darkMode ? "bg-gray-800 text-white" : "bg-white"} p-6 rounded-xl shadow-xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 outline-none`}
            overlayClassName="fixed inset-0 bg-gray-300/50 z-50 flex justify-center items-center"
            shouldCloseOnOverlayClick={true}
            shouldCloseOnEsc={true}
        >
            <div className='w-full h-full flex flex-col'>
                <div className='w-full text-2xl font-bold'>
                    Invite Teammates
                </div>
                
                {/* Search and Filter Section */}
                <div className='w-full h-10 mt-3 flex items-center justify-between'>
                    <div className="h-4 w-80 flex items-center">
                        <div className={`flex flex-1 items-center border ${darkMode ? "border-white text-white" : "border-gray-500 text-gray-500"} py-1 rounded-2xl`}>
                            <div className='h-full cursor-pointer rounded-l-md w-10 flex justify-center items-center'>
                                <CiSearch />
                            </div>
                            <div className='h-full w-50'>
                                <input 
                                    type="text" 
                                    className={`w-full h-full outline-none rounded-r-md px-2 ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"}`}
                                    placeholder='Search teammates...'
                                    value={searchTerm}
                                    onChange={({target}) => {
                                        setSearchTerm(target.value)
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="h-full w-52 flex items-center justify-end">
                        <div className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-500"}`}>
                            Invited: {invitedUsers.length}
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className='w-full h-10 flex items-center justify-start gap-5'>
                    <div 
                        onClick={() => {
                            setCurrentPage("all users")
                        }}
                        className={`font-medium ${currentPage === "all users" ? "text-blue-600 border-b-2 border-blue-600" : darkMode ? "text-gray-300" : "text-gray-600"} hover:text-blue-600 transition-all duration-200 cursor-pointer pb-1`}
                    >
                        All Users ({users.length})
                    </div>
                    <div 
                        onClick={() => {
                            setCurrentPage("invited")
                        }}
                        className={`font-medium ${currentPage === "invited" ? "text-blue-600 border-b-2 border-blue-600" : darkMode ? "text-gray-300" : "text-gray-600"} hover:text-blue-600 transition-all duration-200 cursor-pointer pb-1`}
                    >
                        Invited ({invitedUsers.length})
                    </div>
                </div>

                {/* Users List */}
                <div className='w-full flex-1 overflow-auto hide-scrollbar flex flex-col rounded-2xl mt-3'>
                    {usersToDisplay.length > 0 ? (
                        usersToDisplay
                            .filter((user) =>
                                user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                user.email?.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                            .map((user, index) => (
                                <div
                                    key={user._id || index}
                                    className={`p-3 ${darkMode ? "hover:bg-gray-700" : "hover:bg-blue-50"} transition-all duration-200 flex justify-between items-center gap-3 border-b ${darkMode ? "border-gray-700" : "border-gray-100"}`}
                                >
                                    <div className='flex items-center gap-3'>
                                        <div className='w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full'>
                                            {user.avatar ? (
                                                <div className='w-full h-full flex justify-center items-center'>
                                                    <img src={user.avatar} className='w-full h-full rounded-full object-cover' alt="" />
                                                </div>
                                            ) : (
                                                <div className='w-full h-full text-white flex justify-center items-center'>
                                                    <FaUser className='text-lg' />
                                                </div>
                                            )}
                                        </div>
                                        <div className='flex flex-col gap-1'>
                                            <span className='font-semibold text-base'>{user.username}</span>
                                            <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{user.email}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Action Button */}
                                    <div className='flex items-center gap-2'>
                                        {currentPage === "all users" ? (
                                            <button
                                                onClick={() => handleInviteUser(user)}
                                                disabled={isUserInvited(user._id)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                                    isUserInvited(user._id)
                                                        ? `${darkMode ? "bg-green-700 text-green-200" : "bg-green-100 text-green-700"} cursor-not-allowed`
                                                        : `bg-blue-500 hover:bg-blue-600 text-white hover:shadow-md`
                                                }`}
                                            >
                                                {isUserInvited(user._id) ? "Invited" : "Invite"}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleRemoveInvite(user._id)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                                    darkMode 
                                                        ? "bg-red-700 hover:bg-red-600 text-red-200" 
                                                        : "bg-red-100 hover:bg-red-200 text-red-700"
                                                } hover:shadow-md`}
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                    ) : (
                        <div className={`p-8 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                            {currentPage === "all users" 
                                ? (searchTerm ? "No users found matching your search." : "No users available.")
                                : (searchTerm ? "No invited users found matching your search." : "No users invited yet.")
                            }
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className='w-full h-16 flex items-center justify-end gap-3 mt-4 border-t pt-4'>
                    <button
                        onClick={() => setIsFriendsModalOpen(false)}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            darkMode 
                                ? "bg-gray-700 hover:bg-gray-600 text-gray-300" 
                                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                        }`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            setIsFriendsModalOpen(false);
                            handleInviteUsers()
                            setInvitePopUp(true)
                        }}
                        disabled={invitedUsers.length === 0}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            invitedUsers.length > 0
                                ? "bg-blue-500 hover:bg-blue-600 text-white hover:shadow-md"
                                : `${darkMode ? "bg-gray-700 text-gray-500" : "bg-gray-200 text-gray-400"} cursor-not-allowed`
                        }`}
                    >
                        Send Invites ({invitedUsers.length})
                    </button>
                </div>
            </div>
        </Modal>
    )
}

export default FriendsModal