## Javascript client

This is a sample API client written in Javascript for accessing Prokerala Astrology API from NodeJS.

## Usage

You can find your `clientId` and `clientSecret` in your [dashboard](https://api.prokerala.com/account/client)

Install the api clientId

```
npm install --save @prokerala/api-client
```

### [Kundli](https://api.prokerala.com/docs#operation/get-kundli)

```javascript
const { ApiClient } = require('@prokerala/api-client');

(async () => {
    const client = new ApiClient('YOUR_CLIENT_ID', 'YOUR_CLIENT_SECRET');
    const data = await client.get('v2/astrology/panchang', {
        'ayanamsa': 1,
        'coordinates': '23.1765,75.7885',
        'datetime': '2020-10-19T12:31:14+00:00'
    });

    console.log(data);
})();

```
