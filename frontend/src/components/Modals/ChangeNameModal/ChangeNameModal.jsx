import axios from 'axios';
import React, { useState } from 'react';
import Modal from 'react-modal';

const ChangeNameModal = ({ isOpen, setIsOpen, setUser, darkMode, showMessage }) => {
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const updateName = async () => {
        setError(''); // Clear previous errors
        if (name.trim() === "") {
            setError("Name cannot be empty.");
            return;
        }
        try {
            setUser(prev => ({ ...prev, username: name })); // Instant UI update
            setIsOpen(false);
            setName('');
            const response = await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/settings/updateUserInfo`, { name }, { withCredentials: true }); // Changed 'name' to 'username' to match
            showMessage(response.data.message || 'Username updated successfully!');
        } catch (err) {
            console.error('Error updating name:', err);
            setError(err.response?.data?.message || 'Failed to update username. Please try again.');
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={() => {
                setIsOpen(false);
                setError(''); // Clear error on close
                setName('');
            }}
            shouldCloseOnOverlayClick={true}
            shouldCloseOnEsc={true}
            className={`w-180 h-40 select-none ${darkMode ? 'bg-neutral-700 text-white' : 'bg-white'} p-5 rounded-xl shadow-xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 outline-none`}
            overlayClassName={`fixed inset-0 bg-gray-500/50 z-50 flex justify-center items-center`}
        >
            <div className="flex w-full h-full flex-col gap-5 justify-center items-center">
                <input
                    type="text"
                    className={`w-full h-10 outline-none rounded-md border ${darkMode ? 'border-neutral-600 bg-neutral-800 text-white' : 'border-neutral-300 bg-white text-black'} px-3`}
                    placeholder='Enter New Username'
                    value={name}
                    onChange={({ target }) => {
                        setName(target.value);
                    }}
                />
                {error && <div className="text-red-500 text-sm">{error}</div>}
                <div
                    onClick={updateName}
                    className="w-full h-10 flex justify-center items-center bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700 transition-colors duration-300"
                >
                    Update
                </div>
            </div>
        </Modal>
    );
};

export default ChangeNameModal;