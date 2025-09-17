import React from 'react'
import { BrowserRouter as Router , Routes , Route } from 'react-router-dom'
import Home from './pages/Home/Home'
import Signup from './pages/Signup/Signup' 
import Login from './pages/Login/Login'
import Modal from "react-modal"
Modal.setAppElement('#root');

const App = () => {
  const [trigger , setTrigger]=useState(0)

  return (
    <Router >
      <Routes>
        <Route path='/' element={<Signup setTrigger={setTrigger}/>}/>
        <Route path='/login' element={<Login setTrigger={setTrigger}/>}/>
        <Route path='/home' element={<Home trigger={trigger}/>}/>
      </Routes>
    </Router>
  )
}

export default App