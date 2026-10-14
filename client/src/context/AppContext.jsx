import axios from 'axios'
import { createContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { warnToast } from '../components/WarnToast'

export const AppContext = createContext()

export const AppContextProvider = (props) => {
	const backendUrl = import.meta.env.VITE_BACKEND_URL
	const [isLoggedIn, setIsLoggedIn] = useState(() => sessionStorage.getItem('isLoggedIn') === 'true')
	const [userData, setUserData] = useState(() => {
		try {
			return JSON.parse(sessionStorage.getItem('userData')) ?? null
		} catch {
			return null
		}
	})
	const [authLoading, setAuthLoading] = useState(true)
	const [authStatus, setAuthStatus] = useState('checking')

	const getUserData = async () => {
		try {
			const fields = ['_id', 'name', 'email', 'isAccountVerified']
			const { data, headers } = await axios.post(`${backendUrl}/api/user/get-user-data`, { fields })
			if (headers['redis-ratelimit-message']) {
				warnToast(headers['redis-ratelimit-message'])
			}
			if (data.success) {
				setUserData(data.data)
				sessionStorage.setItem('userData', JSON.stringify(data.data))
			} else {
				toast.error(data.message)
			}
		} catch (error) {
			handleErrorStatusCode(error.response?.status, error)
		}
	}

	const handleErrorStatusCode = (status, error) => {
		if (status === 401) {
			setIsLoggedIn(false)
			sessionStorage.removeItem('isLoggedIn')
			setUserData(null)
			sessionStorage.removeItem('userData')
			setAuthStatus('unauthenticated')
		} else {
			setAuthStatus('unknown')
			toast.error(error.response?.data?.message || error.message)
		}
	}

	useEffect(() => {
		const init = async () => {
			setAuthLoading(true)
			try {
				const { data, headers } = await axios.get(`${backendUrl}/api/user/is-auth`)
				if (headers['redis-ratelimit-message']) {
					warnToast(headers['redis-ratelimit-message'])
				}
				if (data.success) {
					setIsLoggedIn(true)
					sessionStorage.setItem('isLoggedIn', true)
					await getUserData()
					setAuthStatus('authenticated')
				} else {
					setIsLoggedIn(false)
					sessionStorage.removeItem('isLoggedIn')
					setUserData(null)
					sessionStorage.removeItem('userData')
					setAuthStatus('unauthenticated')
				}
			} catch (error) {
				handleErrorStatusCode(error.response?.status, error)
			} finally {
				setAuthLoading(false)
			}
		}
		init()
	}, [])

	const value = {
		backendUrl,
		isLoggedIn,
		setIsLoggedIn,
		userData,
		setUserData,
		getUserData,
		authLoading,
		setAuthLoading,
		authStatus,
		setAuthStatus,
		handleErrorStatusCode
	}

	return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
}
