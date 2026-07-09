const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
require("dotenv").config();

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// ───── Maintenance mode check (must come before all routes) ─────
// ───── Temporary Maintenance Test ─────
app.use((req, res, next) => {
  console.log('Maintenance middleware hit - Path:', req.path);
  
  if (process.env.MAINTENANCE_MODE === 'true') {
    if (req.query.bypass === 'maintenancePath') {
      console.log('Bypass granted');
      return next();
    }
    
    return res.send(`
      <h1 style="color:red;text-align:center;margin-top:100px;">
        MAINTENANCE MODE ACTIVE - Test Page
      </h1>
      <p style="text-align:center;">If you see this, middleware is working.</p>
    `);
  }
  next();
});

// API routes
app.use("/api/admin", require("./routes/admin"));
app.use("/api/calendar", require("./routes/calendar"));
app.use("/api/classes", require("./routes/classes"));
app.use("/api/teacher", require("./routes/teacher"));
app.use("/api/attendance", require("./routes/attendance"));
app.use("/api/flags", require("./routes/flags"));
app.use("/api/teacher-log", require("./routes/teacherLog"));
app.use("/api/reports", require("./routes/reports"));
app.use("/api/search", require("./routes/search"));
app.use("/api/export", require("./routes/export"));
app.use("/api/reset", require("./routes/reset"));
app.use("/api/students", require("./routes/students"));
app.use("/api/teachers", require("./routes/teachers"));
app.use("/api/app", require("./routes/app"));

// Health check (will also be blocked during maintenance because of the middleware above)
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// In production, serve the React build folder as static files
if (process.env.NODE_ENV === "production") {
    const clientBuildPath = path.join(__dirname, "../../client/dist");
    app.use(express.static(clientBuildPath));

    // For any route not handled by API, return the React app (client‑side routing)
    app.get("*", (req, res) => {
        res.sendFile(path.join(clientBuildPath, "index.html"));
    });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
