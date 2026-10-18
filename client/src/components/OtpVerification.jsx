import { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Lock, LockOpen, Mail } from 'lucide-react'

import { AppContext } from '../context/AppContext'
import LoadingAnimation from '../components/LoadingAnimation'
import Navbar from '../components/Navbar'
import { warnToast } from '../components/WarnToast'

const OtpVerification = (props) => {
	const navigate = useNavigate()
	const { backendUrl, isLoggedIn, userData, getUserData, authLoading, handleErrorStatusCode } = useContext(AppContext)

	const [newPassword, setNewPassword] = useState('')
	const [isOtpSent, setIsOtpSent] = useState(false)
	const [isOtpSentChecking, setIsOtpSentChecking] = useState(true)
	const [showPassword, setShowPassword] = useState(false)

	const inputRefs = useRef([])

	const resendOtp = async () => {
		try {
			const { data, headers } = props.type === 'email' ? await axios.post(`${backendUrl}/api/user/send-verify-account-otp`) : await axios.post(`${backendUrl}/api/user/send-reset-password-otp`)
			if (headers['redis-ratelimit-message']) {
				warnToast(headers['redis-ratelimit-message'])
			}
			if (data.success) {
				toast.success(data.message)
			} else {
				toast.error(data.message)
			}
		} catch (error) {
			handleErrorStatusCode(error.response?.status, error)
		} finally {
			await getUserData()
			await otpSentCheck()
		}
	}

	const otpSentCheck = async () => {
		try {
			setIsOtpSentChecking(true)
			const fields = props.type === 'email' ? ['verifyAccountOtpExpiresAt'] : ['resetPasswordOtpExpiresAt']
			const { data, headers } = props.type === 'email' ? await axios.post(`${backendUrl}/api/user/get-user-data`, { fields }) : await axios.post(`${backendUrl}/api/user/get-user-data`, { fields })
			if (headers['redis-ratelimit-message']) {
				warnToast(headers['redis-ratelimit-message'])
			}
			if (data.success) {
				const otpExpiresAt = props.type === 'email' ? data.data.verifyAccountOtpExpiresAt : data.data.resetPasswordOtpExpiresAt
				setIsOtpSent(otpExpiresAt !== null && otpExpiresAt !== undefined)
			} else {
				toast.error(data.message)
				setIsOtpSent(false)
			}
		} catch (error) {
			handleErrorStatusCode(error.response?.status, error)
			setIsOtpSent(false)
		} finally {
			setIsOtpSentChecking(false)
		}
	}

	const cancelOtpRequest = async () => {
		try {
			const { data, headers } = await axios.post(`${backendUrl}/api/user/cancel-otp-request`, { otpType: props.type })
			if (headers['redis-ratelimit-message']) {
				warnToast(headers['redis-ratelimit-message'])
			}
			if (data.success) {
				toast.success(data.message)
				navigate(-1)
			} else {
				toast.error(data.message)
			}
		} catch (error) {
			handleErrorStatusCode(error.response?.status, error)
		}
	}

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

			const { data, headers } = props.type === 'email' ? await axios.post(`${backendUrl}/api/user/verify-account`, { otp }) : await axios.post(`${backendUrl}/api/user/reset-password`, { otp, newPassword })
			if (headers['redis-ratelimit-message']) {
				warnToast(headers['redis-ratelimit-message'])
			}
			if (data.success) {
				toast.success(data.message)
				getUserData()
				props.type === 'email' ? navigate(-1) : navigate('/')
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

		if (props.type === 'email' && userData?.isAccountVerified) {
			navigate('/')
			return
		}

		otpSentCheck()
	}, [authLoading, isLoggedIn, userData?.isAccountVerified])

	useEffect(() => {
		if (authLoading || !isLoggedIn || isOtpSentChecking) return

		if (!isOtpSent) {
			navigate('/')
		}
	}, [authLoading, isLoggedIn, isOtpSentChecking, isOtpSent])

	return authLoading || isOtpSentChecking ? (
		<LoadingAnimation />
	) : (
		<div className='flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-blue-200 to-purple-400'>
			<Navbar />
			<div className='flex flex-col items-center mt-20 px-4 text-center bg-slate-900 p-10 rounded-lg shadow-lg w-[70%] sm:w-100 text-indigo-300 text-sm'>
				<h1 className='text-3xl text-center font-semibold text-white'>{props.type === 'email' ? 'Email Verify OTP' : 'Reset Password OTP'}</h1>

				<p className='text-center text-white'>Enter the 6 digit OTP sent on below email</p>

				<form onSubmit={onSubmitHandler} className='p-8 text-sm'>
					<div className='mb-4 flex items-center gap-3 w-full px-5 py-2 rounded-lg bg-[#333A5C] cursor-not-allowed'>
						<Mail className='bg-transparent' />
						<input type='email' value={userData?.email || ''} className='w-full bg-transparent outline-none text-white/60 cursor-not-allowed' disabled />
					</div>
					<div className='flex justify-between gap-2' onPaste={handlePaste}>
						{Array(6)
							.fill(0)
							.map((_, index) => (
								<input type='text' maxLength='1' key={index} required className='w-full h-12 bg-[#333A5C] text-white outline-none text-center text-xl rounded-md' ref={(e) => (inputRefs.current[index] = e)} onInput={(e) => handleInput(e, index)} onKeyDown={(e) => handleKeyDown(e, index)} />
							))}
					</div>
					{props.type === 'password' && (
						<>
							<div className='mt-4 flex items-center gap-3 w-full px-5 py-2 rounded-lg bg-[#333A5C]'>
								{showPassword && newPassword.length > 0 ? <LockOpen className='bg-transparent' /> : <Lock className='bg-transparent' />}
								<input
									type={showPassword ? 'text' : 'password'}
									onChange={(e) => {
										const value = e.target.value
										setNewPassword(value)
										if (value.length === 0) {
											setShowPassword(false)
										}
									}}
									value={newPassword}
									className='w-full bg-transparent outline-none text-white'
									placeholder='Enter your new password'
									required
								/>
							</div>

							<div className='flex justify-start mb-4'>
								<span className='cursor-pointer text-sm transition-transform hover:scale-110' onClick={() => setShowPassword((prev) => !prev)}>
									{newPassword.length > 0 ? (showPassword ? 'Hide' : 'Show') + ' Password' : ''}
								</span>
							</div>
						</>
					)}
					<p className='text-red-400 mt-4'>Didn't receive the OTP or OTP has expired?</p>
					<span className='text-green-500 inline-block cursor-pointer underline transition-transform duration-300 hover:scale-110' onClick={resendOtp}>
						Resend OTP
					</span>

					<div className='flex flex-row items-center justify-center gap-4'>
						<button className='w-full py-3 mt-4 bg-linear-to-r from-red-300 to-red-500 text-white rounded-full cursor-pointer transition-all hover:scale-110' onClick={cancelOtpRequest}>
							Cancel
						</button>
						<button className='w-full py-3 mt-4 bg-linear-to-r from-indigo-500 to-indigo-900 text-white rounded-full cursor-pointer transition-all hover:scale-110'>{props.type === 'email' ? 'Verify Email' : 'Reset Password'}</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default OtpVerification
