import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import Home from './pages/Home'
import Login from './pages/Login'
import EmailVerify from './pages/EmailVerify'
import MyTasks from './pages/MyTasks'
import MyFriends from './pages/MyFriends'
import SearchUsers from './pages/SearchUsers'
import MyFriendsTasks from './pages/MyFriendsTasks'

const App = () => {
	return (
		<div>
			<Toaster />
			<Routes>
				<Route path='/home' element={<Home />} />
				<Route path='/login' element={<Login />} />
				<Route path='/email-verify' element={<EmailVerify />} />
				<Route path='/my-tasks' element={<MyTasks />} />
				<Route path='/my-friends-tasks/:uniqueUserId/:name' element={<MyFriendsTasks />} />
				<Route path='/my-friends' element={<MyFriends />} />
				<Route path='/search-users' element={<SearchUsers />} />
				<Route path='*' element={<Navigate to='/home' replace />} />
			</Routes>
		</div>
	)
}

export default App
