import config from '../config';
import ApiError from './error';

async function processMiddlewares(request, env, ctx) {
  for (let middleware of config.middlewares) {
    const response = await middleware(request, env, ctx);
    if (response) {
      return response;
    }
  }

  return null;
}

async function handle(request, env, ctx) {
  try {
    const middlwareResponse = await processMiddlewares(request, env, ctx);
    if (middlwareResponse) {
      return middlwareResponse;
    }

    const url = new URL(request.url);
    let token = await env.TOKEN.get('prokerala-token');

    // If no token is cached or token is expired, fetch a new one
    if (!token) {
      const clientId = env.CLIENT_ID;
      const clientSecret = env.CLIENT_SECRET;

      if (clientId === 'your_client_id') {
        console.error('Enter your client credentials in wrangler.toml');
      }
      const res = await fetch('https://api.prokerala.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
      });

      if (!res.ok) {
        return new Response('Failed to fetch token', { status: 500 });
      }

      const data = await res.json();
      token = data.access_token;
      // Store the token in KV storage, setting ttl to token's expiresIn value
      await env.TOKEN.put('prokerala-token', token, {
        expirationTtl: data.expires_in,
      });
    }

    url.hostname = 'api.prokerala.com';
    // Forward the request to the Prokerala API with the Authorization header
    const apiResponse = await fetch(url, {
      headers: {
        ...request.headers,
        Authorization: `Bearer ${token}`,
      },
    });

    return apiResponse;
  } catch (e) {
    if (!(e instanceof ApiError)) {
      console.error(e);
      e = new ApiError('Proxy Error', 'Failed to process request due to an internal error.');
    }

    return new Response(JSON.stringify({ status: 'error', errors: [e] }), {
      status: e.status,
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    });
  }
}

export default {
  fetch: handle,
};
