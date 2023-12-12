#!/usr/bin/env ruby

require './client.rb'

client = ApiClient.new('YOUR_CLIENT_ID', 'YOUR_CLIENT_SECRET');

result = client.get('v2/astrology/natal-planet-position', {
	:profile => {
		:datetime => '2020-10-19T12:31:14+00:00',
		:coordinates => '23.17,75.78',
	},
	:house_system => 'regiomontanus',
	:orb => 'default',
	:birth_time_rectification => 'flat-chart',
})
puts JSON.pretty_generate(result)

