# CodeOps - Online Coding Platform

A full-stack web application for practicing data structures and algorithms, built with React, Node.js, Express, and MongoDB.

## Features

- **Problem Solving**: Browse and solve coding problems with different difficulty levels
- **Code Execution**: Run and test your code with Judge0 API integration
- **AI Tutor**: Get hints and guidance from an AI-powered coding assistant
- **User Authentication**: Secure login/signup with JWT authentication and email verification
- **OTP Email Verification**: Email-based OTP verification for new user registrations
- **Progress Tracking**: Track your solving streak and statistics
- **Admin Panel**: Admin interface for managing problems and users
- **Video Solutions**: Watch solution videos for problems
- **Real-time Chat**: AI-powered chat for coding help

## Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **Redux Toolkit** - State management
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **DaisyUI** - UI components
- **Framer Motion** - Animations
- **Monaco Editor** - Code editor
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Redis** - Caching and session storage
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Nodemailer** - Email service for OTP delivery
- **Handlebars** - Email templating
- **Judge0 API** - Code execution
- **Google Generative AI** - AI chat functionality
- **Cloudinary** - File upload and storage

## Prerequisites

Before running this application, make sure you have:

- **Node.js** (v18 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **Redis** (local installation or Redis Cloud)
- **API Keys**:
  - Judge0 API key
  - Google Generative AI API key
  - Cloudinary credentials
  - SMTP credentials (for email service)

## Installation & Setup

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd codeops
```

### 2. Backend Setup
```bash
cd backend
npm install
```

### 3. Environment Configuration
Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=3000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development

# Database
DB_CONNECT_STRING=your_mongodb_connection_string

# Authentication
JWT_KEY=your_jwt_secret_key

# Redis
REDIS_PASS=your_redis_password

# External APIs
JUDGE0_KEY=your_judge0_api_key
GROQ_KEY=your_google_generative_ai_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
Email Service (for OTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=your_email@gmail.com
FROM_NAME=CodeOps

# 
# Development (optional)
DISABLE_TLS_VERIFICATION=true
```

### 4. Frontend Setup
```bash
cd ../frontend
npm install
```

### 5. Load Initial Data
```bash
cd ../backend
node load-problems.js
node initialize-streaks.js
```

## Running the Application

### Development Mode

1. **Start the backend server**:
```bash
cd backend
npm run dev
```

2. **Start the frontend development server**:
```bash
cd frontend
npm run dev
```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

### Production Mode

1. **Build the frontend**:
```bash
cd frontend
npm run build
```

2. **Start the backend**:
```bash (sends OTP to email)
- `POST /user/verify-otp` - Verify email with OTP code
- `POST /user/resend-otp` - Resend OTP code
- `POST /user/login` - User login (requires verified email)
npm start
```

## API Endpoints

### Authentication
- `POST /user/register` - User registration
- `POST /user/login` - User login
- `POST /user/logout` - User logout
- `GET /user/check` - Check authentication status

### Problems
- `GET /problem/getAllProblem` - Get all problems
- `GET /problem/problemSolvedByUser` - Get user's solved problems
- `GET /problem/:id` - Get specific problem

### Submissions
- `POST /submission/submit` - Submit code solution
- `GET /submission/getSubmissions` - Get user submissions

### AI Chat
- `POST /ai/chat` - Chat with AI tutor

### Admin (Admin only)
- `POST /problem/create` - Create new problem
- `DELETE /problem/:id` - Delete problem
- `POST /video/upload` - Upload solution video

## Project Structure

```
codeops/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and Redis configuration
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Custom middleware
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # Express routes
│   │   ├── utils/           # Utility functions
│   │   └── index.js         # Main server file
│   ├── problems/            # Problem definitions
│   ├── .env.example         # Environment variables template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── store/           # Redux store
│   │   ├── utils/           # Utility functions
│   │   └── main.jsx         # Main React file
│   └── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.