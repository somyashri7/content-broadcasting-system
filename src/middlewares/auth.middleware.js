const { verifyToken } = require("../utils/jwt");
const { error }       = require("../utils/response");

// Verify JWT and attach user to req
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return error(res, "No token provided", 401);
    }
    const token = authHeader.split(" ")[1];
    req.user = verifyToken(token);
    next();
  } catch (err) {
    return error(res, "Invalid or expired token", 401);
  }
};

// Role-based access control factory
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return error(res, `Access denied. Required role: ${roles.join(" or ")}`, 403);
  }
  next();
};

module.exports = { authenticate, authorize };
