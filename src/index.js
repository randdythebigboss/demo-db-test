const MAX_LENGTH = 1000;

// Allowed origins — add your GitHub Pages URL here after publishing
const ALLOWED_ORIGINS = [
  'http://localhost',
  'http://127.0.0.1',
  // 'https://YOUR_GITHUB_USERNAME.github.io',  // uncomment and fill after publishing
];

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.some(o => origin && origin.startsWith(o))
    ? origin
    : ALLOWED_ORIGINS[0];

  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function json(data, status = 200, origin = '') {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(origin),
    },
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') ?? '';
    const { pathname, method } = new URL(request.url);

    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    // POST /api/messages
    if (pathname === '/api/messages' && method === 'POST') {
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: 'Invalid JSON body.' }, 400, origin);
      }

      const text = (body.text ?? '').trim();

      if (!text) {
        return json({ error: 'Text cannot be empty.' }, 400, origin);
      }

      if (text.length > MAX_LENGTH) {
        return json({ error: `Text exceeds ${MAX_LENGTH} characters.` }, 400, origin);
      }

      const result = await env.DB.prepare(
        'INSERT INTO messages (text) VALUES (?) RETURNING id, text, created_at'
      ).bind(text).first();

      return json({ message: result }, 201, origin);
    }

    // GET /api/messages
    if (pathname === '/api/messages' && method === 'GET') {
      const { results } = await env.DB.prepare(
        'SELECT id, text, created_at FROM messages ORDER BY created_at DESC LIMIT 50'
      ).all();

      return json({ messages: results }, 200, origin);
    }

    return json({ error: 'Not found.' }, 404, origin);
  },
};
