import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
	{
		uniqueUserId: { type: String, required: true, unique: true, immutable: true },
		name: { type: String, required: true, trim: true },
		email: { type: String, required: true, unique: true, trim: true, lowercase: true },
		password: { type: String, default: null },
		googleId: { type: String, unique: true, sparse: true, default: null },
		isAccountVerified: { type: Boolean, default: false },
		accountVerifiedAt: { type: Date, default: null },
		verifyAccountOtp: { type: String, default: null },
		verifyAccountOtpExpiresAt: { type: Date, default: null },
		resetPasswordOtp: { type: String, default: null },
		resetPasswordOtpExpiresAt: { type: Date, default: null },
		tasks: [
			{
				title: { type: String, maxlength: 20, required: true, trim: true },
				description: { type: String, maxlength: 200, required: true, trim: true },
				status: { type: String, enum: ['Pending', 'In-progress', 'Completed'], default: 'Pending', required: true },
				createdAt: { type: Date, default: Date.now },
				editedAt: { type: Date, default: null },
				completedAt: { type: Date, default: null },
				remark: { type: String, default: null }
			}
		],
		friends: [
			{
				uniqueUserId: { type: String, required: true },
				name: { type: String, required: true },
				since: { type: Date, default: Date.now }
			}
		],
		friendRequests: {
			sent: [
				{
					uniqueUserId: { type: String, required: true },
					name: { type: String, required: true },
					timestamp: { type: Date, default: Date.now }
				}
			],
			received: [
				{
					uniqueUserId: { type: String, required: true },
					name: { type: String, required: true },
					timestamp: { type: Date, default: Date.now }
				}
			]
		}
	},
	{ timestamps: true }
)

const userModel = mongoose.models.user || mongoose.model('user', userSchema)

export default userModel
