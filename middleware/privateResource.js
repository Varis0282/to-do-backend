const jwt = require('jsonwebtoken');
const User = require('../model/userModel');

module.exports = async (req, res, next) => {
    const token = req.header('authorization');
    if (!token) {
        return res.status(401).json({ message: 'Access denied', success: false });
    }
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(verified.userId);
        if (!user) {
            return res.status(401).json({ message: 'Access denied', success: false });
        }
        user.password = undefined;
        req.user = user;
        next();
    } catch (err) {
        console.log("Error in privateResource.js", err);
        return res.status(500).json({ message: 'Internal server error', success: false });
    }
}