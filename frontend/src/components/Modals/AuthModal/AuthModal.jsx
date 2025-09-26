import React from 'react'
import Modal from 'react-modal'
import { useNavigate } from 'react-router-dom';

const AuthModal = ({showModal , setShowModal}) => {
    const navigate = useNavigate();

  const handleSignUp = () => {
    setShowModal(false);
    navigate("/signup"); // go to signup page
  };

  const handleLogin = () => {
    setShowModal(false);
    navigate("/login"); // go to login page
  };

  return (
    <Modal
        isOpen={showModal}
        onRequestClose={() => setShowModal(false)}
        contentLabel="Signup Choice"
        shouldCloseOnOverlayClick={true}
        shouldCloseOnEsc={true}
        className="bg-white/95 backdrop-blur-lg border border-gray-200/50 p-8 rounded-2xl shadow-2xl w-11/12 max-w-md mx-auto my-4 relative overflow-hidden"
        overlayClassName="fixed inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20 backdrop-blur-sm flex justify-center items-center z-50 p-4">
        
        {/* Decorative gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 rounded-2xl"></div>
        
        {/* Close button */}
        <button
          onClick={() => setShowModal(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="relative z-10">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center mb-3 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Welcome Back!
          </h2>
          
          <p className="mb-6 text-center text-gray-600 leading-relaxed">
            Sign in to your account or create a new one to continue with your purchase.
          </p>
          
          <div className="flex flex-col gap-3">
            <button
              onClick={handleLogin}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              Sign In
            </button>
            
            <button
              onClick={handleSignUp}
              className="bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-900 hover:to-neutral-900 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              Create New Account
            </button>
            
            <button
              onClick={() => setShowModal(false)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-3 rounded-xl transition-all duration-200 border border-gray-200 hover:border-gray-300"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </Modal>
  )
}

export default AuthModal