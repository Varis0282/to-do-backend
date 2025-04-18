const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');
const serverless = require("serverless-http");
dotenv.config();
app.use(express.json());
const port = process.env.PORT || 5001;

// ✅ Move CORS Middleware Before Any Routes
const allowedOrigins = ["http://localhost:3000", "https://varis-to-do.netlify.app"];

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.setHeader("Access-Control-Allow-Credentials", "true");
    }

    // Handle OPTIONS preflight requests
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }

    next();
});

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