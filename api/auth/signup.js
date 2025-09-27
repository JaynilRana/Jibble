import { connectDB } from '../../lib/mongodb'
import bcrypt from 'bcryptjs'
import User from '../../lib/models/User'
import Otp from '../../lib/models/Otp'
import nodemailer from 'nodemailer'

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
    
    const { name, email, password } = req.body || {}
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
    const existing = await User.findOne({ email })
    if (existing) return res.status(409).json({ error: 'An account with this email already exists' })
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, passwordHash, emailVerified: false })
    const code = generateOtp()
    await Otp.create({ email, code, purpose: 'email_verify', expiresAt: new Date(Date.now() + 10 * 60 * 1000) })
    await sendEmail(email, 'Verify your email', `Your verification code is: ${code}`)
    res.json({ needsVerification: true, message: 'Verification code sent to your email' })
  } catch (error) {
    console.error('Signup error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
