// api/requests/[id]/status.js
const { supabase, requireAuth, sendPush } = require('../../_supabase');
const { getJson } = require('../../_utils');

const ALLOWED = new Set(['enroute', 'arrived', 'canceled']);

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

    const { status, note } = await getJson(req);
    if (!ALLOWED.has(status)) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: 'Invalid status' }));
    }

    const { data, error } = await supabase
      .from('shuttle_requests')
      .update({ status, note: note ?? null })
      .eq('id', id)
      .select('customer_push_token')
      .single();

    if (error || !data) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: error?.message || 'Not found' }));
    }

    const body =
      status === 'enroute' ? 'Driver is en route' :
      status === 'arrived' ? 'Driver has arrived' :
      'Request canceled';

    await sendPush(data.customer_push_token, 'Shuttle Update', body, { id, status });

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
