import mongoose from 'mongoose'

const DraftSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  date: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  _updatedAt: { type: Date, default: Date.now }
}, { timestamps: true })

DraftSchema.index({ userId: 1, date: 1 }, { unique: true })

export default mongoose.model('Draft', DraftSchema)


