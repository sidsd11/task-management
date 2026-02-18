import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Home from './pages/Home'
import Login from './pages/Login'
import EmailVerify from './pages/EmailVerify'
import MyTasks from './pages/MyTasks'

const App = () => {
    return (
        <div>
            <ToastContainer />
            <Routes>
                <Route path='/home' element={<Home />} />
                <Route path='/login' element={<Login />} />
                <Route path='/email-verify' element={<EmailVerify />} />
                <Route path='/my-tasks' element={<MyTasks />} />
                <Route path='*' element={<Navigate to='/home' replace />} />
            </Routes>
        </div>
    )
}

export default App
