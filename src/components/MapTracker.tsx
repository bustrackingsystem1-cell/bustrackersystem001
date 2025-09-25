import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { RefreshCw, Satellite, Map as MapIcon, Zap, Clock, Navigation, AlertCircle } from 'lucide-react';
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
const createBusIcon = (speed: number, status: string) => {
  const color = status === 'active' ? '#10B981' : status === 'stopped' ? '#F59E0B' : '#EF4444';
  const iconSvg = `
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" fill="${color}" stroke="white" stroke-width="2"/>
      <rect x="10" y="12" width="20" height="12" rx="2" fill="white"/>
      <circle cx="14" cy="30" r="2" fill="white"/>
      <circle cx="26" cy="30" r="2" fill="white"/>
      <rect x="12" y="14" width="6" height="3" rx="1" fill="${color}"/>
      <rect x="22" y="14" width="6" height="3" rx="1" fill="${color}"/>
      <text x="20" y="25" text-anchor="middle" fill="${color}" font-size="8" font-weight="bold">${Math.round(speed)}</text>
    </svg>
  `;
  
  return new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(iconSvg),
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
};

// Component to update map view
function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  
  return null;
}

interface BusData {
  device_id: string;
  lat: number;
  lon: number;
  speed: number;
  driver_name: string;
  bus_number: string;
  status: string;
  updated: string;
}

export function MapTracker() {
  const [buses, setBuses] = useState<BusData[]>([]);
  const [selectedBus, setSelectedBus] = useState<string>('');
  const [mapView, setMapView] = useState<'street' | 'satellite'>('street');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([11.3580, 77.7120]);
  const [mapZoom, setMapZoom] = useState(13);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch all bus locations
  const fetchBusLocations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getAllBusLocations();
      setBuses(response.buses || []);
      setLastUpdate(new Date());
      
      // If we have buses and no selected bus, select the first one
      if (response.buses.length > 0 && !selectedBus) {
        setSelectedBus(response.buses[0].device_id);
        setMapCenter([response.buses[0].lat, response.buses[0].lon]);
      }
      
      // Update map center to selected bus if it exists
      if (selectedBus) {
        const bus = response.buses.find(b => b.device_id === selectedBus);
        if (bus) {
          setMapCenter([bus.lat, bus.lon]);
        }
      }
    } catch (err) {
      setError('Failed to fetch bus locations. Make sure the server is running.');
      console.error('Error fetching bus locations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Start/stop auto-refresh
  useEffect(() => {
    fetchBusLocations(); // Initial fetch
    
    intervalRef.current = setInterval(fetchBusLocations, 5000); // Fetch every 5 seconds
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [selectedBus]);

  const handleBusSelect = (deviceId: string) => {
    setSelectedBus(deviceId);
    const bus = buses.find(b => b.device_id === deviceId);
    if (bus) {
      setMapCenter([bus.lat, bus.lon]);
      setMapZoom(15);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'stopped': return 'text-yellow-600 bg-yellow-100';
      case 'offline': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Zap className="w-4 h-4" />;
      case 'stopped': return <Clock className="w-4 h-4" />;
      case 'offline': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b z-30 relative">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl flex items-center justify-center">
                <Navigation className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Bus Tracker - Live Map View</h1>
                <p className="text-sm text-gray-500">
                  {buses.length} bus{buses.length !== 1 ? 'es' : ''} tracked
                  {lastUpdate && ` • Last updated: ${lastUpdate.toLocaleTimeString()}`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={fetchBusLocations}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Bus Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Active Buses</h3>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                </div>
              )}
              
              {buses.length === 0 ? (
                <div className="text-center py-8">
                  <Navigation className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No buses found</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Make sure the server is running and buses are sending data
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {buses.map((bus) => (
                    <button
                      key={bus.device_id}
                      onClick={() => handleBusSelect(bus.device_id)}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                        selectedBus === bus.device_id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">{bus.bus_number}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bus.status)}`}>
                          {getStatusIcon(bus.status)}
                          {bus.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <div>Driver: {bus.driver_name}</div>
                        <div>Speed: {bus.speed} km/h</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Updated: {new Date(bus.updated).toLocaleTimeString()}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Bus Details */}
            {selectedBus && buses.find(b => b.device_id === selectedBus) && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Bus Details</h3>
                {(() => {
                  const bus = buses.find(b => b.device_id === selectedBus)!;
                  return (
                    <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Device ID:</span>
                          <div className="font-medium">{bus.device_id}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Bus Number:</span>
                          <div className="font-medium">{bus.bus_number}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Driver:</span>
                          <div className="font-medium">{bus.driver_name}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Speed:</span>
                          <div className="font-medium">{bus.speed} km/h</div>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-600">Location:</span>
                          <div className="font-medium text-xs">
                            {bus.lat.toFixed(6)}, {bus.lon.toFixed(6)}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-600">Last Update:</span>
                          <div className="font-medium">
                            {new Date(bus.updated).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          <div className="h-full">
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              style={{ height: '100%', width: '100%' }}
              className="z-10"
            >
              <MapUpdater center={mapCenter} zoom={mapZoom} />
              
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
              
              {/* Bus Markers */}
              {buses.map((bus) => (
                <Marker
                  key={bus.device_id}
                  position={[bus.lat, bus.lon]}
                  icon={createBusIcon(bus.speed, bus.status)}
                >
                  <Popup>
                    <div className="text-center min-w-[200px]">
                      <div className="font-bold text-blue-600 text-lg mb-2">
                        Bus {bus.bus_number}
                      </div>
                      <div className="space-y-1 text-sm">
                        <div><strong>Driver:</strong> {bus.driver_name}</div>
                        <div><strong>Speed:</strong> {bus.speed} km/h</div>
                        <div><strong>Status:</strong> 
                          <span className={`ml-1 px-2 py-1 rounded text-xs ${getStatusColor(bus.status)}`}>
                            {bus.status}
                          </span>
                        </div>
                        <div><strong>Location:</strong> {bus.lat.toFixed(4)}, {bus.lon.toFixed(4)}</div>
                        <div className="text-xs text-gray-500 mt-2">
                          Last updated: {new Date(bus.updated).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Map Controls Overlay */}
          <div className="absolute top-4 right-4 z-20">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-1 flex">
              <button
                onClick={() => setMapView('street')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${
                  mapView === 'street' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <MapIcon className="w-4 h-4" />
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

          {/* Status Overlay */}
          <div className="absolute bottom-4 left-4 z-20">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3">
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-3 h-3 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
                <span className="text-gray-700">
                  {isLoading ? 'Updating...' : 'Live tracking active'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}