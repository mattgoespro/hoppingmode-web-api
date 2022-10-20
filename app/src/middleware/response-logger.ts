import morgan from "morgan";

export default morgan.token("status-name", (_req, res) => {
  switch (res.statusCode) {
    case 200:
    case 304:
      return "OK";
    case 400:
      return "Bad Request";
    case 401:
      return "Unauthorized";
    case 403:
      return "Forbidden";
    case 404:
      return "Not Found";
    case 500:
      return "Internal Server Error";
    case 503:
      return "Service Unavailable";
    default:
      return "UNKNOWN_RESPONSE";
  }
})("[:date[web]] - [:method] :url (:status :status-name) [:response-time ms]");
