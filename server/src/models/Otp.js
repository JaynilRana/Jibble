import mongoose from 'mongoose'

const OtpSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  code: { type: String, required: true },
  purpose: { type: String, enum: ['email_verify', 'login', 'password_reset'], required: true },
  expiresAt: { type: Date, required: true },
  consumed: { type: Boolean, default: false }
}, { timestamps: true })

OtpSchema.index({ email: 1, purpose: 1, expiresAt: 1 })

export default mongoose.model('Otp', OtpSchema)


