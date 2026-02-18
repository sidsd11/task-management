import userModel from '../models/userModel.js'
import taskModel from '../models/taskModel.js'

export const getAllTasks = async (req, res) => {
    try {
        const userId = req.user.id

        const user = await userModel.findById(userId)
        if (!user) {
            return res.json({success: false, message: 'User does not exist'})
        }

        const tasks = await taskModel.find({userId}).sort({createdAt: -1})

        return res.json({success: true, message: 'Tasks fetched successfully', tasks})
    }
    catch (error) {
        return res.json({success: false, message: 'Not authorized. Login again'})
    }
}

export const getSingleTask = async (req, res) => {
    try {
        const userId = req.user.id
        const taskId = req.params.id
        if (!taskId) {
            return res.json({success: false, message: 'Missing details'})
        }

        const user = await userModel.findById(userId)
        if (!user) {
            return res.json({success: false, message: 'User does not exist'})
        }

        const task = await taskModel.findById(taskId)

        if (task.userId === userId) {
            return res.json({success: true, message: 'Tasks fetched successfully', task})
        }
        else {
            return res.json({success: false, message: 'You cannot access this task'})
        }
    }
    catch (error) {
        return res.json({success: false, message: 'Not authorized. Login again'})
    }
}

export const createTask = async (req, res) => {
    try {
        const userId = req.user.id
        const {title, description} = req.body
        if (!title, !description) {
            return res.json({success: false, message: 'Missing details'})
        }
        const createTask = new taskModel({userId, title, description, createdAt: Date.now()})
        await createTask.save()
    
        return res.json({success: true, message: 'Task created succesfully'})
    }
    catch (error) {
        return res.json({success: false, message: error.message})
    }

}

export const editTask = async (req, res) => {
    try {
        const taskId = req.params.id
        const {title, description} = req.body
        if (!taskId || !title || !description) {
            return res.json({success: false, message: 'Missing details'})
        }

        const selectedTask = await taskModel.findByIdAndUpdate(
            taskId,
            {
                $set: {
                    title, description, editedAt: Date.now()
                }
            },
            {new: true, runValidators: true}
        )
        if (!selectedTask) {
            return res.json({success: false, message: 'Task not found'})
        }
    
        return res.json({success: true, message: 'Task edited successfully'})
    }
    catch (error) {
        return res.json({success: false, message: error.message})
    }
}

export const markTask = async (req, res) => {
    try {
        const {status, id} = req.params
        if (!status || !id) {
            return res.json({success: false, message: 'Missing details'})
        }

        let CompletedAt
        if (status === 'Completed') {
            CompletedAt = Date.now()
        }
        else {
            CompletedAt = 0
        }

        const selectedTask = await taskModel.findByIdAndUpdate(
            id,
            {
                $set: {
                    status: status,
                    completedAt: CompletedAt
                }
            },
            {new: true, runValidators: true}
        )
        if (!selectedTask) {
            return res.json({success: false, message: 'Task not found'})
        }
    
        return res.json({success: true, message: `Task marked as ${status}`})
    }
    catch (error) {
        return res.json({success: false, message: error.message})
    }
}

export const deleteTask = async (req, res) => {
    try {
        const taskId = req.params.id
        if (!taskId) {
            return res.json({success: false, message: 'Missing details'})
        }

        const selectedTask = await taskModel.findByIdAndDelete(taskId)
        if (!selectedTask) {
            return res.json({success: false, message: 'Task not found'})
        }
    
        return res.json({success: true, message: 'Task deleted successfully'})
    }
    catch (error) {
        return res.json({success: false, message: error.message})
    }
}