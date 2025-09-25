# Smart Bus Tracking System

A real-time bus tracking system with Express.js backend and React frontend, designed to work with ESP32 hardware for live location updates.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Backend Server
```bash
npm run server
```

The server will display URLs like this:
```
🚀 ===== SMART BUS TRACKING SERVER STARTED =====

✅ Server running at:
   📱 Local:    http://localhost:3000
   🌍 Network:  http://192.168.1.100:3000

🔧 For Hardware Team (ESP32):
   👉 Use this URL: http://192.168.1.100:3000/api/locations
```

### 3. Start Frontend (New Terminal)
```bash
npm run dev
```

The frontend will show:
```
🎨 Frontend running at http://localhost:5173
🌍 Access from other devices: http://192.168.1.100:5173
```

## 📡 API Endpoints

### For ESP32 Hardware Team

**POST Location Update:**
```bash
curl -X POST http://YOUR_IP:3000/api/locations \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "BUS_001",
    "lat": 11.3580,
    "lon": 77.7120,
    "speed": 35,
    "driver_name": "Murugan",
    "bus_number": "001",
    "status": "active"
  }'
```

**GET Bus Location:**
```bash
curl http://YOUR_IP:3000/api/locations/BUS_001
```

**GET All Buses:**
```bash
curl http://YOUR_IP:3000/api/locations
```

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
    doc["device_id"] = "BUS_001";
    doc["lat"] = lat;
    doc["lon"] = lon;
    doc["speed"] = speed;
    doc["driver_name"] = "Murugan";
    doc["bus_number"] = "001";
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
│   ├── components/       # React components
│   ├── services/
│   │   └── api.ts       # API service layer
│   └── ...
├── package.json
└── README.md
```

## 🌐 Network Access

- **Backend Server**: Accessible from any device on the same network
- **Frontend**: Accessible from any device on the same network
- **ESP32**: Must be on the same WiFi network to send data

## 🔄 Development

### Backend Development
```bash
npm run dev:server  # Auto-restart on changes
```

### Frontend Development
```bash
npm run dev  # Hot reload enabled
```

## 📱 Usage

1. **Hardware Team**: Use the backend URL to send GPS data from ESP32
2. **Passengers**: Open the frontend URL in any browser to track buses
3. **Real-time Updates**: Frontend polls backend every 5 seconds for live data

## 🛠️ Environment Variables

Create `.env` file:
```
VITE_API_URL=http://localhost:3000/api
PORT=3000
```

## 🚀 Production Deployment

For production, consider:
- Using a proper database (PostgreSQL, MongoDB)
- Adding authentication
- Using HTTPS
- Setting up proper CORS policies
- Adding rate limiting
- Using PM2 for process management