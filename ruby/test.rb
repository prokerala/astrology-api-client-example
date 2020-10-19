#!/usr/bin/env ruby

require './client.rb'

client = ApiClient.new('YOUR_CLIENT_ID', 'YOUR_CLIENT_SECRET');

result = client.get('v2/astrology/thirumana-porutham/advanced', {
    :girl_nakshatra => 4,
    :girl_nakshatra_pada => 2,
    :boy_nakshatra => 26,
    :boy_nakshatra_pada => 3
})
puts JSON.pretty_generate(result)

