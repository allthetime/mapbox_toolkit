import type { AllGeoJSON } from "@turf/turf";

export interface CrashData {
  longitude: number;
  latitude: number;
  validationErrors?: string[];
  [key: string]: unknown;
}

export function makeGeoJSON(data: CrashData[]): AllGeoJSON {
  return {
    type: 'FeatureCollection',
    features: data
      .filter(d => {
        // Filter out items with missing coordinates
        if (d.validationErrors?.includes('MISSING_COORDS')) return false;
        
        // Also keep the safety check for runtime safety, but rely primarily on flags if present
        const longitude = d.longitude;
        const latitude = d.latitude;
        return typeof longitude === 'number' && typeof latitude === 'number' && !isNaN(longitude) && !isNaN(latitude);
      })
      .map(d => {
        let longitude = d.longitude;
        
        // Handle positive longitude flag
        if (d.validationErrors?.includes('POSITIVE_LONGITUDE')) {
          longitude = -Math.abs(longitude);
        } else if (longitude > 0) {
          // Fallback if flag is missing but data is still weird
          longitude = -longitude;
        }
        
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [longitude, d.latitude]
          },
          properties: {
            ...d,
            longitude
          }
        };
      })
  };
}
