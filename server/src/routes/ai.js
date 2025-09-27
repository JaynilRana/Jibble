import { Router } from 'express'

const router = Router()

// AI Quote endpoint
router.get('/quote', async (req, res) => {
  try {
    // For now, return a random inspirational quote
    // In production, you can integrate with OpenAI, Anthropic, or other AI services
    const quotes = [
      "The only way to do great work is to love what you do. - Steve Jobs",
      "Innovation distinguishes between a leader and a follower. - Steve Jobs",
      "Life is what happens to you while you're busy making other plans. - John Lennon",
      "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
      "It is during our darkest moments that we must focus to see the light. - Aristotle",
      "The way to get started is to quit talking and begin doing. - Walt Disney",
      "Don't let yesterday take up too much of today. - Will Rogers",
      "You learn more from failure than from success. - Unknown",
      "If you are working on something exciting that you really care about, you don't have to be pushed. - Steve Jobs",
      "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill"
    ]
    
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
    
    res.json({ 
      quote: randomQuote,
      source: 'curated',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('AI Quote error:', error)
    res.status(500).json({ error: 'Failed to generate quote' })
  }
})

export default router
