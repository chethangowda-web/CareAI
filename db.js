const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const DB_PATH = path.join(__dirname, "careai.db");
const db = new sqlite3.Database(DB_PATH);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function initDb() {
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS medicines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      usage TEXT NOT NULL,
      dosage TEXT NOT NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS doctors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      specialization TEXT NOT NULL,
      phone TEXT NOT NULL,
      hospital TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS hospitals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      contact TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS ambulances (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS triage_cases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      problem TEXT NOT NULL,
      body_temperature REAL NOT NULL DEFAULT 0,
      intensity INTEGER NOT NULL,
      severity TEXT NOT NULL,
      user_lat REAL NOT NULL,
      user_lng REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  const triageColumns = await all("PRAGMA table_info(triage_cases)");
  const hasBodyTemperature = triageColumns.some((c) => c.name === "body_temperature");
  if (!hasBodyTemperature) {
    await run("ALTER TABLE triage_cases ADD COLUMN body_temperature REAL NOT NULL DEFAULT 0");
  }

  const medCount = await get("SELECT COUNT(*) as count FROM medicines");
  if (!medCount || medCount.count === 0) {
    const meds = [
      ["Paracetamol 500mg", "Fever and mild pain relief", "1 tablet after food, max 3/day"],
      ["Cetirizine 10mg", "Allergy and cold symptoms", "1 tablet at night"],
      ["Pantoprazole 40mg", "Acidity and gastritis", "1 tablet before breakfast"],
      ["ORS", "Dehydration support", "Sip as needed through the day"],
      ["Ibuprofen 400mg", "Body pain and inflammation", "1 tablet after food if needed"]
    ];
    for (const m of meds) {
      await run("INSERT INTO medicines (name, usage, dosage) VALUES (?, ?, ?)", m);
    }
  }

  const doctorCount = await get("SELECT COUNT(*) as count FROM doctors");
  if (!doctorCount || doctorCount.count === 0) {
    const doctors = [
      ["Dr. Priya Sharma", "General Physician", "9876500011", "City Care Hospital", 12.9716, 77.5946],
      ["Dr. Arun Nair", "Internal Medicine", "9876500012", "Green Valley Hospital", 12.9616, 77.5846],
      ["Dr. Kavya Reddy", "Pulmonologist", "9876500013", "Metro Multispeciality", 12.9816, 77.6046],
      ["Dr. Rahul Mehta", "Cardiologist", "9876500014", "Heartline Hospital", 12.9916, 77.6146],
      ["Dr. Sneha Patil", "Emergency Medicine", "9876500015", "Lifeline Medical Center", 12.9516, 77.5746]
    ];
    for (const d of doctors) {
      await run(
        "INSERT INTO doctors (name, specialization, phone, hospital, lat, lng) VALUES (?, ?, ?, ?, ?, ?)",
        d
      );
    }
  }

  const hospitalCount = await get("SELECT COUNT(*) as count FROM hospitals");
  if (!hospitalCount || hospitalCount.count === 0) {
    const hospitals = [
      ["City Care Hospital", "MG Road, Bengaluru", "080-40001111", 12.9716, 77.5946],
      ["Green Valley Hospital", "Indiranagar, Bengaluru", "080-40002222", 12.9616, 77.5846],
      ["Metro Multispeciality", "Koramangala, Bengaluru", "080-40003333", 12.9816, 77.6046],
      ["Heartline Hospital", "Hebbal, Bengaluru", "080-40004444", 12.9916, 77.6146],
      ["Lifeline Medical Center", "Jayanagar, Bengaluru", "080-40005555", 12.9516, 77.5746]
    ];
    for (const h of hospitals) {
      await run("INSERT INTO hospitals (name, address, contact, lat, lng) VALUES (?, ?, ?, ?, ?)", h);
    }
  }

  const ambulanceCount = await get("SELECT COUNT(*) as count FROM ambulances");
  if (!ambulanceCount || ambulanceCount.count === 0) {
    const ambulances = [
      ["Rapid Response Ambulance", "9000011111", 12.9720, 77.5920],
      ["LifeSaver Emergency", "9000011112", 12.9620, 77.5820],
      ["24x7 MedTransport", "9000011113", 12.9820, 77.6020]
    ];
    for (const a of ambulances) {
      await run("INSERT INTO ambulances (service_name, phone, lat, lng) VALUES (?, ?, ?, ?)", a);
    }
  }
}

async function getNearest(table, lat, lng, limit) {
  const rows = await all(`SELECT * FROM ${table}`);
  return rows
    .map((r) => ({
      ...r,
      distance_km: Number(haversineKm(lat, lng, Number(r.lat), Number(r.lng)).toFixed(2))
    }))
    .sort((a, b) => a.distance_km - b.distance_km)
    .slice(0, limit);
}

module.exports = { db, run, get, all, initDb, getNearest };
