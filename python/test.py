#!/usr/bin/env python

from prokerala_api import ApiClient
import json


def run():
    client = ApiClient(
        "YOUR_CLIENT_ID",
        "YOUR_CLIENT_SECRET",
    )
    result = client.get(
        "v2/astrology/kundli/advanced",
        {
            "ayanamsa": 1,
            "coordinates": "23.1765,75.7885",
            "datetime": "2020-10-19T12:31:14+00:00",
        },
    )
    print(json.dumps(result, indent=4))


if __name__ == "__main__":
    run()
