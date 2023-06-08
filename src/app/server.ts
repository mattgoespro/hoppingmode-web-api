import express, { json, urlencoded } from "express";
import helmet from "helmet";
import cors from "./middleware/cors";
import requestRateLimiter from "./middleware/request-rate-limiter";
import loggerMiddleware from "./middleware/response-logger";
import ApiRouter from "./server-config";

const app = express();

// Configure basic express middleware
app.use(json()).use(urlencoded({ extended: true }));

// Set up custom middleware
app.use(cors, requestRateLimiter, loggerMiddleware, helmet());

// Add API router
app.use(ApiRouter);

export default app;
