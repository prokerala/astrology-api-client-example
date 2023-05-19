// Configuration

// Set your client credentials
const CLIENT_ID = 'YOUR_CLIENT_ID';
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET';

// Set your desired user rate limits and durations
const RATE_LIMITS = [
  { duration: 60, limit: 100 },    // 100 requests per minute
  { duration: 600, limit: 500 },   // 500 requests per 10 minutes
  { duration: 3600, limit: 1000 }, // 1000 requests per hour
];

// Proxy Script

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  let token = await TOKEN.get('prokerala-token');

  // If no token is cached or token is expired, fetch a new one
  if (!token) {
    const res = await fetch('https://api.prokerala.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `grant_type=client_credentials&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`
    });

    if (!res.ok) {
      return new Response('Failed to fetch token', { status: 500 });
    }

    const data = await res.json();
    token = data.access_token;
    // Store the token in KV storage, setting ttl to token's expiresIn value
    await TOKEN.put('prokerala-token', token, { expirationTtl: data.expires_in });
  }

  // Get the user's unique identifier (IP address in this example)
  const userIdentifier = request.headers.get('cf-connecting-ip') || '';

  // Implement rate limiting using a counter in KV storage for each user and each rate limit
  for (const { duration, limit } of RATE_LIMITS) {
    let count = await USER_COUNT.get(`${userIdentifier}-${duration}`);
    count = parseInt(count) || 0;
    if (count >= limit) {
      return new Response('Rate limit exceeded', { status: 429 });
    }

    await USER_COUNT.put(`${userIdentifier}-${duration}`, count + 1, { expirationTtl: duration }); // Reset the count after the duration
  }

  url.hostname = 'api.prokerala.com';
  // Forward the request to the Prokerala API with the Authorization header
  const apiResponse = await fetch(url, {
    headers: {
      ...request.headers,
      'Authorization': `Bearer ${token}`
    }
  });

  return apiResponse;
}

