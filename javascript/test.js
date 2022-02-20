const {ApiClient} = require('./client');

(async () => {
    const client = new ApiClient('YOUR_CLIENT_ID', 'YOUR_CLIENT_SECRET');
    const data = await client.get('v2/astrology/panchang', {
        'ayanamsa': 1,
        'coordinates': '23.1765,75.7885',
        'datetime': '2020-10-19T12:31:14+00:00'
    });

    console.log(data);
})();
