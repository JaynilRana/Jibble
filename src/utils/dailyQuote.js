// Deterministic daily quote generator
// Generates a pseudo-AI inspirational quote that changes daily

const QUOTES = [
  "Small, steady wins compound into extraordinary outcomes.",
  "Progress loves clarity; give today a simple, bold target.",
  "You don’t need more time—only a truer first step.",
  "Momentum is built, not found. Start, then steer.",
  "Ship the 80%, learn from the 20%.",
  "Energy follows focus. Focus follows choice.",
  "Make today expensive for your doubts.",
  "Craft beats speed; iteration beats perfection.",
  "One honest hour can redesign a week.",
  "Direction over velocity. Velocity over hesitation.",
  "Say no with kindness so you can say yes with power.",
  "Systems free willpower; habits free time.",
  "Tidy inputs, crisp outputs.",
  "Today’s edge: fewer tabs, deeper work.",
  "Start where your future self would be grateful.",
  "Build like someone will read it—because they will (including you).",
  "Confidence is a side-effect of kept promises to yourself.",
  "Your calendar is a scoreboard of priorities.",
  "Tiny improvements beat rare epiphanies.",
  "If it matters, schedule it; if not, delete it.",
]

function getDayKey(date = new Date()) {
  // Use UTC to avoid timezone flapping; format as YYYY-MM-DD
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function hashStringToNumber(str) {
  // Simple FNV-1a like hash for deterministic index
  let hash = 2166136261
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)
  }
  // Convert to positive 32-bit int
  return (hash >>> 0)
}

export function getDailyQuote(options = {}) {
  const { userName } = options
  const key = getDayKey()
  const base = userName ? `${key}|${userName.toLowerCase()}` : key
  const index = hashStringToNumber(base) % QUOTES.length
  const baseQuote = QUOTES[index]

  if (userName) {
    return baseQuote.replace(/(^|\s)you(\s|\.|!|,|$)/gi, `$1${userName}$2`)
  }
  return baseQuote
}

export function getDailyQuoteWithAttribution(options = {}) {
  const quote = getDailyQuote(options)
  return `“${quote}”`
}

export default getDailyQuote


