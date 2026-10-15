import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { BadgeCheck, Mail, User } from 'lucide-react'

import { AppContext } from '../context/AppContext'
import { warnToast } from '../components/WarnToast'
import Navbar from '../components/Navbar'
import LoadingAnimation from '../components/LoadingAnimation'

const MyProfile = () => {
	const navigate = useNavigate()

	const { authLoading, isLoggedIn, getUserData, userData, backendUrl, handleErrorStatusCode } = useContext(AppContext)

	const [newName, setNewName] = useState('')
	const [newEmail, setNewEmail] = useState('')
	const [isEditModeOn, setIsEditModeOn] = useState(false)

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
		} finally {
			await getUserData()
		}
	}

	const sendResetPasswordOtp = async () => {
		try {
			const { data, headers } = await axios.post(`${backendUrl}/api/user/send-reset-password-otp`)
			if (headers['redis-ratelimit-message']) {
				warnToast(headers['redis-ratelimit-message'])
			}
			if (data.success) {
				navigate('/reset-password')
				toast.success(data.message)
			} else {
				toast.error(data.message)
			}
		} catch (error) {
			handleErrorStatusCode(error.response?.status, error)
		}
	}

	const UpdateProfile = async (newName, newEmail) => {
		try {
			const { data, headers } = await axios.patch(`${backendUrl}/api/user/update-my-profile`, { newName, newEmail })
			if (headers['redis-ratelimit-message']) {
				warnToast(headers['redis-ratelimit-message'])
			}
			if (data.success) {
				setIsEditModeOn(false)
				toast.success(data.message)
			} else {
				toast.error(data.message)
			}
		} catch (error) {
			handleErrorStatusCode(error.response?.status, error)
		}
		await getUserData()
	}

	useEffect(() => {
		if (authLoading) return
		if (!isLoggedIn) {
			navigate('/')
			return
		}
		setNewName(userData?.name)
		setNewEmail(userData?.email)
	}, [authLoading, isLoggedIn])

	return authLoading ? (
		<LoadingAnimation />
	) : (
		<div className='flex flex-col items-center justify-center min-h-screen min-w-screen bg-linear-to-br from-blue-200 to-purple-400'>
			<Navbar />

			<div className='flex flex-col items-center justify-center mt-20 px-4 text-center bg-slate-900 p-10 rounded-lg shadow-lg w-[70%] sm:w-100 text-indigo-300 text-sm'>
				<h1 className='text-3xl text-center font-semibold text-white mb-5'>My Profile</h1>

				<div>
					<div className={`mb-4 flex items-center gap-3 w-full px-5 py-2 rounded-lg bg-[#333A5C] ${isEditModeOn ? '' : 'cursor-not-allowed'}`}>
						<User className='bg-transparent' />
						<input type='text' onChange={(e) => setNewName(e.target.value)} value={isEditModeOn ? newName : userData?.name || ''} className={`w-full bg-transparent outline-none text-white ${isEditModeOn ? 'text-white' : 'cursor-not-allowed text-white/60'}`} placeholder='Enter your name' required disabled={!isEditModeOn} />
					</div>

					<div className={`mb-4 flex flex-row items-center gap-3 w-full px-5 py-2 rounded-lg bg-[#333A5C] ${isEditModeOn ? '' : 'cursor-not-allowed'}`}>
						<Mail className='bg-transparent' />
						<input type='email' onChange={(e) => setNewEmail(e.target.value)} value={isEditModeOn ? newEmail : userData?.email || ''} className={`w-full bg-transparent outline-none ${isEditModeOn ? 'text-white' : 'cursor-not-allowed text-white/60'}`} required disabled={!isEditModeOn} />

						{userData?.isAccountVerified
							? !isEditModeOn && <BadgeCheck className='text-green-500 bg-transparent' />
							: !isEditModeOn && (
									<span className='text-green-500 underline cursor-pointer transition-all hover:scale-110' onClick={sendVerificationOtp}>
										Verify
									</span>
								)}
					</div>

					<span className='inline-block mb-4 cursor-pointer underline transition-transform duration-300 hover:scale-110' onClick={sendResetPasswordOtp}>
						Reset Password
					</span>

					{
						<div className='flex flex-row items-center justify-center gap-4'>
							<button
								className={`w-full py-3 bg-linear-to-r ${isEditModeOn ? 'from-red-300 to-red-500' : 'from-indigo-500 to-indigo-900'} text-white rounded-full cursor-pointer transition-all hover:scale-110`}
								onClick={() => {
									setIsEditModeOn(!isEditModeOn)
									setNewName(userData?.name)
									setNewEmail(userData?.email)
								}}
							>
								{isEditModeOn ? 'Cancel' : 'Edit Profile'}
							</button>

							{isEditModeOn && (
								<button className='w-full py-3 bg-linear-to-r from-indigo-500 to-indigo-900 text-white rounded-full cursor-pointer transition-all hover:scale-110' onClick={() => UpdateProfile(newName, newEmail)}>
									Update
								</button>
							)}
						</div>
					}
				</div>
			</div>
		</div>
	)
}

export default MyProfile
