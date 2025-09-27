import { connectDB } from '../../lib/mongodb'
import jwt from 'jsonwebtoken'
import User from '../../lib/models/User'
import Otp from '../../lib/models/Otp'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

function setAuthCookie(res, token) {
  res.setHeader('Set-Cookie', `auth_token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${7 * 24 * 60 * 60}`)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    await connectDB()
    
    const { email, code } = req.body || {}
    const otp = await Otp.findOne({ email, purpose: 'email_verify', consumed: false, expiresAt: { $gt: new Date() } })
    if (!otp || otp.code !== code) return res.status(400).json({ error: 'Invalid or expired code' })
    otp.consumed = true
    await otp.save()
    const user = await User.findOneAndUpdate({ email }, { $set: { emailVerified: true } }, { new: true })
    const token = signToken(user)
    setAuthCookie(res, token)
    res.json({ user: { id: user._id, email: user.email, name: user.name } })
  } catch (error) {
    console.error('Verify email error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
