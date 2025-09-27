import { Router } from 'express'
import Log from '../models/Log.js'
import { requiredAuth } from '../middleware/auth.js'

const router = Router()

// List logs (desc by date)
router.get('/', requiredAuth, async (req, res) => {
  const logs = await Log.find({ userId: req.user.uid }).sort({ date: -1 }).lean()
  res.json(logs)
})

// Get single log by date
router.get('/:date', requiredAuth, async (req, res) => {
  const { date } = req.params
  const log = await Log.findOne({ userId: req.user.uid, date }).lean()
  if (!log) return res.status(404).json({})
  res.json(log)
})

// Create/update log (upsert by date)
router.post('/', requiredAuth, async (req, res) => {
  const payload = req.body || {}
  if (!payload.date) return res.status(400).json({ error: 'date required' })

  // Normalize tasks to expected shape
  let tasks
  if (Array.isArray(payload.tasks)) {
    tasks = payload.tasks.map((t, idx) => ({
      id: typeof t?.id === 'number' ? t.id : Number(t?.id) || idx + 1,
      text: typeof t?.text === 'string' ? t.text : String(t?.text || ''),
      completed: Boolean(t?.completed)
    }))
  }

  const setDoc = { ...payload, userId: req.user.uid }
  if (tasks) setDoc.tasks = tasks

  const updated = await Log.findOneAndUpdate(
    { userId: req.user.uid, date: payload.date },
    { $set: setDoc },
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
  ).lean()
  res.json(updated)
})

// Update partial
router.patch('/:date', requiredAuth, async (req, res) => {
  const { date } = req.params
  const updates = req.body || {}

  let tasks
  if (Array.isArray(updates.tasks)) {
    tasks = updates.tasks.map((t, idx) => ({
      id: typeof t?.id === 'number' ? t.id : Number(t?.id) || idx + 1,
      text: typeof t?.text === 'string' ? t.text : String(t?.text || ''),
      completed: Boolean(t?.completed)
    }))
  }

  const $set = { ...updates }
  if (tasks) $set.tasks = tasks

  const updated = await Log.findOneAndUpdate(
    { userId: req.user.uid, date },
    { $set },
    { new: true, runValidators: true }
  ).lean()
  if (!updated) return res.status(404).json({ error: 'Not found' })
  res.json(updated)
})

// Delete
router.delete('/:date', requiredAuth, async (req, res) => {
  const { date } = req.params
  await Log.findOneAndDelete({ userId: req.user.uid, date })
  res.json({ message: 'Deleted' })
})

export default router


