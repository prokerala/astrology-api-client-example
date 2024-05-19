export default (rateLimits, headerName = 'cf-connecting-ip') => {
  return async (request, env) => {
    // Get the user's unique identifier
    const userIdentifier = request.headers.get(headerName) || '';

    // Implement rate limiting using a counter in KV storage for each user and each rate limit
    for (const { duration, limit } of rateLimits) {
      let count = await env.USER_COUNT.get(`${userIdentifier}-${duration}`);
      count = parseInt(count) || 0;
      if (count >= limit) {
        return new Response('Too Many Requests', { status: 429 });
      }

      await env.USER_COUNT.put(`${userIdentifier}-${duration}`, count + 1, {
        expirationTtl: duration, // Reset the count after the duration
      });
    }
  };
};
