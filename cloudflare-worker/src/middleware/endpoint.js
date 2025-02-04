import ApiError from '../error';

// A simple validator to restrict the allowed API Endpoints
export default (endpoints) => {
  return (request, next) => {
    const url = new URL(request.url);
    if (!endpoints.includes(url.pathname)) {
      throw new ApiError(
        'Proxy Error',
        `Endpoint denied by proxy configuration. Whitelist the path '${url.pathname}' in endpoint validator configuration to allow the request.`,
        403
      );
    }

    return next();
  };
};
