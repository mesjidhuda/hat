const path = require('path');
const fs = require('fs');

module.exports = function maintenanceMode(req, res, next) {
  const isMaintenance = process.env.MAINTENANCE_MODE === 'true';

  if (!isMaintenance) {
    return next();
  }

  // === Bypass for you (the developer/admin) ===
  const bypassSecret = process.env.MAINTENANCE_BYPASS_SECRET;
  const isBypass = 
    bypassSecret && (
      req.query.bypass === bypassSecret ||                    // ?bypass=yoursecret
      req.headers['x-bypass-maintenance'] === bypassSecret || // Custom header
      req.path.startsWith('/api/admin')                       // Allow admin routes
    );

  if (isBypass) {
    console.log('🔧 Maintenance bypass granted for admin');
    return next();
  }

  // === API Routes - return JSON ===
  if (req.path.startsWith('/api')) {
    return res.status(503).json({
      success: false,
      message: 'The application is currently under maintenance. Please try again later.',
    });
  }

  // === Frontend Routes - serve maintenance.html ===
  const maintenancePath = path.join(__dirname, '..', '..', '..', 'client', 'public', 'maintenance.html');

  if (fs.existsSync(maintenancePath)) {
    return res.sendFile(maintenancePath);
  } 

  // Fallback HTML (nice & styled)
  return res.status(503).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Under Maintenance – Huda Masjid</title>
      <style>
        :root {
          --bg-dark: #0d130d;
          --accent: #d4af37;
          --text-primary: #ffffff;
          --text-secondary: rgba(255,255,255,0.7);
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background-color: var(--bg-dark);
          background-image: radial-gradient(circle at top right, #2c5f2d 0%, transparent 40%);
          font-family: 'Outfit', sans-serif;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          text-align: center;
          padding: 20px;
        }
        h1 { font-family: 'Merriweather', serif; color: var(--accent); font-size: 2rem; margin-bottom: 15px; }
        p { color: var(--text-secondary); font-size: 1rem; max-width: 500px; }
      </style>
    </head>
    <body>
      <div>
        <h1>🕌 Under Maintenance</h1>
        <p>Huda Masjid Attendance Manager is currently undergoing scheduled maintenance.</p>
        <p style="font-size:0.9rem;opacity:0.8;margin-top:15px;">We'll be back shortly. Please check again in a few minutes.</p>
      </div>
    </body>
    </html>
  `);
};