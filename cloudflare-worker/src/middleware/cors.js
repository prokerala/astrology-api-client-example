// Middleware to enable CORS
export default (allowedOrigins = ['*']) => {
  return async (request, next) => {

    const origin = request.headers.get('origin');
    const response = await next();

    if (!allowedOrigins.includes('*') && !allowedOrigins.includes(origin)) {
      return response;
    }

    const newHeaders = new Headers(response.headers)
    newHeaders.set('Access-Control-Allow-Origin', origin);

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    })
  };
};
