const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      code: "UNAUTHENTICATED",
      message: "Authentication is required.",
      detail: "Provide a valid Bearer token."
    });
  }

  const token = header.substring(7);

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.auth = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      code: "INVALID_TOKEN",
      message: "The supplied authentication token is invalid.",
      detail: "The token may be expired or malformed."
    });
  }
}

function requireRoles(...roles) {
  return function (req, res, next) {
    if (!req.auth || !roles.includes(req.auth.role)) {
      return res.status(403).json({
        code: "FORBIDDEN",
        message: "You are not authorized to perform this operation.",
        detail: "Your role does not permit this action."
      });
    }

    next();
  };
}

module.exports = {
  authenticate,
  requireRoles
};