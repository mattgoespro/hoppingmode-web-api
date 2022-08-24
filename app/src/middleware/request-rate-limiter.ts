import rateLimit from "express-rate-limit";

export default rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hrs in milliseconds
  max: 10000,
  message: "Request limited exceeded.",
  standardHeaders: true,
  legacyHeaders: false,
});