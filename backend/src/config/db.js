const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function connectDB() {
    try {
        if (!process.env.DB_CONNECT_STRING) {
            throw new Error('MongoDB connection string is not defined in environment variables');
        }
        mongoose.set('strictQuery', true);
        
        console.log('Attempting to connect to MongoDB Atlas...');
        
        if (process.env.NODE_ENV === 'development' && process.env.DISABLE_TLS_VERIFICATION === 'true') {
            console.warn('⚠️  TLS verification disabled for development');
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        }
        
        const conn = await mongoose.connect(process.env.DB_CONNECT_STRING.trim());
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log(`Database Name: ${conn.connection.name}`);
        return conn;

    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
}

module.exports = connectDB;