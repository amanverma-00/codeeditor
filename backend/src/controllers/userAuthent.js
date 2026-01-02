const redisClient = require('../config/redis')
const User = require('../models/user')
const validate = require('../utils/validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Submission = require('../models/submission')
const emailService = require('../services/emailService')

const register = async (req, res) => {
  try {
    validate(req.body)
    const { firstName, emailId, password } = req.body

    req.body.password = await bcrypt.hash(password, 10)
    req.body.role = 'user'
    req.body.isVerified = false // User starts as unverified
    req.body.problemSolved = []

    const user = await User.create(req.body)
    
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Store OTP in Redis with 10 minutes expiry
    await redisClient.setEx(`otp:${emailId}`, 600, otp)
    
    // Send OTP email
    await emailService.sendOTP(emailId, otp, firstName)
    
    res.status(201).json({
      requiresVerification: true,
      emailId: emailId,
      userId: user._id,
      message: 'Registration successful. Please check your email for OTP verification.',
    })
  } catch (err) {
    console.error('Registration error:', err)

    if (err.code === 11000) {
      if (err.keyValue && err.keyValue.emailId) {
        return res.status(400).json({
          message: 'Email already exists',
        })
      }

      if (err.message && err.message.includes('problemSolved_1')) {
        return res.status(500).json({
          message:
            'Database configuration error. Please contact administrator to fix database indexes.',
          error: 'problemSolved_index_error',
          suggestion:
            'This is a database index issue that needs to be resolved by dropping the problemSolved_1 index from the users collection.',
        })
      }

      return res.status(400).json({
        message: 'Email already exists',
      })
    }

    if (err.message) {
      return res.status(400).json({
        message: err.message,
      })
    }

    res.status(400).json({
      message: 'Registration failed',
    })
  }
}

const login = async (req, res) => {
  try {
    const { emailId, password } = req.body

    if (!emailId) throw new Error('Invalid Credentials')
    if (!password) throw new Error('Invalid Credentials')

    const user = await User.findOne({ emailId })

    if (!user) {
      throw new Error('Invalid Credentials')
    }

    const match = await bcrypt.compare(password, user.password)

    if (!match) throw new Error('Invalid Credentials')

    const reply = {
      firstName: user.firstName,
      emailId: user.emailId,
      _id: user._id,
      role: user.role,
    }

    const token = jwt.sign(
      { _id: user._id, emailId: emailId, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: 60 * 60 }
    )

    // Configure cookie for production cross-domain
    const cookieOptions = {
      maxAge: 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    }

    res.cookie('token', token, cookieOptions)
    res.status(201).json({
      user: reply,
      message: 'Loggin Successfully',
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(401).json({
      message: err.message || 'Login failed',
    })
  }
}

const logout = async (req, res) => {
  try {
    const { token } = req.cookies
    const payload = jwt.decode(token)

    await redisClient.set(`token:${token}`, 'Blocked')
    await redisClient.expireAt(`token:${token}`, payload.exp)

    // Configure cookie for logout - same settings as login
    const cookieOptions = {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    }

    res.cookie('token', null, cookieOptions)
    res.send('Logged Out Succesfully')
  } catch (err) {
    res.status(503).send('Error: ' + err)
  }
}

const adminRegister = async (req, res) => {
  try {
    validate(req.body)
    const { firstName, emailId, password } = req.body

    req.body.password = await bcrypt.hash(password, 10)

    const user = await User.create(req.body)
    const token = jwt.sign(
      { _id: user._id, emailId: emailId, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: 60 * 60 }
    )

    // Configure cookie for production cross-domain
    const cookieOptions = {
      maxAge: 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    }

    res.cookie('token', token, cookieOptions)
    res.status(201).send('User Registered Successfully')
  } catch (err) {
    res.status(400).send('Error: ' + err)
  }
}

const deleteProfile = async (req, res) => {
  try {
    const userId = req.result._id

    await User.findByIdAndDelete(userId)

    res.status(200).send('Deleted Successfully')
  } catch (err) {
    res.status(500).send('Internal Server Error')
  }
}

const verifyOTP = async (req, res) => {
  try {
    const { emailId, otp } = req.body

    if (!emailId || !otp) {
      return res.status(400).json({
        message: 'Email and OTP are required'
      })
    }

    // Get OTP from Redis
    const storedOTP = await redisClient.get(`otp:${emailId}`)
    
    if (!storedOTP) {
      return res.status(400).json({
        message: 'OTP expired or invalid'
      })
    }

    if (storedOTP !== otp) {
      return res.status(400).json({
        message: 'Invalid OTP'
      })
    }

    // Mark user as verified
    const user = await User.findOneAndUpdate(
      { emailId },
      { isVerified: true },
      { new: true }
    )

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      })
    }

    // Delete OTP from Redis
    await redisClient.del(`otp:${emailId}`)

    // Generate token
    const token = jwt.sign(
      { _id: user._id, emailId: user.emailId, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: 60 * 60 }
    )

    const reply = {
      firstName: user.firstName,
      emailId: user.emailId,
      _id: user._id,
      role: user.role,
      isVerified: user.isVerified
    }

    // Configure cookie for production cross-domain
    const cookieOptions = {
      maxAge: 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    }

    res.cookie('token', token, cookieOptions)
    res.status(200).json({
      user: reply,
      message: 'Email verified successfully'
    })
  } catch (err) {
    console.error('OTP verification error:', err)
    res.status(500).json({
      message: 'Failed to verify OTP'
    })
  }
}

const resendOTP = async (req, res) => {
  try {
    const { emailId } = req.body

    if (!emailId) {
      return res.status(400).json({
        message: 'Email is required'
      })
    }

    // Check if user exists
    const user = await User.findOne({ emailId })
    
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      })
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: 'Email already verified'
      })
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // Store OTP in Redis with 10 minutes expiry
    await redisClient.setEx(`otp:${emailId}`, 600, otp)

    // Send OTP email
    await emailService.sendOTP(emailId, otp, user.firstName)

    res.status(200).json({
      message: 'OTP sent successfully'
    })
  } catch (err) {
    console.error('Resend OTP error:', err)
    res.status(500).json({
      message: 'Failed to resend OTP'
    })
  }
}

module.exports = { register, login, logout, adminRegister, deleteProfile, verifyOTP, resendOTP }
