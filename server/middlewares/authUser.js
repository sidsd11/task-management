import jwt from 'jsonwebtoken'

import userModel from '../models/userModel.js'

export const userAuth = async (req, res, next) => {
	try {
		const { token } = req.cookies
		if (!token) {
			return res.status(401).json({ success: false, message: 'Not authorized, please login again' })
		}

		const tokenDecode = jwt.verify(token, process.env.JWT_SECRET)
		const id = tokenDecode?.id
		if (!id) {
			return res.status(401).json({ success: false, message: 'Not authorized, please login again' })
		}

		const user = await userModel.exists({ _id: id })
		if (!user) {
			res.clearCookie('token', {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
			})

			return res.status(401).json({ success: false, message: 'User does not exist' })
		}

		req.user = { id }

		next()
	} catch (error) {
		console.error('Error while verifying token:', error)
		return res.status(401).json({ success: false, message: 'Not authorized, please login again' })
	}
}

export const isFriend = async (req, res, next) => {
	try {
		const { friendUniqueUserId } = req.params
		if (!friendUniqueUserId) {
			return res.status(400).json({ success: false, message: 'Missing details' })
		}

		const friend = await userModel.exists({ uniqueUserId: friendUniqueUserId })
		if (!friend) {
			return res.status(404).json({ success: false, message: 'Friend user does not exist' })
		}

		const isFriend = await userModel.exists({ _id: req.user.id, 'friends.uniqueUserId': friendUniqueUserId })

		req.isFriend = Boolean(isFriend)

		next()
	} catch (error) {
		console.error('Error while checking friend:', error)
		return res.status(500).json({ success: false, message: 'Something went wrong' })
	}
}
