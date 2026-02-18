import React, { useContext, useEffect, useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext.jsx'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Loader, Pen, ChevronDown, ChevronUp, Trash2, CirclePlus } from 'lucide-react'

const MyTasks = () => {
    axios.defaults.withCredentials = true

    const navigate = useNavigate()
    const {backendUrl, isLoggedIn, userData, getUserData, authLoading} = useContext(AppContext)
     /* To get all tasks */
    const [tasks, setTasks] = useState([])
     /* To filter tasks */
    const allStatus = ['All', 'In-progress', 'Pending', 'Completed']
    const [selectedFilter, setSelectedFilter] = useState('All')
     /* Expand task with longer description */
    const [expandedTaskId, setExpandedTaskId] = useState(null)
     /* Edit particular task */
    const [editTask, setEditTask] = useState(false)  /* To check whether to show edit task window or not */
    const [EditTaskTitle, setEditTaskTitle] = useState('')  /* To store title of selected task which user wants to edit */
    const [editTaskDescription, setEditTaskDescription] = useState('')  /* To store description of selected task which user wants to edit */
    const [EditTaskTitleCheck, setEditTaskTitleCheck] = useState('')  /* To check where old and new title of selected task which user wants to edit are same or not */
    const [editTaskDescriptionCheck, setEditTaskDescriptionCheck] = useState('')  /* To check where old and new description of selected task which user wants to edit are same or not */
    const [editTaskId, setEditTaskId] = useState('')  /* To store id of selected task which user wants to edit */
     /* Create new task */
    const [createNewTask, setCreateNewTask] = useState(false)  /* To check whether to show create new task window or not */
    const [createNewTaskTitle, setCreateNewTaskTitle] = useState('')  /* To store title of new task */
    const [createNewTaskDescription, setCreateNewTaskDescription] = useState('')  /* To store description of new task */
    
     /* To get data of all tasks */
    const getTasks = async () => {
        try {
            const {data} = await axios.get(`${backendUrl}/api/task/get-all-tasks/${userData.id}`)
            if (data.success) {
                setTasks(data.tasks)
            }
            else {
                toast.error(data.message)
            }
        }
        catch (error) {
            toast.error(error.message)
        }
    }

     /* To mark task as completed */
    const markTask = async (taskId, status) => {
        try {
            const {data} = await axios.patch(`${backendUrl}/api/task/mark-task/${status}/${taskId}`, {})
            if (data.success) {
                toast.success(data.message)
                getTasks()
            }
            else {
                toast.error(data.message)
            }
        }
        catch (error) {
            toast.error(error.message)
        }
    }

     /* To get data of selected task which user wants to edit */
    const getSelectedTask = async (taskId) => {
        try {
            const {data} = await axios.get(`${backendUrl}/api/task/get-single-task/${taskId}`)
            if (data.success) {
                setEditTask(true)
                setEditTaskTitle(data.task.title)
                setEditTaskDescription(data.task.description)
                setEditTaskTitleCheck(data.task.title)
                setEditTaskDescriptionCheck(data.task.description)
                setEditTaskId(taskId)
            }
            else {
                toast.error(data.message)
            }
        }
        catch (error) {
            toast.error(error.message)
        }
    }

     /* To edit selected task which user wants to edit */
    const editSelectedTask = async (e) => {
        e.preventDefault()
        try {
            if (EditTaskTitleCheck === EditTaskTitle && editTaskDescriptionCheck === editTaskDescription) {
                toast.error('Title and description are same as before.')
                return
            }

            const {data} = await axios.patch(`${backendUrl}/api/task/edit-task/${editTaskId}`, {title: EditTaskTitle, description: editTaskDescription})
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
        }
        catch (error) {
            toast.error(error.message)
        }
    }

     /* To create a new task */
    const createTask = async (e) => {
        try {
            e.preventDefault()

            const {data} = await axios.post(`${backendUrl}/api/task/create-task`, {title: createNewTaskTitle, description: createNewTaskDescription})
            if (data.success) {
                getTasks()
                toast.success(data.message)
                setCreateNewTaskTitle('')
                setCreateNewTaskDescription('')
                setCreateNewTask(false)
                setEditTask(false)
            }
            else {
                toast.error(data.message)
            }
        }
        catch (error) {
            toast.error(error.message)
        }
    }

     /* To delete a task */
    const deleteTask = async (taskId) => {
        try {
            const {data} = await axios.delete(`${backendUrl}/api/task/delete-task/${taskId}`)
            if (data.success) {
                toast.success(data.message)
                getTasks()
            }
            else {
                toast.error(data.message)
            }
        }
        catch (error) {
            toast.error(error.message)
        }
    }

     /* To convert time in 'dd/mm/yyyy hh:mm:ss am/pm' format */
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

    /* Send OTP to verify account */
    const handleVerify = async () => {
        try {
            const {data} = await axios.post(`${backendUrl}/api/user/send-verification-otp`)
            if (data.success) {
                sessionStorage.setItem('prevPage', '/my-tasks')
                navigate('/email-verify')
                toast.success(data.message)
            }
            else {
                toast.error(data.message)
            }
        }
        catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        if (authLoading) return
        if (!isLoggedIn) {
            navigate('/')
            return
        }
        getTasks()
        getUserData()
    }, [authLoading, isLoggedIn])

    return (
        authLoading
        ? (
            <div className='flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-blue-200 to-purple-400'>
                <h1 className='text-3xl text-center font-semibold text-black mb-5'>
                    Loading your page...
                </h1>
                <Loader className='animate-spin' />
            </div>
        ) :
        (
            <>
                <div className='flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-blue-200 to-purple-400'>
                    <Navbar />
                    {
                        /* To check whether account is verified or not */
                        !userData?.isAccountVerified
                        ? (
                            <div className='flex flex-col items-center mt-20 px-4 text-center p-10 w-[70%] sm:w-[80%] text-black text-sm'>
                                <h1 className='text-3xl text-center font-semibold'>
                                    Your account is not verified. Please <span className='cursor-pointer underline' onClick={handleVerify}>verify</span> it to create tasks.
                                </h1>
                            </div>
                        ) :
                        (
                            /* Main content */
                            <div className='flex flex-col items-center mt-20 px-4 text-center p-10 w-[70%] sm:w-[80%] text-black text-sm'>
                                <h1 className='text-3xl text-center font-semibold'>
                                    My Tasks
                                </h1>

                                <h1 className='text-2xl text-center font-semibold mb-6 cursor-pointer hover:scale-110 transition-all' onClick={() => setCreateNewTask(true)}>
                                    <CirclePlus className='size-5 inline-block' /> Create a new task
                                </h1>

                                {/* Task filter */}
                                <div className='hidden sm:flex gap-4 mb-6 justify-center'>
                                    {
                                        allStatus.map((f, index) => (
                                            <button
                                            key = {index}
                                            className={`px-4 py-2 rounded-full border border-indigo-600 transition-all ${selectedFilter === f ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-200 hover:scale-110'}`}
                                            onClick={() => setSelectedFilter(f)}>
                                                {f}
                                            </button>
                                        ))
                                    }
                                </div>
                                <div className='sm:hidden mb-6 justify-center'>
                                    <select
                                    className='w-full p-2 border border-indigo-600 rounded-lg text-white bg-indigo-600'
                                    value={selectedFilter}
                                    onChange={((e) => setSelectedFilter(e.target.value))}>
                                        {
                                            allStatus.map((f, index) => (
                                                <option key={index} value={f} className='text-black bg-white'>
                                                    {f}
                                                </option>
                                            ))
                                        }
                                    </select>
                                </div>

                                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full'>
                                    {/* Filter tasks according to selected type */}
                                    {(() => {
                                        const filteredTasks = tasks.filter(task => {
                                            if (selectedFilter === 'Completed') return task.status === 'Completed'
                                            if (selectedFilter === 'Pending') return task.status === 'Pending'
                                            if (selectedFilter === 'In-progress') return task.status === 'In-progress'
                                            return true
                                        })

                                        if (filteredTasks.length === 0) {
                                            return (
                                                <p className='text-lg font-semibold text-black mt-10 col-span-full'>
                                                    No tasks found {selectedFilter === 'All' ? '' : 'as ' + selectedFilter}
                                                </p>
                                            )
                                        }

                                        /* Map filtered tasks */
                                        return filteredTasks.map(task => (
                                            <div
                                            key={task._id}
                                            className={`${selectedFilter !== 'All' ? 'transition-opacity' : ''} p-4 bg-white shadow-md rounded-lg hover:shadow-xl hover:z-10 hover:scale-[1.03] transition-all w-full h-full`}>
                                                {/* Title */}
                                                <h3 className='font-semibold text-lg text-gray-800 border-b pb-2'>
                                                    {task.title}
                                                </h3>

                                                {/* Description */}
                                                <p className='text-gray-600 text-sm mt-2 transition-all duration-300 break-all whitespace-normal min-h-[50px]'>
                                                    {
                                                        expandedTaskId === task._id ? task.description : task.description.length > 50 ? task.description.substring(0, 100) + '...' : task.description
                                                    }
                                                </p>

                                                {/* Expand description */}
                                                {
                                                    task.description?.length > 50 &&
                                                    <div className='flex justify-center items-center mt-3 gap-2'>
                                                        <p className='text-gray-600 cursor-pointer transition-all hover:scale-120' onClick={() => setExpandedTaskId(expandedTaskId === task._id ? null : task._id)}>
                                                            {
                                                                expandedTaskId === task._id ? <ChevronUp /> : <ChevronDown />
                                                            }
                                                        </p>
                                                    </div>
                                                }

                                                {
                                                    <div className='flex flex-col justify-center items-center mt-5 transition-all'>
                                                        <p className='text-gray-600'>Current status:</p>
                                                        <label className='flex items-center gap-2'>
                                                            <input
                                                            type='checkbox'
                                                            checked={true}
                                                            className='accent-green-600' />
                                                            <p className='text-yellow-600 text-xs'>{task.status}</p>
                                                        </label>
                                                    </div>
                                                }

                                                {/* Checkbox to mark task */}
                                                <div className='flex flex-col justify-center items-center mt-5 transition-all'>
                                                    <p className='text-gray-600'>Mark it as:</p>
                                                    <div className='flex flex-row gap-4'>
                                                        {
                                                            allStatus.filter(status => status != task.status && status != 'All').map(status => (
                                                                <label
                                                                key={status}
                                                                className='flex items-center gap-2 cursor-pointer transition-all hover:scale-120'>
                                                                    <input
                                                                    type='checkbox'
                                                                    name={`status-${task._id}`}
                                                                    onChange={() => markTask(task._id, status)}
                                                                    className='accent-green-600 cursor-pointer' />
                                                                    <p className='text-yellow-600 text-xs'>{status}</p>
                                                                </label>
                                                            ))
                                                        }
                                                    </div>
                                                </div>

                                                <div className='flex flex-col justify-center items-center mt-5 gap-2'>
                                                    {/* Task created at */}
                                                    {
                                                        task.created !== 0 && (
                                                            <p className='text-xs text-gray-500'>
                                                                Created at: {convertTime(new Date(task.editedAt))}
                                                            </p>
                                                        )
                                                    }

                                                    {/* Task edited at */}
                                                    {
                                                        task.editedAt !== 0 && (
                                                            <p className='text-xs text-gray-500'>
                                                                Edited at: {convertTime(new Date(task.editedAt))}
                                                            </p>
                                                        )
                                                    }

                                                    {/* Task completed at */}
                                                    {
                                                        task.completedAt !== 0 && (
                                                            <p className='text-xs text-gray-500'>
                                                                Completed at: {convertTime(new Date(task.completedAt))}
                                                            </p>
                                                        )
                                                    }
                                                </div>

                                                <div className='flex flex-row justify-center items-center mt-5 gap-2'>
                                                    {/* Edit task */}
                                                    {
                                                        task.status != 'Completed' && (
                                                            <p className='text-gray-500'>
                                                                <Pen className='size-5 cursor-pointer transition-all hover:scale-120'
                                                                onClick={() => {
                                                                    setEditTask(true)
                                                                    getSelectedTask(task._id)
                                                                }}/>
                                                            </p>
                                                        )
                                                    }

                                                    {/* Delete task */}
                                                    <p className='text-red-500'>
                                                        <Trash2 className='size-5 cursor-pointer transition-all hover:scale-120' onClick={() => deleteTask(task._id)} />
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    })()}
                                </div>
                            </div>
                        )
                    }
                </div>

                {
                    /* Gray backgroung while editing/craeting task */
                    (editTask || createNewTask) && (
                        <div
                        className='flex flex-col items-center justify-center min-h-screen min-w-screen bg-gray-400/60 z-99 fixed top-0 left-0'
                        onClick={() => {
                            setEditTask(false)
                            setCreateNewTask(false)
                        }}>
                            <div
                            className='flex flex-col items-center mt-20 px-4 text-center bg-slate-900 p-10 rounded-lg shadow-lg w-[70%] sm:w-96 text-indigo-300 text-sm z-100'
                            onClick={(e) => e.stopPropagation()}>
                                {
                                    editTask
                                    ? (
                                        /* Edit task form */
                                        <>
                                            <h1 className='text-3xl text-center font-semibold text-white mb-5'>
                                                Edit task
                                            </h1>

                                            <form onSubmit={editSelectedTask}>
                                                <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-lg bg-[#333A5C]'>
                                                    <input type='text' value={EditTaskTitle} onChange={e => setEditTaskTitle(e.target.value)} className='bg-transparent outline-none text-white' placeholder='Enter title' maxLength='20' required />
                                                </div>

                                                <div className='mb-4 w-full px-5 py-2.5 rounded-lg bg-[#333A5C]'>
                                                    <textarea value={editTaskDescription} onChange={e => setEditTaskDescription(e.target.value)} className='bg-transparent outline-none text-white w-full min-h-[200px] resize-y overflow-auto' placeholder='Enter description' maxLength='200' required />
                                                </div>

                                                <button className='w-full py-3 bg-linear-to-r from-indigo-500 to-indigo-900 text-white rounded-full cursor-pointer'>
                                                    Save
                                                </button>
                                            </form>
                                        </>
                                    ) :
                                    (
                                        /* Create new task form */
                                        <>
                                            <h1 className='text-3xl text-center font-semibold text-white mb-5'>
                                                Create a new task
                                            </h1>

                                            <form onSubmit={createTask}>
                                                <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-lg bg-[#333A5C]'>
                                                    <input type='text' value={createNewTaskTitle} onChange={e => setCreateNewTaskTitle(e.target.value)} className='bg-transparent outline-none text-white' placeholder='Enter title' maxLength='20' required />
                                                </div>

                                                <div className='mb-4 w-full px-5 py-2.5 rounded-lg bg-[#333A5C]'>
                                                    <textarea value={createNewTaskDescription} onChange={e => setCreateNewTaskDescription(e.target.value)} className='bg-transparent outline-none text-white w-full min-h-[200px] resize-y overflow-auto' placeholder='Enter description' maxLength='200' required />
                                                </div>

                                                <button className='w-full py-3 bg-linear-to-r from-indigo-500 to-indigo-900 text-white rounded-full cursor-pointer'>
                                                    Create
                                                </button>
                                            </form>
                                        </>
                                    )
                                }
                            </div>
                        </div>
                    )
                }
            </>
        )
    )
}

export default MyTasks