import { rateLimit } from "express-rate-limit";

export default rateLimit({
  max: 10000,
  message: "Request limited exceeded.",
  standardHeaders: true,
  legacyHeaders: false
});
