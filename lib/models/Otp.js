import mongoose from 'mongoose'

const OtpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  code: { type: String, required: true },
  purpose: { type: String, required: true, enum: ['email_verify', 'login', 'password_reset'] },
  consumed: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true }
}, { timestamps: true })

export default mongoose.models.Otp || mongoose.model('Otp', OtpSchema)
