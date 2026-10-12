import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { checkDbConnection } from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
    origin: CLIENT_URL,
    credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

import apiRouter from './routes/index.js';

// Basic Health Check & System Info
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        system: 'Hospital Management System (HMS) API',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

app.use('/api', apiRouter);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, async () => {
        console.log(`🚀 Hospital Management System Backend running on http://localhost:${PORT}`);
        await checkDbConnection();
    });
}

export default app;
