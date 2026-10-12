import userModel from '../models/userModel.js'

export const getAllTasks = async (req, res) => {
	try {
		const { id } = req.user
		if (!id) {
			return res.status(400).json({ success: false, message: 'Missing User details' })
		}

		const user = await userModel.findById(id)
		if (!user) {
			return res.status(404).json({ success: false, message: 'User does not exist' })
		}

		return res.status(200).json({ success: true, message: 'Tasks retrieved successfully', tasks: user.tasks })
	} catch (error) {
		console.error('Error while retrieving tasks:', error)
		return res.status(401).json({ success: false, message: 'Something went wrong' })
	}
}

export const getSingleTask = async (req, res) => {
	try {
		const { id } = req.user
		if (!id) {
			return res.status(400).json({ success: false, message: 'Missing User details' })
		}

		const { taskId } = req.params
		if (!taskId) {
			return res.status(400).json({ success: false, message: 'Missing details' })
		}

		const task = await userModel.findOne({ _id: id, 'tasks._id': taskId })
		if (!task) {
			return res.status(404).json({ success: false, message: 'Task not found' })
		}

		return res.status(200).json({ success: true, message: 'Tasks retrieved successfully', task })
	} catch (error) {
		console.error('Error while retrieving task:', error)
		return res.status(401).json({ success: false, message: 'Something went wrong' })
	}
}

export const createTask = async (req, res) => {
	try {
		const { id } = req.user
		if (!id) {
			return res.status(400).json({ success: false, message: 'Missing User details' })
		}

		const { title, description } = req.body
		if (!title || !description) {
			return res.status(400).json({ success: false, message: 'Missing details' })
		}

		const user = await userModel.findById(id)
		if (!user) {
			return res.status(404).json({ success: false, message: 'User does not exist' })
		}

		user.tasks.push({
			title,
			description
		})
		await user.save()

		return res.status(201).json({ success: true, message: 'Task created succesfully' })
	} catch (error) {
		console.error('Error while creating task:', error)
		return res.status(401).json({ success: false, message: 'Something went wrong' })
	}
}

export const editTask = async (req, res) => {
	try {
		const { id } = req.user
		if (!id) {
			return res.status(400).json({ success: false, message: 'Missing User details' })
		}

		const { taskId } = req.params
		const { newTitle, newDescription } = req.body
		if (!taskId || !newTitle || !newDescription) {
			return res.status(400).json({ success: false, message: 'Missing details' })
		}

		const selectedUser = await userModel.findOne({ _id: id, 'tasks._id': taskId })
		if (!selectedUser) {
			return res.status(404).json({ success: false, message: 'Task not found' })
		}

		const selectedTask = selectedUser.tasks.id(taskId)

		const titleChanged = newTitle.trim() !== selectedTask.title
		const descriptionChanged = newDescription.trim() !== selectedTask.description
		if (!titleChanged && !descriptionChanged) {
			return res.status(400).json({ success: false, message: 'Old and new information cannot be same' })
		}

		selectedTask.title = newTitle.trim()
		selectedTask.description = newDescription
		selectedTask.editedAt = Date.now()
		await selectedUser.save()

		return res.status(200).json({ success: true, message: 'Task edited successfully' })
	} catch (error) {
		console.error('Error while editing task:', error)
		return res.status(500).json({ success: false, message: 'Something went wrong' })
	}
}

export const markTaskAs = async (req, res) => {
	try {
		const { id } = req.user
		if (!id) {
			return res.status(400).json({ success: false, message: 'Missing User details' })
		}

		const { status, taskId } = req.params
		if (!status || status !== 'Pending' || status !== 'In-progress' || status !== 'Completed' || !taskId) {
			return res.status(400).json({ success: false, message: 'Missing or invalid details' })
		}

		let CompletedAt = status === 'Completed' ? Date.now() : null

		const selectedTask = await userModel.findOneAndUpdate(
			{
				_id: id,
				'tasks._id': taskId
			},
			{
				$set: {
					'tasks.$.status': status,
					'tasks.$.completedAt': CompletedAt
				}
			},
			{ new: true, runValidators: true }
		)
		if (!selectedTask) {
			return res.status(404).json({ success: false, message: 'Task not found' })
		}

		return res.status(200).json({ success: true, message: `Task marked as ${status}` })
	} catch (error) {
		console.error('Error while marking task:', error)
		return res.status(500).json({ success: false, message: 'Something went wrong' })
	}
}

export const deleteTask = async (req, res) => {
	try {
		const { id } = req.user
		if (!id) {
			return res.status(400).json({ success: false, message: 'Missing User details' })
		}

		const { taskId } = req.params
		if (!taskId) {
			return res.status(400).json({ success: false, message: 'Missing details' })
		}

		const deletedTask = await userModel.findOneAndUpdate(
			{
				_id: id,
				'tasks._id': taskId
			},
			{
				$pull: {
					tasks: {
						_id: taskId
					}
				}
			}
		)
		if (!deletedTask) {
			return res.status(404).json({ success: false, message: 'Task not found' })
		}

		return res.status(200).json({ success: true, message: 'Task deleted successfully' })
	} catch (error) {
		console.error('Error while deleting task:', error)
		return res.status(500).json({ success: false, message: 'Something went wrong' })
	}
}
