export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/health') {
      return Response.json({ ok: true, ts: Date.now(), service: 'forge-test' });
    }

    if (url.pathname === '/api/chat' && request.method === 'POST') {
      try {
        const body = await request.json();
        const incoming = Array.isArray(body.messages) ? body.messages : [];
        const messages = incoming
          .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
          .slice(-12);
        if (messages.length === 0 || messages[messages.length - 1].role !== 'user') {
          return Response.json({ error: 'last message must be from user' }, { status: 400 });
        }

        const r = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5',
            max_tokens: 600,
            system:
              'You are Forge Bot, a friendly assistant living inside a test console for a forging/build-and-deploy pipeline. ' +
              'You help users understand build jobs, deployment stages, logging, and the messaging workflow. ' +
              'Keep replies concise, helpful, and a little playful. Use occasional emoji. This is a test environment.',
            messages,
          }),
        });

        if (!r.ok) {
          const detail = await r.text();
          return Response.json({ error: 'upstream ' + r.status, detail }, { status: 502 });
        }
        const data = await r.json();
        const reply = data.content?.[0]?.text ?? '(no response)';
        return Response.json({ reply });
      } catch (err) {
        return Response.json({ error: String(err && err.message || err) }, { status: 500 });
      }
    }

    if (url.pathname.startsWith('/api/')) {
      return Response.json({ error: 'not found' }, { status: 404 });
    }

    return env.ASSETS.fetch(request);
  },
};
