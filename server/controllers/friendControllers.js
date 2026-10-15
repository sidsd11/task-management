import userModel from '../models/userModel.js'

export const sendFriendRequest = async (req, res) => {
	try {
		const { id } = req.user
		if (!id) {
			return res.status(400).json({ success: false, message: 'Missing User details' })
		}

		const { friendUniqueUserId } = req.params
		if (!friendUniqueUserId) {
			return res.status(400).json({ success: false, message: 'Missing details' })
		}

		const friend = await userModel.findOne({ uniqueUserId: friendUniqueUserId, _id: { $ne: id } })
		if (!friend) {
			return res.status(404).json({ success: false, message: 'Friend user does not exist' })
		}

		const user = await userModel.findById(id)
		if (!user) {
			return res.status(404).json({ success: false, message: 'User does not exist' })
		}

		if (req.isFriend) {
			return res.status(400).json({ success: false, message: 'You are already friends with this user' })
		}

		const isRequestAlreadySent = user.friendRequests.sent.some((request) => request.uniqueUserId === friendUniqueUserId)
		if (isRequestAlreadySent) {
			return res.status(400).json({ success: false, message: 'You have already sent a friend request to this user' })
		}

		const isRequestAlreadyReceived = user.friendRequests.received.some((request) => request.uniqueUserId === friendUniqueUserId)
		if (isRequestAlreadyReceived) {
			return res.status(400).json({ success: false, message: 'This user has already sent you a friend request' })
		}

		user.friendRequests.sent.push({ uniqueUserId: friend.uniqueUserId, name: friend.name })
		await user.save()
		friend.friendRequests.received.push({ uniqueUserId: user.uniqueUserId, name: user.name })
		await friend.save()

		return res.status(200).json({ success: true, message: 'Friend request sent successfully' })
	} catch (error) {
		console.error('Error while sending friend request:', error)
		return res.status(500).json({ success: false, message: 'Something went wrong' })
	}
}

export const deleteSentFriendRequest = async (req, res) => {
	try {
		const { id } = req.user
		if (!id) {
			return res.status(400).json({ success: false, message: 'Missing User details' })
		}

		const { friendUniqueUserId } = req.params
		if (!friendUniqueUserId) {
			return res.status(400).json({ success: false, message: 'Missing details' })
		}

		if (req.isFriend) {
			return res.status(400).json({ success: false, message: 'You are already friends with this user' })
		}

		const user = await userModel.findById(id)
		if (!user) {
			return res.status(404).json({ success: false, message: 'User does not exist' })
		}

		const sentRequestIndex = user.friendRequests.sent.findIndex((request) => request.uniqueUserId === friendUniqueUserId)

		const friend = await userModel.findOne({ uniqueUserId: friendUniqueUserId })
		if (!friend) {
			if (sentRequestIndex !== -1) {
				user.friendRequests.sent.splice(sentRequestIndex, 1)
				await user.save()
			}

			return res.status(404).json({ success: false, message: 'Friend does not exist' })
		}

		const receivedRequestIndex = friend.friendRequests.received.findIndex((request) => request.uniqueUserId === user.uniqueUserId)
		if (sentRequestIndex === -1) {
			if (receivedRequestIndex !== -1) {
				friend.friendRequests.received.splice(receivedRequestIndex, 1)
				await friend.save()
			}

			return res.status(400).json({ success: false, message: 'You did not send friend request to this user' })
		}

		if (receivedRequestIndex === -1) {
			user.friendRequests.sent.splice(sentRequestIndex, 1)
			await user.save()

			return res.status(400).json({ success: false, message: 'This user did not receive a friend request from you' })
		}

		user.friendRequests.sent.splice(sentRequestIndex, 1)
		friend.friendRequests.received.splice(receivedRequestIndex, 1)

		await user.save()
		await friend.save()

		return res.status(200).json({ success: true, message: 'Friend request deleted successfully' })
	} catch (error) {
		console.error('Error while deleting friend request:', error)
		return res.status(500).json({ success: false, message: 'Something went wrong' })
	}
}

export const acceptOrDeleteFriendRequest = async (req, res) => {
	try {
		const { id } = req.user
		if (!id) {
			return res.status(400).json({ success: false, message: 'Missing User details' })
		}

		const { action, friendUniqueUserId } = req.params
		if (!action || (action !== 'accept' && action !== 'reject') || !friendUniqueUserId) {
			return res.status(400).json({ success: false, message: 'Missing or invalid details' })
		}

		const user = await userModel.findById(id)
		if (!user) {
			return res.status(404).json({ success: false, message: 'User does not exist' })
		}

		if (req.isFriend) {
			return res.status(400).json({ success: false, message: 'You are already friends with this user' })
		}

		const receivedRequestIndex = user.friendRequests.received.findIndex((request) => request.uniqueUserId === friendUniqueUserId)
		if (receivedRequestIndex === -1) {
			return res.status(400).json({ success: false, message: 'You did not receive a friend request from this user' })
		}

		const friend = await userModel.findOne({ uniqueUserId: friendUniqueUserId })
		if (!friend) {
			user.friendRequests.received.splice(receivedRequestIndex, 1)
			await user.save()

			return res.status(404).json({ success: false, message: 'Friend user does not exist' })
		}

		const sentRequestIndex = friend.friendRequests.sent.findIndex((request) => request.uniqueUserId === user.uniqueUserId)
		if (sentRequestIndex === -1) {
			user.friendRequests.received.splice(receivedRequestIndex, 1)
			await user.save()

			return res.status(400).json({ success: false, message: 'This user did not send you a friend request' })
		}

		if (action === 'accept') {
			const currTime = Date.now()

			user.friends.push({ uniqueUserId: friendUniqueUserId, name: user.friendRequests.received[receivedRequestIndex].name, timestamp: currTime })

			friend.friends.push({ uniqueUserId: user.uniqueUserId, name: user.name, timestamp: currTime })
		}

		user.friendRequests.received.splice(receivedRequestIndex, 1)
		friend.friendRequests.sent.splice(sentRequestIndex, 1)

		await user.save()
		await friend.save()

		return res.status(200).json({ success: true, message: `Friend request ${action}ed successfully` })
	} catch (error) {
		console.error('Error while accepting friend request:', error)
		return res.status(500).json({ success: false, message: 'Something went wrong' })
	}
}

export const removeFriend = async (req, res) => {
	try {
		const { id } = req.user
		if (!id) {
			return res.status(400).json({ success: false, message: 'Missing User details' })
		}

		const { friendUniqueUserId } = req.params
		if (!friendUniqueUserId) {
			return res.status(400).json({ success: false, message: 'Missing details' })
		}

		const friend = await userModel.findOne({ uniqueUserId: friendUniqueUserId })
		if (!friend) {
			return res.status(404).json({ success: false, message: 'Friend user does not exist' })
		}

		if (!req.isFriend) {
			return res.status(400).json({ success: false, message: 'This user is not your friend' })
		}

		const user = await userModel.findById(id)
		if (!user) {
			return res.status(404).json({ success: false, message: 'User does not exist' })
		}

		user.friends.pull({ uniqueUserId: friendUniqueUserId })
		await user.save()

		friend.friends.pull({ uniqueUserId: user.uniqueUserId })
		await friend.save()

		return res.status(200).json({ success: true, message: 'Friend removed successfully' })
	} catch (error) {
		console.error('Error while removing friend:', error)
		return res.status(500).json({ success: false, message: 'Something went wrong' })
	}
}

export const getFriendsData = async (req, res) => {
	try {
		const { id } = req.user
		if (!id) {
			return res.status(400).json({ success: false, message: 'Missing User details' })
		}

		const { friendUniqueUserId } = req.params
		if (!friendUniqueUserId) {
			return res.status(400).json({ success: false, message: 'Missing details' })
		}

		const { fields } = req.body
		if (!fields || !Array.isArray(fields)) {
			return res.status(400).json({ success: false, message: 'Missing or invalid details' })
		}

		if (!req.isFriend) {
			return res.status(403).json({ success: false, message: 'You cannot access data of users you are not friends with' })
		}

		const allowedFields = ['uniqueUserId', 'name', 'email', 'tasks']
		const toBeSentFields = fields.filter((field) => allowedFields.includes(field))
		if (toBeSentFields.length === 0) {
			return res.status(400).json({ success: false, message: 'No valid fields requested' })
		}

		const friendData = await userModel.findOne({ uniqueUserId: friendUniqueUserId }).select(toBeSentFields.join(' '))
		if (!friendData) {
			return res.status(404).json({ success: false, message: 'User does not exist' })
		}

		return res.status(200).json({ success: true, message: 'Friend data retrieved successfullt', data: friendData })
	} catch (error) {
		console.error('Error while retrieving friend data:', error)
		return res.status(500).json({ success: false, message: 'Something went wrong' })
	}
}

export const copyFriendsTask = async (req, res) => {
	try {
		const { id } = req.user
		if (!id) {
			return res.status(400).json({ success: false, message: 'Missing User details' })
		}

		const { friendUniqueUserId, taskId } = req.params
		if (!friendUniqueUserId || !taskId) {
			return res.status(400).json({ success: false, message: 'Missing details' })
		}

		if (!req.isFriend) {
			return res.status(403).json({ success: false, message: 'You are not friends with this user so you cannot copy their tasks' })
		}

		const friend = await userModel.findOne({ uniqueUserId: friendUniqueUserId, 'tasks._id': taskId })
		if (!friend) {
			return res.status(404).json({ success: false, message: 'Task does not exist' })
		}

		const task = friend.tasks.id(taskId)

		const user = await userModel.findById(id)
		if (!user) {
			return res.status(404).json({ success: false, message: 'User does not exist' })
		}

		user.tasks.push({ title: task.title, description: task.description, remark: `Copied from ${friend.name}` })
		await user.save()

		return res.status(200).json({ success: true, message: 'Task copied successfully' })
	} catch (error) {
		console.error('Error while copying task:', error)
		return res.status(500).json({ success: false, message: 'Something went wrong' })
	}
}
