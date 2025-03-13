export default (rateLimits, headerName = 'cf-connecting-ip') => {
  return async (request, next, ctx, env) => {
    // Get the user's unique identifier
    const userIdentifier = ctx.userId || request.headers.get(headerName) || '';

    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\/+/g, '/');
    const urlMatches = (filter) => prefix instanceof RegExp ? prefix.test(pathname) : (pathname === filter);

    // Implement rate limiting using a counter in KV storage for each user and each rate limit
    for (const { duration, limit, filter } of rateLimits) {
      if (filter && !urlMatches(filter)) {
        continue;
      }

      let count = await env.RATE_LIMIT_KV.get(`${userIdentifier}-${duration}`);
      count = parseInt(count) || 0;
      if (count >= limit) {
        return new Response('Too Many Requests', { status: 429 });
      }

      await env.RATE_LIMIT_KV.put(`${userIdentifier}-${duration}`, count + 1, {
        expirationTtl: duration, // Reset the count after the duration
      });
    }

    return next();
  };
};
