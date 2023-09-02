import { IncomingMessage, ServerResponse } from "http";
import { getReasonPhrase } from "http-status-codes";
import morgan from "morgan";

function getReasonIfErrorCode(code: number) {
  if (code >= 400 && code < 600) {
    return getReasonPhrase(code);
  }

  return null;
}

const logger = (
  tokens: morgan.TokenIndexer<IncomingMessage, ServerResponse>,
  req: IncomingMessage,
  res: ServerResponse
) => {
  const date = tokens.date(req, res);
  const method = tokens.method(req, res);
  const url = tokens.url(req, res);
  const statusCode = tokens.status(req, res);
  const responseTime = `(${tokens["response-time"](req, res)} ms)`;
  const logText = [`[${date}]`, method, url, statusCode];
  const errorReason = tokens["status-reason"](req, res);

  if (errorReason != null) {
    logText.push(`(${errorReason})`);
  }

  logText.push(responseTime);
  return logText.join(" ");
};

// eslint-disable-next-line import/no-named-as-default-member
const loggerMiddleware = morgan.token("status-reason", (_req, res) =>
  getReasonIfErrorCode(res.statusCode)
)(logger);

export default loggerMiddleware;
