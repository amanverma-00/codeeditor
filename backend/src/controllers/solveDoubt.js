const Groq = require('groq-sdk');

// Constants
const MAX_QUERY_LENGTH = 5000; // 5000 characters
const MIN_QUERY_LENGTH = 3;
const AI_MODEL = 'llama-3.3-70b-versatile'; // Best balance of speed/quality/cost

// Validate API key on startup
if (!process.env.GROQ_API_KEY) {
    console.error('CRITICAL: GROQ_API_KEY environment variable is not set!');
}

// Initialize the Groq client
let groqClient;
try {
    groqClient = new Groq({
        apiKey: process.env.GROQ_API_KEY
    });
    console.log('✅ Groq AI client initialized');
} catch (error) {
    console.error('Failed to initialize Groq AI:', error);
}

async function solveDoubt(req, res) {
    try {
        // Check if AI is initialized
        if (!groqClient) {
            return res.status(503).json({
                status: 'error',
                message: 'AI service is not configured properly'
            });
        }

        const { query } = req.body;

        // Validate query presence
        if (!query) {
            return res.status(400).json({
                status: 'error',
                message: 'Query is required'
            });
        }

        // Validate query type
        if (typeof query !== 'string') {
            return res.status(400).json({
                status: 'error',
                message: 'Query must be a string'
            });
        }

        // Trim and validate query length
        const trimmedQuery = query.trim();
        
        if (trimmedQuery.length < MIN_QUERY_LENGTH) {
            return res.status(400).json({
                status: 'error',
                message: `Query must be at least ${MIN_QUERY_LENGTH} characters long`
            });
        }

        if (trimmedQuery.length > MAX_QUERY_LENGTH) {
            return res.status(400).json({
                status: 'error',
                message: `Query exceeds maximum length of ${MAX_QUERY_LENGTH} characters`
            });
        }

        // Generate AI response using Groq
        const chatCompletion = await groqClient.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful coding assistant. Provide clear, concise explanations with code examples when relevant. Format code blocks properly using markdown.'
                },
                {
                    role: 'user',
                    content: trimmedQuery
                }
            ],
            model: AI_MODEL,
            temperature: 0.7,
            max_tokens: 2048,
        });

        const text = chatCompletion.choices[0]?.message?.content;

        // Validate response
        if (!text) {
            return res.status(500).json({
                status: 'error',
                message: 'AI returned an empty response'
            });
        }

        return res.status(200).json({
            status: 'success',
            data: { 
                response: text,
                queryLength: trimmedQuery.length,
                model: AI_MODEL,
                tokensUsed: chatCompletion.usage?.total_tokens || 0
            }
        });

    } catch (error) {
        console.error('AI Chat Error:', error);
        
        // Handle specific error types
        if (error.message?.includes('API key') || error.status === 401) {
            return res.status(503).json({
                status: 'error',
                message: 'AI service authentication failed'
            });
        }

        if (error.message?.includes('quota') || error.message?.includes('limit') || error.status === 429) {
            return res.status(429).json({
                status: 'error',
                message: 'AI service quota exceeded. Please try again later'
            });
        }

        // Generic error response (don't leak error details in production)
        return res.status(500).json({
            status: 'error',
            message: 'Failed to process your request',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

module.exports = solveDoubt;
