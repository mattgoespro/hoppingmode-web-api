import express from "express";
import requestRateLimiter from "./middleware/request-rate-limiter";
import logger from "./middleware/response-logger";
import cors from "./middleware/cors";
import helmet from "helmet";
import ApiRouter from "./routes/api";

const app = express();

// Configure basic express settings
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up middleware
app.use(cors, requestRateLimiter, logger, helmet());

// Add APIs
app.use(ApiRouter);

export default app;
