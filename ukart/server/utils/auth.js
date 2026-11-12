import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import 'dotenv/config'

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET || 'ukart-super-secret-key'

export const hashPassword = async (password) => bcrypt.hash(password, 12)

export const verifyPassword = async (password, hashedPassword) => bcrypt.compare(password, hashedPassword)

export const generateToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
