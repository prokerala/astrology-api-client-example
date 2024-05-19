import ApiError from '../error';
import jwt from '@tsndr/cloudflare-worker-jwt';

export default (secretOrPublicKey, claimsValidator = null) => {
  return async (request) => {
    const header = request.headers.get('Authorization') || '';
    if (!header.startsWith('Bearer ')) {
      throw new ApiError('Proxy Error', 'Missing or invalid Authorization header', 401);
    }
    const token = header.substring(7);

    const isValid = await jwt.verify(token, secretOrPublicKey);
    if (!isValid) {
      throw new ApiError('Proxy Error', 'The provided signed token is invalid', 401);
    }

    try {
      const { payload } = jwt.decode(token);
      if (claimsValidator) {
        return await claimsValidator(payload);
      }

      return null;
    } catch (e) {
      console.error(e);
      throw new ApiError('Proxy Error', 'Failed to decode payload from JWT', 401);
    }
  };
};
