/**
 * ============================================================================
 * LEVI.AI - SERVERLESS EVENT ANALYTICS (/api/analytics)
 * ============================================================================
 * 
 * Target: Vercel Serverless Function (Node.js)
 * Purpose: Lightweight event telemetry for form conversions & chat engagement.
 * ============================================================================
 */

export default async function handler(req, res) {
  // CORS Preflight & Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'online',
      service: 'Levi.ai Analytics Telemetry',
      timestamp: new Date().toISOString()
    });
  }

  if (req.method === 'POST') {
    try {
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch (e) {
          // ignore parsing error
        }
      }

      const eventName = body?.event || 'page_view';
      const eventData = body?.data || {};
      const timestamp = new Date().toISOString();

      // Log event telemetry for monitoring in Vercel Runtime Logs
      console.log(`[ANALYTICS] Event: ${eventName}`, JSON.stringify({
        event: eventName,
        timestamp,
        data: eventData
      }));

      return res.status(200).json({
        success: true,
        event: eventName,
        recordedAt: timestamp
      });
    } catch (err) {
      return res.status(200).json({
        success: true,
        note: 'Swallowed error to maintain silent telemetry'
      });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
