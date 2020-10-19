require 'net/http'
require 'json'

class ApiClient
	BASE_URL = "https://api.prokerala.com/"
	# Make sure that the following file path is set to a location that is not publicly accessible
	TOKEN_FILE = "./token.json"

	def initialize(clientId, clientSecret)
		# Instance variables
		@clientId = clientId
		@clientSecret = clientSecret
	end

	def parseResponse(response)
		res = JSON.parse(response)

		if res['status'] == "error"
			raise res['errors'].map {|e| e['detail']}.join("\n")
		end

		if not res.key?('access_token') and res['status'] != "ok"
			raise "HTTP request failed"
		end

		return res
	end

	def saveToken(token)
		# Cache the token until it expires.
		File.open(ApiClient::TOKEN_FILE,"w") do |f|
			token = {
				:access_token => token['access_token'],
				:expires_at => Time.now.to_i + token['expires_in']
			}
			f.write(token.to_json)
		end
	end

	def getTokenFromCache
		if not File.file?(ApiClient::TOKEN_FILE)
			return nil
		end

		begin
			# Fetch the cached token, and return if not expired
			text = File.read(ApiClient::TOKEN_FILE)
			token = JSON.parse(text)

			if token['expires_at'] < Time.now.to_i
				return nil
			end

			return token['access_token']
		rescue JSON::ParserError
			return nil
		end
	end

	def fetchNewToken
		params = {
			:grant_type => 'client_credentials',
			:client_id => @clientId,
			:client_secret => @clientSecret
		}

		res = Net::HTTP.post_form(URI(ApiClient::BASE_URL + 'token'), params)
		token = parseResponse(res.body)

		saveToken(token)

		return token['access_token']
	end

	def get(endpoint, params)
		# Try to fetch the access token from cache
		token = getTokenFromCache
		# If failed, request new token
		token ||= fetchNewToken

		uri = URI(ApiClient::BASE_URL + endpoint)
		uri.query = URI.encode_www_form(params)

		req = Net::HTTP::Get.new(uri.to_s, {'Authorization' => 'Bearer ' + token})

		res = Net::HTTP.start(uri.hostname) do |http|
			http.request(req)
		end

		return JSON.parse(res.body)
	end
end
