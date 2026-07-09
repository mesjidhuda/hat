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

};