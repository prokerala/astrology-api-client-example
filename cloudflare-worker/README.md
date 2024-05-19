## Cloudflare Worker Based OAuth Proxy

This is a simple proxy using Cloudflare Workers to make authenticated requests to the Prokerala API without bundling your OAuth2 credentials with your native applications.

We use Cloudflare [`wrangler`](https://developers.cloudflare.com/workers/wrangler/) tool in the instructions below. It is possible to create the Key Value namespaces and worker directly from your Cloudflare dashboard.

## Configuration

### Credentials

Update the `CLIENT_ID` and `CLIENT_SECRET` variables in `wrangler.toml` with the client ID and client secret from your Prokerala API Dashboard.

### Middleware

You can add custom middleware in `config.js` to restrict access to your proxy. A few sample middleware are available under the [src/middleware](src/middleware) directory.

- #### RateLimit

  The RateLimit middleware enforces rate limits by IP address to prevent abuse. You can add multiple (per user) rate limits.

- #### Endpoint

  The Endpoint middleware allows whitelisting API endpoints that will be available through the proxy. It is highly recommended to whitelist only those endpoints that are used by your application.

- #### JWT

  The JWT validator middleware authenticates your API requests using public key authentication. If properly configured, the JWT authentication can fully prevent unauthorized access.

- #### Custom Middleware

  You can create your own custom middleware by passing a function that accepts the `Request` object and returns a `Response` or throws an `ApiError`.

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

        return null; // Pass the request to the next middleware / API server
      },
    ],
  };
  ```

## Local Testing

Create a KV namespace for previewing and update `wrangler.toml` with the generated `preview_id`.

```sh
wrangler kv:namespace create --preview TOKEN
wrangler kv:namespace create --preview USER_COUNT
```
Export your cloudflare api token.

```sh
export CLOUDFLARE_API_TOKEN='Your_API_Token'
```

Start the local web server for testing by running:

```sh
wrangler dev
```

## Production

Create a KV namespace for production and update `wrangler.toml` with the generated `id`.

```sh
wrangler kv:namespace create TOKEN
wrangler kv:namespace create USER_COUNT
```

Deploy to Cloudflare Worker edge with:

```sh
wrangler publish
```

This will output a message like the following with your Cloudflare Worker hostname.

> ✨ Successfully published your script to
> https://prokerala-api-proxy.<YOUR_SUBDOMAIN>.workers.dev

Now you can access the API without authentication by using the Worker hostname instead of `api.prokerala.com`. For example, try visiting the following URL after replacing `<YOUR_SUBDOMAIN>` with your actual Cloudflare Worker subdomain.

```sh
https://prokerala-api-proxy.<YOUR_SUBDOMAIN>.workers.dev/v2/astrology/panchang?datetime=2004-02-12T15:19:21Z&ayanamsa=1&coordinates=10.21,78.09
```

## Troubleshooting

- While switching to remote mode in wrangler, if you are getting the following error:

  > A request to the Cloudflare API (/memberships) failed.

  set the environment variable `CLOUDFLARE_ACCOUNT_ID` to your account ID. ([See Issue](https://github.com/cloudflare/workers-sdk/issues/1422))

  ```sh
  export CLOUDFLARE_ACCOUNT_ID="CHANGE_TO_YOUR_ACCOUNT_ID"
  ```

## Security

While this script protects your credentials, inspection of the application can reveal the URL of your proxy service. A malicious user can still make requests on your behalf by using the proxy URL. Rate limiting is the first step towards preventing abuse.

To further secure your API from unauthorized access, you need to authenticate each user from within the proxy script before allowing the request. If your app already has user authentication, you may use a per-user API key instead of an IP address for rate limiting. This limits the API access to users of your app, and if you detect suspicious activity from a particular API key, you can revoke that key without affecting other clients.

A more secure approach is to use a form of client authentication that doesn't require distributing secret keys to clients. For example, you might use a system where the client authenticates to your server (possibly using a username and password, or a federated identity system like OAuth), and your server issues a short-lived, signed token that the client can use to authenticate to the proxy service.
