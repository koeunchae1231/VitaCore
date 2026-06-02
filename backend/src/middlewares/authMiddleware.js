// backend/src/middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET이 설정되지 않았습니다.");
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({
      message: "토큰이 없습니다.",
    });
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      message: "토큰 형식이 올바르지 않습니다.",
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        message: "유효하지 않은 토큰입니다.",
      });
    }

    req.user = decoded;
    next();
  });
}

module.exports = authenticateToken;
