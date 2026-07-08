const path = require('path');
const fs = require('fs');

module.exports = function maintenanceMode(req, res, next) {
  if (process.env.MAINTENANCE_MODE === 'true') {
    // If the request is for an API route, return a 503 JSON response
    if (req.path.startsWith('/api')) {
      return res.status(503).json({
        message: 'The application is currently under maintenance. Please try again later.',
      });
    }
    
    // Resolve the maintenance page path from the project root
    // __dirname = server/src/middleware
    // Go up 3 levels to project root, then into client/public
    const maintenancePath = path.join(__dirname, '..', '..', '..', 'client', 'public', 'maintenance.html');
    
    // Check if file exists before sending
    if (fs.existsSync(maintenancePath)) {
      return res.sendFile(maintenancePath);
    } else {
      // Fallback inline HTML if file not found
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
            h1 { font-family: 'Merriweather', serif; color: var(--accent); font-size: 1.8rem; margin-bottom: 15px; }
            p { color: var(--text-secondary); font-size: 0.95rem; }
          </style>
        </head>
        <body>
          <div>
            <h1>🕌 Under Maintenance</h1>
            <p>Huda Masjid Attendance Manager is currently undergoing scheduled maintenance.</p>
            <p style="font-size:0.85rem;opacity:0.7;margin-top:10px;">We'll be back shortly. Please check again in a few minutes.</p>
          </div>
        </body>
        </html>
      `);
    }
  }
  next();
};
