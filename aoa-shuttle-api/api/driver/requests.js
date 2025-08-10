// api/driver/requests.js
const { supabase, requireAuth } = require('../_supabase');

module.exports = async (req, res) => {
  if (requireAuth(req, res)) return;

  try {
    // Try to read from req.query first (Vercel sets this), fallback to URL parsing.
    const since = (req.query && req.query.since) ||
                  (new URL(req.url, 'http://localhost').searchParams.get('since'));

    let query = supabase
      .from('shuttle_requests')
      .select('id, trip, vessels, status, eta_minutes, created_at, updated_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (since) query = query.gte('created_at', since);

    const { data, error } = await query;
    if (error) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: error.message }));
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Server error' }));
  }
};
