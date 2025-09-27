import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import User from '../models/User.js'
import Otp from '../models/Otp.js'

const router = Router()

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

function setAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production'
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000
  })
}

function clearAuthCookie(res) {
  res.clearCookie('auth_token', { path: '/' })
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: process.env.SMTP_USER && process.env.SMTP_PASS ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
})

async function sendEmail(to, subject, text) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    // eslint-disable-next-line no-console
    console.log(`[DEV EMAIL] To: ${to} | Subject: ${subject} | ${text}`)
    return
  }
  await transporter.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to, subject, text })
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

// Sign up: create user, send email verification OTP
router.post('/signup', async (req, res) => {
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
})

// Verify email OTP
router.post('/verify-email', async (req, res) => {
  const { email, code } = req.body || {}
  const otp = await Otp.findOne({ email, purpose: 'email_verify', consumed: false, expiresAt: { $gt: new Date() } })
  if (!otp || otp.code !== code) return res.status(400).json({ error: 'Invalid or expired code' })
  otp.consumed = true
  await otp.save()
  const user = await User.findOneAndUpdate({ email }, { $set: { emailVerified: true } }, { new: true })
  const token = signToken(user)
  setAuthCookie(res, token)
  res.json({ user: { id: user._id, email: user.email, name: user.name } })
})

// Login: if 2FA enabled, send OTP; else return JWT
router.post('/login', async (req, res) => {
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
})

// Verify login OTP
router.post('/verify-login', async (req, res) => {
  const { email, code } = req.body || {}
  const user = await User.findOne({ email })
  if (!user) return res.status(404).json({ error: 'User not found' })
  const otp = await Otp.findOne({ email, purpose: 'login', consumed: false, expiresAt: { $gt: new Date() } })
  if (!otp || otp.code !== code) return res.status(400).json({ error: 'Invalid or expired code' })
  otp.consumed = true
  await otp.save()
  const token = signToken(user)
  setAuthCookie(res, token)
  res.json({ user: { id: user._id, email: user.email, name: user.name } })
})

// Resend OTP (for email verification or login)
router.post('/resend-otp', async (req, res) => {
  const { email, purpose } = req.body || {}
  if (!['email_verify', 'login'].includes(purpose)) return res.status(400).json({ error: 'Invalid purpose' })
  const code = generateOtp()
  await Otp.create({ email, code, purpose, expiresAt: new Date(Date.now() + 10 * 60 * 1000) })
  await sendEmail(email, 'Your code', `Your code is: ${code}`)
  res.json({ success: true })
})

// Current user
router.get('/me', async (req, res) => {
  try {
    const token = req.cookies?.auth_token
    if (!token) return res.status(401).json({ error: 'Unauthorized' })
    const decoded = jwt.verify(token, JWT_SECRET)
    const user = await User.findById(decoded.sub).lean()
    if (!user) return res.status(401).json({ error: 'Unauthorized' })
    res.json({ id: user._id, email: user.email, name: user.name })
  } catch (_e) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
})

// Logout: clear cookie
router.post('/logout', (_req, res) => {
  clearAuthCookie(res)
  res.json({ success: true })
})

// Password reset request: send OTP
router.post('/password/request', async (req, res) => {
  const { email } = req.body || {}
  const user = await User.findOne({ email })
  if (user) {
    const code = generateOtp()
    await Otp.create({ email, code, purpose: 'password_reset', expiresAt: new Date(Date.now() + 10 * 60 * 1000) })
    await sendEmail(email, 'Password reset code', `Your password reset code is: ${code}`)
  }
  res.json({ success: true })
})

// Password reset confirm with OTP
router.post('/password/reset', async (req, res) => {
  const { email, code, newPassword } = req.body || {}
  const otp = await Otp.findOne({ email, purpose: 'password_reset', consumed: false, expiresAt: { $gt: new Date() } })
  if (!otp || otp.code !== code) return res.status(400).json({ error: 'Invalid or expired code' })
  otp.consumed = true
  await otp.save()
  const passwordHash = await bcrypt.hash(newPassword, 10)
  await User.findOneAndUpdate({ email }, { $set: { passwordHash } })
  res.json({ success: true })
})

export default router


