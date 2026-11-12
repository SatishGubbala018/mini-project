import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './server/config/db.js'
import authRoutes from './server/routes/authRoutes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', message: 'Ukart backend is running.' })
})

app.use('/api/auth', authRoutes)

const startServer = async () => {
  await connectDB()

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
}

startServer()
