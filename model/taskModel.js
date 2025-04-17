const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Low'
    },
    description: {
        type: String,
        required: true,
        trim: true,
        minlength: 6
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Completed'],
        default: 'Pending'
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    completedAt: {
        type: Date
    }
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;