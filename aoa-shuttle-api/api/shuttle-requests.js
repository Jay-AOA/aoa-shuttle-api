// api/shuttle-requests.js
const { supabase } = require('./_supabase');
const { getJson } = require('./_utils');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    return res.end('Method Not Allowed');
  }

  try {
    const { trip, vessels, customerPushToken, note } = await getJson(req);
    if (!trip || !vessels || !customerPushToken) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: 'Missing required fields' }));
    }

    const { data, error } = await supabase
      .from('shuttle_requests')
      .insert([{
        trip,
        vessels,
        customer_push_token: customerPushToken,
        note: note ?? null,
      }])
      .select()
      .single();

    if (error) {
      console.error(error);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: error.message }));
    }

    res.statusCode = 201;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ id: data.id, status: data.status }));
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Server error' }));
  }
};
