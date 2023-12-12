<?php

use Prokerala\Api\Sample\Exception\ValidationError;

include __DIR__ . '/client.php';

$client = new Prokerala\Api\Sample\ApiClient('YOUR_CLIENT_ID', 'YOUR_CLIENT_SECRET');

try {
    $data = $client->get('v2/astrology/natal-planet-position', [
        'profile' => [
            'datetime' => '2020-10-19T12:31:14+00:00',
            'coordinates' => '23.17,75.78',
        ],
	'house_system' => 'regiomontanus',
	'orb' => 'default',
	'birth_time_rectification' => 'flat-chart',
    ]);
    print_r($data);
} catch (ValidationError $error) {
    print_r($error->getValidationMessages());
} catch (\Exception $error) {
    print_r($error->getMessage());
}

