#!/usr/bin/env python

import os
import json
import time

from pprint import pprint

try:
	from urllib.parse import urlparse, urlencode
	from urllib.request import urlopen, Request
	from urllib.error import HTTPError
except ImportError:
	from urlparse import urlparse
	from urllib import urlencode
	from urllib2 import urlopen, Request, HTTPError

class ApiError(Exception):
	"""Base class for exceptions in this module."""
	pass

class ApiClient:
	BASE_URL = "https://api.prokerala.com/"
	# Make sure that the following file path is set to a location that is not publicly accessible
	TOKEN_FILE = "./token.json"

	def __init__(self, clientId, clientSecret):
		self.clientId = clientId
		self.clientSecret = clientSecret

	def parseResponse(self, response):
		content = response.read()
		res = json.loads(content)

		if 'access_token' in res:
			return res

		if res['status'] == "error":
			raise ApiError(map(lambda e: e['detail'], res['errors']).join("\n"))

		if res['status'] != "ok":
			raise ApiError("HTTP request failed")

		return res

	def saveToken(self, token):
		# Cache the token until it expires.
		with open(self.TOKEN_FILE, 'w') as f:
			token = {
				'access_token': token['access_token'],
				'expires_at': int(time.time()) + token['expires_in']
			}
			json.dump(token, f)
			f.close()


	def getTokenFromCache(self):
		if not os.path.isfile(self.TOKEN_FILE):
			return None

		try:
			with open(self.TOKEN_FILE, 'r') as f:
				token = json.load(f)
				f.close()

			if token['expires_at'] < int(time.time()):
				return None

			return token['access_token']
		except ValueError:
			return None
		end

	def fetchNewToken(self):
		data = {
			'grant_type': 'client_credentials',
			'client_id': self.clientId,
			'client_secret': self.clientSecret
		}

		data = urlencode(data)

		request = Request(self.BASE_URL + '/token', data.encode('ascii'))
		response = urlopen(request)
		token = self.parseResponse(response)

		self.saveToken(token)

		return token['access_token']

	def get(self, endpoint, params):
		# Try to fetch the access token from cache
		token = self.getTokenFromCache()
		if not token:
			# If failed, request new token
			token = self.fetchNewToken()

		uri = self.BASE_URL + endpoint + '?' + urlencode(params)
		request = Request(uri, headers={'Authorization': 'Bearer ' + token})
		response = urlopen(request)

		return self.parseResponse(response)


