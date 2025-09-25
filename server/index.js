const express = require('express');
const cors = require('cors');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for bus locations (in production, use a database)
const busLocations = new Map();

// Get local IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  return 'localhost';
}

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Smart Bus Tracking System API',
    version: '1.0.0',
    endpoints: {
      'POST /api/locations': 'Update bus location',
      'GET /api/locations/:device_id': 'Get bus location',
      'GET /api/locations': 'Get all bus locations'
    }
  });
});

// POST endpoint for ESP32 to send location data
app.post('/api/locations', (req, res) => {
  const { device_id, lat, lon, speed, driver_name, bus_number, status } = req.body;
  
  // Validate required fields
  if (!device_id || lat === undefined || lon === undefined) {
    return res.status(400).json({
      error: 'Missing required fields: device_id, lat, lon'
    });
  }

  // Store location data
  const locationData = {
    device_id,
    lat: parseFloat(lat),
    lon: parseFloat(lon),
    speed: speed ? parseFloat(speed) : 0,
    driver_name: driver_name || 'Unknown',
    bus_number: bus_number || device_id,
    status: status || 'active',
    updated: new Date().toISOString()
  };

  busLocations.set(device_id, locationData);

  console.log(`📍 Location update received from ${device_id}:`, {
    lat: locationData.lat,
    lon: locationData.lon,
    speed: locationData.speed,
    time: new Date().toLocaleTimeString()
  });

  res.json({
    success: true,
    message: 'Location updated successfully',
    data: locationData
  });
});

// GET endpoint to retrieve specific bus location
app.get('/api/locations/:device_id', (req, res) => {
  const { device_id } = req.params;
  const location = busLocations.get(device_id);
  
  if (!location) {
    return res.status(404).json({
      error: `Bus with device_id '${device_id}' not found`
    });
  }

  res.json(location);
});

// GET endpoint to retrieve all bus locations
app.get('/api/locations', (req, res) => {
  const allLocations = Array.from(busLocations.values());
  res.json({
    count: allLocations.length,
    buses: allLocations
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  const localIP = getLocalIP();
  
  console.log('\n🚀 ===== SMART BUS TRACKING SERVER STARTED =====');
  console.log('');
  console.log('✅ Server running at:');
  console.log(`   📱 Local:    http://localhost:${PORT}`);
  console.log(`   🌍 Network:  http://${localIP}:${PORT}`);
  console.log('');
  console.log('📡 API Endpoints:');
  console.log(`   POST http://${localIP}:${PORT}/api/locations`);
  console.log(`   GET  http://${localIP}:${PORT}/api/locations/:device_id`);
  console.log(`   GET  http://${localIP}:${PORT}/api/locations`);
  console.log('');
  console.log('🔧 For Hardware Team (ESP32):');
  console.log(`   👉 Use this URL: http://${localIP}:${PORT}/api/locations`);
  console.log('   📝 POST JSON: {"device_id":"BUS_001","lat":11.3580,"lon":77.7120,"speed":35}');
  console.log('');
  console.log('📊 Test endpoints:');
  console.log(`   🏠 Home: http://${localIP}:${PORT}`);
  console.log(`   ❤️  Health: http://${localIP}:${PORT}/health`);
  console.log('');
  console.log('===============================================\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Server shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Server shutting down gracefully...');
  process.exit(0);
});