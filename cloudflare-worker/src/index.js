import config from '../config';
import fetchToken from './token';
import ApiError from './error';

/**
 * Compose an array of middlewares into a single function.
 * Each middleware has the signature: (request, next, ctx, env).
 */
function compose(middlewares) {
  return function(request, ctx, env) {
    let index = -1;
    function dispatch(i) {
      if (i <= index) {
        return Promise.reject(new Error('next() called multiple times'));
      }

      index = i;
      const fn = middlewares[i];
      if (!fn) {
        return Promise.resolve(null);
      }

      return Promise.resolve(fn(request, () => dispatch(i + 1), ctx, env));
    }
    return dispatch(0);
  };
}

/**
 * Top-level handler: Runs the configured middlewares and then the default proxy logic.
 */
export async function handle(request, env, ctx) {
  try {
    // Get the configured middlewares.
    let middlewares = config.middlewares;

    // Append the default proxy middleware to the end of the chain.
    middlewares = middlewares.concat([
      async function defaultProxyMiddleware(request, next, ctx, env) {
        // This middleware is terminal—it forwards the request to the external API.
        const token = await fetchToken(env.CLIENT_ID, env.CLIENT_SECRET, env.TOKEN);
        const url = new URL(request.url);
        url.hostname = 'api.prokerala.com';
        const apiResponse = await fetch(url, {
          headers: {
            ...request.headers,
            Authorization: `Bearer ${token}`,
          },
        });
        return apiResponse;
      }
    ]);

    // Compose and execute the middleware chain.
    const middlewareChain = compose(middlewares);
    return await middlewareChain(request, ctx, env);
  } catch (e) {
    if (!(e instanceof ApiError)) {
      console.error(e);
      e = new ApiError('Proxy Error', 'Internal server error.', 500);
    }

    return new Response(JSON.stringify({ status: 'error', errors: [e.toJSON()] }), {
      status: e.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export default {
  fetch: handle,
  fetchToken,
};
