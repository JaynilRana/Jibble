import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  emailVerified: { type: Boolean, default: false },
  twoFactorEnabled: { type: Boolean, default: false }
}, { timestamps: true })

export default mongoose.models.User || mongoose.model('User', UserSchema)
