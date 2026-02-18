import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    isAccountVerified: {type: Boolean, default: false},
    verifyAccountOtp: {type: String, default: ''},
    verifyAccountOtpExpiresAt: {type: Number, default: 0}
}, {timestamps: true})

const userModel = mongoose.models.user || mongoose.model('user', userSchema)

export default userModel