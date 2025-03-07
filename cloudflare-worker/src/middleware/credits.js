import jwt from '@tsndr/cloudflare-worker-jwt';
import ApiError from '../error';
import fetchToken from '../token';

export default async function creditsMiddleware(request, next, ctx, env) {
  const url = new URL(request.url);

  if (url.pathname !== '/credits') {
    return next();
  }

  let token = await fetchToken(env.CLIENT_ID, env.CLIENT_SECRET, env.TOKEN_KV);
  try {
    const { payload } = jwt.decode(token);
    if (payload.credits_remaining === undefined) {
      throw new ApiError('Bad Request', 'credits_remaining not found in JWT payload', 400);
    }
    return new Response(
      JSON.stringify({ credits_remaining: payload.credits_remaining }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error(error);
    throw new ApiError('Bad Request', 'Failed to decode JWT token', 400);
  }
  // Delegate to the next middleware if the route is not `/credits`.
  return next();
}
