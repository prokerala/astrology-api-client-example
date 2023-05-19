## Cloudflare Worker Based OAuth Proxy

This is a simple Proxy using Cloudflare worker to make authenticated requests to Prokerala API without bundling your OAuth2 credentials with your Native applications.

We use cloudflare [`wrangler`](https://developers.cloudflare.com/workers/wrangler/) tool in the instructions below. It is possible to create the Key Value namesspaces and worker directly from your Cloudflare dashboard.

## Configuration

### Credentials

Update `CLIENT_ID` and `CLIENT_SECRET` variables in `index.js` with the Client id and client secret from your Prokerala API Dashboard.

### Rate Limiting

The script allows adding rate limits by IP Address to prevent abuse. You can add multiple (per user) rate limits by modifying the `RATE_LIMITS` variable.

## Local Testing

Create KV namespace for previewing and update `wrangler.toml` with the generated `preview_id`.

```
wrangler kv:namespace create --preview TOKEN
wrangler kv:namespace create --preview USER_COUNT
```

Start the local web server for testing by running

```
wrangler dev
```

## Production

Create KV namespace for production and update `wrangler.toml` with the generated `id`.

```
wrangler kv:namespace create TOKEN
wrangler kv:namespace create USER_COUNT
```

Deploy to Cloudflare worker edge with

```
wrangler publish
```

This will output a message like the following with your Cloudflare worker hostname.

> ✨  Successfully published your script to
> https://prokerala-api-proxy.<YOUR_SUBDOMAIN>.workers.dev

Now you can access the API without authentication by using the worker hostname, instead of `api.prokerala.com`. For example, 
try visiting the following url after replacing `<YOUR_SUBDOMAIN>` with your actual Cloudflare worker subdomain.

```
https://prokerala-api-proxy.<YOUR_SUBDOMAIN>.workers.dev/v2/astrology/panchang?datetime=2004-02-12T15:19:21Z&ayanamsa=1&coordinates=10.21,78.09
```

## Warning

While this script protects your credentials, inspection of the application can reveal the URL to your proxy service.
A malicious user can make requests on your behalf by using the Proxy URL. Rate limit is the first step towards preventing abuse.

To properly secure your API access, you need to authenticate each user from within the proxy script before allowing the request.


