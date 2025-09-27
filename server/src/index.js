import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import mongoose from 'mongoose'
import logsRouter from './routes/logs.js'
import draftsRouter from './routes/drafts.js'
import authRouter from './routes/auth.js'
import aiRouter from './routes/ai.js'
import cookieParser from 'cookie-parser'

const app = express()

// CORS FIRST
const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',').filter(Boolean)
const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true
})
app.use(corsMiddleware)
// Handle preflight for all routes
app.options('*', corsMiddleware)

// Then security headers
app.use(helmet({ crossOriginResourcePolicy: false }))
app.use(express.json({ limit: '1mb' }))
app.use(morgan('dev'))
app.use(cookieParser())

// Health route
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() })
})

app.use('/logs', logsRouter)
app.use('/drafts', draftsRouter)
app.use('/auth', authRouter)
app.use('/ai', aiRouter)

// Mongo connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jibble'
mongoose.set('strictQuery', true)
mongoose
  .connect(mongoUri)
  .then(() => {
    // eslint-disable-next-line no-console
    console.log("Connected to MongoDB")
    const port = Number(process.env.PORT || 8000)
    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`API listening on http://localhost:${port}`)
    })
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Failed to connect to MongoDB', err)
    process.exit(1)
  })

export default app


