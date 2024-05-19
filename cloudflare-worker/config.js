import rateLimitValidator from './src/middleware/ratelimit';
import jwtValidator from './src/middleware/jwt';
import endpointValidator from './src/middleware/endpoint';

export default {
  middlewares: [
    rateLimitValidator([
      // Set your desired per user rate limits and durations
      { duration: 60, limit: 100 }, // 100 requests per minute
      { duration: 600, limit: 500 }, // 500 requests per 10 minutes
      { duration: 3600, limit: 1000 }, // 1000 requests per hour
    ]),
    // // Restrict the API endpoints to those used by your application
    endpointValidator([
      '/v2/astrology/panchang',
      '/v2/astrology/kundli',
      '/v2/numerology/life-path-number',
      '/v2/astrology/kundli-matching/advanced',
    ]),
    // jwtValidator(PUBLIC_KEY),
    // Validate the request with a JWT token passed via Bearer authentication
    // Claims will be passed to the optional callback function specified as
    // second argument for additional validation
  ],
};
