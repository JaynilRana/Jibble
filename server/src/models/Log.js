import mongoose from 'mongoose'

const TaskSchema = new mongoose.Schema({
  id: { type: Number },
  text: { type: String },
  completed: { type: Boolean, default: false }
}, { _id: false })

const RatingsSchema = new mongoose.Schema({
  discipline: { type: Number },
  sociability: { type: Number },
  productivity: { type: Number }
}, { _id: false })

const DietSchema = new mongoose.Schema({
  protein: { type: Number },
  calories: { type: Number },
  water: { type: Number }
}, { _id: false })

const LogSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  quote: { type: String },
  tasks: { type: [TaskSchema], default: [] },
  ratings: { type: RatingsSchema, default: {} },
  learning: { type: String },
  mood_score: { type: Number },
  energy_level: { type: Number },
  diet: { type: DietSchema, default: {} },
  steps: { type: Number },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })

LogSchema.index({ userId: 1, date: -1 }, { unique: true })

export default mongoose.model('Log', LogSchema)


