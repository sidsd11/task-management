import express from 'express'
import { register, login, logout, isAuth, sendVerificationOtp, verifyAccount, sendResetPasswordOtp, resetPassword, getUserData } from '../controllers/userControllers.js'
import userAuth from '../middleware/authUser.js'

const userRouter = express.Router()

userRouter.post('/register', register)
userRouter.post('/login', login)
userRouter.post('/logout', logout)
userRouter.get('/is-auth', userAuth, isAuth)
userRouter.post('/send-verification-otp', userAuth, sendVerificationOtp)
userRouter.post('/verify-account', userAuth, verifyAccount)
userRouter.post('/send-reset-otp', userAuth, sendResetPasswordOtp)
userRouter.post('/reset-password', userAuth, resetPassword)
userRouter.get('/get-user-data', userAuth, getUserData)

export default userRouter