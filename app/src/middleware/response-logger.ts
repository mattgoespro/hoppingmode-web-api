import { getReasonPhrase } from "http-status-codes";
import morgan from "morgan";

export default morgan.token("status-name", (_req, res) => getReasonPhrase(res.statusCode))(
  "[:date[web]] - [:method] :url (:status :status-name) [:response-time ms]"
);
