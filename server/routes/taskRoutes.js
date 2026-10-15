import express from 'express'

import { userAuth } from '../middlewares/authUser.js'
import { createTask, deleteTask, editTask, getSingleTask, markTaskAs } from '../controllers/taskControllers.js'

const taskRouter = express.Router()

/* Protected Routes */
taskRouter.use(userAuth)

taskRouter.get('/get-single-task/:taskId', getSingleTask)

taskRouter.post('/create-task', createTask)

taskRouter.patch('/edit-task/:taskId', editTask)
taskRouter.patch('/mark-task-as/:status/:taskId', markTaskAs)

taskRouter.delete('/delete-task/:taskId', deleteTask)

export default taskRouter
