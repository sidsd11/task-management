import axios from 'axios'
import { createContext, useEffect, useState } from 'react'
import { toast } from 'react-toastify'

export const AppContext = createContext()

export const AppContextProvider = (props) => {
    axios.defaults.withCredentials = true

    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [userData, setUserData] = useState(null)
    const [authLoading, setAuthLoading] = useState(true)
    const [loading, setLoading] = useState(true)

    const getUserData = async () => {
        try {
            const {data} = await axios.get(`${backendUrl}/api/user/get-user-data`)
            if (data.success) {
                setUserData(data.userData)
            }
            else {
                setUserData(null)
                toast.error(data.message)
            }
        }
        catch (error) {
            toast.error(error.message)
            setUserData(null)
        }
    }

    useEffect(() => {
        const init = async () => {
            setAuthLoading(true)
            try {
                const {data} = await axios.get(`${backendUrl}/api/user/is-auth`)
                if (data.success) {
                    setIsLoggedIn(true)
                    await getUserData()
                }
                else {
                    setIsLoggedIn(false)
                    setUserData(null)
                }
            }
            catch (error) {
                toast.error(error.message)
                setIsLoggedIn(false)
                setUserData(null)
            }
            setLoading(false)
            setAuthLoading(false)
        }
        init()
    }, [])

    const value = {
        backendUrl,
        isLoggedIn, setIsLoggedIn,
        userData, setUserData,
        getUserData,
        authLoading, setAuthLoading,
        loading, setLoading
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}