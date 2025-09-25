const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface LocationUpdate {
  device_id: string;
  lat: number;
  lon: number;
  speed: number;
  driver_name?: string;
  bus_number?: string;
  status?: 'active' | 'stopped' | 'offline';
}

export interface BusLocationResponse {
  device_id: string;
  lat: number;
  lon: number;
  speed: number;
  driver_name: string;
  bus_number: string;
  status: string;
  updated: string;
}

export interface AllLocationsResponse {
  count: number;
  buses: BusLocationResponse[];
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async getBusLocation(deviceId: string): Promise<BusLocationResponse> {
    const response = await fetch(`${this.baseUrl}/locations/${deviceId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch bus location: ${response.statusText}`);
    }
    
    return response.json();
  }

  async getAllBusLocations(): Promise<AllLocationsResponse> {
    const response = await fetch(`${this.baseUrl}/locations`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch bus locations: ${response.statusText}`);
    }
    
    return response.json();
  }

  async updateBusLocation(locationData: LocationUpdate): Promise<any> {
    const response = await fetch(`${this.baseUrl}/locations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(locationData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update bus location: ${response.statusText}`);
    }
    
    return response.json();
  }

  async checkHealth(): Promise<any> {
    const response = await fetch(`${this.baseUrl.replace('/api', '')}/health`);
    
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }
    
    return response.json();
  }
}

export const apiService = new ApiService();