import ApiError from '../error';

// A simple validator to restrict the allowed API Endpoints
export default (endpoints) => {
  return (request, next) => {
    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\/+/g, '/');
    const urlMatches = (prefix) => prefix instanceof RegExp ? prefix.test(pathname) : (pathname === prefix);

    if (!endpoints.some(urlMatches)) {
      throw new ApiError(
        'Proxy Error',
        `Endpoint denied by proxy configuration. Whitelist the path '${pathname}' in endpoint validator configuration to allow the request.`,
        403
      );
    }

    return next();
  };
};
