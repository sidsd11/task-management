import mongoose from 'mongoose'

const connectDB = async () => {
    mongoose.connection.on('connected', () => {
        console.log(`Connected to ${mongoose.connection.name} database`)
    })
    await mongoose.connect(`${process.env.MONGODB_URI}/TaskManagement`)
}

export default connectDB