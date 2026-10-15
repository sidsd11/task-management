import express from 'express'

import { cancelOtpRequest, getAllUsersList, getUserData, googleLogin, isAuth, login, logout, register, resetPassword, sendResetPasswordOtp, sendVerifyAccountOtp, updateUserProfile, verifyAccount } from '../controllers/userControllers.js'
import { userAuth } from '../middlewares/authUser.js'

const userRouter = express.Router()

/* Public Routes */
userRouter.post('/register', register)
userRouter.post('/login', login)
userRouter.post('/google-login', googleLogin)
userRouter.post('/logout', logout)

/* Protected Routes */
userRouter.use(userAuth)

userRouter.get('/is-auth', isAuth)
userRouter.get('/get-users-list', getAllUsersList)

userRouter.post('/get-user-data', getUserData)
userRouter.post('/send-verify-account-otp', sendVerifyAccountOtp)
userRouter.post('/verify-account', verifyAccount)
userRouter.post('/send-reset-password-otp', sendResetPasswordOtp)
userRouter.post('/reset-password', resetPassword)
userRouter.post('/cancel-otp-request', cancelOtpRequest)

userRouter.patch('/update-my-profile', updateUserProfile)

export default userRouter
