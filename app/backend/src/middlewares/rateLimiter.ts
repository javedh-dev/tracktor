import rateLimit from "express-rate-limit";

export default rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  message: "Rate Limit Exceeded. Please try again later.",
});
