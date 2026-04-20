require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const { createClient } = require("@supabase/supabase-js");
const path = require("path");
const { initDb } = require("./db");

const chatRoute = require("./routes/chat");
const authRoute = require("./routes/auth");
const triageRoute = require("./routes/triage");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

// In-memory session store (simple + hackathon-ready)
app.locals.sessionStore = Object.create(null);
app.locals.createEphemeralSessionId = () => `ephemeral_${uuidv4()}`;

// Optional Supabase (no DB complexity required)
// If SUPABASE_URL and SUPABASE_ANON_KEY are set, we will log chat events.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
app.locals.supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/chat", chatRoute);
app.use("/api/auth", authRoute);
app.use("/api/triage", triageRoute);
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = 5000;
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`CareAI backend running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err.message);
    process.exit(1);
  });

