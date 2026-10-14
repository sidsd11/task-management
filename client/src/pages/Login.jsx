import { useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { User, Mail, Lock } from 'lucide-react'

import { AppContext } from '../context/AppContext'
import { warnToast } from '../components/WarnToast'
import LoadingAnimation from '../components/LoadingAnimation'
import { assets } from '../assets/assets.js'

const Login = () => {
	const navigate = useNavigate()
	const { backendUrl, isLoggedIn, setIsLoggedIn, getUserData, authLoading } = useContext(AppContext)

	const [state, setState] = useState('Login')
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')

	const onSubmitHandler = async (e) => {
		try {
			e.preventDefault()

			const { data, headers } = await axios.post(`${backendUrl}/api/user/${state.toLowerCase()}`, { name, email, password })
			if (headers['redis-ratelimit-message']) {
				warnToast(headers['redis-ratelimit-message'])
			}
			if (data.success) {
				navigate('/home')
				setIsLoggedIn(true)
				sessionStorage.setItem('isLoggedIn', true)
				getUserData()
				setName('')
				setEmail('')
				setPassword('')
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
				navigate('/home')
				setIsLoggedIn(true)
				sessionStorage.setItem('isLoggedIn', true)
				getUserData()
				setName('')
				setEmail('')
				setPassword('')
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
		let button
		let clickHandler

		const initializeGoogle = () => {
			if (!window.google) {
				toast.error('Google Identity Services failed to load')
				return
			}

			window.google.accounts.id.initialize({
				client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
				callback: handleGoogleLogin
			})

			const button = document.getElementById('google-login')

			if (button) {
				clickHandler = () => {
					window.google.accounts.id.prompt((notification) => {
						if (notification.isNotDisplayed()) {
							warnToast('Google One Tap was not displayed:' + notification.getNotDisplayedReason())
						}
					})
				}
				button.addEventListener('click', clickHandler)
			}
		}
		// If script is already loaded
		if (window.google) {
			initializeGoogle()
		} else {
			// Otherwise load it
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
			if (button && clickHandler) {
				button.removeEventListener('click', clickHandler)
			}
			if (script?.parentNode) {
				script.parentNode.removeChild(script)
			}
		}
	}, [])

	return authLoading ? (
		<LoadingAnimation />
	) : (
		<div className='flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-blue-200 to-purple-400'>
			<div className='w-full flex justify-between items-center p-4 sm:p-6 sm:px-24 absolute top-0'>
				<img src={assets.logo} onClick={() => navigate('/')} className='w-28 sm:w-32 cursor-pointer hover:scale-110 transition-all' />
			</div>

			<div className='flex flex-col items-center mt-20 px-4 text-center bg-slate-900 p-10 rounded-lg shadow-lg w-[70%] sm:w-96 text-indigo-300 text-sm'>
				<h1 className='text-3xl text-center font-semibold text-white mb-5'>{state}</h1>

				<form onSubmit={onSubmitHandler}>
					{state === 'Register' && (
						<div className='mb-4 flex items-center gap-3 w-full px-5 py-2 rounded-lg bg-[#333A5C]'>
							<User className='bg-transparent' />
							<input type='text' onChange={(e) => setName(e.target.value)} value={name} className='bg-transparent outline-none text-white' placeholder='Enter your name' required />
						</div>
					)}

					<div className='mb-4 flex items-center gap-3 w-full px-5 py-2 rounded-lg bg-[#333A5C]'>
						<Mail className='bg-transparent' />
						<input type='email' onChange={(e) => setEmail(e.target.value)} value={email} className='bg-transparent outline-none text-white' placeholder='Enter your email' required />
					</div>

					<div className='mb-4 flex items-center gap-3 w-full px-5 py-2 rounded-lg bg-[#333A5C]'>
						<Lock className='bg-transparent' />
						<input type='password' onChange={(e) => setPassword(e.target.value)} value={password} className='bg-transparent outline-none text-white' placeholder='Enter your password' required />
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

				<p className='text-lg text-white'>OR</p>
				<button id='google-login' className='google-logo-btn' aria-label='Sign in with Google'>
					<img src='https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg' alt='Google' />
				</button>
			</div>
		</div>
	)
}

export default Login
