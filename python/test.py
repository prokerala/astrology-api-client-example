#!/usr/bin/env python

from client import ApiClient, ValidationError, AuthenticationError, ServerError
import json


def run():
	try:
		client = ApiClient('YOUR_CLIENT_ID', 'YOUR_CLIENT_SECRET')
		result = client.get('v2/astrology/natal-planet-position', {
			'profile': {
				'datetime': '2020-10-19T12:31:14+00:00',
				'coordinates': '23.17,75.78',
			},
			'house_system': 'regiomontanus',
			'orb': 'default',
			'birth_time_rectification': 'flat-chart',
		})
		print(result)
	except ValidationError as e:
		for msg in e.getValidationMessages():
			print(msg['detail'])
	except AuthenticationError as e:
		print(e.message)
	except ServerError as e:
		print(e.message)


if __name__ == '__main__':
	run()
