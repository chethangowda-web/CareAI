const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { run, get } = require("../db");
const { requireAuth, JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email and password are required" });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const emailNorm = String(email).trim().toLowerCase();
    const exists = await get("SELECT id FROM users WHERE email = ?", [emailNorm]);
    if (exists) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hash = await bcrypt.hash(String(password), 10);
    const out = await run(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [String(name).trim(), emailNorm, hash]
    );

    const token = jwt.sign({ userId: out.lastID }, JWT_SECRET, { expiresIn: "7d" });
    return res.status(201).json({
      token,
      user: { id: out.lastID, name: String(name).trim(), email: emailNorm }
    });
  } catch (e) {
    return res.status(500).json({ message: "Failed to register user" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const emailNorm = String(email).trim().toLowerCase();
    const user = await get("SELECT * FROM users WHERE email = ?", [emailNorm]);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(String(password), user.password_hash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (e) {
    return res.status(500).json({ message: "Failed to login" });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  return res.json({ user: req.user });
});

module.exports = router;
