const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');
const serverless = require("serverless-http");
dotenv.config();
app.use(express.json());
const port = process.env.PORT || 5001;
app.use(cors());

// Import routes
const authRoute = require('../routes/auth_routes');
const taskRoute = require('../routes/task_routes');

// Route middlewares
app.use('/api/user', authRoute);
app.use('/api/task', taskRoute);


app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

module.exports.handler = serverless(app);