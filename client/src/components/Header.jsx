import { useContext } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import { warnToast } from './WarnToast'

const Header = () => {
	const navigate = useNavigate()
	const { backendUrl, userData, isLoggedIn, handleErrorStatusCode } = useContext(AppContext)

	const handleVerify = async () => {
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

	return (
		<div className='flex flex-col items-center mt-20 px-4 text-center text-gray-800'>
			<img src={assets.header_img} alt='' className='w-36 h-36 rounded-full mb-6' />
			<h1 className='flex items-center gap-2 text-xl sm:text-3xl font-medium mb-2'>
				Hello {userData ? userData.name : ''}!
				<img src={assets.hand_wave} alt='' className='w-8 aspect-square' />
			</h1>
			<h2 className='text-3xl sm:text-5xl font-semibold mb-4'>Welcome</h2>
			{!userData?.isAccountVerified && isLoggedIn && (
				<div className='flex flex-col items-center px-4 text-center p-10 w-[70%] sm:w-[80%] text-black text-sm'>
					<h1 className='text-2xl text-center font-semibold'>
						Your account is not verified. Please{' '}
						<span className='cursor-pointer underline' onClick={handleVerify}>
							verify
						</span>{' '}
						it to create or view tasks or to make new friends.
					</h1>
				</div>
			)}
		</div>
	)
}

export default Header
