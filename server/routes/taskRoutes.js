import express from 'express'
import { getAllTasks, getSingleTask, createTask, editTask, deleteTask, markTask } from '../controllers/taskControllers.js'
import userAuth from '../middleware/authUser.js'

const taskRouter = express.Router()

taskRouter.get('/get-all-tasks/:id', userAuth, getAllTasks)
taskRouter.get('/get-single-task/:id', userAuth, getSingleTask)
taskRouter.post('/create-task', userAuth, createTask)
taskRouter.patch('/edit-task/:id', userAuth, editTask)
taskRouter.patch('/mark-task/:status/:id', userAuth, markTask)
taskRouter.delete('/delete-task/:id', userAuth, deleteTask)

export default taskRouter