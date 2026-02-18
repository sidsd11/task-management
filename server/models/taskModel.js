import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema({
    userId: {type: String, required: true},
    title: {type: String, maxlength: 20, required: true},
    description: {type: String, maxlength: 200, required: true},
    status: {type: String, enum: ['Pending', 'In-progress', 'Completed'], default: 'Pending', required: true},
    createdAt: {type: Number, default: 0},
    editedAt: {type: Number, default: 0},
    completedAt: {type: Number, default: 0},
}, {timestamps: true})

const taskModel = mongoose.models.task || mongoose.model('task', taskSchema)

export default taskModel