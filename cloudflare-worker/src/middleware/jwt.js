import jwt from '@tsndr/cloudflare-worker-jwt';
import ApiError from '../error';

export default (secretOrPublicKey, claimsValidator = null) => {
  return async (request, next, ctx, env) => {
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
      ctx.jwtPayload = payload; // Save for later middlewares.
      if (claimsValidator) {
        await claimsValidator(payload);
      }
    } catch (e) {
      console.error(e);
      throw new ApiError('Proxy Error', 'Failed to decode JWT payload', 401);
    }

    return next();
  };
};
