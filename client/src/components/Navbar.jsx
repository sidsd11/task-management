import { useContext, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { Search } from 'lucide-react'

import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { warnToast } from '../components/WarnToast'

const Navbar = () => {
	const navigate = useNavigate()

	const currPage = useLocation().pathname
	const { userData, backendUrl, getUserData, setUserData, setIsLoggedIn, handleErrorStatusCode } = useContext(AppContext)

	const sendVerificationOtp = async () => {
		try {
			const { data, headers } = await axios.post(`${backendUrl}/api/user/send-verify-account-otp`)
			if (headers['redis-ratelimit-message']) {
				warnToast(headers['redis-ratelimit-message'])
			}
			if (data.success) {
				navigate('/email-verify')
				toast.success(data.message)
			} else {
				toast.error(data.message)
			}
		} catch (error) {
			handleErrorStatusCode(error.response?.status, error)
		}
	}

	const logout = async () => {
		try {
			const { data, headers } = await axios.post(`${backendUrl}/api/user/logout`)
			if (headers['redis-ratelimit-message']) {
				warnToast(headers['redis-ratelimit-message'])
			}
			if (data.success) {
				setIsLoggedIn(false)
				sessionStorage.removeItem('isLoggedIn')
				sessionStorage.removeItem('userData')
				setUserData(null)
				navigate('/')
				toast.success(data.message)
			} else {
				toast.error(data.message)
			}
		} catch (error) {
			handleErrorStatusCode(error.response?.status, error)
		}
	}

	useEffect(() => {})

	return (
		<div className='w-full flex justify-between items-center p-4 sm:p-6 sm:px-24 absolute top-0'>
			<img src={assets.logo} onClick={() => navigate('/')} className='w-28 sm:w-32 cursor-pointer hover:scale-110 transition-all' />
			{userData ? (
				<div className='w-8 h-8 flex justify-center items-center rounded-full bg-black text-white relative group cursor-pointer'>
					{userData?.name[0].toUpperCase()}
					<div className='absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-10'>
						<ul className='list none m-0 p-2 text-sm rounded-2xl border border-black bg-linear-to-br from-blue-50 to-purple-100'>
							{currPage !== '/' && currPage !== '/home' && (
								<li onClick={() => navigate('/')} className='py-2 px-2 whitespace-nowrap rounded-lg transition-all cursor-pointer hover:bg-linear-to-r hover:from-blue-100 hover:to-purple-200 hover:scale-110'>
									Home
								</li>
							)}
							{!userData?.isAccountVerified && currPage !== '/email-verify' && (
								<li onClick={sendVerificationOtp} className='py-2 px-2 whitespace-nowrap rounded-lg transition-all cursor-pointer hover:bg-linear-to-r hover:from-blue-100 hover:to-purple-200 hover:scale-110'>
									Verify Email
								</li>
							)}
							{currPage !== '/my-tasks' && (
								<li onClick={() => navigate('/my-tasks')} className='py-2 px-2 whitespace-nowrap rounded-lg transition-all cursor-pointer hover:bg-linear-to-r hover:from-blue-100 hover:to-purple-200 hover:scale-110'>
									My Tasks
								</li>
							)}
							{currPage !== '/my-friends' && (
								<li onClick={() => navigate('/my-friends')} className='py-2 px-2 whitespace-nowrap rounded-lg transition-all cursor-pointer hover:bg-linear-to-r hover:from-blue-100 hover:to-purple-200 hover:scale-110'>
									My Friends
								</li>
							)}
							{currPage !== `/search-users` && (
								<li onClick={() => navigate('/search-users')} className='py-2 px-2 whitespace-nowrap rounded-lg transition-all cursor-pointer hover:bg-linear-to-r hover:from-blue-100 hover:to-purple-200 hover:scale-110'>
									Search Users
								</li>
							)}
							<li onClick={logout} className='py-2 px-2 whitespace-nowrap rounded-lg transition-all cursor-pointer hover:bg-linear-to-r hover:from-blue-100 hover:to-purple-200 hover:scale-110'>
								Logout
							</li>
						</ul>
					</div>
				</div>
			) : (
				<button onClick={() => navigate('/login')} className='flex items-center gap-2 border border-gray-500 rounded-full px-6 py-2 text-gray-800 bg-white hover:bg-red-400 hover:scale-110 transition-all cursor-pointer '>
					Login <img src={assets.arrow_icon} />
				</button>
			)}
		</div>
	)
}

export default Navbar
