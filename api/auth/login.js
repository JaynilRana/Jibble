import { connectDB } from '../../lib/mongodb'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../../lib/models/User'
import Otp from '../../lib/models/Otp'
import nodemailer from 'nodemailer'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

function setAuthCookie(res, token) {
  res.setHeader('Set-Cookie', `auth_token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${7 * 24 * 60 * 60}`)
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: process.env.SMTP_USER && process.env.SMTP_PASS ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
})

async function sendEmail(to, subject, text) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[DEV EMAIL] To: ${to} | Subject: ${subject} | ${text}`)
    return
  }
  await transporter.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to, subject, text })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    await connectDB()
    
    const { email, password } = req.body || {}
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ error: 'User does not exist' })
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return res.status(401).json({ error: 'Incorrect password' })
    if (user.twoFactorEnabled) {
      const code = generateOtp()
      await Otp.create({ email, code, purpose: 'login', expiresAt: new Date(Date.now() + 10 * 60 * 1000) })
      await sendEmail(email, 'Your login code', `Your login code is: ${code}`)
      return res.json({ needsOtp: true, message: 'OTP sent to your email' })
    }
    const token = signToken(user)
    setAuthCookie(res, token)
    res.json({ user: { id: user._id, email: user.email, name: user.name } })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
