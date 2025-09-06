const express = require('express');
const path = require('path');
const app = express();

require('dotenv').config({ path: path.join(__dirname, '../.env') });

if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development';
}

// Set default port if not specified
const PORT = process.env.PORT || 3000;

const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const authRouter = require("./routes/userAuth");
const redisClient = require('./config/redis');
const problemRouter = require("./routes/problemCreator");
const submitRouter = require("./routes/submit");
const aiRouter = require("./routes/aiChatting");
const videoRouter = require("./routes/videoCreator");
const cors = require('cors');

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174', 
    'http://localhost:5175',
    'http://localhost:5176',
    process.env.FRONTEND_URL
].filter(Boolean); 

app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? [process.env.FRONTEND_URL].filter(Boolean)
        : allowedOrigins,
    credentials: true 
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Add a root endpoint for health check
app.get('/', (req, res) => {
    res.status(200).json({ 
        message: 'CodeOps Backend Server is running!', 
        timestamp: new Date().toISOString(),
        endpoints: {
            auth: '/user',
            problems: '/problem',
            submissions: '/submission',
            ai: '/ai',
            videos: '/video'
        }
    });
});

// Add a simple login page endpoint for testing (this is just for verification)
app.get('/login', (req, res) => {
    res.status(200).json({ 
        message: 'Login endpoint is available at POST /user/login', 
        method: 'Use POST method to login',
        example: {
            url: '/user/login',
            method: 'POST',
            body: {
                email: 'user@example.com',
                password: 'your_password'
            }
        }
    });
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.use('/user', authRouter);
app.use('/problem', problemRouter);
app.use('/submission', submitRouter);
app.use('/ai', aiRouter);
app.use("/video", videoRouter);

const initializeServer = async () => {
    try {
        
        console.log('🔍 Validating environment variables...');
        const requiredEnvVars = ['PORT', 'DB_CONNECT_STRING', 'REDIS_PASS', 'JWT_KEY'];
        const missing = requiredEnvVars.filter(env => !process.env[env]);
        
        if (missing.length > 0) {
            throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        }
        
        console.log('✅ Environment variables validated');

        console.log('🔄 Connecting to MongoDB...');
        await connectDB();
        console.log('✅ MongoDB connected successfully');

        console.log('🔄 Connecting to Redis...');
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }
        console.log('✅ Redis connected successfully');

        console.log('🚀 Starting Express server...');
        const server = app.listen(PORT, () => {
            console.log(`\n🎉 Server running successfully on port ${PORT}`);
            console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
            console.log(`📊 Backend API: http://localhost:${PORT}`);
            console.log('\n📋 Available endpoints:');
            console.log('   - /user (authentication)');
            console.log('   - /problem (problems management)');
            console.log('   - /submission (code submission)');
            console.log('   - /ai (AI chat)');
            console.log('   - /video (video solutions)');
            console.log('\n✨ Server is ready to accept connections!\n');
        });

        server.on('error', (error) => {
            console.error('❌ Server error:', error);
            if (error.code === 'EADDRINUSE') {
                console.error(`Port ${PORT} is already in use. Please use a different port or stop the conflicting service.`);
            }
        });

    } catch (err) {
        console.error('❌ Server initialization failed:', err.message);

        if (err.message.includes('environment variables')) {
            console.error('\n💡 Please check your .env file and ensure all required variables are set.');
        } else if (err.message.includes('MongoDB') || err.message.includes('Atlas')) {
            console.error('\n💡 MongoDB connection failed. Check the detailed error message above.');
        } else if (err.message.includes('Redis')) {
            console.error('\n💡 Redis connection failed. Please check your Redis configuration.');
        }
        
        console.error('\n🔄 You can try restarting the server after fixing the issues.');
        process.exit(1);
    }
};

process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    try {
        if (redisClient.isOpen) {
            await redisClient.disconnect();
            console.log('Redis connection closed');
        }
    } catch (err) {
        console.error('Error during shutdown:', err);
    }
    process.exit(0);
});

initializeServer();