import express from 'express'

import { register, login, logout, isAuth, sendVerifyAccountOtp, verifyAccount, getUserData, googleLogin, sendResetPasswordOtp, resetPassword, updateUserProfile, getAllUsersList } from '../controllers/userControllers.js'
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
userRouter.get('/get-user-data', getUserData)
userRouter.get('/get-users-list', getAllUsersList)

userRouter.post('/send-verify-account-otp', sendVerifyAccountOtp)
userRouter.post('/verify-account', verifyAccount)
userRouter.post('/send-reset-password-otp', sendResetPasswordOtp)
userRouter.post('/reset-password', resetPassword)

userRouter.patch('/update-my-profile', updateUserProfile)

export default userRouter
