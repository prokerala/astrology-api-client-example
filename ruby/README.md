## Ruby client

This is a sample code for a very basic API client in [Ruby](https://www.ruby-lang.org/) for accessing Prokerala Astrology API.

## Usage

You can find your `clientId` and `clientSecret` in your [dashboard](https://api.prokerala.com/account/client)


### [Kundli](https://api.prokerala.com/docs#operation/get-kundli)

```ruby
require './client.rb'

client = ApiClient.new('YOUR_CLIENT_ID', 'YOUR_CLIENT_SECRET');

result = client.get('v2/astrology/kundli', {
    :ayanamsa => 1,
    :coordinates => '23.1765,75.7885',
    :datetime => '2020-10-19T12:31:14+00:00'
})
puts JSON.pretty_generate(result)
```

### [Kundli Matching](https://api.prokerala.com/docs#operation/get-kundli-matching)

```ruby
require './client.rb'

client = ApiClient.new('YOUR_CLIENT_ID', 'YOUR_CLIENT_SECRET');

result = client.get('v2/astrology/kundli-matching', {
    :ayanamsa => 1,
    :girl_coordinates => '23.1765,75.7885',
    :boy_coordinates => '23.1765,75.7885',
    :girl_dob => '2000-02-25T12:30:00+00:00',
    :boy_dob => '1995-01-25T18:30:00+00:00'
})
puts JSON.pretty_generate(result)
