#!/usr/bin/env python

from prokerala_api import ApiClient
import json


def run():
    client = ApiClient(
        "9814f49f-5d57-4c70-af9a-616dfffc9f2f",
        "VO8EKdIHFAfsaRVBy6qD81bsFNOf9EjMVGCLdDQT",
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
