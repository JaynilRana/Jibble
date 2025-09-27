import jwt from 'jsonwebtoken'

export const optionalAuth = async (req, _res, next) => {
  await authenticate(req).catch(() => {})
  next()
}

export const requiredAuth = async (req, res, next) => {
  const ok = await authenticate(req)
  if (!ok) return res.status(401).json({ error: 'Unauthorized' })
  next()
}

async function authenticate(req) {
  req.user = null
  const authHeader = req.headers['authorization'] || ''
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  const token = req.cookies?.auth_token || bearer
  if (!token) return false
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-change')
    req.user = { uid: decoded.sub, email: decoded.email }
    return true
  } catch (_e) {
    return false
  }
}


