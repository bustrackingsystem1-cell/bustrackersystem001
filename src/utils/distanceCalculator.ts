/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate ETA in minutes based on distance and speed
 * @param distanceKm Distance in kilometers
 * @param speedKmh Speed in km/h
 * @returns ETA in minutes or "Stopped" if speed is 0
 */
export function calculateETA(distanceKm: number, speedKmh: number): number | string {
  if (speedKmh === 0) return "Stopped";
  if (speedKmh < 1) return "Very Slow";
  
  const etaMinutes = (distanceKm / speedKmh) * 60;
  return Math.round(etaMinutes);
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format ETA for display
 */
export function formatETA(eta: number | string): string {
  if (typeof eta === 'string') return eta;
  
  if (eta < 1) return "Arriving";
  if (eta < 60) return `${eta}m`;
  
  const hours = Math.floor(eta / 60);
  const minutes = eta % 60;
  
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}