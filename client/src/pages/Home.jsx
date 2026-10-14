import { useContext } from 'react'

import { AppContext } from '../context/AppContext'
import LoadingAnimation from '../components/LoadingAnimation'
import Navbar from '../components/Navbar'
import Header from '../components/Header'

const Home = () => {
	const { authLoading } = useContext(AppContext)

	return authLoading ? (
		<LoadingAnimation />
	) : (
		<div className='flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-blue-200 to-purple-400'>
			<Navbar />
			<Header />
		</div>
	)
}

export default Home
