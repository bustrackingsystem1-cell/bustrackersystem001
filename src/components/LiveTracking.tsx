import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { ArrowLeft, MapPin, Clock, Zap, Bell, Navigation, Gauge, Maximize2, Minimize2, Map, Satellite } from 'lucide-react';
import { Bus, BusStop } from '../types';
import { calculateDistance, calculateETA, formatETA } from '../utils/distanceCalculator';
import { mockRoutes } from '../data/mockData';
import { apiService } from '../services/api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom bus icon
const busIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="8" width="24" height="16" rx="4" fill="#2563EB"/>
      <rect x="6" y="10" width="20" height="12" rx="2" fill="#FFFFFF"/>
      <circle cx="10" cy="26" r="2" fill="#374151"/>
      <circle cx="22" cy="26" r="2" fill="#374151"/>
      <rect x="8" y="12" width="6" height="4" rx="1" fill="#E5E7EB"/>
      <rect x="18" y="12" width="6" height="4" rx="1" fill="#E5E7EB"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

// Custom stop icon
const stopIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="8" fill="#059669"/>
      <circle cx="12" cy="12" r="4" fill="#FFFFFF"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

// Component to update map view
function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  
  return null;
}

interface LiveTrackingProps {
  bus: Bus;
  onBack: () => void;
}

export function LiveTracking({ bus: initialBus, onBack }: LiveTrackingProps) {
  const [bus, setBus] = useState(initialBus);
  const [alertsEnabled, setAlertsEnabled] = useState({ fiveMin: false, tenMin: false });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapView, setMapView] = useState<'street' | 'satellite'>('street');
  const [mapCenter, setMapCenter] = useState<[number, number]>([bus.current_location.lat, bus.current_location.lon]);
  const mapRef = useRef<L.Map | null>(null);

  // Find the route for this bus
  const route = mockRoutes.find(r => r.id === bus.route_id);
  const routeStops = route?.stops || [];

  // Create route polyline coordinates
  const routeCoordinates: [number, number][] = routeStops.map(stop => [stop.lat, stop.lon]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Try to fetch real data from API, fallback to simulation
      apiService.getBusLocation(bus.device_id)
        .then(locationData => {
          setBus(prevBus => ({
            ...prevBus,
            current_location: {
              ...prevBus.current_location,
              lat: locationData.lat,
              lon: locationData.lon,
              speed: locationData.speed,
              updated: locationData.updated
            }
          }));
          setMapCenter([locationData.lat, locationData.lon]);
        })
        .catch(() => {
          // Fallback to simulation if API fails
          setBus(prevBus => {
            const latVariation = (Math.random() - 0.5) * 0.002;
            const lonVariation = (Math.random() - 0.5) * 0.002;
            const speedVariation = Math.max(0, prevBus.current_location.speed + (Math.random() - 0.5) * 15);

            const newLat = prevBus.current_location.lat + latVariation;
            const newLon = prevBus.current_location.lon + lonVariation;

            setMapCenter([newLat, newLon]);

            return {
              ...prevBus,
              current_location: {
                ...prevBus.current_location,
                lat: newLat,
                lon: newLon,
                speed: Math.round(speedVariation),
                updated: new Date().toISOString()
              }
            };
          });
        });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Calculate ETAs to each stop
  const stopsWithETA = routeStops.map(stop => {
    const distance = calculateDistance(
      bus.current_location.lat,
      bus.current_location.lon,
      stop.lat,
      stop.lon
    );
    const eta = calculateETA(distance, bus.current_location.speed);
    
    return {
      ...stop,
      distance,
      eta: typeof eta === 'number' ? eta : 0
    };
  });

  // Find next stop (closest with positive ETA)
  const nextStop = stopsWithETA
    .filter(stop => stop.eta > 0)
    .sort((a, b) => a.distance - b.distance)[0];

  const toggleAlert = (type: 'fiveMin' | 'tenMin') => {
    setAlertsEnabled(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'stopped': return 'text-yellow-600';
      case 'offline': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b z-30 relative">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gray-900">Live Tracking</h1>
              <p className="text-sm text-gray-500">{bus.bus_number} - {bus.driver_name}</p>
            </div>
            <button
              onClick={toggleFullscreen}
              className="w-10 h-10 bg-blue-100 hover:bg-blue-200 rounded-full flex items-center justify-center transition-colors"
            >
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5 text-blue-700" />
              ) : (
                <Maximize2 className="w-5 h-5 text-blue-700" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Map Container */}
        <div className={`${isFullscreen ? 'flex-1' : 'flex-1 lg:flex-[2]'} relative`}>
          <div className="h-full min-h-[500px] lg:min-h-[600px]">
            <MapContainer
              center={mapCenter}
              zoom={14}
              style={{ height: '100%', width: '100%' }}
              className="rounded-none lg:rounded-l-xl"
              ref={mapRef}
            >
              <MapUpdater center={mapCenter} zoom={14} />
              
              {/* Conditional Tile Layer based on mapView */}
              {mapView === 'street' && (
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  maxZoom={19}
                />
              )}
              
              {mapView === 'satellite' && (
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  attribution='&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                  maxZoom={19}
                />
              )}
              
              {/* Route Polyline */}
              {routeCoordinates.length > 0 && (
                <Polyline
                  positions={routeCoordinates}
                  color="#2563EB"
                  weight={5}
                  opacity={0.8}
                  dashArray="10, 5"
                />
              )}
              
              {/* Bus Marker */}
              <Marker
                position={[bus.current_location.lat, bus.current_location.lon]}
                icon={busIcon}
              >
                <Popup>
                  <div className="text-center">
                    <div className="font-bold text-blue-600 text-lg">Bus {bus.bus_number}</div>
                    <div className="text-sm text-gray-600 mb-1">Driver: {bus.driver_name}</div>
                    <div className="text-sm mb-1">Speed: {bus.current_location.speed} km/h</div>
                    <div className="text-sm capitalize font-medium">{bus.status}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Last updated: {new Date(bus.current_location.updated).toLocaleTimeString()}
                    </div>
                  </div>
                </Popup>
              </Marker>
              
              {/* Stop Markers */}
              {routeStops.map((stop, index) => (
                <Marker
                  key={stop.id}
                  position={[stop.lat, stop.lon]}
                  icon={stopIcon}
                >
                  <Popup>
                    <div className="text-center">
                      <div className="font-bold text-green-600 text-base">{stop.name}</div>
                      <div className="text-sm text-blue-600 mb-1">
                        Scheduled: {stop.scheduledTime}
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        ETA: {formatETA(stopsWithETA[index]?.eta || 0)}
                      </div>
                      <div className="text-xs text-gray-400">
                        Stop #{index + 1}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Map Overlay - Quick Stats */}
          <div className="absolute top-4 left-4 right-4 z-20">
            {/* Map View Toggle */}
            <div className="flex justify-end mb-2">
              <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-1 flex">
                <button
                  onClick={() => setMapView('street')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${
                    mapView === 'street' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Map className="w-4 h-4" />
                  Street
                </button>
                <button
                  onClick={() => setMapView('satellite')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${
                    mapView === 'satellite' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Satellite className="w-4 h-4" />
                  Satellite
                </button>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-blue-600">
                    {nextStop ? formatETA(nextStop.eta) : 'N/A'}
                  </div>
                  <div className="text-xs text-gray-600">Next Stop</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-green-600">
                    {bus.current_location.speed}
                  </div>
                  <div className="text-xs text-gray-600">km/h</div>
                </div>
                <div>
                  <div className={`text-xl font-bold ${getStatusColor(bus.status)}`}>
                    {bus.status.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-xs text-gray-600">Status</div>
                </div>
              </div>
            </div>
            
            {/* Current Location Info */}
            <div className="mt-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3">
              <div className="text-sm">
                <div className="font-medium text-gray-900 mb-1">Current Location</div>
                <div className="text-gray-600">
                  Lat: {bus.current_location.lat.toFixed(4)}, 
                  Lon: {bus.current_location.lon.toFixed(4)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Updated: {new Date(bus.current_location.updated).toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        {!isFullscreen && (
          <div className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-gray-200">
            <div className="h-full overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Bus Status Card */}
                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{bus.bus_number}</h3>
                      <p className="text-sm text-gray-600">{bus.driver_name}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-2 bg-white/50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">
                        {bus.current_location.speed}
                      </div>
                      <div className="text-xs text-gray-600">km/h</div>
                    </div>
                    <div className="text-center p-2 bg-white/50 rounded-lg">
                      <div className={`text-lg font-bold ${getStatusColor(bus.status)}`}>
                        {bus.status.charAt(0).toUpperCase() + bus.status.slice(1)}
                      </div>
                      <div className="text-xs text-gray-600">Status</div>
                    </div>
                  </div>
                </div>

                {/* Next Stop */}
                {nextStop && (
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Navigation className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">Next Stop</h4>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{nextStop.name}</span>
                      <span className="text-xl font-bold text-blue-600">
                        {formatETA(nextStop.eta)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {nextStop.distance.toFixed(1)} km away
                    </div>
                  </div>
                )}

                {/* Upcoming Stops */}
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-gray-600" />
                    <h4 className="font-semibold text-gray-900">Upcoming Stops</h4>
                  </div>
                  <div className="space-y-3">
                    {stopsWithETA.slice(0, 5).map((stop, index) => (
                      <div key={stop.id} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            index === 0 ? 'bg-green-500' : 
                            index === 1 ? 'bg-yellow-500' : 'bg-gray-300'
                          }`}></div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{stop.name}</div>
                            <div className="text-xs text-gray-500">{stop.distance.toFixed(1)} km</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {formatETA(stop.eta)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Arrival Alerts */}
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Bell className="w-5 h-5 text-orange-600" />
                    <h4 className="font-semibold text-gray-900">Arrival Alerts</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => toggleAlert('fiveMin')}
                      className={`py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                        alertsEnabled.fiveMin
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      5 min alert
                    </button>
                    <button
                      onClick={() => toggleAlert('tenMin')}
                      className={`py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                        alertsEnabled.tenMin
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      10 min alert
                    </button>
                  </div>
                  
                  {(alertsEnabled.fiveMin || alertsEnabled.tenMin) && (
                    <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                      <div className="text-sm text-green-800 flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        Alerts enabled! You'll be notified when the bus approaches.
                      </div>
                    </div>
                  )}
                </div>

                {/* Route Info */}
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-5 h-5 text-purple-600" />
                    <h4 className="font-semibold text-gray-900">Route Information</h4>
                  </div>
                  {route && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">From:</span>
                        <span className="font-medium text-gray-900">{route.from}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">To:</span>
                        <span className="font-medium text-gray-900">{route.to}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Distance:</span>
                        <span className="font-medium text-gray-900">{route.distance} km</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Stops:</span>
                        <span className="font-medium text-gray-900">{route.stops.length}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}