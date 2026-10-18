import { useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { User, Mail, Lock, LockOpen } from 'lucide-react'

import { AppContext } from '../context/AppContext'
import { warnToast } from '../components/WarnToast'
import LoadingAnimation from '../components/LoadingAnimation'
import Navbar from '../components/Navbar.jsx'

const Login = () => {
	const navigate = useNavigate()
	const { backendUrl, isLoggedIn, setIsLoggedIn, getUserData, authLoading } = useContext(AppContext)

	const [state, setState] = useState('Login')
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [showPassword, setShowPassword] = useState(false)

	const onSubmitHandler = async (e) => {
		try {
			e.preventDefault()

			const { data, headers } = await axios.post(`${backendUrl}/api/user/${state.toLowerCase()}`, { name, email, password })
			if (headers['redis-ratelimit-message']) {
				warnToast(headers['redis-ratelimit-message'])
			}
			if (data.success) {
				setIsLoggedIn(true)
				sessionStorage.setItem('isLoggedIn', true)
				await getUserData()
				setName('')
				setEmail('')
				setPassword('')
				navigate('/home')
				toast.success(data.message)
			} else {
				toast.error(data.message)
			}
		} catch (error) {
			toast.error(error.response?.data?.message)
		}
	}

	const handleGoogleLogin = async (response) => {
		try {
			const { data, headers } = await axios.post(`${backendUrl}/api/user/google-login`, {
				credential: response.credential
			})
			if (headers['redis-ratelimit-message']) {
				warnToast(headers['redis-ratelimit-message'])
			}
			if (data.success) {
				setIsLoggedIn(true)
				sessionStorage.setItem('isLoggedIn', true)
				await getUserData()
				setName('')
				setEmail('')
				setPassword('')
				navigate('/home')
				toast.success(data.message)
			} else {
				toast.error(data.message)
			}
		} catch (error) {
			toast.error(error.response?.data?.message || 'Google login failed')
		}
	}

	useEffect(() => {
		const init = async () => {
			try {
				if (isLoggedIn) {
					navigate('/')
				}
			} catch (error) {
				toast.error(error.message)
			}
		}
		init()
	}, [])

	useEffect(() => {
		let script
		let cancelled = false

		const initializeGoogle = () => {
			if (cancelled || !window.google) return

			window.google.accounts.id.initialize({
				client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
				callback: handleGoogleLogin
			})

			const buttonContainer = document.getElementById('google-login-container')

			if (buttonContainer) {
				buttonContainer.innerHTML = ''

				window.google.accounts.id.renderButton(buttonContainer, {
					theme: 'outline',
					size: 'large',
					text: 'continue_with',
					shape: 'pill',
					width: 280
				})
			}
		}

		if (window.google) {
			initializeGoogle()
		} else {
			script = document.createElement('script')
			script.src = 'https://accounts.google.com/gsi/client'
			script.async = true
			script.defer = true
			script.onload = initializeGoogle

			script.onerror = () => {
				toast.error('Failed to load Google Identity Services')
			}

			document.head.appendChild(script)
		}

		return () => {
			cancelled = true

			if (script?.parentNode) {
				script.parentNode.removeChild(script)
			}
		}
	}, [])

	return authLoading ? (
		<LoadingAnimation />
	) : (
		<div className='flex flex-col items-center justify-center min-h-screen min-w-screen bg-linear-to-br from-blue-200 to-purple-400'>
			<Navbar />

			<div className='flex flex-col items-center justify-center mt-20 px-4 text-center bg-slate-900 p-10 rounded-lg shadow-lg w-[70%] sm:w-100 text-indigo-300 text-sm'>
				<h1 className='text-3xl text-center font-semibold text-white mb-5'>{state}</h1>

				<form onSubmit={onSubmitHandler} className='w-[90%]'>
					{state === 'Register' && (
						<div className='mb-4 flex items-center gap-3 w-full px-5 py-2 rounded-lg bg-[#333A5C]'>
							<User className='bg-transparent' />
							<input type='text' onChange={(e) => setName(e.target.value)} value={name} className='w-full bg-transparent outline-none text-white' placeholder='Enter your name' required />
						</div>
					)}

					<div className='mb-4 flex items-center gap-3 w-full px-5 py-2 rounded-lg bg-[#333A5C]'>
						<Mail className='bg-transparent' />
						<input type='email' onChange={(e) => setEmail(e.target.value)} value={email} className='w-full bg-transparent outline-none text-white' placeholder='Enter your email' required />
					</div>

					<div className='mb-1 flex items-center gap-3 w-full px-5 py-2 rounded-lg bg-[#333A5C]'>
						{showPassword && password.length > 0 ? <LockOpen className='bg-transparent' /> : <Lock className='bg-transparent' />}
						<input
							type={showPassword ? 'text' : 'password'}
							onChange={(e) => {
								const value = e.target.value
								setPassword(value)
								if (value.length === 0) {
									setShowPassword(false)
								}
							}}
							value={password}
							className='w-full bg-transparent outline-none text-white'
							placeholder='Enter your password'
							required
						/>
					</div>

					<div className='flex justify-start mb-4'>
						<span className='cursor-pointer text-sm transition-transform hover:scale-110' onClick={() => setShowPassword((prev) => !prev)}>
							{password.length > 0 ? (showPassword ? 'Hide' : 'Show') + ' Password' : ''}
						</span>
					</div>

					<button className='w-full py-2.5 rounded-full bg-linear-to-br from-indigo-500 to-indigo-900 text-white font-medium cursor-pointer transition-all hover:scale-110'>{state}</button>
				</form>

				{state === 'Register' ? (
					<p className='text-gray-400 text-center text-sm mt-4'>
						Already have an account?{' '}
						<span onClick={() => setState('Login')} className='inline-block text-blue-400 cursor-pointer underline transition-transform hover:scale-110'>
							Login here
						</span>
					</p>
				) : (
					<p className='text-gray-400 text-center text-sm mt-4'>
						Don't have an account?{' '}
						<span onClick={() => setState('Register')} className='inline-block text-blue-400 cursor-pointer underline transition-transform hover:scale-110'>
							Register here
						</span>
					</p>
				)}

				<p className='text-gray-400 text-center text-sm mt-4'>Log In or Sign Up with</p>
				<div id='google-login-container' className='mt-3 flex justify-center' />
			</div>
		</div>
	)
}

export default Login
