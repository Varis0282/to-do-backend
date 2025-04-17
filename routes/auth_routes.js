const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../model/userModel');
const Task = require('../model/taskModel');
const privateResource = require('../middleware/privateResource');

router.post('/register', async (req, res) => {
    try {
        const { name, password, email, role } = req.body;
        if (!password || !email || !name) {
            return res.status(422).json({ message: 'Please fill all the fields', success: false });
        }
        if (password.length < 6) {
            return res.status(422).json({ message: 'Password should be at least 6 characters long', success: false });
        }
        // Check if user already exists by email
        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(422).json({ message: 'User already exists', success: false });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = new User({
            name,
            password: hashedPassword,
            email: email.toLowerCase(),
            role
        });
        await user.save();
        user.password = undefined;
        return res.status(201).json({ message: 'User registered successfully', success: true, user });
    } catch (err) {
        console.log("Error in /register", err);
        return res.status(500).json({ message: 'Internal server error', success: false });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { key, password } = req.body;
        if (!key || !password) {
            return res.status(422).json({ message: 'Please fill all the fields', success: false });
        }
        const user = await User.findOne({ email: key.toLowerCase() });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credential', success: false });
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid email or password', success: false });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        user.password = undefined;
        return res.status(200).json({ message: 'User logged in successfully', token, success: true, user: user });
    } catch (err) {
        console.log("Error in /login", err);
        return res.status(500).json({ message: 'Internal server error', success: false });
    }
});

router.put('/update-password', privateResource, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(422).json({ message: 'Please fill all the fields', success: false });
        }
        if (newPassword.length < 6) {
            return res.status(422).json({ message: 'New password should be at least 6 characters long', success: false });
        }
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found', success: false });
        }
        const validPassword = await bcrypt.compare(oldPassword, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid old password', success: false });
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        return res.status(200).json({ message: 'Password updated successfully', success: true });
    } catch (error) {
        console.log("Error in /update-password", error);
        return res.status(500).json({ message: 'Internal server error', success: false });
    }
});

router.get('/user', privateResource, async (req, res) => {
    try {
        console.log("User ID:", req.user._id);
        let user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found', success: false });
        }
        // aslo fetch tasks created by the user
        const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
        if (tasks.length === 0) {
            user = {
                ...user._doc,
                tasks: []
            };
        } else {
            user = {
                ...user._doc,
                tasks: tasks.map(task => ({
                    _id: task._id,
                    title: task.title,
                    description: task.description,
                    priority: task.priority,
                    status: task.status,
                    createdAt: task.createdAt,
                    updatedAt: task.updatedAt
                }))
            };
        }
        return res.status(200).json({ message: 'User fetched successfully', success: true, user });
    } catch (error) {
        console.log("Error in /user", error);
        return res.status(500).json({ message: 'Internal server error', success: false });
    }
});


module.exports = router;