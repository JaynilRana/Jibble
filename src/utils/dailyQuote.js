// Deterministic daily quote generator
// Generates a pseudo-AI inspirational quote that changes daily
// Also provides a non-repeating rotation backed by localStorage

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

const QUOTES_VERSION = 'v1' // bump if QUOTES list meaningfully changes

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

// Fisher–Yates shuffle
function shuffleInPlace(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = array[i]
    array[i] = array[j]
    array[j] = tmp
  }
  return array
}

function getLocalDateKey() {
  // Local timezone date key YYYY-MM-DD (matches dateUtils.getCurrentDateKey)
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getStorageKey(userName) {
  const userKey = userName ? String(userName).toLowerCase() : 'anon'
  return `quoteQueue_${QUOTES_VERSION}_${userKey}`
}

function initQueueState() {
  const order = shuffleInPlace(Array.from({ length: QUOTES.length }, (_, i) => i))
  return { order, pointer: 0, lastDateKey: '' }
}

export function getNonRepeatingDailyQuoteWithAttribution(options = {}) {
  const { userName } = options
  const storageKey = getStorageKey(userName)
  const todayKey = getLocalDateKey()

  let state
  try {
    const raw = localStorage.getItem(storageKey)
    const parsed = raw ? JSON.parse(raw) : null
    const valid = parsed && Array.isArray(parsed.order) && typeof parsed.pointer === 'number'
    // reset when QUOTES length changed (stale order)
    if (!valid || parsed.order.length !== QUOTES.length) {
      state = initQueueState()
    } else {
      state = parsed
    }
  } catch (e) {
    state = initQueueState()
  }

  if (state.lastDateKey !== todayKey) {
    // advance to next quote for a new day
    const nextPointer = state.pointer + 1
    if (nextPointer >= QUOTES.length) {
      // cycle finished; reshuffle for a new unique cycle
      state = initQueueState()
    } else {
      state.pointer = nextPointer
    }
    state.lastDateKey = todayKey
  }

  const index = state.order[state.pointer]
  let baseQuote = QUOTES[index]
  if (userName) {
    baseQuote = baseQuote.replace(/(^|\s)you(\s|\.|!|,|$)/gi, `$1${userName}$2`)
  }

  try {
    localStorage.setItem(storageKey, JSON.stringify(state))
  } catch {}

  return `“${baseQuote}”`
}

// -----------------------------
// AI-style on-device generator
// -----------------------------

function seededHash(input) {
  return hashStringToNumber(input)
}

function xorshift32(seed) {
  let state = seed || 1
  return function next() {
    // xorshift32
    state ^= state << 13
    state ^= state >>> 17
    state ^= state << 5
    // ensure uint32
    state >>>= 0
    // scale to [0,1)
    return state / 0xFFFFFFFF
  }
}

function pickRandom(rng, arr) {
  const idx = Math.floor(rng() * arr.length)
  return arr[idx]
}

function maybe(rng, prob) {
  return rng() < prob
}

export function getAIStyledDailyQuoteWithAttribution(options = {}) {
  const { userName } = options
  const dateKey = getLocalDateKey()
  const seedBase = `${dateKey}|${(userName || 'anon').toLowerCase()}`
  const rng = xorshift32(seededHash(seedBase) || 1)

  const focuses = ['clarity', 'momentum', 'discipline', 'focus', 'courage', 'craft', 'patience', 'consistency', 'energy', 'attention']
  const actions = ['start', 'ship', 'simplify', 'commit', 'iterate', 'prioritize', 'show up', 'decide', 'focus deep', 'finish']
  const outcomes = ['progress', 'compounding gains', 'breakthroughs', 'results', 'quiet confidence', 'better days', 'clean execution', 'meaningful work']
  const frames = ['today', 'this hour', 'this morning', 'right now', 'before noon', 'before you rest']
  const blockers = ['doubts', 'distractions', 'noise', 'perfectionism', 'hesitation', 'busywork']

  const templates = [
    'Choose {focus}. Then {action}. {frame}, make room for {outcome}.',
    '{Frame}, {action} once. Momentum invites {outcome}.',
    'Silence {blocker}. {Action}, and let {outcome} compound.',
    '{Action} small; aim for {outcome}. Repeat {frame}.',
    '{Frame}, trade friction for {focus}. {Action} toward {outcome}.',
    '{Action} before you explain. {Frame} belongs to {focus}.',
  ]

  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)
  const data = {
    focus: pickRandom(rng, focuses),
    action: pickRandom(rng, actions),
    outcome: pickRandom(rng, outcomes),
    frame: pickRandom(rng, frames),
    blocker: pickRandom(rng, blockers),
  }

  let raw = pickRandom(rng, templates)
  raw = raw
    .replace('{focus}', data.focus)
    .replace('{action}', data.action)
    .replace('{outcome}', data.outcome)
    .replace('{frame}', data.frame)
    .replace('{Frame}', cap(data.frame))
    .replace('{Action}', cap(data.action))
    .replace('{blocker}', pickRandom(rng, blockers))

  // Optional personalization of "you" → userName
  if (userName) {
    raw = raw.replace(/(^|\s)you(\s|\.|!|,|$)/gi, `$1${userName}$2`)
  }

  // Occasionally add a short kicker
  if (maybe(rng, 0.25)) {
    const kickers = [
      'Keep it light; keep it true.',
      'Simplicity scales.',
      'Less haste, more speed.',
      'Noise off, signal on.',
    ]
    raw = `${raw} ${pickRandom(rng, kickers)}`
  }

  return `“${raw}”`
}

export default getDailyQuote


