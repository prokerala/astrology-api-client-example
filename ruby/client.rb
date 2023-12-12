require 'net/http'
require 'json'

class ApiError < StandardError
end

class AuthenticationError < ApiError
end

class ValidationError < ApiError
	def __init__(code, message, validationMessages)
		self.code = code
		self.message = 'Input data validation failed'
		self.validationMessages = validationMessages
	end

	def getValidationMessages()
		return self.validationMessages
	end
end

class ServerError < ApiError
end

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
		content = response.body
		res = JSON.parse(content)

		if res.key?('access_token')
			return res
		end

		if res['status'] == "error"
			raise ApiError, res['errors'].map {|e| e['detail']}.join("\n")
		end

		if res['status'] != "ok"
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
		token = parseResponse(res)

		saveToken(token)

		return token['access_token']
	end

	def get(endpoint, params)
		# Try to fetch the access token from cache
		token = getTokenFromCache
		# If failed, request new token
		token ||= fetchNewToken

		uri = URI(ApiClient::BASE_URL + endpoint)
		uri.query = serialize(params)

		req = Net::HTTP::Get.new(uri.to_s, {'Authorization' => 'Bearer ' + token})

		res = Net::HTTP.start(uri.hostname) do |http|
			http.request(req)
		end

		return parseResponse(res)
	end

	def serialize(hash, parentKey = nil)
		query_array = []

		hash.each do |key, value|
			if parentKey
				key = "#{parentKey}[#{key}]"
			end

			if value.is_a?(Hash)
				query_array << serialize(value, key)
			elsif value.is_a?(Array)
				value.each do |v|
					query_array << "#{key}[]=#{URI.encode_www_form_component(v)}"
				end
			else
				query_array << "#{key}=#{URI.encode_www_form_component(value)}"
			end
		end

		query_array.join('&')
	end
end
