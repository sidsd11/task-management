import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, CirclePlus, ClipboardCopy, Pen, Search, Trash2, X } from 'lucide-react'

import { AppContext } from '../context/AppContext'
import LoadingAnimation from '../components/LoadingAnimation'
import Navbar from '../components/Navbar'
import { warnToast } from '../components/WarnToast'

const FriendRequests = () => {
	const navigate = useNavigate()
	const { backendUrl, isLoggedIn, userData, getUserData, authLoading, handleErrorStatusCode } = useContext(AppContext)

	const [friendRequests, setFriendRequests] = useState({ sent: [], received: [] })

	const allStatus = ['Sent', 'Received']
	const [selectedFilter, setSelectedFilter] = useState('Sent')

	const [filteredFriendRequests, setFilteredFriendRequests] = useState([])
	const [filteredFriendRequestsBeforeSearching, setFilteredFriendRequestsBeforeSearching] = useState([])

	const [searchText, setSearchText] = useState('')

	const [currentPage, setCurrentPage] = useState(1)
	const [friendRequestsPerPage, setFriendRequestsPerPage] = useState(4)
	const indexOfLastFriendRequest = currentPage * friendRequestsPerPage
	const indexOfFirstFriendRequest = indexOfLastFriendRequest - friendRequestsPerPage

	const currentFriendRequests = filteredFriendRequests.slice(indexOfFirstFriendRequest, indexOfLastFriendRequest)
	const totalPages = Math.ceil(filteredFriendRequests.length / friendRequestsPerPage)

	const handlePageChange = (pageNumber) => {
		setCurrentPage(pageNumber)
	}

	const getFriendRequests = async () => {
		try {
			const fields = ['friendRequests']
			const { data, headers } = await axios.post(`${backendUrl}/api/user/get-user-data`, { fields })
			if (headers['redis-ratelimit-message']) {
				warnToast(headers['redis-ratelimit-message'])
			}
			if (data.success) {
				setFriendRequests(data.data.friendRequests)
			} else {
				toast.error(data.message)
			}
		} catch (error) {
			handleErrorStatusCode(error.response?.status, error)
		}
	}

	const acceptOrDeleteFriendRequest = async (action, friendUniqueUserId) => {
		try {
			const { data, headers } = await axios.patch(`${backendUrl}/api/friend/friend-request/${action}/${friendUniqueUserId}`)
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
		}
		getFriendRequests()
	}

	const convertTime = (t) => {
		const day = String(t.getDate()).padStart(2, '0')
		const month = String(t.getMonth() + 1).padStart(2, '0')
		const year = String(t.getFullYear()).slice(-2)

		let hour = t.getHours()
		const min = String(t.getMinutes()).padStart(2, '0')
		const sec = String(t.getSeconds()).padStart(2, '0')
		const ampm = hour >= 12 ? 'pm' : 'am'
		hour = String(hour % 12 || 12).padStart(2, '0')

		return `${day}/${month}/${year} ${hour}:${min}:${sec} ${ampm}`
	}

	useEffect(() => {
		if (authLoading) return
		if (!isLoggedIn) {
			navigate('/')
			return
		}
		getFriendRequests()
	}, [authLoading, isLoggedIn])

	useEffect(() => {
		let filtered = friendRequests[selectedFilter.toLowerCase()] || []
		setFilteredFriendRequestsBeforeSearching(filtered)
		if (searchText.length > 0) {
			filtered = filtered.filter((friendRequest) => friendRequest.name.toLowerCase().includes(searchText.toLowerCase()) || friendRequest.uniqueUserId.toLowerCase().includes(searchText.toLowerCase()))
		}
		setFilteredFriendRequests(filtered)
		setCurrentPage(1)
	}, [friendRequests, selectedFilter, searchText])

	useEffect(() => {
		const updateFriendRequestsPerPage = () => {
			const width = window.innerWidth

			let columns = 1
			if (width >= 1024) columns = 4
			else if (width >= 768) columns = 3
			else if (width >= 640) columns = 2

			setFriendRequestsPerPage(columns)
		}

		updateFriendRequestsPerPage()

		window.addEventListener('resize', updateFriendRequestsPerPage)

		return () => {
			window.removeEventListener('resize', updateFriendRequestsPerPage)
		}
	}, [])

	useEffect(() => {
		if (currentPage > totalPages) {
			setCurrentPage(1)
		}
	}, [friendRequestsPerPage])

	return authLoading ? (
		<LoadingAnimation />
	) : (
		<>
			<div className='flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-blue-200 to-purple-400'>
				<Navbar />
				{!userData?.isAccountVerified ? (
					navigate('/')
				) : (
					<div className='flex flex-col items-center mt-20 px-4 text-center p-10 w-[70%] sm:w-[80%] text-black text-sm'>
						<h1 className='text-3xl text-center font-semibold'>Friend Requests</h1>

						<div className='hidden sm:flex gap-4 mt-6 mb-6 justify-center'>
							{allStatus.map((f, index) => (
								<button key={index} className={`px-4 py-2 rounded-full border border-indigo-600 transition-all ${selectedFilter === f ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 cursor-pointer hover:bg-gray-200 hover:scale-110'}`} onClick={() => setSelectedFilter(f)}>
									{f}
								</button>
							))}
						</div>
						<div className='sm:hidden mb-6 justify-center'>
							<select className='w-full p-2 border border-indigo-600 rounded-lg text-white bg-indigo-600' value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value)}>
								{allStatus.map((f, index) => (
									<option key={index} value={f} className='text-black bg-white'>
										{f}
									</option>
								))}
							</select>
						</div>

						{filteredFriendRequestsBeforeSearching.length > 0 && (
							<div className='flex items-center justify-center mb-3 border border-indigo-600 bg-white rounded-full p-2'>
								<Search className='size-4 inline-block' />
								<input type='text' placeholder='Search users' value={searchText} onChange={(e) => setSearchText(e.target.value)} className='rounded ml-3 text-sm' />
							</div>
						)}

						<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full'>
							{filteredFriendRequests.length === 0 ? (
								<p className='text-lg font-semibold text-black mt-10 col-span-full'>No requests found</p>
							) : (
								currentFriendRequests.map((friendRequest) => (
									<div key={friendRequest._id} className='p-4 bg-white shadow-md rounded-lg hover:shadow-xl hover:z-10 hover:scale-[1.03] transition-all w-full h-full'>
										<h3 className='font-semibold text-lg text-gray-800 border-b pb-2'>{friendRequest.name}</h3>

										<h3 className='font-semibold text-base text-gray-800 border-b pb-2'>{friendRequest.uniqueUserId}</h3>

										<h3 className='font-semibold text-base text-gray-800 border-b pb-2'>
											{selectedFilter} on: {convertTime(new Date(friendRequest.timestamp))}
										</h3>
										{selectedFilter === 'Received' && (
											<div className='flex flex-row items-center justify-center'>
												<X className='text-red-500 size-5 mt-1 mr-10 cursor-pointer transition-all hover:scale-120' onClick={() => acceptOrDeleteFriendRequest('reject', friendRequest.uniqueUserId)} />
												<Check className='text-green-700 size-5 mt-1 cursor-pointer transition-all hover:scale-120' onClick={() => acceptOrDeleteFriendRequest('accept', friendRequest.uniqueUserId)} />
											</div>
										)}
									</div>
								))
							)}
						</div>
					</div>
				)}
			</div>
		</>
	)
}

export default FriendRequests
