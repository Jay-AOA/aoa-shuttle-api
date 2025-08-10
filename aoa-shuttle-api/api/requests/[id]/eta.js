// api/requests/[id]/eta.js
const { supabase, requireAuth, sendPush } = require('../../_supabase');
const { getJson } = require('../../_utils');

module.exports = async (req, res) => {
  if (requireAuth(req, res)) return;
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    return res.end('Method Not Allowed');
  }

  try {
    const id = (req.query && req.query.id) ||
               req.url.split('/').slice(-2, -1)[0]; // fallback

    const { etaMinutes, driverId } = await getJson(req);
    if (!etaMinutes) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: 'etaMinutes required' }));
    }

    const { data, error } = await supabase
      .from('shuttle_requests')
      .update({
        status: 'accepted',
        eta_minutes: etaMinutes,
        driver_id: driverId ?? null,
      })
      .eq('id', id)
      .select('customer_push_token, trip, vessels')
      .single();

    if (error || !data) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: error?.message || 'Not found' }));
    }

    await sendPush(
      data.customer_push_token,
      'Shuttle ETA',
      `Driver in ~${etaMinutes} min`,
      { id, etaMinutes, status: 'accepted' }
    );

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: true }));
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Server error' }));
  }
};
