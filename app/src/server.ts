import Express from "express";
import requestRateLimiter from "./middleware/request-rate-limiter";
import loggerMiddleware from "./middleware/response-logger";
import cors from "./middleware/cors";
import helmet from "helmet";
import ApiRouter from "./routes/api-router-configuration";

const app = Express();

// Configure basic express middleware
app.use(Express.json()).use(Express.urlencoded({ extended: true }));

// Set up custom middleware
app.use(cors, requestRateLimiter, loggerMiddleware, helmet());

// Add API router
app.use(ApiRouter);

export default app;
