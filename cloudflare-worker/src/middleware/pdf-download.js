// Middleware to force download of PDF reports by adding
// `Content-Disposition: attachment` header
export default (filename='report.pdf') => {
  return async (request, next) => {
    const response = await next();
    const contentType = response.headers.get('Content-Type') || ''

    // If the response is a PDF, modify the headers to force download
    if (contentType.includes('application/pdf')) {
      const newHeaders = new Headers(response.headers)
      newHeaders.set('Content-Disposition', `attachment; filename="${filename}"`)
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      })
    }

    return response;
  };
};
