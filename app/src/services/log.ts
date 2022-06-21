import morgan from "morgan";

morgan.token("status-name", (_req, res) => {
  switch (res.statusCode) {
    case 200:
      return "OK";
    case 404:
      return "Not Found";
    case 301:
      return "Moved Permanently";
    case 401:
      return "Forbidden";
    case 500:
      return "Internal Server Error";
    case 503:
      return "Service Unavailable";
  }
});

export default morgan;
