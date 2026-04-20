const jwt = require("jsonwebtoken");
const { get } = require("../db");

const JWT_SECRET = process.env.JWT_SECRET || "careai-dev-secret";

async function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) {
      return res.status(401).json({ message: "Missing token" });
    }

    const payload = jwt.verify(token, JWT_SECRET);
    const user = await get("SELECT id, name, email FROM users WHERE id = ?", [payload.userId]);
    if (!user) {
      return res.status(401).json({ message: "Invalid user" });
    }
    req.user = user;
    return next();
  } catch (e) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

module.exports = { requireAuth, JWT_SECRET };
