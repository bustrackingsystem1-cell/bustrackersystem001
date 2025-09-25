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
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Bus Tracking System API',
    version: '1.0.0',
    endpoints: {
      'POST /api/locations': 'Update bus location (for ESP32/Hardware)',
      'GET /api/locations/:device_id': 'Get specific bus location',
      'GET /api/locations': 'Get all bus locations'
    },
    status: 'Server is running successfully! 🚀'
  });
});

// POST endpoint for ESP32/Hardware to send location data
app.post('/api/locations', (req, res) => {
  const { device_id, lat, lon, speed, driver_name, bus_number, status } = req.body;
  
  // Validate required fields
  if (!device_id || lat === undefined || lon === undefined) {
    return res.status(400).json({
      error: 'Missing required fields: device_id, lat, lon',
      example: {
        device_id: 'BUS_101',
        lat: 11.3580,
        lon: 77.7120,
        speed: 35
      }
    });
  }

  // Store location data
  const locationData = {
    device_id,
    lat: parseFloat(lat),
    lon: parseFloat(lon),
    speed: speed ? parseFloat(speed) : 0,
    driver_name: driver_name || 'Unknown Driver',
    bus_number: bus_number || device_id,
    status: status || 'active',
    updated: new Date().toISOString(),
    timestamp: Date.now()
  };

  busLocations.set(device_id, locationData);

  console.log(`📍 Location update from ${device_id}:`, {
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
      error: `Bus with device_id '${device_id}' not found`,
      available_buses: Array.from(busLocations.keys())
    });
  }

  res.json(location);
});

// GET endpoint to retrieve all bus locations
app.get('/api/locations', (req, res) => {
  const allLocations = Array.from(busLocations.values());
  res.json({
    count: allLocations.length,
    buses: allLocations,
    last_updated: allLocations.length > 0 ? Math.max(...allLocations.map(b => b.timestamp)) : null
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    memory: process.memoryUsage(),
    buses_tracked: busLocations.size
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  const localIP = getLocalIP();
  
  console.log('\n🚀 ===== BUS TRACKING SYSTEM STARTED =====');
  console.log('');
  console.log('✅ Server running at:');
  console.log(`   📱 http://localhost:${PORT}`);
  console.log(`   🌍 Access from other devices: http://${localIP}:${PORT}`);
  console.log('');
  console.log('📡 API Endpoints for Hardware Team (ESP32):');
  console.log(`   👉 Example API: http://${localIP}:${PORT}/api/locations/BUS_101`);
  console.log(`   📤 POST Location: http://${localIP}:${PORT}/api/locations`);
  console.log(`   📥 GET Location: http://${localIP}:${PORT}/api/locations/:device_id`);
  console.log(`   📋 GET All Buses: http://${localIP}:${PORT}/api/locations`);
  console.log('');
  console.log('🔧 Test Commands:');
  console.log(`   curl -X POST http://${localIP}:${PORT}/api/locations \\`);
  console.log('     -H "Content-Type: application/json" \\');
  console.log('     -d \'{"device_id":"BUS_101","lat":11.3580,"lon":77.7120,"speed":35}\'');
  console.log('');
  console.log(`   curl http://${localIP}:${PORT}/api/locations/BUS_101`);
  console.log('');
  console.log('📊 Dashboard:');
  console.log(`   🏠 Home: http://${localIP}:${PORT}`);
  console.log(`   ❤️  Health: http://${localIP}:${PORT}/health`);
  console.log('');
  console.log('===============================================\n');
});

// Add some demo data for testing
setTimeout(() => {
  const demoData = {
    device_id: 'BUS_101',
    lat: 11.3580,
    lon: 77.7120,
    speed: 35,
    driver_name: 'Demo Driver',
    bus_number: '101',
    status: 'active'
  };
  
  busLocations.set('BUS_101', {
    ...demoData,
    updated: new Date().toISOString(),
    timestamp: Date.now()
  });
  
  console.log('📍 Demo bus BUS_101 added for testing');
}, 1000);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Server shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Server shutting down gracefully...');
  process.exit(0);
});