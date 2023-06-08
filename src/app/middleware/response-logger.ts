import { IncomingMessage, ServerResponse } from "http";
import chalk from "chalk";
import { StatusCodes, getReasonPhrase, getStatusCode } from "http-status-codes";
import { TokenIndexer, token } from "morgan";

function statusText(status: { code: string; reason: string; format: string }) {
  const errorCodes = [
    StatusCodes.BAD_REQUEST,
    StatusCodes.UNAUTHORIZED,
    StatusCodes.FORBIDDEN,
    StatusCodes.NOT_FOUND,
    StatusCodes.INTERNAL_SERVER_ERROR
  ].map((code) => code.toString());

  const format = status.format;

  if (
    errorCodes.includes(status.code) ||
    errorCodes.includes(getStatusCode(status.reason).toString())
  ) {
    return chalk.bold.red(format);
  }

  return chalk.bold.green(format);
}

const colorLogging = (
  tokens: TokenIndexer<IncomingMessage, ServerResponse>,
  req: IncomingMessage,
  res: ServerResponse
) => {
  const date = `[${chalk.gray(tokens.date(req, res))}]`;
  const method = chalk.hex("#663b8c").bold(tokens.method(req, res));
  const url = chalk.bold.hex("#6e6e6e")(tokens.url(req, res));
  const status = statusText({
    code: tokens.status(req, res),
    reason: tokens["status-reason"](req, res),
    format: `${tokens.status(req, res)} ${tokens["status-reason"](req, res)}`
  });
  const responseTime = chalk.blue(`(${tokens["response-time"](req, res)} ms)`);
  return chalk.bgBlack([date, method, url, status, responseTime].join(" "));
};

const loggerMiddleware = token("status-reason", (_req, res) => getReasonPhrase(res.statusCode))(
  colorLogging
);

export default loggerMiddleware;
