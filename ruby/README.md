## Ruby client

This is a sample API client written in [Ruby](https://www.ruby-lang.org/) for accessing Prokerala Astrology API.

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

#### Output

```
{
  "status": "ok",
  "data": {
    "nakshatra_details": {
      "nakshatra": {
        "id": 16,
        "name": "Anuradha",
        "lord": {
          "id": 6,
          "name": "Saturn",
          "vedic_name": "Shani"
        },
        "pada": 3
      },
      "chandra_rasi": {
        "id": 7,
        "name": "Vrischika",
        "lord": {
          "id": 4,
          "name": "Mars",
          "vedic_name": "Kuja"
        }
      },
      "soorya_rasi": {
        "id": 6,
        "name": "Tula",
        "lord": {
          "id": 3,
          "name": "Venus",
          "vedic_name": "Shukra"
        }
      },
      "zodiac": {
        "id": 6,
        "name": "Libra"
      },
      "additional_info": {
        "deity": "Mitra",
        "ganam": "Deva",
        "symbol": "Lotus",
        "animal_sign": "Deer",
        "nadi": "Pitta",
        "color": "Reddish Brown",
        "best_direction": "South",
        "syllables": "Na, Ne, Nu, Ne",
        "birth_stone": "Blue Sapphire",
        "gender": "female",
        "planet": "sani",
        "enemy_yoni": "Dog"
      }
    },
    "mangal_dosha": {
      "has_dosha": true,
      "description": "The person is Manglik. Mars is positioned in the 12th house, it is mild Manglik Dosha"
    },
    "yoga_details": [
      {
        "name": "Major Yogas",
        "description": "Your kundli have 3 major yogas."
      },
      {
        "name": "Chandra Yogas",
        "description": "Your kundli have 4 chandra yogas."
      },
      {
        "name": "Soorya Yogas",
        "description": "Your kundli does not have any soorya yoga."
      },
      {
        "name": "Inauspicious Yogas",
        "description": "Your kundli have 3 inauspicious yogas."
      }
    ]
  }
}
```

### [Kaal Sarp Dosha](https://api.prokerala.com/docs#operation/get-kaal-sarp-dosha)

```ruby
require './client.rb'

client = ApiClient.new('YOUR_CLIENT_ID', 'YOUR_CLIENT_SECRET');

result = client.get('v2/astrology/kaal-sarp-dosha', {
    :ayanamsa => 1,
    :coordinates => '23.1765,75.7885',
    :datetime => '2020-10-19T12:31:14+00:00'
})
puts JSON.pretty_generate(result)
```

#### Output

```ruby
{
  "status": "ok",
  "data": {
    "type": null,
    "dosha_type": null,
    "has_dosha": false,
    "description": "You do not have Kaal Sarp dosha."
  }
}
```

### [Mangal Dosha](https://api.prokerala.com/docs#operation/get-mangal-dosha)

```ruby
require './client.rb'

client = ApiClient.new('YOUR_CLIENT_ID', 'YOUR_CLIENT_SECRET');

result = client.get('v2/astrology/kaal-sarp-dosha', {
    :ayanamsa => 1,
    :coordinates => '23.1765,75.7885',
    :datetime => '2020-10-19T12:31:14+00:00'
})
puts JSON.pretty_generate(result)
```

#### Output

```
{
  "status": "ok",
  "data": {
    "has_dosha": true,
    "description": "The person is Manglik. Mars is positioned in the 8th house, it is strong Manglik Dosha",
    "has_exception": true,
    "type": "Strong",
    "exceptions": [
      "Benefic Jupiter occupies the Ascendant."
    ],
    "remedies": [
      "It is considered that if a manglik person marries to another manglik person then the manglik dosha gets cancelled and has no effect.",
      "Worship Lord Hanuman by reciting Hanuman Chalisa daily & visit the temple of Lord Hanuman on Tuesdays.",
      "The ill effects of Manglik Dosha can be cancelled by performing a \"Kumbh Vivah\" in which the manglik marries a banana tree, a peepal tree, or a statue of God Vishnu before the actual wedding.",
      "The ill effects of Manglik Dosha can be reduced with the application of Special Pooja, Mantras, Gemstones and Charities.",
      "Donate blood on a Tuesday in every three months, if health permits.",
      "Feed birds with something sweet.",
      "Worship banyan tree with milk mixed with something sweet.",
      "Start a fast in a rising moon period on a Tuesday."
    ]
  }
}
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
```

#### Output
```
{
  "status": "ok",
  "data": {
    "girl_info": {
      "koot": {
        "varna": "Shudra",
        "vasya": "Manava",
        "tara": "Janma",
        "yoni": "Vyagrah",
        "graha_maitri": "Venus",
        "gana": "Rakshasa",
        "bhakoot": "Tula",
        "nadi": "Antya"
      },
      "nakshatra": {
        "id": 15,
        "name": "Vishaka",
        "lord": {
          "id": 5,
          "name": "Jupiter",
          "vedic_name": "Guru"
        },
        "pada": 2
      },
      "rasi": {
        "id": 6,
        "name": "Tula",
        "lord": {
          "id": 3,
          "name": "Venus",
          "vedic_name": "Shukra"
        }
      }
    },
    "boy_info": {
      "koot": {
        "varna": "Brahmin",
        "vasya": "Keeta",
        "tara": "Janma",
        "yoni": "Vyagrah",
        "graha_maitri": "Mars",
        "gana": "Rakshasa",
        "bhakoot": "Vrischika",
        "nadi": "Antya"
      },
      "nakshatra": {
        "id": 15,
        "name": "Vishaka",
        "lord": {
          "id": 5,
          "name": "Jupiter",
          "vedic_name": "Guru"
        },
        "pada": 4
      },
      "rasi": {
        "id": 7,
        "name": "Vrischika",
        "lord": {
          "id": 4,
          "name": "Mars",
          "vedic_name": "Kuja"
        }
      }
    },
    "message": {
      "type": "bad",
      "description": "Union is not recommended due to the presence of Nadi Maha Dosha. Since Nadi Kuta is given supreme priority during match making. There is a slight difference in the Mangal Dosha compatibility of both the horoscopes. Please consult an astrologer before proceeding to marriage."
    },
    "guna_milan": {
      "total_points": 18.0,
      "maximum_points": 36.0
    }
  }
}
```

### [Thirumana Porutham](https://api.prokerala.com/docs#operation/get-thirumana-porutham-advanced)

```ruby
require './client.rb'

client = ApiClient.new('YOUR_CLIENT_ID', 'YOUR_CLIENT_SECRET');

result = client.get('v2/astrology/thirumana-porutham/advanced', {
    :girl_nakshatra => 4,
    :girl_nakshatra_pada => 2,
    :boy_nakshatra => 26,
    :boy_nakshatra_pada => 3
})
puts JSON.pretty_generate(result)
```

#### Output

```
{
  "status": "ok",
  "data": {
    "maximum_points": 12.0,
    "obtained_points": 9.0,
    "message": {
      "type": null,
      "description": "Matching between boy and girl is 9/12"
    },
    "matches": [
      {
        "id": 1,
        "name": "Dina Porutham",
        "has_porutham": false,
        "porutham_status": null,
        "points": 0.0,
        "description": "Their match is deemed to be 'unsuccessful' or 'Athamam' since on counting from birth star of girl to boy – the result shows 23 and that is a bad sign."
      },
      {
        "id": 2,
        "name": "Gana Porutham",
        "has_porutham": true,
        "porutham_status": null,
        "points": 1.0,
        "description": "The girl and boy stars come under the Deva Ganam. It clearly shows that they will be affectionate and good natured to each other and that is why match is 'Uthamam'."
      },
      {
        "id": 3,
        "name": "Mahendra Porutham",
        "has_porutham": false,
        "porutham_status": null,
        "points": 0.0,
        "description": "This relationship can be declared as an 'Athamam' relationship as on counting the birth star of girl to boy, it can come to the number 23 - which shows that here both will find it difficult to enjoy a smooth relation."
      },
      {
        "id": 4,
        "name": "Stree Deergha Porutham",
        "has_porutham": true,
        "porutham_status": null,
        "points": 1.0,
        "description": "This relationship can be declared as an 'Uthamam' relationship as on counting the birth star of girl to boy, it can come to the number 23- which shows a safe and happy marriage."
      },
      {
        "id": 5,
        "name": "Yoni Porutham",
        "has_porutham": true,
        "porutham_status": null,
        "points": 1.0,
        "description": "The animal in the matching horoscopes are not enemies, So the match is recommended."
      },
      {
        "id": 6,
        "name": "Veda Porutham",
        "has_porutham": true,
        "porutham_status": null,
        "points": 1.0,
        "description": "For the couples where the birth stars do not have vedha, there is a satisfactory match in their birth stars."
      },
      {
        "id": 7,
        "name": "Rajju Porutham",
        "has_porutham": true,
        "porutham_status": null,
        "points": 1.0,
        "description": "As per the stars, both belong to different Rajju, and therefore this can be selected as a perfect match."
      },
      {
        "id": 8,
        "name": "Rasi Porutham",
        "has_porutham": true,
        "porutham_status": null,
        "points": 1.0,
        "description": "This match is recommended and can be called as 'Uthamam' because on counting the stars from the girl to the boy's rasi – it can be calculated to 11, which shows this to be a very good relationship."
      },
      {
        "id": 9,
        "name": "Rasi Lord Porutham",
        "has_porutham": true,
        "porutham_status": null,
        "points": 1.0,
        "description": "Since the Ruling Gods of the boy and the girl happens to be neutral, then their match is said to be acceptable."
      },
      {
        "id": 10,
        "name": "Vashya Porutham",
        "has_porutham": false,
        "porutham_status": null,
        "points": 0.0,
        "description": "This is an Athamam relationship since the girl's rasi is not at all compatible to the boy's vasya or even in the opposite manner. Hence this will not be a peaceful relationship."
      },
      {
        "id": 11,
        "name": "Nadi Porutham",
        "has_porutham": true,
        "porutham_status": null,
        "points": 1.0,
        "description": "Here, since both the boy and the girl, belong to varied Nadi, it can be deemed as a good match."
      },
      {
        "id": 12,
        "name": "Varna Porutham",
        "has_porutham": true,
        "porutham_status": null,
        "points": 1.0,
        "description": "The boy’s varna is higher than that of the girl, so this match is deemed to be a good one."
      }
    ]
  }
}
```

