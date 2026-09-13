const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "10kb" }));
app.use(express.static(path.join(__dirname, "public")));

const locations = [];

app.post("/api/location", (req, res) => {
  const { latitude, longitude, accuracy, timestamp } = req.body;

  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return res.status(400).json({ error: "Localização inválida." });
  }

  const location = {
    latitude,
    longitude,
    accuracy: typeof accuracy === "number" ? accuracy : null,
    timestamp: timestamp || new Date().toISOString()
  };

  locations.push(location);
  if (locations.length > 50) locations.shift();

  console.log("Localização recebida após consentimento:", location);
  res.json({ success: true });
});

app.get("/api/locations", (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: "Não autorizado." });
  }

  res.json(locations);
});

app.get("/api/status", (req, res) => {
  res.json({ online: true, locationsReceived: locations.length });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor funcionando na porta ${PORT}`);
});