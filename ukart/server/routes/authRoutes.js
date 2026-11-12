import express from 'express'
import User from '../models/User.js'
import { generateToken, hashPassword, verifyPassword } from '../utils/auth.js'

const authRouter = express.Router()

authRouter.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' })
    }

    const trimmedEmail = email.trim().toLowerCase()
    const existingUser = await User.findOne({ email: trimmedEmail })

    if (existingUser) {
      return res.status(409).json({ message: 'User already exists with this email.' })
    }

    const user = await User.create({
      name: name.trim(),
      email: trimmedEmail,
      phone: phone || '',
      password: await hashPassword(password),
    })

    const token = generateToken({ id: user._id.toString(), email: user.email, name: user.name })

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    })
  } catch (error) {
    console.error('Register error:', error)
    return res.status(500).json({ message: 'Registration failed. Please try again.' })
  }
})

authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' })
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() })

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    const isPasswordValid = await verifyPassword(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    const token = generateToken({ id: user._id.toString(), email: user.email, name: user.name })

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ message: 'Login failed. Please try again.' })
  }
})

export default authRouter
