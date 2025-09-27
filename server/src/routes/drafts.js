import { Router } from 'express'
import Draft from '../models/Draft.js'
import { requiredAuth } from '../middleware/auth.js'

const router = Router()

// Get draft by date
router.get('/:date', requiredAuth, async (req, res) => {
  const { date } = req.params
  const d = await Draft.findOne({ userId: req.user.uid, date }).lean()
  if (!d) return res.status(404).json({})
  res.json({ id: d._id, ...d.data, _updatedAt: d._updatedAt })
})

// Save/merge draft
router.post('/:date', requiredAuth, async (req, res) => {
  const { date } = req.params
  const draftData = req.body || {}
  const saved = await Draft.findOneAndUpdate(
    { userId: req.user.uid, date },
    { $set: { data: draftData, _updatedAt: new Date() } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean()
  res.json({ success: true, id: saved._id })
})

// Clear draft
router.delete('/:date', requiredAuth, async (req, res) => {
  const { date } = req.params
  await Draft.findOneAndDelete({ userId: req.user.uid, date })
  res.json({ success: true })
})

export default router


