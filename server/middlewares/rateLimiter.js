/*
 * In-Memory Sliding Window Rate Limiter Middleware
 * Protects sensitive endpoints (LiveKit token generation, login/auth) from abuse.
 */

const createRateLimiter = (options = {}) => {
  const windowMs = options.windowMs || 60 * 1000; // Default 1 minute
  const max = options.max || 30; // Default 30 requests per window
  const message = options.message || "Too many requests, please try again later.";
  const keyGenerator =
    options.keyGenerator ||
    ((req) => {
      // Use user ID if authenticated or fallback to client IP
      return (
        (req.user && req.user._id ? req.user._id.toString() : null) ||
        req.ip ||
        req.headers["x-forwarded-for"] ||
        req.socket.remoteAddress ||
        "global"
      );
    });

  const hits = new Map();

  // Periodic cleanup of stale entries every 5 minutes
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of hits.entries()) {
      if (now - record.resetTime > 0) {
        hits.delete(key);
      }
    }
  }, Math.max(windowMs, 60000));

  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  const rateLimiterMiddleware = (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();

    let record = hits.get(key);
    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs };
      hits.set(key, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, max - record.count);
    const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);

    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", Math.ceil(record.resetTime / 1000));

    if (record.count > max) {
      res.setHeader("Retry-After", retryAfterSeconds);
      return res.status(429).json({
        success: false,
        message,
        retryAfterSeconds,
      });
    }

    next();
  };

  // Provide reset method for testing
  rateLimiterMiddleware.reset = () => {
    hits.clear();
  };

  return rateLimiterMiddleware;
};

module.exports = {
  createRateLimiter,
};
