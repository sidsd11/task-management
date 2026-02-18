import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'
import transporter from '../config/nodemailer.js'

export const register = async (req, res) => {
    const {name, email, password} = req.body
    if (!name || !email || !password) {
        return res.json({success: false, message: 'Enter all the details'})
    }

    try {
        const existingUser = await userModel.findOne({email})
        if (existingUser) {
            return res.json({success: false, message: 'User already exists. Please login'})
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const user = new userModel({name, email, password: hashedPassword})
        await user.save()

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'})
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to To-Do-List',
            text: `Welcome ${name} to To-Do-List. Your account has been created successfully.`
        }
        await transporter.sendMail(mailOptions)

        return res.json({success: true, message: 'Account registered successfully. Please login to continue'})
    }
    catch (error) {
        return res.json({success: false, message: error.message})
    }
}

export const login = async (req, res) => {
    const {email, password} = req.body
    if (!email || !password) {
        return res.json({success: false, message: 'Enter all the details'})
    }

    try {
        const user = await userModel.findOne({email})
        if (!user) {
            return res.json({success: false, message: 'User does not exist. Please register first and then login'})
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.json({success: false, message: 'Invalid email or password'})
        }

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'})
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.json({success: true, message: 'User logged in successfully'})
    }
    catch (error) {
        return res.json({success: false, message: error.message})
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })

        return res.json({success: true, message: 'User logged out successfully'})
    }
    catch (error) {
        return res.json({success: false, message: error.message})
    }
}

export const isAuth = async (req, res) => {
    try {
        return res.json({success: true, message: 'User is authenticated'})
    }
    catch (error) {
        return res.json({success: false, message: error.message})
    }    
}

export const sendVerificationOtp = async (req, res) => {
    try {
        const userId = req.user.id

        const user = await userModel.findById(userId)
        if (user.isAccountVerified) {
            return res.json({success: false, message: 'Account is already verified'})
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000))
        user.verifyAccountOtp = otp
        user.verifyAccountOtpExpiresAt = Date.now() + (5 * 60 * 1000)
        await user.save()

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'OTP to verify your account',
            text: `OTP to verify your account is ${otp}. It will expire in 5 minutes`
        }
        await transporter.sendMail(mailOptions)

        return res.json({success: true, message: 'An OTP to verify your account has been sent successfully.'})
    }
    catch (error) {
        return res.json({success: false, message: error.message})
    }
}

export const verifyAccount = async (req, res) => {
    const userId = req.user.id
    const {otp} = req.body
    if (!otp) {
        return res.json({success: false, message: 'Missing OTP'})
    }

    try {
        const user = await userModel.findById(userId)
        if (!user) {
            return res.json({success: false, message: 'User does not exist'})
        }
        
        if (user.verifyAccountOtp !== otp || user.verifyAccountOtp === '') {
            return res.json({success: false, message: 'Invalid OTP'})
        }

        if (user.verifyAccountOtpExpiresAt < Date.now()) {
            return res.json({success: false, message: 'Your OTP has expired'})
        }

        user.isAccountVerified = true
        user.verifyAccountOtp = ''
        user.verifyAccountOtpExpiresAt = 0
        await user.save()

        return res.json({success: true, message: 'Account verified successfully'})
    }
    catch (error) {
        return res.json({success: false, message: error.message})
    }
}

export const sendResetPasswordOtp = async (req, res) => {
    try {
        const {email} = req.body

        const user = await userModel.findOne(email)
        if (!user) {
            return res.json({success: false, message: 'User does not exist'})
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000))
        user.resetPasswordOtp = otp
        user.resetPasswordOtpExpiresAt = Date.now() + (5 * 60 * 1000)
        await user.save()

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'OTP to reset your password',
            text: `OTP to reset your password is ${otp}. It will expire in 5 minutes`
        }
        await transporter.sendMail(mailOptions)

        return res.json({success: true, message: 'An OTP to reset your password has been sent successfully.'})
    }
    catch (error) {
        return res.json({success: false, message: error.message})
    }
}

export const resetPassword = async (req, res) => {
    const {email, otp, password} = req.body
    if (!email || !otp || !password) {
        return res.json({success: false, message: 'Missing details'})
    }

    try {
        const user = await userModel.findOne({email})
        if (!user) {
            return res.json({success: false, message: 'User does not exist'})
        }
        
        if (user.resetPasswordOtp !== otp || user.resetPasswordOtp === '') {
            return res.json({success: false, message: 'Invalid OTP'})
        }

        if (user.resetPasswordOtpExpiresAt < Date.now()) {
            return res.json({success: false, message: 'Your OTP has expired'})
        }

        const newPassword = await bcrypt.hash(password, 10)
        user.password = newPassword
        user.resetPasswordOtp = ''
        user.resetPasswordOtpExpiresAt = 0
        await user.save()

        return res.json({success: true, message: 'Password changed successfully'})
    }
    catch (error) {
        return res.json({success: false, message: error.message})
    }
}

export const getUserData = async (req, res) => {
    try {
        const userId = req.user.id

        const user = await userModel.findById(userId)

        if (!user) {
            return res.json({success: false, message: 'User does not exist'})
        }

        res.json({
            success: true,
            userData: {
                id: user._id,
                name: user.name,
                isAccountVerified: user.isAccountVerified,
                email: user.email
            }
        })
    }
    catch (error) {
        return res.json({success: false, message: error.message})
    }
}