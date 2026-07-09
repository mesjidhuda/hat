const path = require('path');
const fs = require('fs');

module.exports = function maintenanceMode(req, res, next) {
  const isMaintenance = process.env.MAINTENANCE_MODE === 'true';

  if (!isMaintenance) return next();

  const bypassSecret = process.env.MAINTENANCE_BYPASS_SECRET;
  const isBypass = bypassSecret && (
    req.query.bypass === bypassSecret ||
    req.headers['x-bypass-maintenance'] === bypassSecret ||
    req.path.startsWith('/api/admin')
  );

  if (isBypass) {
    console.log('🔧 Maintenance bypass granted');
    return next();
  }

  // API routes
  if (req.path.startsWith('/api')) {
    return res.status(503).json({
      success: false,
      message: 'The application is currently under maintenance. Please try again later.',
    });
  }

  // Try to serve maintenance.html
  const possiblePaths = [
    path.join(__dirname, '..', '..', '..', 'client', 'public', 'maintenance.html'),
    path.join(__dirname, '..', '..', 'client', 'public', 'maintenance.html'), // alternative
    path.join(process.cwd(), 'client', 'public', 'maintenance.html')
  ];

  for (const maintenancePath of possiblePaths) {
    console.log('Trying maintenance path:', maintenancePath);
    if (fs.existsSync(maintenancePath)) {
      console.log('✅ Maintenance file found at:', maintenancePath);
      return res.sendFile(maintenancePath);
    }
  }

  // Final fallback
  console.log('⚠️ Maintenance file not found, using inline HTML');
  
};