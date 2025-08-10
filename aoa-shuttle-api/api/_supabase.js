const { createClient } = require('@supabase/supabase-js');

// Server-side Supabase client (service role key required).
// NEVER expose the service role key in your mobile/web client.
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE,
  { auth: { persistSession: false } }
);

function requireAuth(req, res) {
  const header = req.headers['authorization'] || '';
  const token = header.replace(/^Bearer\s+/i, '');
  if (!token || token !== process.env.AUTH_TOKEN) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Unauthorized' }));
    return true;
  }
  return false;
}

async function sendPush(to, title, body, data) {
  try {
    const resp = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{ to, title, body, data }]),
    });
    if (!resp.ok) {
      const text = await resp.text();
      console.error('Expo Push error:', text);
    }
  } catch (err) {
    console.error('Expo Push error:', err);
  }
}

module.exports = { supabase, requireAuth, sendPush };
