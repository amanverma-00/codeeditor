const axios = require('axios');

const testGroq = async (req, res) => {
    try {
        console.log('Testing Groq API directly...');
        console.log('Environment check - Groq key present:', !!process.env.GROQ_KEY);
        
        if (!process.env.GROQ_KEY) {
            return res.status(500).json({
                success: false,
                error: 'Groq API key not configured in environment variables'
            });
        }
        
        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: 'You are a helpful coding tutor specializing in DSA.' },
                    { role: 'user', content: 'What is time complexity?' }
                ],
                max_tokens: 200,
                temperature: 0.3
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            }
        );
        
        console.log('Groq API test successful');
        res.json({ 
            success: true, 
            message: response.data.choices[0].message.content,
            apiKeyPreview: process.env.GROQ_KEY.substring(0, 10) + '...'
        });
    } catch (error) {
        console.error('Groq test error:', error.response?.data || error.message);
        res.status(500).json({ 
            success: false, 
            error: error.response?.data || error.message,
            details: {
                status: error.response?.status,
                statusText: error.response?.statusText,
                apiKeyPresent: !!process.env.GROQ_KEY
            }
        });
    }
};

// Function to check if the question is related to DSA/programming
const isDSARelatedQuestion = (question) => {
    const dsaKeywords = [
        // Core CS concepts
        'algorithm', 'data structure', 'complexity', 'time complexity', 'space complexity',
        'big o', 'o(n)', 'o(1)', 'o(log n)', 'o(n^2)', 'asymptotic',
        
        // Data structures
        'array', 'linked list', 'stack', 'queue', 'tree', 'binary tree', 'bst',
        'heap', 'hash table', 'hashmap', 'graph', 'trie', 'priority queue',
        
        // Algorithms
        'sorting', 'searching', 'dfs', 'bfs', 'dynamic programming', 'dp',
        'recursion', 'iteration', 'greedy', 'divide and conquer', 'backtracking',
        'binary search', 'merge sort', 'quick sort', 'dijkstra', 'floyd',
        
        // Programming concepts
        'code', 'function', 'method', 'variable', 'loop', 'condition', 'if else',
        'optimization', 'performance', 'efficient', 'solution', 'approach',
        'implement', 'debug', 'error', 'bug', 'syntax', 'logic',
        
        // Problem-solving terms
        'solve', 'problem', 'question', 'help', 'explain', 'understand',
        'how to', 'what is', 'why', 'when', 'where', 'which', 'hint',
        'step by step', 'example', 'trace', 'walkthrough'
    ];
    
    const questionLower = question.toLowerCase();
    
    // Check for direct keyword matches
    const hasKeywords = dsaKeywords.some(keyword => 
        questionLower.includes(keyword.toLowerCase())
    );
    
    // Check for code-related patterns
    const codePatterns = [
        /\b(def|function|class|int|string|return|print)\b/i,
        /\b(for|while|if|else|elif)\b/i,
        /[{}()\[\];]/,  // Code symbols
        /\b\w+\(.*\)/,  // Function calls
        /\b(\d+\s*[+\-*/%]\s*\d+)/  // Mathematical expressions
    ];
    
    const hasCodePatterns = codePatterns.some(pattern => pattern.test(question));
    
    return hasKeywords || hasCodePatterns;
};

const solveDoubt = async(req, res) => {
    try {
        const {messages, title, description, testCases, startCode} = req.body;
        
        if (process.env.NODE_ENV === 'development') {
            console.log('=== AI Chat Debug ===');
            console.log('Messages received:', messages?.length || 0);
            console.log('Title:', title);
            console.log('API Key present:', !!process.env.GROQ_KEY);
        }
        
        // Check if Groq API key is available
        if (!process.env.GROQ_KEY) {
            console.error('Missing Groq API key');
            return res.status(200).json({
                message: "🤖 AI service is currently unavailable. Please make sure the API key is configured properly.\n\nFor time complexity questions, I can still help manually:\n\n📚 **Time Complexity Basics:**\n• O(1) - Constant time\n• O(log n) - Logarithmic time\n• O(n) - Linear time\n• O(n log n) - Linearithmic time\n• O(n²) - Quadratic time\n\nWhat specific algorithm would you like me to analyze?"
            });
        }

        const currentMessages = [...(messages || [])];
        
        if (currentMessages.length === 0) {
        if (process.env.NODE_ENV === 'development') {
            console.log('No messages received');
        }
            return res.status(400).json({
                message: "Please ask me about algorithms, data structures, or coding problems!"
            });
        }

        const lastUserMessage = currentMessages[currentMessages.length - 1];
        const userQuestion = lastUserMessage?.parts?.[0]?.text || '';
        
        if (process.env.NODE_ENV === 'development') {
            console.log('User question:', userQuestion);
        }
        
        if (!userQuestion.trim()) {
        if (process.env.NODE_ENV === 'development') {
            console.log('Empty user question');
        }
            return res.status(400).json({
                message: "Please ask a specific question about algorithms, data structures, or coding!"
            });
        }

        // Check if the question is DSA-related
        const isRelevant = isDSARelatedQuestion(userQuestion);
        
        console.log('Question relevance check:', isRelevant);
        
        if (!isRelevant) {
            const rudeResponses = [
                "🙄 Seriously? I'm a coding tutor, not your personal assistant. Ask me about algorithms, data structures, or programming problems!",
                "😤 I don't have time for non-coding questions. Bring me some DSA problems or time complexity questions!",
                "🤨 That's not my job. I'm here for algorithms and data structures. Got any coding questions or should I take a break?",
                "😑 Wrong AI buddy. I only deal with code, algorithms, and programming concepts. Try Google for everything else!",
                "🔥 Listen, I'm a DSA tutor, not a general chatbot. Ask me about sorting algorithms, data structures, or complexity analysis!"
            ];
            
            const randomResponse = rudeResponses[Math.floor(Math.random() * rudeResponses.length)];
            
            return res.status(200).json({
                message: randomResponse
            });
        }

        // Prepare conversation history
        const conversationHistory = currentMessages
            .filter(msg => msg && msg.parts && msg.parts[0] && msg.parts[0].text) 
            .map(msg => ({
                role: msg.role === 'model' ? 'assistant' : 'user',
                content: msg.parts[0].text.trim()
            }))
            .filter(msg => msg.content.length > 0); 
        
        console.log('Filtered conversation history length:', conversationHistory.length);

        const systemPrompt = `You are a highly knowledgeable and slightly sarcastic coding tutor specializing in Data Structures and Algorithms (DSA). You ONLY answer questions related to:

✅ ALLOWED TOPICS:
- Algorithms and their analysis
- Data structures (arrays, trees, graphs, etc.)
- Time and space complexity analysis
- Code optimization and debugging
- Programming concepts and problem-solving
- Algorithm design patterns
- Sorting, searching, and graph algorithms
- Dynamic programming, recursion, greedy algorithms

🚫 FORBIDDEN TOPICS:
- Personal questions or general chitchat
- Non-programming topics
- Homework/assignments unrelated to coding
- General life advice

CURRENT PROBLEM CONTEXT:
Title: ${title || 'Coding Problem'}
Description: ${description || 'Not provided'}

Your personality:
- Be helpful and educational for coding questions
- Provide clear, step-by-step explanations
- Use examples and analogies when helpful
- For time complexity, always explain your reasoning
- Be encouraging but direct

When analyzing time/space complexity:
1. Identify the main operations/loops
2. Determine how they scale with input size
3. Express in Big O notation with clear reasoning
4. Provide examples if helpful

Remember: You're a coding tutor, stay focused on programming topics!`;
        
        console.log('Making Groq API call...');
        
        const requestPayload = {
            model: 'llama-3.1-8b-instant',
            messages: [
                { role: 'system', content: systemPrompt },
                ...conversationHistory
            ],
            max_tokens: 1000,
            temperature: 0.4,
            top_p: 0.9
        };
        
        const groqResponse = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            requestPayload,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );
        
        console.log('Groq API response received successfully');
        
        if (!groqResponse.data || !groqResponse.data.choices || !groqResponse.data.choices[0]) {
            console.error('Invalid Groq API response structure:', groqResponse.data);
            return res.status(500).json({
                message: "🤖 I got a weird response from my brain. Could you rephrase your coding question?"
            });
        }
        
        const aiResponse = groqResponse.data.choices[0].message.content;
        console.log('AI response length:', aiResponse?.length || 0);
        
        if (!aiResponse || aiResponse.trim().length === 0) {
            console.error('Empty AI response');
            return res.status(500).json({
                message: "🤔 My brain went blank. Could you ask your coding question differently?"
            });
        }
        
        res.status(200).json({
            message: aiResponse.trim()
        });
        
    } catch(err) {
        console.error('=== AI Chat Error Details ===');
        console.error('Error type:', err.name);
        console.error('Error message:', err.message);
        console.error('Response status:', err.response?.status);
        console.error('Response data:', err.response?.data);
        
        let errorMessage;

        if (err.response?.status === 401) {
            errorMessage = "🔐 Authentication failed with AI service. The API key might be invalid.";
        } else if (err.response?.status === 429) {
            errorMessage = "⏰ AI service is overwhelmed. Please wait a moment and try again.";
        } else if (err.response?.status >= 500) {
            errorMessage = "🚨 AI service is down. Please try again later.";
        } else if (err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED') {
            errorMessage = "⏱️ Request timed out. Try asking a shorter question.";
        } else {
            // Provide helpful fallback for specific questions
            const {messages} = req.body;
            const lastMessage = messages?.[messages.length - 1];
            const userQuestion = lastMessage?.parts?.[0]?.text?.toLowerCase() || '';
            
            if (userQuestion.includes('time complexity') || userQuestion.includes('complexity')) {
                errorMessage = `🔄 Connection issues, but I can help with time complexity analysis!\n\n**Time Complexity Quick Guide:**\n• O(1) - Constant: Hash table lookup\n• O(log n) - Logarithmic: Binary search\n• O(n) - Linear: Array traversal\n• O(n log n) - Linearithmic: Merge sort\n• O(n²) - Quadratic: Nested loops\n\n📝 Share your specific algorithm code and I'll analyze it once my connection improves!`;
            } else if (userQuestion.includes('space complexity')) {
                errorMessage = `🔄 Connection issues, but here's space complexity help!\n\n**Space Complexity Basics:**\n• O(1) - Constant extra space\n• O(n) - Linear space (like copying array)\n• O(h) - Tree height space (recursion)\n• O(V+E) - Graph space (vertices + edges)\n\n📝 Share your code and I'll analyze the space usage!`;
            } else {
                errorMessage = "🔧 Having technical difficulties. Please try asking your coding question again.";
            }
        }
        
        res.status(500).json({
            message: errorMessage
        });
    }
}

module.exports = { solveDoubt, testGroq };