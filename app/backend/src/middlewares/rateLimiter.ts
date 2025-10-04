import rateLimit from "express-rate-limit";

export default rateLimit({
  windowMs: 10 * 1000,
  max: 5,
  message: "Rate Limit Exceeded. Please try again later.",
});
