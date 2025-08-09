import React from 'react'
import { BrowserRouter as Router , Routes , Route } from 'react-router-dom'
import Home from './pages/Home/Home'
import Signup from './pages/Signup/Signup' 
import Login from './pages/Login/Login'
import Modal from "react-modal"
Modal.setAppElement('#root');

const App = () => {
  return (
    <Router >
      <Routes>
        <Route path='/' element={<Signup />}/>
        <Route path='/login' element={<Login />}/>
        <Route path='/home' element={<Home />}/>
      </Routes>
    </Router>
  )
}

export default App