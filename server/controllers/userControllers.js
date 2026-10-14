import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library'

import userModel from '../models/userModel.js'
import transporter from '../config/nodemailer.js'
import generateUniqueUserId from '../utils/generateUniqueUserId.js'

export const register = async (req, res) => {
	try {
		const { name, email, password } = req.body
		if (!name || !email || !password) {
			return res.status(400).json({ success: false, message: 'Missing details' })
		}
		const normalizedEmail = email.trim().toLowerCase()

		const existingUser = await userModel.findOne({ email: normalizedEmail })
		if (existingUser) {
			return res.status(409).json({ success: false, message: 'User already exists. Please login' })
		}

		const hashedPassword = await bcrypt.hash(password, 10)
		const uniqueUserId = await generateUniqueUserId()
		if (!uniqueUserId.success) {
			return res.status(500).json({ success: false, message: 'Error generating UniqueUserId, please try again' })
		}

		const user = new userModel({ name, email: normalizedEmail, password: hashedPassword, uniqueUserId: uniqueUserId.uniqueUserId })
		await user.save()

		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' })
		res.cookie('token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
			maxAge: 1 * 24 * 60 * 60 * 1000
		})

		try {
			const mailOptions = {
				from: process.env.SENDER_EMAIL,
				to: normalizedEmail,
				subject: 'Welcome to To-Do-List',
				text: `Welcome ${name.trim()} to To-Do-List. Your account has been created successfully.`
			}
			await transporter.sendMail(mailOptions)
		} catch (emailError) {
			console.error('Error while sending welcome email:', emailError)
		}

		return res.status(201).json({ success: true, message: 'Account registered successfully' })
	} catch (error) {
		console.error('Error while registering user:', error)
		return res.status(500).json({ success: false, message: 'Something went wrong' })
	}
}

export const login = async (req, res) => {
	try {
		const { email, password } = req.body
		if (!email || !password) {
			return res.status(400).json({ success: false, message: 'Enter all the details' })
		}
		const normalizedEmail = email.trim().toLowerCase()

		const user = await userModel.findOne({ email: normalizedEmail })
		if (!user) {
			return res.status(404).json({ success: false, message: 'Account with this email does not exist. Please register first and then login' })
		}

		const isMatch = await bcrypt.compare(password, user.password)
		if (!isMatch) {
			return res.status(401).json({ success: false, message: 'Invalid email or password' })
		}

		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' })
		res.cookie('token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
			maxAge: 1 * 24 * 60 * 60 * 1000
		})

		return res.status(200).json({ success: true, message: 'Logged in successfully' })
	} catch (error) {
		console.error('Error while logging in user:', error)
		return res.status(500).json({ success: false, message: 'Something went wrong' })
	}
}

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
export const googleLogin = async (req, res) => {
	try {
		const { credential } = req.body
		if (!credential) {
			return res.status(400).json({ success: false, message: 'Google credential is missing' })
		}

		const ticket = await googleClient.verifyIdToken({
			idToken: credential,
			audience: process.env.GOOGLE_CLIENT_ID
		})

		const payload = ticket.getPayload()
		const { sub: googleId, name, email: emailFromGoogle, email_verified } = payload
		if (!email_verified || !emailFromGoogle) {
			return res.status(400).json({ success: false, message: 'Google email is not verified' })
		}
		const normalizedEmail = emailFromGoogle.trim().toLowerCase()

		let user = await userModel.findOne({ googleId })
		if (!user) {
			user = await userModel.findOne({ email: normalizedEmail })
			if (user) {
				if (user.googleId && user.googleId !== googleId) {
					return res.status(400).json({ success: false, message: 'This email is already linked to another Google account' })
				}
				user.googleId = googleId
				user.isAccountVerified = true
				if (!user.accountVerifiedAt) {
					user.accountVerifiedAt = Date.now()
				}
				await user.save()
			} else {
				const uniqueUserId = await generateUniqueUserId()
				if (!uniqueUserId.success) {
					return res.status(500).json({ success: false, message: 'Failed to generate unique uniqueUserId' })
				}

				user = new userModel({
					uniqueUserId,
					name,
					email: normalizedEmail,
					password: null,
					googleId,
					isAccountVerified: true,
					accountVerifiedAt: Date.now()
				})
				await user.save()
			}
		}

		const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '7d' })

		res.cookie('token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
			maxAge: 7 * 24 * 60 * 60 * 1000
		})

		return res.status(200).json({ success: true, message: 'Google login successful' })
	} catch (error) {
		console.error('Error while logging in user via Google:', error)
		return res.status(500).json({ success: false, message: 'Something went wrong' })
	}
}

export const logout = async (req, res) => {
	try {
		const { token } = req.cookies
		if (!token) {
			return res.status(400).json({ success: false, message: 'User is not logged in' })
		}

		res.clearCookie('token', {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
		})

		return res.status(200).json({ success: true, message: 'Logged out successfully' })
	} catch (error) {
		console.error('Error while logging out user:', error)
		return res.status(500).json({ success: false, message: 'Something went wrong' })
	}
}

export const isAuth = async (req, res) => {
	try {
		return res.status(200).json({ success: true, message: 'User is authenticated' })
	} catch (error) {
		console.error('Error while checking authentication:', error)
		return res.status(500).json({ success: false, message: 'Something went wrong' })
	}
}

export const sendVerifyAccountOtp = async (req, res) => {
	try {
		const { id } = req.user
		if (!id) {
			return res.status(400).json({ success: false, message: 'Missing User details' })
		}

		const user = await userModel.findById(id)
		if (user.isAccountVerified) {
			return res.status(400).json({ success: false, message: 'Account is already verified' })
		}

		const otp = String(Math.floor(100000 + Math.random() * 900000))
		const hashedOtp = await bcrypt.hash(otp, 10)

		user.verifyAccountOtp = hashedOtp
		user.verifyAccountOtpExpiresAt = Date.now() + 5 * 60 * 1000
		await user.save()

		try {
			const mailOptions = {
				from: process.env.SENDER_EMAIL,
				to: user.email,
				subject: 'OTP to verify your account',
				text: `OTP to verify your account is ${otp}. It will expire in 5 minutes`
			}
			await transporter.sendMail(mailOptions)
		} catch (emailError) {
			console.error('Error while sending OTP email:', emailError)
			return res.status(500).json({ success: false, message: 'Failed to send OTP via email' })
		}

		return res.status(200).json({ success: true, message: 'An OTP to verify your account has been sent successfully.' })
	} catch (error) {
		console.error('Error while sending verification OTP:', error)
		return res.status(500).json({ success: false, message: 'Something went wrong' })
	}
}

export const verifyAccount = async (req, res) => {
	try {
		const { id } = req.user
		if (!id) {
			return res.status(400).json({ success: false, message: 'Missing User details' })
		}

		const { otp } = req.body
		if (!otp) {
			return res.status(400).json({ success: false, message: 'Missing OTP' })
		}

		const user = await userModel.findById(id)
		if (!user) {
			return res.status(404).json({ success: false, message: 'User does not exist' })
		}
		if (user.isAccountVerified) {
			return res.status(400).json({ success: false, message: 'Account is already verified' })
		}
		if (user.verifyAccountOtpExpiresAt < Date.now()) {
			return res.status(400).json({ success: false, message: 'Your OTP has expired' })
		}
		const otpCheck = await bcrypt.compare(otp, user.verifyAccountOtp)
		if (!otpCheck || user.verifyAccountOtp === null || user.verifyAccountOtp === '') {
			return res.status(400).json({ success: false, message: 'Invalid OTP' })
		}

		user.isAccountVerified = true
		user.verifyAccountOtp = null
		user.verifyAccountOtpExpiresAt = null
		user.accountVerifiedAt = Date.now()
		await user.save()

		return res.status(200).json({ success: true, message: 'Account verified successfully' })
	} catch (error) {
		console.error('Error while verifying account:', error)
		return res.status(500).json({ success: false, message: 'Something went wrong' })
	}
}

export const sendResetPasswordOtp = async (req, res) => {
	try {
		const { id } = req.user
		if (!id) {
			return res.status(400).json({ success: false, message: 'Missing User details' })
		}

		const user = await userModel.findById(id)
		if (!user) {
			return res.status(404).json({ success: false, message: 'User does not exist' })
		}

		const otp = String(Math.floor(100000 + Math.random() * 900000))
		const hashedOtp = await bcrypt.hash(otp, 10)

		try {
			const mailOptions = {
				from: process.env.SENDER_EMAIL,
				to: user.email,
				subject: 'OTP to reset your password',
				text: `OTP to reset your password is ${otp}. It will expire in next 5 minutes.`
			}
			await transporter.sendMail(mailOptions)
		} catch (emailError) {
			console.error('Error while sending reset password OTP via email:', emailError)
			return res.status(500).json({ success: false, message: 'Failed to send OTP via email' })
		}

		user.resetPasswordOtp = hashedOtp
		user.resetPasswordOtpExpiresAt = Date.now() + 5 * 60 * 1000
		await user.save()

		return res.status(200).json({ success: true, message: 'An OTP to reset password has been sent successfully to your registered email address' })
	} catch (error) {
		console.error('Error while sending reset password OTP:', error)
		return res.status(500).json({ success: false, message: 'Something went wrong' })
	}
}

export const resetPassword = async (req, res) => {
	try {
		const { id } = req.user
		if (!id) {
			return res.status(400).json({ success: false, message: 'Missing User details' })
		}

		const { otp, newPassword } = req.body
		if (!otp || !newPassword) {
			return res.status(400).json({ success: false, message: 'Missing details' })
		}

		const user = await userModel.findById(id)
		if (!user) {
			return res.status(404).json({ success: false, message: 'User does not exist' })
		}
		if (user.resetPasswordOtpExpiresAt < Date.now()) {
			return res.status(400).json({ success: false, message: 'OTP has expired' })
		}
		const otpCheck = await bcrypt.compare(otp, user.resetPasswordOtp)
		if (!otpCheck || user.resetPasswordOtp === '' || user.resetPasswordOtp === null || otp === '') {
			return res.status(400).json({ success: false, message: 'Incorrect OTP' })
		}

		const passwordCheck = await bcrypt.compare(newPassword, user.password)
		if (passwordCheck) {
			return res.status(400).json({ success: false, message: 'Old and new password cannot be same' })
		}

		const hashedNewPassword = await bcrypt.hash(newPassword, 10)

		user.resetPasswordOtp = null
		user.resetPasswordOtpExpiresAt = null
		user.password = hashedNewPassword
		await user.save()

		res.clearCookie('token', {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
		})

		return res.status(200).json({ success: true, message: 'Password changed successfully. Please login again' })
	} catch (error) {
		console.error('Error while resetting user password:', error)
		return res.status(500).json({ success: false, message: 'Something went wrong' })
	}
}

export const getUserData = async (req, res) => {
	try {
		const { id } = req.user
		if (!id) {
			return res.status(400).json({ success: false, message: 'Missing User details' })
		}

		const { fields } = req.body
		if (!fields || !Array.isArray(fields) || fields.length === 0) {
			return res.status(400).json({ success: false, message: 'Missing or invalid fields' })
		}

		const allowedFields = ['_id', 'uniqueUserId', 'name', 'email', 'isAccountVerified', 'tasks', 'friends', 'friendRequests', 'createdAt', 'updatedAt', 'verifyAccountOtpExpiresAt', 'resetPasswordOtpExpiresAt']
		const toBeSentFields = fields.filter((field) => allowedFields.includes(field))
		if (toBeSentFields.length === 0) {
			return res.status(400).json({ success: false, message: 'No valid fields requested' })
		}

		const userData = await userModel.findById(id).select(toBeSentFields.join(' '))
		if (!userData) {
			return res.status(404).json({ success: false, message: 'User does not exist' })
		}

		return res.status(200).json({ success: true, message: 'Data retrieved successfully', data: userData })
	} catch (error) {
		console.error('Error while retrieving user data:', error)
		return res.status(500).json({ success: false, message: 'Something went wrong' })
	}
}

export const updateUserProfile = async (req, res) => {
	try {
		const { id } = req.user
		if (!id) {
			return res.status(400).json({ success: false, message: 'Missing User details' })
		}

		const { newName, newEmail } = req.body
		if (!newName || !newEmail) {
			return res.status(400).json({ success: false, message: 'Missing details' })
		}
		const normalizedNewEmail = newEmail.trim().toLowerCase()

		const user = await userModel.findById(id)
		if (!user) {
			return res.status(404).json({ success: false, message: 'User does not exist' })
		}

		const nameChanged = newName.trim() !== user.name
		const emailChanged = normalizedNewEmail !== user.email
		if (!nameChanged && !emailChanged) {
			return res.status(400).json({ success: false, message: 'Old and new information cannot be same' })
		}

		const emailCheck = await userModel.findOne({ email: normalizedNewEmail })
		if (emailCheck && emailChanged) {
			return res.status(400).json({ success: false, message: 'Account with this email address already exists' })
		}

		user.name = newName.trim()
		user.email = normalizedNewEmail
		if (emailChanged) {
			user.isAccountVerified = false
			user.accountVerifiedAt = null

			try {
				const mailOptions = {
					from: process.env.SENDER_EMAIL,
					to: normalizedNewEmail,
					subject: 'Welcome to To-Do-List',
					text: `Welcome ${newName.trim()} to To-Do-List. Your account has been created successfully.`
				}
				await transporter.sendMail(mailOptions)
			} catch (emailError) {
				console.error('Error while sending welcome email after changing email address:', emailError)
			}
		}
		await user.save()

		return res.status(200).json({ success: true, message: 'Profile updated successfully' })
	} catch (error) {
		console.error('Error while updating user profile:', error)
		return res.status(500).json({ success: false, message: 'Something went wrong' })
	}
}

export const getAllUsersList = async (req, res) => {
	try {
		const { id } = req.user
		if (!id) {
			return res.status(400).json({ success: false, message: 'Missing User details' })
		}

		const allowedFields = ['uniqueUserId', 'name']

		const usersList = await userModel.find({ _id: { $ne: id } }).select(allowedFields.join(' '))

		return res.status(200).json({ success: true, message: 'Users list retreived successfully', data: usersList })
	} catch (error) {
		console.error('Error while retrieving users list:', error)
		return res.status(500).json({ success: false, message: 'Something went wrong' })
	}
}
