const path = require('path');

module.exports = function maintenanceMode(req, res, next) {
  if (process.env.MAINTENANCE_MODE === 'true') {
    // If the request is for an API route, return a 503 JSON response
    if (req.path.startsWith('/api')) {
      return res.status(503).json({
        message: 'The application is currently under maintenance. Please try again later.',
      });
    }
    // For all other requests, serve the static maintenance page
    return res.sendFile(path.join(__dirname, '../../client/public/maintenance.html'));
  }
  next();
};
