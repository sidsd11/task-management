import React, { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Mail } from 'lucide-react'

import { AppContext } from '../context/AppContext'
import LoadingAnimation from '../components/LoadingAnimation'
import Navbar from '../components/Navbar'
import { warnToast } from '../components/WarnToast'

const EmailVerify = () => {
	const navigate = useNavigate()
	const { backendUrl, isLoggedIn, userData, getUserData, authLoading, handleErrorStatusCode } = useContext(AppContext)

	const inputRefs = React.useRef([])

	const handleInput = (e, index) => {
		if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
			inputRefs.current[index + 1].focus()
		}
	}

	const handleKeyDown = (e, index) => {
		if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
			inputRefs.current[index - 1].focus()
		}
	}

	const handlePaste = (e) => {
		const paste = e.clipboardData.getData('text')
		const pasteArray = paste.split('')
		pasteArray.forEach((char, index) => {
			if (inputRefs.current[index]) {
				inputRefs.current[index].value = char
			}
		})
	}

	const onSubmitHandler = async (e) => {
		try {
			e.preventDefault()

			const otpArray = inputRefs.current.map((e) => e.value)
			const otp = otpArray.join('')

			const { data, headers } = await axios.post(`${backendUrl}/api/user/verify-account`, { otp })
			if (headers['redis-ratelimit-message']) {
				warnToast(headers['redis-ratelimit-message'])
			}
			if (data.success) {
				toast.success(data.message)
				getUserData()
				navigate(-1)
			} else {
				toast.error(data.message)
			}
		} catch (error) {
			handleErrorStatusCode(error.response?.status, error)
		}
	}

	useEffect(() => {
		if (authLoading) return
		if (!isLoggedIn) {
			navigate('/')
			return
		}
		if (userData && userData.isAccountVerified) {
			navigate('/')
		}
	}, [isLoggedIn, userData])

	return authLoading ? (
		<LoadingAnimation />
	) : (
		<div className='flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-blue-200 to-purple-400'>
			<Navbar />
			<div className='flex flex-col items-center mt-20 px-4 text-center bg-slate-900 p-10 rounded-lg shadow-lg w-[70%] sm:w-96 text-indigo-300 text-sm'>
				<h1 className='text-3xl text-center font-semibold text-white'>Email verify OTP</h1>

				<p className='text-center text-white'>Enter the 6 digit OTP sent on below email</p>

				<form onSubmit={onSubmitHandler} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
					<div className='mb-4 flex items-center gap-3 w-full px-5 py-2 5 rounded-lg bg-[#333A5C] cursor-not-allowed'>
						<Mail className='bg-transparent' />
						<input type='email' value={userData?.email || ''} className='bg-transparent outline-none text-white/60 cursor-not-allowed' disabled />
					</div>

					<div className='flex justify-between mb-8' onPaste={handlePaste}>
						{Array(6)
							.fill(0)
							.map((_, index) => (
								<input type='text' maxLength='1' key={index} required className='w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md' ref={(e) => (inputRefs.current[index] = e)} onInput={(e) => handleInput(e, index)} onKeyDown={(e) => handleKeyDown(e, index)} />
							))}
					</div>

					<button className='w-full py-3 bg-linear-to-r from-indigo-500 to-indigo-900 text-white rounded-full cursor-pointer'>Verify Email</button>
				</form>
			</div>
		</div>
	)
}

export default EmailVerify
