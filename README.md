# 🚌 Bus Tracking System - Complete Solution

A real-time bus tracking system with Express.js backend and React frontend with interactive map view, designed to work with ESP32 hardware for live location updates.

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Backend Server
```bash
npm run server
```

**Expected Output:**
```
🚀 ===== BUS TRACKING SYSTEM STARTED =====

✅ Server running at:
   📱 http://localhost:3000
   🌍 Access from other devices: http://192.168.1.100:3000

📡 API Endpoints for Hardware Team (ESP32):
   👉 Example API: http://192.168.1.100:3000/api/locations/BUS_101
   📤 POST Location: http://192.168.1.100:3000/api/locations
   📥 GET Location: http://192.168.1.100:3000/api/locations/:device_id
   📋 GET All Buses: http://192.168.1.100:3000/api/locations
```

### 3. Start Frontend (New Terminal)
```bash
npm run dev
```

**Expected Output:**
```
🎨 ===== FRONTEND MAP VIEW STARTED =====

🎨 Frontend running at:
   📱 http://localhost:5173
   🌍 Access from other devices: http://192.168.1.100:5173

📍 Map Features:
   🗺️  Interactive map with bus markers
   📡 Auto-refresh every 5 seconds
   🛰️  Street & Satellite view toggle
   📊 Real-time bus status & speed
```

## 📡 API Endpoints

### For ESP32 Hardware Team

**POST Location Update:**
```bash
curl -X POST http://YOUR_IP:3000/api/locations \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "BUS_101",
    "lat": 11.3580,
    "lon": 77.7120,
    "speed": 35,
    "driver_name": "John Doe",
    "bus_number": "101",
    "status": "active"
  }'
```

**GET Bus Location:**
```bash
curl http://YOUR_IP:3000/api/locations/BUS_101
```

**GET All Buses:**
```bash
curl http://YOUR_IP:3000/api/locations
```

## 🗺️ Map View Features

### Interactive Map
- **Street View**: Standard OpenStreetMap tiles
- **Satellite View**: High-resolution satellite imagery
- **Real-time Updates**: Automatic refresh every 5 seconds
- **Bus Markers**: Custom icons showing speed and status

### Bus Information
- **Live Tracking**: See buses moving in real-time
- **Status Indicators**: Active (green), Stopped (yellow), Offline (red)
- **Speed Display**: Current speed shown on map markers
- **Detailed Info**: Click markers for full bus details

### Sidebar Controls
- **Bus Selection**: Click any bus to focus on it
- **Live Status**: Real-time connection status
- **Bus Details**: Complete information panel
- **Auto-refresh**: Continuous updates every 5 seconds

## 🔧 ESP32 Arduino Code Example

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "YOUR_WIFI";
const char* password = "YOUR_PASSWORD";
const char* serverURL = "http://192.168.1.100:3000/api/locations";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");
}

void sendLocation(float lat, float lon, float speed) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverURL);
    http.addHeader("Content-Type", "application/json");
    
    StaticJsonDocument<200> doc;
    doc["device_id"] = "BUS_101";
    doc["lat"] = lat;
    doc["lon"] = lon;
    doc["speed"] = speed;
    doc["driver_name"] = "John Doe";
    doc["bus_number"] = "101";
    doc["status"] = "active";
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    int httpResponseCode = http.POST(jsonString);
    
    if (httpResponseCode > 0) {
      Serial.println("Location sent successfully");
    } else {
      Serial.println("Error sending location");
    }
    
    http.end();
  }
}

void loop() {
  // Get GPS coordinates (replace with actual GPS code)
  float lat = 11.3580 + random(-100, 100) / 100000.0;
  float lon = 77.7120 + random(-100, 100) / 100000.0;
  float speed = random(0, 60);
  
  sendLocation(lat, lon, speed);
  delay(5000); // Send every 5 seconds
}
```

## 🏗️ Project Structure

```
├── server/
│   └── index.js          # Express backend server
├── src/
│   ├── components/
│   │   └── MapTracker.tsx # Main map component
│   ├── services/
│   │   └── api.ts        # API service layer
│   └── App.tsx           # Main app component
├── package.json
└── README.md
```

## 🌐 Network Access

- **Backend Server**: Accessible from any device on the same network
- **Frontend**: Accessible from any device on the same network  
- **ESP32**: Must be on the same WiFi network to send data

## 🔄 Development Commands

### Backend Development
```bash
npm run dev:server  # Auto-restart on changes
```

### Frontend Development
```bash
npm run dev  # Hot reload enabled
```

### Production Build
```bash
npm run build  # Build for production
```

## 📱 Usage Instructions

### For Hardware Team
1. Use the backend URL printed in terminal to send GPS data from ESP32
2. Send POST requests to `/api/locations` endpoint
3. Include required fields: `device_id`, `lat`, `lon`, `speed`

### For Users/Passengers
1. Open the frontend URL in any browser
2. View real-time bus locations on interactive map
3. Click bus markers for detailed information
4. Toggle between street and satellite views

### For Developers
1. Backend automatically logs all location updates
2. Frontend shows connection status and update times
3. Error handling for network issues
4. Demo data included for testing

## 🛠️ Environment Variables

Create `.env` file:
```
VITE_API_URL=http://localhost:3000/api
PORT=3000
```

## 🚀 Production Deployment

For production, consider:
- Using a proper database (PostgreSQL, MongoDB)
- Adding authentication and authorization
- Using HTTPS with SSL certificates
- Setting up proper CORS policies
- Adding rate limiting and API security
- Using PM2 for process management
- Setting up monitoring and logging

## 🧪 Testing

### Test Server Endpoints
```bash
# Test POST endpoint
curl -X POST http://localhost:3000/api/locations \
  -H "Content-Type: application/json" \
  -d '{"device_id":"TEST_BUS","lat":11.3580,"lon":77.7120,"speed":25}'

# Test GET endpoint
curl http://localhost:3000/api/locations/TEST_BUS

# Test health endpoint
curl http://localhost:3000/health
```

### Demo Data
- Server automatically creates demo bus `BUS_101` for testing
- Frontend will show this demo bus on the map
- Use this to verify the system is working before connecting real hardware

## 🎯 Key Features

✅ **Real-time Tracking**: Live bus locations updated every 5 seconds  
✅ **Interactive Map**: Street and satellite view with custom bus markers  
✅ **Network Access**: Both server and frontend accessible from any device  
✅ **Hardware Ready**: ESP32-compatible API endpoints  
✅ **Status Monitoring**: Live connection status and error handling  
✅ **Demo Data**: Built-in test bus for immediate verification  
✅ **Responsive Design**: Works on desktop, tablet, and mobile  
✅ **Production Ready**: Scalable architecture with proper error handling