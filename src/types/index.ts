export interface BusLocation {
  device_id: string;
  lat: number;
  lon: number;
  speed: number;
  updated: string;
  driver_name?: string;
  bus_number?: string;
  status?: 'active' | 'stopped' | 'offline';
}

export interface BusStop {
  id: string;
  name: string;
  lat: number;
  lon: number;
  eta?: number;
}

export interface Route {
  id: string;
  from: string;
  to: string;
  stops: BusStop[];
  distance: number;
}

export interface RecentSearch {
  id: string;
  from: string;
  to: string;
  timestamp: string;
}

export interface Bus {
  device_id: string;
  bus_number: string;
  driver_name: string;
  route_id: string;
  current_location: BusLocation;
  next_stop?: BusStop;
  eta_to_destination?: number;
  status: 'active' | 'stopped' | 'offline';
}