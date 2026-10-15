import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, CirclePlus, ClipboardCopy, Pen, Search, Trash2 } from 'lucide-react'

import { AppContext } from '../context/AppContext'
import LoadingAnimation from '../components/LoadingAnimation'
import Navbar from '../components/Navbar'
import { warnToast } from '../components/WarnToast'

const Tasks = (props) => {
	const navigate = useNavigate()
	const { backendUrl, isLoggedIn, userData, authLoading, handleErrorStatusCode } = useContext(AppContext)

	const [tasks, setTasks] = useState([])

	const allStatus = ['All', 'Pending', 'In-progress', 'Completed']
	const [selectedFilter, setSelectedFilter] = useState('All')

	const [expandedTaskId, setExpandedTaskId] = useState(null)

	const [editTask, setEditTask] = useState(false)
	const [editTaskTitle, setEditTaskTitle] = useState('')
	const [editTaskDescription, setEditTaskDescription] = useState('')
	const [editTaskTitleCheck, setEditTaskTitleCheck] = useState('')
	const [editTaskDescriptionCheck, setEditTaskDescriptionCheck] = useState('')
	const [editTaskId, setEditTaskId] = useState('')

	const [createNewTask, setCreateNewTask] = useState(false)
	const [createNewTaskTitle, setCreateNewTaskTitle] = useState('')
	const [createNewTaskDescription, setCreateNewTaskDescription] = useState('')

	const [filteredTasks, setFilteredTasks] = useState([])
	const [filteredTasksBeforeSearching, setFilteredTasksBeforeSearching] = useState([])

	const [searchText, setSearchText] = useState('')

	const [currentPage, setCurrentPage] = useState(1)
	const [tasksPerPage, setTasksPerPage] = useState(4)
	const indexOfLastTask = currentPage * tasksPerPage
	const indexOfFirstTask = indexOfLastTask - tasksPerPage

	const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask)
	const totalPages = Math.ceil(filteredTasks.length / tasksPerPage)

	const handlePageChange = (pageNumber) => {
		setCurrentPage(pageNumber)
	}

	const getTasks = async () => {
		try {
			const fields = ['tasks']
			const { data, headers } = props.type === 'self' ? await axios.post(`${backendUrl}/api/user/get-user-data`, { fields }) : await axios.post(`${backendUrl}/api/friend/get-friends-data/${props.uniqueUserId}`, { fields })
			if (headers['redis-ratelimit-message']) {
				warnToast(headers['redis-ratelimit-message'])
			}
			if (data.success) {
				setTasks(data.data.tasks)
			} else {
				toast.error(data.message)
			}
		} catch (error) {
			handleErrorStatusCode(error.response?.status, error)
		}
	}

	const markTaskAs = async (taskId, status) => {
		try {
			const { data, headers } = await axios.patch(`${backendUrl}/api/task/mark-task-as/${status}/${taskId}`)
			if (headers['redis-ratelimit-message']) {
				warnToast(headers['redis-ratelimit-message'])
			}
			if (data.success) {
				toast.success(data.message)
				getTasks()
			} else {
				toast.error(data.message)
			}
		} catch (error) {
			handleErrorStatusCode(error.response?.status, error)
		}
	}

	const getSelectedTask = async (taskId) => {
		try {
			const { data, headers } = await axios.get(`${backendUrl}/api/task/get-single-task/${taskId}`)
			if (headers['redis-ratelimit-message']) {
				warnToast(headers['redis-ratelimit-message'])
			}
			if (data.success) {
				setEditTask(true)
				setEditTaskTitle(data.task.title)
				setEditTaskDescription(data.task.description)
				setEditTaskTitleCheck(data.task.title)
				setEditTaskDescriptionCheck(data.task.description)
				setEditTaskId(taskId)
			} else {
				toast.error(data.message)
			}
		} catch (error) {
			handleErrorStatusCode(error.response?.status, error)
		}
	}

	const editSelectedTask = async (e) => {
		e.preventDefault()
		try {
			if (editTaskTitleCheck === editTaskTitle && editTaskDescriptionCheck === editTaskDescription) {
				toast.error('Title and description are same as before.')
				return
			}

			const { data, headers } = await axios.patch(`${backendUrl}/api/task/edit-task/${editTaskId}`, { newTitle: editTaskTitle, newDescription: editTaskDescription })
			if (headers['redis-ratelimit-message']) {
				warnToast(headers['redis-ratelimit-message'])
			}
			if (data.success) {
				getTasks()
				toast.success(data.message)
				setEditTask(false)
				setEditTaskTitle('')
				setEditTaskDescription('')
				setEditTaskTitleCheck('')
				setEditTaskDescriptionCheck('')
				setCreateNewTask(false)
			}
		} catch (error) {
			handleErrorStatusCode(error.response?.status, error)
		}
	}

	const createTask = async (e) => {
		try {
			e.preventDefault()

			const { data, headers } = await axios.post(`${backendUrl}/api/task/create-task`, { title: createNewTaskTitle, description: createNewTaskDescription })
			if (headers['redis-ratelimit-message']) {
				warnToast(headers['redis-ratelimit-message'])
			}
			if (data.success) {
				getTasks()
				setCurrentPage()
				toast.success(data.message)
				setCreateNewTaskTitle('')
				setCreateNewTaskDescription('')
				setCreateNewTask(false)
				setEditTask(false)
			} else {
				toast.error(data.message)
			}
		} catch (error) {
			handleErrorStatusCode(error.response?.status, error)
		}
	}

	const deleteTask = async (taskId) => {
		try {
			const { data, headers } = await axios.delete(`${backendUrl}/api/task/delete-task/${taskId}`)
			if (headers['redis-ratelimit-message']) {
				warnToast(headers['redis-ratelimit-message'])
			}
			if (data.success) {
				toast.success(data.message)
				getTasks()
			} else {
				toast.error(data.message)
			}
		} catch (error) {
			handleErrorStatusCode(error.response?.status, error)
		}
	}

	const copyFriendsTask = async (friendUniqueUserId, taskId) => {
		try {
			const { data, headers } = await axios.patch(`${backendUrl}/api/friend/copy-friends-task/${friendUniqueUserId}/${taskId}`)
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
		getTasks()
	}, [authLoading, isLoggedIn])

	useEffect(() => {
		let filtered = selectedFilter === 'All' ? tasks : tasks.filter((task) => task.status === selectedFilter)
		setFilteredTasksBeforeSearching(filtered)
		if (searchText.length > 0) {
			filtered = filtered.filter((task) => task.title.toLowerCase().includes(searchText.toLowerCase()) || task.description.toLowerCase().includes(searchText.toLowerCase()))
		}
		setFilteredTasks(filtered)
	}, [tasks, selectedFilter, searchText])

	useEffect(() => {
		setCurrentPage(1)
	}, [selectedFilter, searchText])

	useEffect(() => {
		const updateTasksPerPage = () => {
			const width = window.innerWidth

			let columns = 1
			if (width >= 1024) columns = 4
			else if (width >= 768) columns = 3
			else if (width >= 640) columns = 2

			setTasksPerPage(columns)
		}

		updateTasksPerPage()

		window.addEventListener('resize', updateTasksPerPage)

		return () => {
			window.removeEventListener('resize', updateTasksPerPage)
		}
	}, [])

	useEffect(() => {
		if (currentPage > totalPages) {
			setCurrentPage(1)
		}
	}, [tasksPerPage])

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
						<h1 className='text-3xl text-center font-semibold'>{props.type === 'self' ? 'My' : props.name + `'s`} Tasks</h1>

						{props.type === 'self' && (
							<h1 className='text-2xl text-center font-semibold cursor-pointer hover:scale-110 transition-all' onClick={() => setCreateNewTask(true)}>
								<CirclePlus className='size-5 inline-block' /> Create a new task
							</h1>
						)}

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

						{filteredTasksBeforeSearching.length > 0 && (
							<div className='flex items-center justify-center mb-3 border border-indigo-600 bg-white rounded-full p-2'>
								<Search className='size-4 inline-block' />
								<input type='text' placeholder='Search tasks' value={searchText} onChange={(e) => setSearchText(e.target.value)} className='w-full rounded ml-3 text-sm' />
							</div>
						)}

						<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full'>
							{filteredTasks.length === 0 ? (
								<p className='text-lg font-semibold text-black mt-10 col-span-full'>No tasks found {selectedFilter === 'All' ? '' : 'as ' + selectedFilter}</p>
							) : (
								currentTasks.map((task) => (
									<div key={task._id} className={`${selectedFilter !== 'All' ? 'transition-opacity' : ''} p-4 bg-white shadow-md rounded-lg hover:shadow-xl hover:z-10 hover:scale-[1.03] transition-all w-full h-full`}>
										<h3 className='font-semibold text-lg text-gray-800 border-b pb-2'>{task.title}</h3>

										<p className='text-gray-600 text-sm mt-2 transition-all duration-300 break-all whitespace-normal min-h-[50px]'>{expandedTaskId === task._id ? task.description : task.description.length > 50 ? task.description.substring(0, 100) + '...' : task.description}</p>

										{task.description?.length > 50 && (
											<div className='flex justify-center items-center mt-3 gap-2'>
												<p className='text-gray-600 cursor-pointer transition-all hover:scale-120' onClick={() => setExpandedTaskId(expandedTaskId === task._id ? null : task._id)}>
													{expandedTaskId === task._id ? <ChevronUp /> : <ChevronDown />}
												</p>
											</div>
										)}

										{
											<div className='flex flex-col justify-center items-center mt-5 transition-all'>
												<p className='text-gray-600'>Current status:</p>
												<label className='flex items-center gap-2'>
													<p className='text-yellow-600 text-xs'>{task.status}</p>
												</label>
											</div>
										}

										{props.type === 'self' ? (
											<>
												<div className='flex flex-col justify-center items-center mt-5 transition-all'>
													<p className='text-gray-600'>Mark it as:</p>
													<div className='flex flex-row gap-4'>
														{allStatus
															.filter((status) => status != task.status && status != 'All')
															.map((status) => (
																<label key={status} className='flex items-center gap-2 cursor-pointer transition-all hover:scale-120'>
																	<input type='checkbox' name={`status-${task._id}`} onChange={() => markTaskAs(task._id, status)} className='accent-green-600 cursor-pointer' />
																	<p className='text-yellow-600 text-xs'>{status}</p>
																</label>
															))}
													</div>
												</div>

												<div className='flex flex-col justify-center items-center mt-5 gap-2'>
													{task.createdAt !== null && (
														<p className='text-xs text-gray-500'>
															{task.remark?.includes('Copied') ? 'Copied' : 'Created'} at: {convertTime(new Date(task.createdAt))}
														</p>
													)}

													{task.editedAt !== null && <p className='text-xs text-gray-500'>Edited at: {convertTime(new Date(task.editedAt))}</p>}

													{task.completedAt !== null && <p className='text-xs text-gray-500'>Completed at: {convertTime(new Date(task.completedAt))}</p>}
												</div>

												{task.remark !== null && (
													<div className='flex flex-col justify-center items-center mt-5 transition-all'>
														<p className='text-gray-600'>Remark:</p>
														<label className='flex items-center gap-2'>
															<p className='text-yellow-600 text-xs'>{task.remark}</p>
														</label>
													</div>
												)}

												<div className='flex flex-row justify-center items-center mt-5 gap-2'>
													{task.status != 'Completed' && (
														<p className='text-gray-500'>
															<Pen
																className='size-5 cursor-pointer transition-all hover:scale-120'
																onClick={() => {
																	setEditTask(true)
																	getSelectedTask(task._id)
																}}
															/>
														</p>
													)}

													<p className='text-red-500'>
														<Trash2 className='size-5 cursor-pointer transition-all hover:scale-120' onClick={() => deleteTask(task._id)} />
													</p>
												</div>
											</>
										) : (
											<div className='flex flex-row justify-center items-center mt-5 gap-2'>
												<p>
													<ClipboardCopy
														className='size-5 cursor-pointer transition-all hover:scale-120'
														onClick={() => {
															copyFriendsTask(props.uniqueUserId, task._id)
														}}
													/>
												</p>
											</div>
										)}
									</div>
								))
							)}
						</div>

						{totalPages != 1 && filteredTasks.length != 0 && (
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
			{props.type === 'self' && (editTask || createNewTask) && (
				<div
					className='flex flex-col items-center justify-center min-h-screen min-w-screen bg-gray-400/60 z-99 fixed top-0 left-0'
					onClick={() => {
						setEditTask(false)
						setCreateNewTask(false)
					}}
				>
					<div className='flex flex-col items-center mt-20 px-4 text-center bg-slate-900 p-10 rounded-lg shadow-lg w-[70%] sm:w-100 text-indigo-300 text-sm z-100' onClick={(e) => e.stopPropagation()}>
						{editTask ? (
							<>
								<h1 className='text-3xl text-center font-semibold text-white mb-5'>Edit task</h1>

								<form onSubmit={editSelectedTask}>
									<div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-lg bg-[#333A5C]'>
										<input type='text' value={editTaskTitle} onChange={(e) => setEditTaskTitle(e.target.value)} className='bg-transparent outline-none text-white' placeholder='Enter title' maxLength='20' required />
									</div>

									<div className='mb-4 w-full px-5 py-2.5 rounded-lg bg-[#333A5C]'>
										<textarea value={editTaskDescription} onChange={(e) => setEditTaskDescription(e.target.value)} className='bg-transparent outline-none text-white w-full min-h-[200px] resize-y overflow-auto' placeholder='Enter description' maxLength='200' required />
									</div>

									<button className='w-full py-3 bg-linear-to-r from-indigo-500 to-indigo-900 text-white rounded-full cursor-pointer'>Save</button>
								</form>
							</>
						) : (
							<>
								<h1 className='text-3xl text-center font-semibold text-white mb-5'>Create a new task</h1>

								<form onSubmit={createTask}>
									<div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-lg bg-[#333A5C]'>
										<input type='text' value={createNewTaskTitle} onChange={(e) => setCreateNewTaskTitle(e.target.value)} className='bg-transparent outline-none text-white' placeholder='Enter title' maxLength='20' required />
									</div>

									<div className='mb-4 w-full px-5 py-2.5 rounded-lg bg-[#333A5C]'>
										<textarea value={createNewTaskDescription} onChange={(e) => setCreateNewTaskDescription(e.target.value)} className='bg-transparent outline-none text-white w-full min-h-[200px] resize-y overflow-auto' placeholder='Enter description' maxLength='200' required />
									</div>

									<button className='w-full py-3 bg-linear-to-r from-indigo-500 to-indigo-900 text-white rounded-full cursor-pointer'>Create</button>
								</form>
							</>
						)}
					</div>
				</div>
			)}
		</>
	)
}

export default Tasks
