/**
 * Calculates distance between two coordinates in kilometers using Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculates bounding box coordinates given a center point and radius in kilometers
 * Used for fast indexed pre-filtering before spatial spherical distance checks
 */
export function calculateBoundingBox(
  latitude: number,
  longitude: number,
  radiusKm: number
): { minLat: number; maxLat: number; minLng: number; maxLng: number } {
  const earthRadiusKm = 6371;

  // Angular distance in radians on a great circle
  const radDist = radiusKm / earthRadiusKm;

  const radLat = toRad(latitude);
  const radLon = toRad(longitude);

  let minLat = radLat - radDist;
  let maxLat = radLat + radDist;

  let minLng: number;
  let maxLng: number;

  const MIN_LAT = toRad(-90);
  const MAX_LAT = toRad(90);
  const MIN_LON = toRad(-180);
  const MAX_LON = toRad(180);

  if (minLat > MIN_LAT && maxLat < MAX_LAT) {
    const deltaLon = Math.asin(Math.sin(radDist) / Math.cos(radLat));
    minLng = radLon - deltaLon;
    if (minLng < MIN_LON) minLng += 2 * Math.PI;
    maxLng = radLon + deltaLon;
    if (maxLng > MAX_LON) maxLng -= 2 * Math.PI;
  } else {
    // Near poles
    minLat = Math.max(minLat, MIN_LAT);
    maxLat = Math.min(maxLat, MAX_LAT);
    minLng = MIN_LON;
    maxLng = MAX_LON;
  }

  return {
    minLat: (minLat * 180) / Math.PI,
    maxLat: (maxLat * 180) / Math.PI,
    minLng: (minLng * 180) / Math.PI,
    maxLng: (maxLng * 180) / Math.PI,
  };
}
