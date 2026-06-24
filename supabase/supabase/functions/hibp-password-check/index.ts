import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
  if (authError || !user) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  let body: { hashPrefix?: unknown };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid request body' }, 400);
  }

  const { hashPrefix } = body;
  if (typeof hashPrefix !== 'string' || !/^[0-9A-Fa-f]{5}$/.test(hashPrefix)) {
    return jsonResponse({ error: 'Invalid hash prefix' }, 400);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const hibpRes = await fetch(
      `https://api.pwnedpasswords.com/range/${hashPrefix.toUpperCase()}`,
      {
        headers: {
          'user-agent': 'StowitAll',
          'Add-Padding': 'true',
        },
        signal: controller.signal,
      },
    );
    clearTimeout(timeoutId);

    if (!hibpRes.ok) {
      return jsonResponse({ error: 'HIBP service unavailable' }, 502);
    }

    const suffixes = await hibpRes.text();
    return jsonResponse({ suffixes }, 200);
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === 'AbortError') {
      return jsonResponse({ error: 'HIBP request timed out' }, 504);
    }
    return jsonResponse({ error: 'HIBP service unavailable' }, 502);
  }
});
