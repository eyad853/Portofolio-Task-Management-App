import axios from 'axios';
import React, { useState } from 'react';
import Modal from 'react-modal';

const ChangeEmailModal = ({ isOpen, setIsOpen, setUser, darkMode, showMessage }) => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const updateEmail = async () => { // Renamed from updateName to updateEmail
        setError(''); // Clear previous errors
        if (email.trim() === "" || !email.includes('@')) {
            setError("Please enter a valid email.");
            return;
        }
        try {
            setUser(prev => ({ ...prev, email: email })); // Instant UI update
            setIsOpen(false);
            setEmail('');
            const response = await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/settings/updateUserInfo`, { email: email }, { withCredentials: true });
            showMessage(response.data.message || 'Email updated successfully!');
        } catch (err) {
            console.error('Error updating email:', err);
            setError(err.response?.data?.message || 'Failed to update email. Please try again.');
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={() => {
                setIsOpen(false);
                setError(''); // Clear error on close
                setEmail('');
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
                    placeholder='Enter New Email'
                    value={email}
                    onChange={({ target }) => {
                        setEmail(target.value);
                    }}
                />
                {error && <div className="text-red-500 text-sm">{error}</div>}
                <div
                    onClick={updateEmail}
                    className="w-full h-10 flex justify-center items-center bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700 transition-colors duration-300"
                >
                    Update
                </div>
            </div>
        </Modal>
    );
};

export default ChangeEmailModal;