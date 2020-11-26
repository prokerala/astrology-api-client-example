## PHP client

This is a sample API client written in [PHP](https://php.net/) for accessing Prokerala Astrology API.

## Usage

You can find your `clientId` and `clientSecret` in your [dashboard](https://api.prokerala.com/account/client)


### [Kundli](https://api.prokerala.com/docs#operation/get-kundli)

```php
<?php

include __DIR__ . '/client.php';

$client = new Prokerala\Api\Sample\ApiClient('YOUR_CLIENT_ID', 'YOUR_CLIENT_SECRET');

$data = $client->get('v2/astrology/panchang', [
    'ayanamsa' => 1,
    'coordinates' => '23.1765,75.7885',
    'datetime' => '2020-10-19T12:31:14+00:00'
]);

print_r($data);
```
