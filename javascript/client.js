const https = require('https')

const BASE_URL = 'https://api.prokerala.com/';

class ApiError extends Error
{
    constructor(message, code = 0)
    {
        super(message);
        this.code = code
    }
}

class ValidationError extends ApiError
{
    constructor(message, code, validationMessages)
    {
        super(message, code);
        this.validationMessages = validationMessages;
    }

    getValidationMessages()
    {
        return this.validationMessages;
    }

    getCode()
    {
        return this.code;
    }
}

class AuthenticationError extends ApiError
{
}

class ServerError extends ApiError
{
}

class ApiClient
{
    constructor(clientId, clientSecret)
    {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    async get(endpoint, params)
    {
        // Try to fetch the access token from cache
        let token = await this.getTokenFromCache();
        if (!token) {
            // If failed, request new token
            token = await this.fetchNewToken();
        }

        const uri = new URL(endpoint, BASE_URL);
        uri.search = new URLSearchParams(params);

        const headers = {
            'Authorization': `Bearer ${token}`
        };

        return await this.request(uri, headers);
    }

    async request(uri, headers = {}, body = null) {
        const isGet = null === body;

        if (!isGet) {
            headers['Content-Length'] = body.length;
        }

        return new Promise((resolve, reject) => {
            const options = {
                method: isGet ? 'GET' : 'POST',
                headers: headers,
            };

            const req = https.request(uri, options, res => {
              let resBody = '';

              res.on('data', chunk =>  resBody += chunk)

              res.on('end', () => {
                  const resCode = res.statusCode;
                  const contentType = res.headers['content-type'];

                  let response = this.parseResponse(resBody, resCode, contentType);
                  resolve(response);
              })
            })

            req.on('error', error => reject(error));

            if (!isGet) {
                req.write(body);
            }

            req.end();
        });
    }

    async saveToken(token)
    {
        // TODO: Cache the token until it expires
    }

    async getTokenFromCache()
    {
        // TODO: Return cached token, if exists
    }

    async fetchNewToken()
    {
        const params = {
            'grant_type': 'client_credentials',
            'client_id': this.clientId,
            'client_secret': this.clientSecret,
        };

        const uri = new URL('token', BASE_URL);
        const postBody = (new URLSearchParams(params)).toString();

        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        };

        const token = await this.request(uri, headers, postBody);
        await this.saveToken(token);

        return token.access_token
    }

    /**
     * Parse API Response.
     *
     * @param string response     response body
     * @param int    responseCode HTTP Status code
     * @param string contentType  response content type
     *
     * @return \stdClass|string
     */
    parseResponse(response, responseCode, contentType)
    {
        let res = response;

        if ('application/json' === contentType.split(';')[0]) {
            res = JSON.parse(res);
        }

        if (200 === responseCode) {
            return res;
        }

        if ('error' !== res.status) {
            throw new ApiError('HTTP request failed');
        }

        const errors = res.errors;

        if (400 === responseCode) {
            throw new ValidationError('Validation failed', 400, errors);
        }

        if (401 === responseCode) {
            throw new AuthenticationError(errors[0].detail, 403);
        }

        if (responseCode >= 500) {
            throw new ServerError(errors[0].detail, responseCode);
        }

        throw new ApiError('Unexpected error');
    }
}

module.exports = {
    ApiClient: ApiClient,
    ApiError: ApiError,
    ValidationError: ValidationError,
    AuthenticationError: AuthenticationError,
    ServerError: ServerError,
}
