<?php

namespace Prokerala\Api\Sample\Exception
{
    class ApiError extends \Exception
    {
    }

    class ValidationError extends \InvalidArgumentException
    {
        private $validationMessages;

        public function __construct($message, $code, $validationMessages)
        {
            parent::__construct($message, $code, null);
            $this->validationMessages = $validationMessages;
        }

        public function getValidationMessages()
        {
            return $this->validationMessages;
        }
    }

    class AuthenticationError extends \InvalidArgumentException
    {
    }

    class ServerError extends \RuntimeException
    {
    }
}

namespace Prokerala\Api\Sample {
    class ApiClient
    {
        const BASE_URL = 'https://api.prokerala.com/';

        /**
         * @var string
         */
        private $clientId;
        /**
         * @var string
         */
        private $clientSecret;

        public function __construct($clientId, $clientSecret)
        {
            $this->clientId = $clientId;
            $this->clientSecret = $clientSecret;
        }

        public function get($endpoint, $params)
        {
            // Try to fetch the access token from cache
            $token = $this->getTokenFromCache();
            if (!$token) {
                // If failed, request new token
                $token = $this->fetchNewToken();
            }

            $uri = self::BASE_URL . $endpoint . '?' . http_build_query($params);

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $uri);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                "Authorization: Bearer {$token}",
            ]);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            $response = curl_exec($ch);
            $responseCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
            curl_close($ch); // Close the connection

            return $this->parseResponse($response, $responseCode, $contentType);
        }

        private function saveToken($token)
        {
            // TODO: Cache the token until it expires
        }

        private function getTokenFromCache()
        {
            // TODO: Return cached token, if exists
        }

        private function fetchNewToken()
        {
            $data = [
                'grant_type' => 'client_credentials',
                'client_id' => $this->clientId,
                'client_secret' => $this->clientSecret,
            ];

            $uri = self::BASE_URL . 'token';
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $uri);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
            $response = curl_exec($ch);
            $responseCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
            curl_close($ch);

            $token = $this->parseResponse($response, $responseCode, $contentType);
            $this->saveToken($token);

            return $token->access_token;
        }

        /**
         * Parse API Response.
         *
         * @param string $response     response body
         * @param int    $responseCode HTTP Status code
         * @param string $contentType  response content type
         *
         * @return \stdClass|string
         */
        private function parseResponse($response, $responseCode, $contentType)
        {
            $res = $response;

            if ('application/json' === strtok($contentType, ';')) {
                $res = json_decode($res);
            }

            if (200 === $responseCode) {
                return $res;
            }

            if ('error' !== $res->status) {
                throw new Exception\ApiError('HTTP request failed');
            }

            $errors = $res->errors;

            if (400 === $responseCode) {
                throw new Exception\ValidationError('Validation failed', 400, $errors);
            }

            if (401 === $responseCode) {
                throw new Exception\AuthenticationError($errors[0]->detail, 403);
            }

            if ($responseCode >= 500) {
                throw new Exception\ServerError($errors[0]->detail, $responseCode);
            }

            if ($responseCode === 404) {
                throw new Exception\ServerError($errors[0]->detail, $responseCode);
            }

            throw new Exception\ApiError('Unexpected error');
        }
    }
}
