import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import Home from './pages/Home'
import Login from './pages/Login'
import MyProfile from './pages/MyProfile'
import EmailVerify from './pages/EmailVerify'
import ResetPassword from './pages/ResetPassword'
import MyTasks from './pages/MyTasks'
import MyFriends from './pages/MyFriends'
import MyFriendsTasks from './pages/MyFriendsTasks'
import FriendRequests from './pages/FriendRequests'
import SearchUsers from './pages/SearchUsers'

const App = () => {
	return (
		<div>
			<Toaster />
			<Routes>
				<Route path='/home' element={<Home />} />
				<Route path='/login' element={<Login />} />
				<Route path='/my-profile' element={<MyProfile />} />
				<Route path='/email-verify' element={<EmailVerify />} />
				<Route path='/reset-password' element={<ResetPassword />} />
				<Route path='/my-tasks' element={<MyTasks />} />
				<Route path='/my-friends' element={<MyFriends />} />
				<Route path='/my-friends-tasks/:uniqueUserId/:name' element={<MyFriendsTasks />} />
				<Route path='/friend-requests' element={<FriendRequests />} />
				<Route path='/search-users' element={<SearchUsers />} />
				<Route path='*' element={<Navigate to='/home' replace />} />
			</Routes>
		</div>
	)
}

export default App
