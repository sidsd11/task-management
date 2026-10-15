import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Check, ChevronLeft, ChevronRight, Forward, Handshake, Search, Trash2, UserPlus, X } from 'lucide-react'

import { AppContext } from '../context/AppContext'
import LoadingAnimation from '../components/LoadingAnimation'
import Navbar from '../components/Navbar'
import { warnToast } from '../components/WarnToast'

const FriendsOrUsers = (props) => {
	const navigate = useNavigate()
	const { backendUrl, isLoggedIn, userData, authLoading, handleErrorStatusCode } = useContext(AppContext)

	const [friendsOrUsers, setFriendsOrUsers] = useState([])
	const [friendRequests, setFriendRequests] = useState([])
	const [friendsList, setFriendsList] = useState([])

	const [filteredFriendsOrUsers, setFilteredFriendsOrUsers] = useState([])

	const [searchText, setSearchText] = useState('')

	const [currentPage, setCurrentPage] = useState(1)
	const [friendsOrUsersPerPage, setFriendsOrUsersPerPage] = useState(4)
	const indexOfLastFriendsOrUsersPerPage = currentPage * friendsOrUsersPerPage
	const indexOfFirstFriendsOrUsersPerPage = indexOfLastFriendsOrUsersPerPage - friendsOrUsersPerPage

	const currentFriendsOrUsersPerPages = filteredFriendsOrUsers.slice(indexOfFirstFriendsOrUsersPerPage, indexOfLastFriendsOrUsersPerPage)
	const totalPages = Math.ceil(filteredFriendsOrUsers.length / friendsOrUsersPerPage)

	const handlePageChange = (pageNumber) => {
		setCurrentPage(pageNumber)
	}

	const getFriendsOrUsers = async () => {
		try {
			const fields = ['friends']
			const { data, headers } = props.type === 'friend' ? await axios.post(`${backendUrl}/api/user/get-user-data`, { fields }) : await axios.get(`${backendUrl}/api/user/get-users-list`)
			if (headers['redis-ratelimit-message']) {
				warnToast(headers['redis-ratelimit-message'])
			}
			if (data.success) {
				if (props.type === 'friend') {
					setFriendsOrUsers(data.data.friends)
				} else {
					setFriendsOrUsers(data.data)
				}
			} else {
				toast.error(data.message)
			}
		} catch (error) {
			handleErrorStatusCode(error.response?.status, error)
		}
	}

	const getFriendsAndFriendRequests = async () => {
		try {
			const fields = ['friends', 'friendRequests']
			const { data, headers } = await axios.post(`${backendUrl}/api/user/get-user-data`, { fields })
			if (headers['redis-ratelimit-message']) {
				warnToast(headers['redis-ratelimit-message'])
			}
			if (data.success) {
				setFriendsList(data.data.friends)
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
				getFriendsOrUsers()
			} else {
				toast.error(data.message)
			}
		} catch (error) {
			handleErrorStatusCode(error.response?.status, error)
		}
		getFriendsAndFriendRequests()
	}

	const sendFriendRequest = async (friendUniqueUserId) => {
		try {
			const { data, headers } = await axios.patch(`${backendUrl}/api/friend/send-friend-request/${friendUniqueUserId}`)
			if (headers['redis-ratelimit-message']) {
				warnToast(headers['redis-ratelimit-message'])
			}
			if (data.success) {
				toast.success(data.message)
				getFriendsOrUsers()
			} else {
				toast.error(data.message)
			}
		} catch (error) {
			handleErrorStatusCode(error.response?.status, error)
		}
		getFriendsAndFriendRequests()
	}

	const deleteSentFriendRequest = async (friendUniqueUserId) => {
		try {
			const { data, headers } = await axios.patch(`${backendUrl}/api/friend/delete-sent-friend-request/${friendUniqueUserId}`)
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
		getFriendsAndFriendRequests()
	}

	const removeFriend = async (friendUniqueUserId) => {
		try {
			const { data, headers } = await axios.delete(`${backendUrl}/api/friend/remove-friend/${friendUniqueUserId}`)
			if (headers['redis-ratelimit-message']) {
				warnToast(headers['redis-ratelimit-message'])
			}
			if (data.success) {
				toast.success(data.message)
				getFriendsOrUsers()
			} else {
				toast.error(data.message)
			}
		} catch (error) {
			handleErrorStatusCode(error.response?.status, error)
		}
		getFriendsAndFriendRequests()
	}

	const requestCheck = (uniqueUserId, type) => {
		return friendRequests[type]?.some((request) => request.uniqueUserId === uniqueUserId) ? true : false
	}

	const friendCheck = (uniqueUserId) => {
		return friendsList?.some((friend) => friend.uniqueUserId === uniqueUserId) ? true : false
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
		getFriendsOrUsers()
		getFriendsAndFriendRequests()
	}, [authLoading, isLoggedIn])

	useEffect(() => {
		let filtered = searchText.length === 0 ? (props.type === 'friend' ? friendsOrUsers : []) : friendsOrUsers.filter((friendOrUser) => friendOrUser.name.toLowerCase().includes(searchText.toLowerCase()) || friendOrUser.uniqueUserId.toLowerCase().includes(searchText.toLowerCase()))
		setFilteredFriendsOrUsers(filtered)
		setCurrentPage(1)
	}, [friendsOrUsers, searchText])

	useEffect(() => {
		const updateFriendsOrUsersPerPage = () => {
			const width = window.innerWidth

			let columns = 1
			if (width >= 1024) columns = 4
			else if (width >= 768) columns = 3
			else if (width >= 640) columns = 2

			setFriendsOrUsersPerPage(columns)
		}

		updateFriendsOrUsersPerPage()

		window.addEventListener('resize', updateFriendsOrUsersPerPage)

		return () => {
			window.removeEventListener('resize', updateFriendsOrUsersPerPage)
		}
	}, [])

	useEffect(() => {
		if (currentPage > totalPages) {
			setCurrentPage(1)
		}
	}, [friendsOrUsersPerPage])

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
						<h1 className='text-3xl text-center font-semibold mb-6'>{props.type === 'friend' ? 'My friends' : 'Search users'}</h1>

						{(props.type === 'friend' && friendsOrUsers.length > 0) ||
							(props.type === 'user' && (
								<div className='flex items-center justify-center mb-3 border border-indigo-600 bg-white rounded-full p-2'>
									<Search className='size-4 inline-block' />
									<input type='text' placeholder={props.type === 'friend' ? 'Search friends' : 'Search users'} value={searchText} onChange={(e) => setSearchText(e.target.value)} className='rounded ml-3 text-sm' />
								</div>
							))}

						<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full'>
							{props.type === 'friend' && friendsOrUsers.length === 0 && (
								<p className='text-lg font-semibold text-black mt-10 col-span-full'>
									You don't have any friends yet.{' '}
									<span className='inline-block underline cursor-pointer tranisition-transofrm duration-300 hover:scale-110' onClick={() => navigate('/search-users')}>
										Search
									</span>{' '}
									for other users to add them as friend.
								</p>
							)}
							{props.type === 'user' && searchText.length === 0 ? (
								<p className='text-lg font-semibold text-black mt-10 col-span-full'>Please type to search other users</p>
							) : filteredFriendsOrUsers.length === 0 && friendsOrUsers.length > 0 ? (
								<p className='text-lg font-semibold text-black mt-10 col-span-full'>No {props.type === 'friend' ? 'friends' : 'users'} found</p>
							) : (
								currentFriendsOrUsersPerPages.map((friendOrUser) => (
									<div key={friendOrUser.uniqueUserId} className='p-4 bg-white shadow-md rounded-lg hover:shadow-xl hover:z-10 hover:scale-[1.03] transition-all w-full h-full'>
										<h3 className={`font-semibold text-[10px] sm:text-lg text-gray-800 border-b pb-2 ${friendCheck(friendOrUser.uniqueUserId) && 'cursor-pointer'}`} onClick={() => friendCheck(friendOrUser.uniqueUserId) && navigate(`/my-friends-tasks/${friendOrUser.uniqueUserId}/${friendOrUser.name}`)}>
											{friendOrUser.name}
										</h3>

										<h3 className='font-semibold text-[10px] sm:text-lg text-gray-800 border-b pb-2'>{friendOrUser.uniqueUserId}</h3>

										{props.type === 'friend' ? (
											<>
												<p className='text-[10px] sm:text-lg p-2 border-b'>Since: {convertTime(new Date(friendOrUser.since))}</p>
												<div className='flex flex-row items-center justify-center gap-10 mt-2'>
													<Trash2 className='text-red-500 size-5 cursor-pointer transition-all hover:scale-120' onClick={() => removeFriend(friendOrUser.uniqueUserId)} />
												</div>
											</>
										) : (
											<div className='flex flex-row items-center justify-center'>
												{requestCheck(friendOrUser.uniqueUserId, 'received') ? (
													<>
														<X className='text-red-500 size-5 mt-1 mr-10 cursor-pointer transition-all hover:scale-120' onClick={() => acceptOrDeleteFriendRequest('reject', friendOrUser.uniqueUserId)} />
														<Check className='text-green-500 size-5 mt-1 cursor-pointer transition-all hover:scale-120' onClick={() => acceptOrDeleteFriendRequest('accept', friendOrUser.uniqueUserId)} />
													</>
												) : requestCheck(friendOrUser.uniqueUserId, 'sent') ? (
													<div className='flex flex-row items-center justify-center gap-10'>
														<Forward className='size-5 mt-1' />
														<Trash2 className='text-red-500 size-5 mt-1 cursor-pointer transition-all hover:scale-120' onClick={() => deleteSentFriendRequest(friendOrUser.uniqueUserId)} />
													</div>
												) : friendCheck(friendOrUser.uniqueUserId) ? (
													<div className='flex flex-row items-center justify-center gap-10 mt-2'>
														<Handshake className='size-5' />
														<Trash2 className='text-red-500 size-5 cursor-pointer transition-all hover:scale-120' onClick={() => removeFriend(friendOrUser.uniqueUserId)} />
													</div>
												) : (
													<UserPlus className='size-5 mt-1 cursor-pointer transition-all hover:scale-120' onClick={() => sendFriendRequest(friendOrUser.uniqueUserId)} />
												)}
											</div>
										)}
									</div>
								))
							)}
						</div>

						{totalPages != 1 && filteredFriendsOrUsers.length != 0 && (
							<div className='flex justify-center items-center mt-6 gap-2 flex-wrap'>
								<ChevronLeft onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} className={`${currentPage === 1 ? 'opacity-50' : 'cursor-pointer hover:scale-110'} text-black rounded disabled:opacity-50`} />
								{[...Array(totalPages)].map((_, index) => (
									<button key={index} onClick={() => handlePageChange(index + 1)} className={`px-3 py-1 rounded-md text-sm transition ${currentPage === index + 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 hover:bg-gray-300 hover:scale-110 cursor-pointer'}`}>
										{index + 1}
									</button>
								))}
								<ChevronRight onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} className={`${currentPage === totalPages ? 'opacity-50' : 'cursor-pointer hover:scale-110'} text-black rounded disabled:opacity-50`} />
							</div>
						)}
					</div>
				)}
			</div>
		</>
	)
}

export default FriendsOrUsers
