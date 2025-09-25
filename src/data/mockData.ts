import { Bus, BusStop, Route } from '../types';

export const mockRoutes: Route[] = [
  {
    id: 'route_1',
    from: 'Central Station',
    to: 'Airport Terminal',
    distance: 25.5,
    stops: [
      { id: 'stop_1', name: 'Central Station', lat: 11.1863, lon: 77.6232 },
      { id: 'stop_2', name: 'City Mall', lat: 11.1950, lon: 77.6350 },
      { id: 'stop_3', name: 'Tech Park', lat: 11.2100, lon: 77.6500 },
      { id: 'stop_4', name: 'University', lat: 11.2250, lon: 77.6650 },
      { id: 'stop_5', name: 'Airport Terminal', lat: 11.2400, lon: 77.6800 }
    ]
  },
  {
    id: 'route_2',
    from: 'Downtown',
    to: 'Suburbs',
    distance: 18.3,
    stops: [
      { id: 'stop_6', name: 'Downtown Plaza', lat: 11.1700, lon: 77.6100 },
      { id: 'stop_7', name: 'Hospital', lat: 11.1800, lon: 77.6200 },
      { id: 'stop_8', name: 'Stadium', lat: 11.1900, lon: 77.6300 },
      { id: 'stop_9', name: 'Suburbs Center', lat: 11.2000, lon: 77.6400 }
    ]
  }
];

export const mockBuses: Bus[] = [
  {
    device_id: 'BUS_101',
    bus_number: 'AC-101',
    driver_name: 'Rajesh Kumar',
    route_id: 'route_1',
    status: 'active',
    current_location: {
      device_id: 'BUS_101',
      lat: 11.1950,
      lon: 77.6350,
      speed: 35,
      updated: new Date().toISOString()
    },
    next_stop: mockRoutes[0].stops[2],
    eta_to_destination: 45
  },
  {
    device_id: 'BUS_102',
    bus_number: 'EX-102',
    driver_name: 'Priya Sharma',
    route_id: 'route_1',
    status: 'active',
    current_location: {
      device_id: 'BUS_102',
      lat: 11.2100,
      lon: 77.6500,
      speed: 42,
      updated: new Date().toISOString()
    },
    next_stop: mockRoutes[0].stops[3],
    eta_to_destination: 25
  },
  {
    device_id: 'BUS_201',
    bus_number: 'ST-201',
    driver_name: 'Mohamed Ali',
    route_id: 'route_2',
    status: 'stopped',
    current_location: {
      device_id: 'BUS_201',
      lat: 11.1800,
      lon: 77.6200,
      speed: 0,
      updated: new Date().toISOString()
    },
    next_stop: mockRoutes[1].stops[2],
    eta_to_destination: 0
  }
];

// Popular search suggestions
export const popularSearches = [
  { from: 'Central Station', to: 'Airport Terminal' },
  { from: 'Downtown', to: 'Tech Park' },
  { from: 'University', to: 'City Mall' },
  { from: 'Hospital', to: 'Suburbs' }
];