## Python client

This is a sample API client written in [Python](https://www.python.org/) for accessing Prokerala Astrology API.

## Usage

You can find your `clientId` and `clientSecret` in your [dashboard](https://api.prokerala.com/account/client)


### [Kundli](https://api.prokerala.com/docs#operation/get-kundli)

```python
#!/usr/bin/env python

from client import ApiClient
import json

def run():
    client = ApiClient('YOUR_CLIENT_ID', 'YOUR_CLIENT_SECRET')
    result = client.get('v2/astrology/kundli/advanced', {
        'ayanamsa': 1,
        'coordinates': '23.1765,75.7885',
        'datetime': '2020-10-19T12:31:14+00:00'
    })
    print json.dumps(result, indent=4)

if __name__ == '__main__':
    run()

```
