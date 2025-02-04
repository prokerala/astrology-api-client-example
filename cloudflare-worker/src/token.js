/**
 * Helper function: Fetch or cache a token.
 */
export default async (clientId, clientSecret, store) => {
  let token = await store.get('prokerala-token');
  if (token) {
    return token;
  }

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
    throw new ApiError('Token Error', 'Failed to fetch token', 500);
  }

  const data = await res.json();
  token = data.access_token;
  // Cache the token with the proper TTL.
  await store.put('prokerala-token', token, { expirationTtl: data.expires_in });

  return token;
}
