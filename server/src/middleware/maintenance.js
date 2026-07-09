module.exports = function maintenanceMode(req, res, next) {
  const isMaintenance = process.env.MAINTENANCE_MODE === 'true';

  if (!isMaintenance) return next();

  // Bypass
  if (req.query.bypass === 'maintenancePath') {
    console.log('Bypass granted');
    return next();
  }

  // Simple inline page - no file path issues
  return res.status(503).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Under Maintenance – Huda Masjid</title>
      <style>
        body {
          background-color: #0d130d;
          color: white;
          font-family: Arial, sans-serif;
          text-align: center;
          padding: 50px;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        h1 { color: #d4af37; font-size: 2.5rem; }
      </style>
    </head>
    <body>
      <div>
        <h1>🕌 Under Maintenance</h1>
        <p>Huda Masjid Attendance Manager is currently undergoing maintenance.</p>
        <p>We'll be back shortly. Thank you for your patience.</p>
        <p style="margin-top:30px; font-size:0.9rem;">
          <strong>Bypass test:</strong> Add ?bypass=maintenancePath to the URL
        </p>
      </div>
    </body>
    </html>
  `);
};