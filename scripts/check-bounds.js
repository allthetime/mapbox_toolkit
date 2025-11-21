import fs from 'node:fs';
import path from 'node:path';
import { bbox } from '@turf/turf';

/**
 * Validates coordinate data and adds validation errors to the object
 * @param {Object} obj - The data object to validate
 * @returns {Object} - The object with validationErrors array added if any errors found
 */
export function validateCoordinates(obj) {
  const longitude = obj.longitude;
  const latitude = obj.latitude;
  const validationErrors = [];

  if (typeof longitude !== 'number' || typeof latitude !== 'number') {
    validationErrors.push('MISSING_COORDS');
  } else {
    if (longitude > 0) {
      validationErrors.push('POSITIVE_LONGITUDE');
    }
    // Add more validation checks here if needed
  }

  if (validationErrors.length > 0) {
    obj.validationErrors = validationErrors;
  }

  return obj;
}

// If running directly, perform bounds check
if (import.meta.url === `file://${process.argv[1]}`) {
  const dataPath = path.join(process.cwd(), 'src/assets/data.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  const validData = data.filter(d => {
    const longitude = d.longitude;
    const latitude = d.latitude;
    return typeof longitude === 'number' && typeof latitude === 'number' && !isNaN(longitude) && !isNaN(latitude);
  });

  console.log(`Total records: ${data.length}`);
  console.log(`Valid records (strict number check): ${validData.length}`);

  const outliers = validData.filter(d => d.longitude > 0);
  console.log('Positive Longitude Outliers:', outliers.map(d => ({
    id: d.ID, 
    longitude: d.longitude, 
    latitude: d.latitude,
    municipality: d.Municipality
  })));

  const geojson = {
    type: 'FeatureCollection',
    features: validData.map(d => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [d.longitude, d.latitude]
      },
      properties: d
    }))
  };

  const bounds = bbox(geojson);
  console.log('Bounds:', bounds);
}

