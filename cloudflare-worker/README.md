# Cloudflare Worker Based OAuth Proxy

A simple proxy using Cloudflare Workers to make authenticated requests to the Prokerala API

## Overview

This proxy allows you to make authenticated requests to the Prokerala API without exposing your OAuth2 credentials in your native/distributed applications. We will use Cloudflare's `wrangler` tool, but you can also create Key-Value (KV) namespaces and workers directly from the Cloudflare dashboard.

## Setup Instructions

### 1. Install Wrangler

First, install the Cloudflare `wrangler` CLI tool if you haven't already:

```sh
npm install -g @cloudflare/wrangler
```

### 2. Configure Credentials

Update the `wrangler.toml` file with your Prokerala API client ID and client secret:

```toml
[vars]
CLIENT_ID = "your_client_id"
CLIENT_SECRET = "your_client_secret"
```

### 3. Add Middleware

- #### RateLimit

  The RateLimit middleware enforces rate limits by IP address to prevent abuse. You can add multiple (per user) rate limits.

- #### Endpoint

  The Endpoint middleware allows whitelisting API endpoints that will be available through the proxy. It is highly recommended to whitelist only those endpoints that are used by your application.

- #### JWT

  The JWT validator middleware authenticates your API requests using shared secret/public key authentication. If properly configured, the JWT authentication can fully prevent unauthorized access.

- #### Example Custom Middleware

  You can create custom middleware by adding a function that processes the `Request` object:

  ```javascript
  // config.js
  export default {
    middleware: [
      async (request) => {
        const userId = request.headers.get('X-User-Id');
        const response = await fetch(`https://example.com/validate?userId=${userId}`);
        if (response.status === 200) {
          return response;
        }
        return null; // Proceed to the next middleware/API server
      },
    ],
  };
  ```

### 4. Local Testing

To test your setup locally, create KV namespaces and update your `wrangler.toml` with the `preview_id`:

```sh
wrangler kv:namespace create --preview TOKEN_KV
wrangler kv:namespace create --preview RATE_LIMIT_KV
```

Export your Cloudflare API token:

```sh
export CLOUDFLARE_API_TOKEN='Your_API_Token'
```

Then, start the local server:

```sh
wrangler dev
```

### 5. Deploy to Production

Create KV namespaces for production and update `wrangler.toml` with the generated IDs:

```sh
wrangler kv:namespace create TOKEN_KV
wrangler kv:namespace create RATE_LIMIT_KV
```

Deploy your worker:

```sh
wrangler publish
```

This will output a message like the following with your Cloudflare Worker hostname.

> ✨ Successfully published your script to
> https://prokerala-api-proxy.<YOUR_SUBDOMAIN>.workers.dev

Now you can access the API without authentication by using the Worker hostname instead of `api.prokerala.com`.

## Example API Call

Here is an example of how to make a request through the proxy:

```sh
curl https://prokerala-api-proxy.<YOUR_SUBDOMAIN>.workers.dev/v2/astrology/panchang?datetime=2004-02-12T15:19:21Z&ayanamsa=1&coordinates=10.21,78.09
```

## Troubleshooting

- If you encounter the following error while switching to remote mode in wrangler:

  > A request to the Cloudflare API (/memberships) failed.

  Set the `CLOUDFLARE_ACCOUNT_ID` environment variable:

  ```sh
  export CLOUDFLARE_ACCOUNT_ID="YOUR_ACCOUNT_ID"
  ```

## Security Considerations

While this script protects your credentials, it is possible for someone to discover the URL of your proxy service and misuse it. Implementing rate limiting is the first step to prevent abuse.

To further secure your API, ensure that each user is authenticated within the proxy script before processing their requests. If your application already has user authentication, consider using per-user API keys instead of IP addresses for rate limiting. This approach confines API access to your app’s users and allows you to revoke a compromised API key without affecting others.

An even more secure method is to use client authentication that doesn't involve distributing secret keys. For example, clients can authenticate to your server using a username and password or a federated identity system like OAuth. Your server can then issue a short-lived, signed JSON Web Token (JWT) for the client to use when authenticating with the proxy service.
