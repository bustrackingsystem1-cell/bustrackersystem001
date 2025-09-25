import { Bus, BusStop, Route } from '../types';

export const mockRoutes: Route[] = [
  {
    id: 'route_1',
    from: 'Boothapadi',
    to: 'Mpnmjec',
    distance: 45.2,
    stops: [
      { id: 'stop_1', name: 'Boothapadi', lat: 11.3500, lon: 77.7200 },
      { id: 'stop_2', name: 'Poonachi', lat: 11.3520, lon: 77.7180 },
      { id: 'stop_3', name: 'Chithar', lat: 11.3540, lon: 77.7160 },
      { id: 'stop_4', name: 'Bhavani BS', lat: 11.3560, lon: 77.7140 },
      { id: 'stop_5', name: 'Kasipalayam', lat: 11.3570, lon: 77.7130 },
      { id: 'stop_6', name: 'Kalingarayanpalayam', lat: 11.3580, lon: 77.7120 },
      { id: 'stop_7', name: 'KK-nagar', lat: 11.3590, lon: 77.7110 },
      { id: 'stop_8', name: 'Lakshminagar', lat: 11.3600, lon: 77.7100 },
      { id: 'stop_9', name: 'R.N.pudhur', lat: 11.3620, lon: 77.7080 },
      { id: 'stop_10', name: 'Agraharam', lat: 11.3640, lon: 77.7060 },
      { id: 'stop_11', name: 'Erode BS', lat: 11.3660, lon: 77.7040 },
      { id: 'stop_12', name: 'Savitha & G.H', lat: 11.3680, lon: 77.7020 },
      { id: 'stop_13', name: 'Diesel Shed', lat: 11.3700, lon: 77.7000 },
      { id: 'stop_14', name: 'ITI', lat: 11.3720, lon: 77.6980 },
      { id: 'stop_15', name: 'Mpnmjec', lat: 11.3740, lon: 77.6960 }
    ]
  }
];

export const mockBuses: Bus[] = [
  {
    device_id: 'BUS_001',
    bus_number: '001',
    driver_name: 'Murugan',
    route_id: 'route_1',
    status: 'active',
    current_location: {
      device_id: 'BUS_001',
      lat: 11.3580,
      lon: 77.7120,
      speed: 35,
      updated: new Date().toISOString()
    },
    next_stop: mockRoutes[0].stops[6], // KK-nagar
    eta_to_destination: 85 // Estimated time to final destination in minutes
  }
];

// Popular search suggestions based on the route
export const popularSearches = [
  { from: 'Boothapadi', to: 'Mpnmjec' },
  { from: 'Bhavani BS', to: 'Erode BS' },
  { from: 'Erode BS', to: 'Mpnmjec' },
  { from: 'Boothapadi', to: 'Erode BS' }
];