import crypto from 'node:crypto'

import userModel from '../models/userModel.js'

const generateUniqueUserId = async () => {
	try {
		let uniqueUserId
		let uniqueUserIdExists = true
		const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
		const len = characters.length
		while (uniqueUserIdExists) {
			uniqueUserId = ''

			for (let i = 0; i < 8; i++) {
				const index = crypto.randomInt(0, len)
				uniqueUserId += characters[index]
			}

			uniqueUserIdExists = await userModel.exists({ uniqueUserId })
		}

		return { success: true, uniqueUserId }
	} catch (error) {
		console.error('Error generating unique user ID:', error)
		return { success: false, message: 'Error generating unique user ID' }
	}
}

export default generateUniqueUserId
