/**
 * ============================================================================
 * LEVI.AI - SERVERLESS CHAT ENDPOINT (/api/chat)
 * ============================================================================
 * 
 * Target: Vercel Serverless Function (Node.js)
 * AI Engine: Google Gemini API (gemini-1.5-flash)
 * Environment Variable: GOOGLE_API_KEY
 * Rate Limit: Max 60 requests per minute
 * ============================================================================
 */

// In-memory sliding-window rate limiter (60 requests/minute per client IP)
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 60 seconds
const MAX_REQUESTS_PER_MINUTE = 60;

/**
 * Clean up stale rate limiter entries periodically
 */
function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [key, timestamps] of rateLimitStore.entries()) {
    const validTimestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
    if (validTimestamps.length === 0) {
      rateLimitStore.delete(key);
    } else {
      rateLimitStore.set(key, validTimestamps);
    }
  }
}

/**
 * Check if the given client key exceeds rate limits
 */
function isRateLimited(clientKey) {
  const now = Date.now();
  const timestamps = rateLimitStore.get(clientKey) || [];
  
  // Filter only timestamps in the last 60 seconds
  const recentTimestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  
  if (recentTimestamps.length >= MAX_REQUESTS_PER_MINUTE) {
    return true;
  }
  
  recentTimestamps.push(now);
  rateLimitStore.set(clientKey, recentTimestamps);
  
  // Periodic cleanup if store grows large
  if (rateLimitStore.size > 1000) {
    cleanupRateLimitStore();
  }
  
  return false;
}

export default async function handler(req, res) {
  // 1. CORS Preflight & Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 2. Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method Not Allowed. Use POST to communicate with Levi AI.'
    });
  }

  // 3. Client IP identification & Rate Limiting
  const clientIp = (
    req.headers['x-forwarded-for'] ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    'global_client'
  ).toString().split(',')[0].trim();

  if (isRateLimited(clientIp)) {
    return res.status(429).json({
      error: 'Rate limit exceeded (max 60 requests/minute). Please slow down and try again shortly.'
    });
  }

  try {
    // 4. Parse request body
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (parseErr) {
        return res.status(400).json({ error: 'Malformed JSON payload.' });
      }
    }

    const userMessage = body?.message;

    if (!userMessage || typeof userMessage !== 'string' || !userMessage.trim()) {
      return res.status(400).json({
        error: 'Missing required field: "message" (must be a non-empty string).'
      });
    }

    if (userMessage.length > 2000) {
      return res.status(400).json({
        error: 'Message length exceeds maximum limit of 2,000 characters.'
      });
    }

    // 5. Verify Google API Key
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.error('Server Configuration Error: GOOGLE_API_KEY environment variable is not defined.');
      return res.status(500).json({
        error: 'Server configuration error: GOOGLE_API_KEY is missing. Please configure it in your Vercel Dashboard under Settings > Environment Variables.'
      });
    }

    // 6. Build Gemini 1.5 Flash Request
    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const systemPrompt = `You are Levi, a helpful, intelligent, and courteous AI assistant for Levi.ai (https://personal-ai-ruby.vercel.app). 
Your personality is modern, concise, sharp, and helpful. 
Key facts about Levi.ai:
- Levi.ai is a next-generation autonomous AI platform with zero-latency core, smart agent workflows, and native Google Sheets synchronization.
- Users can join the waitlist or schedule an enterprise onboarding by submitting their Name, Email, and Phone number on the landing page form.
- Google Sheets integration allows instant, bi-directional lead routing and real-time operational synchronization.
- Keep your answers concise (2-4 sentences max unless detailed assistance is specifically requested), clear, and professional.`;

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: userMessage.trim() }]
        }
      ],
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
        topP: 0.95
      }
    };

    // 7. Execute request to Gemini API
    const response = await fetch(geminiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error('Gemini API Error Response:', errData);
      const errorMessage = errData?.error?.message || `Google Gemini API returned status ${response.status}`;
      return res.status(response.status >= 500 ? 502 : response.status).json({
        error: `AI Service Error: ${errorMessage}`
      });
    }

    const data = await response.json();
    const candidate = data?.candidates?.[0];
    const aiText = candidate?.content?.parts?.[0]?.text;

    if (!aiText) {
      const finishReason = candidate?.finishReason || 'UNKNOWN';
      return res.status(200).json({
        response: `I'm unable to process this request at the moment (Reason: ${finishReason}). How else can I assist you with Levi.ai?`
      });
    }

    // 8. Return response
    return res.status(200).json({
      response: aiText.trim()
    });

  } catch (error) {
    console.error('Unexpected error in /api/chat:', error);
    return res.status(500).json({
      error: 'An internal server error occurred while communicating with Levi AI.'
    });
  }
}
