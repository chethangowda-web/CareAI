const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { all, getNearest, run } = require("../db");

const router = express.Router();

router.post("/submit", requireAuth, async (req, res) => {
  try {
    const { preferredLanguage, problem, bodyTemperature, intensity, lat, lng } = req.body || {};
    if (!preferredLanguage || !problem || !Number.isFinite(Number(bodyTemperature)) || !Number.isFinite(Number(intensity))) {
      return res.status(400).json({ message: "preferredLanguage, problem, bodyTemperature and intensity are required" });
    }
    if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) {
      return res.status(400).json({ message: "Valid latitude and longitude are required" });
    }

    const temperature = Number(bodyTemperature);
    if (temperature < 30 || temperature > 45) {
      return res.status(400).json({ message: "Body temperature must be between 30 and 45 °C" });
    }

    const value = Number(intensity);
    if (value < 1 || value > 10) {
      return res.status(400).json({ message: "Intensity must be from 1 to 10" });
    }

    const userLat = Number(lat);
    const userLng = Number(lng);
    const severity = value >= 9 ? "Emergency" : value > 5 ? "Severe" : "Normal";
    const feverNote =
      temperature >= 38
        ? " High body temperature detected, monitor for fever-related escalation."
        : "";

    await run(
      "INSERT INTO triage_cases (user_id, problem, body_temperature, intensity, severity, user_lat, user_lng) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [req.user.id, String(problem).trim(), temperature, value, severity, userLat, userLng]
    );

    if (severity === "Normal") {
      const medicines = await all("SELECT id, name, usage, dosage FROM medicines ORDER BY id ASC");
      return res.json({
        severity,
        preferredLanguage: String(preferredLanguage).trim(),
        bodyTemperature: temperature,
        advice: `Normal issue detected. Tablets only are suggested. If symptoms worsen, consult a doctor.${feverNote}`,
        medicines,
        doctors: [],
        hospitals: [],
        ambulances: []
      });
    }

    if (severity === "Severe") {
      const doctors = await getNearest("doctors", userLat, userLng, 5);
      const hospitals = await getNearest("hospitals", userLat, userLng, 5);
      return res.json({
        severity,
        preferredLanguage: String(preferredLanguage).trim(),
        bodyTemperature: temperature,
        advice: `Severe issue detected. Doctor consultation is recommended.${feverNote}`,
        medicines: [],
        doctors,
        hospitals,
        ambulances: []
      });
    }

    const ambulances = await getNearest("ambulances", userLat, userLng, 3);
    const hospitals = await getNearest("hospitals", userLat, userLng, 3);
    return res.json({
      severity,
      preferredLanguage: String(preferredLanguage).trim(),
      bodyTemperature: temperature,
      advice: `Emergency detected. Call ambulance immediately and proceed to nearest hospital.${feverNote}`,
      emergencyNumbers: ["108", "112"],
      medicines: [],
      doctors: [],
      hospitals,
      ambulances
    });
  } catch (e) {
    return res.status(500).json({ message: "Failed to process triage request" });
  }
});

module.exports = router;
