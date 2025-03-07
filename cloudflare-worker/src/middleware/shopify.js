// Middleware to integrate with Shopify
// Use https://{worker_hostname}/{prefix}/install as App Url,
// and https://{worker_hostname}/{prefix}/auth as Redirection Url,
//
// Where default value of
// {worker_hostname} is prokerala-api-proxy.<YOUR_SUBDOMAIN>.workers.dev
// {prefix} is /shopify
//
// Middleware requires two additional KV stores SHOPIFY_STATE_KV and SHOPIFY_TOKEN_KV
// Also, create environment variables SHOPIFY_API_KEY and SHOPIFY_API_SECRET
import ApiError from "../error";

class SignatureError extends Error {
}

export default (requireLogin, scopes = '', prefix = '/shopify') => {
  return async (request, next, ctx, env) => {
    const url = new URL(request.url)

    if (url.pathname === `${prefix}/install`) {
      const redirectUri = `${url.origin}${prefix}/auth`;
      // Initiate Shopify OAuth installation process
      return handleAppInstall(url, env.SHOPIFY_API_KEY, scopes, redirectUri, env.SHOPIFY_STATE_KV);
    }

    const params = new URLSearchParams(url.search)

    try {
      if (url.pathname === `${prefix}/auth`) {
        // Validate HMAC to ensure the request is from Shopify
        await verifyShopifyHmac(params, env.SHOPIFY_API_SECRET)

        return handleAppAuth(url, env.SHOPIFY_API_KEY, env.SHOPIFY_API_SECRET, env.SHOPIFY_STATE_KV, env.SHOPIFY_TOKEN_KV);
      }

      await verifyShopifySignature(params, env.SHOPIFY_API_SECRET);
    } catch (e) {
      if (e instanceof SignatureError) {
        throw new ApiError(
          'Proxy Error',
          'Failed to verify request integrity. ' + e.message,
          403
        );
      }
    }

    ctx.userId = params.get('logged_in_customer_id');
    if (requireLogin && !ctx.userId) {
      throw new ApiError(
        'Proxy Error',
        'Request is missing required authentication credentials.',
        403
      );
    }

    return next();
  };
};

async function handleAppInstall(url, apiKey, scopes, redirectUri, stateKv) {
  const shop = url.searchParams.get('shop')
  if (!shop) {
    return new Response("Missing shop parameter", { status: 400 })
  }
  // Generate a random state string and store it in KV for later validation
  const state = generateRandomString(16)
  await stateKv.put(`shopify_state_${state}`, shop, { expirationTtl: 300 }) // expires in 5 minutes

  // Build Shopify's OAuth URL
  const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${apiKey}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`
  return Response.redirect(installUrl, 302)
}

async function handleAppAuth(url, apiKey, apiSecret, stateKv, tokenKv) {
  const params = url.searchParams;
  // Handle the OAuth callback from Shopify
  const code = params.get('code')
  const shop = params.get('shop')
  const state = params.get('state')
  const hmac = params.get('hmac')

  if (!code || !shop || !state || !hmac) {
    return new Response("Invalid callback parameters", { status: 400 })
  }

  const stateKey = `shopify_state_${state}`;
  // Validate state by checking KV
  const storedShop = await stateKv.get(stateKey)
  if (!storedShop || storedShop !== shop) {
    return new Response("Invalid or expired state parameter", { status: 403 })
  }
  // Delete the state to prevent re-use
  await stateKv.delete(stateKey)

  // Exchange the temporary code for a permanent access token
  const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: apiKey,
      client_secret: apiSecret,
      code: code
    })
  })

  if (!tokenResponse.ok) {
    return new Response("Failed to fetch access token", { status: tokenResponse.status })
  }

  const tokenData = await tokenResponse.json()
  const accessToken = tokenData.access_token

  tokenKv.put(`shopify_token_${shop}`, accessToken);

  return new Response('Auth successful!', { status: 200 })
}

/**
 * Generates a random string of the specified length.
 */
function generateRandomString(length) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const result = [];
  const charsetLength = charset.length;
  const maxByte = 256;
  // Calculate the maximum valid byte value to avoid bias.
  const maxValidByte = Math.floor(maxByte / charsetLength) * charsetLength;

  while (result.length < length) {
    // Generate a single random byte.
    const randomByte = new Uint8Array(1);
    crypto.getRandomValues(randomByte);

    if (randomByte[0] < maxValidByte) {
      // Use modulus to get an index within the charset.
      const index = randomByte[0] % charsetLength;
      result.push(charset.charAt(index));
    }
  }
  return result.join('');
}

async function verifySignature(signatureParam, params, sharedSecret, glue) {
  const timestamp = params.get('timestamp');

  if (!timestamp) {
    throw new SignatureError('Timestamp is missing');
  }
  const requestTime = parseInt(timestamp, 10);
  const now = Math.floor(Date.now() / 1000);
  const allowedWindow = 300; // 5 minutes in seconds.
  if (Math.abs(now - requestTime) > allowedWindow) {
    throw new SignatureError('Timestamp expired');
  }

  const receivedSignature = params.get(signatureParam);

  if (!receivedSignature) {
    throw new SignatureError('Signature is missing');
  }

  const computedSignature = await generateHmacSignature(params, sharedSecret, glue);
  if (computedSignature !== receivedSignature) {
    throw new SignatureError('Invalid signature');
  }

  return true;
}

async function generateHmacSignature(params, sharedSecret, glue) {
  // Remove hmac and signature from the parameters for verification
  params.delete('hmac')
  params.delete('signature')

  const entries = [];
  for (const key of params.keys()) {
    const values = params.getAll(key);
    entries.push(`${key}=${values.join(',')}`);
  }
  const message = entries.sort().join(glue);

  const encoder = new TextEncoder()
  const keyData = encoder.encode(sharedSecret)
  const msgData = encoder.encode(message)

  // Import the secret key and compute the HMAC digest
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, msgData);

  return bufferToHex(signatureBuffer);
}

function bufferToHex(buffer) {
  const byteArray = new Uint8Array(buffer);
  return Array.from(byteArray)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function verifyShopifySignature(params, sharedSecret) {
  return verifySignature('signature', params, sharedSecret, '');
}

async function verifyShopifyHmac(params, sharedSecret) {
  return verifySignature('hmac', params, sharedSecret, '&');
}
