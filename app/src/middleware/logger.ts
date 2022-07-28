import morgan from 'morgan';

export default morgan.token('status-name', (_req, res) => {
  switch (res.statusCode) {
    case 200:
      return 'OK';
    case 304:
      return 'Not Modified';
    case 401:
      return 'Forbidden';
    case 404:
      return 'Not Found';
    case 500:
      return 'Internal Server Error';
    case 503:
      return 'Service Unavailable';
  }
})('[:date[web]] - [:method] :url (:status :status-name) [:response-time ms]');
