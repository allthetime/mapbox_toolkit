import fs from 'node:fs';
import https from 'node:https';
import path from 'node:path';
import { validateCoordinates } from './check-bounds.js';
import { addInfo } from './process-data.js';

const SHEET_ID = '1OFRKPoFwA7UrX6yTVrtidbzLWIcFrJVStu8aOq0PnDc';
const GID = '1792731114';
const EXPORT_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;
const OUTPUT_PATH = path.join(process.cwd(), 'src/assets/data.json');

// Helper to parse CSV line handling quotes
function parseCSVLine(line) {
  const values = [];
  let currentValue = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentValue += '"';
        i++; // Skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      values.push(currentValue);
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  values.push(currentValue);
  return values;
}

function csvToJson(csvText) {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]).map(h => h.trim());
  const result = [];

  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i].trim();
    if (!currentLine) continue;

    const values = parseCSVLine(currentLine);
    const obj = {};

    headers.forEach((header, index) => {
      // Try to convert to number if possible, otherwise keep as string
      let val = values[index] || '';
      if (!isNaN(Number(val)) && val.trim() !== '') {
        val = Number(val);
      }
      obj[header] = val;
    });

    // Map coordinate fields to semantic names
    obj.longitude = obj['Coorddata.Table3.X'];
    obj.latitude = obj['Coorddata.Table3.Y'];
    
    // Validate coordinates and add validation errors if any
    validateCoordinates(obj);
    addInfo(obj);

    result.push(obj);
  }

  return result;
}

console.log(`Downloading sheet from: ${EXPORT_URL}`);

function downloadSheet(url) {
  https.get(url, (res) => {
    // Handle Redirects
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      console.log(`Redirecting (Status: ${res.statusCode}) to: ${res.headers.location}`);
      downloadSheet(res.headers.location);
      return;
    }

    if (res.statusCode !== 200) {
      console.error(`Failed to download sheet. Status Code: ${res.statusCode}`);
      return;
    }

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const jsonData = csvToJson(data);
        
        // Ensure directory exists
        const dir = path.dirname(OUTPUT_PATH);
        if (!fs.existsSync(dir)){
          fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(jsonData, null, 2));
        console.log(`Successfully converted sheet to JSON at: ${OUTPUT_PATH}`);
        console.log(`Total records: ${jsonData.length}`);
        process.exit(0);
      } catch (error) {
        console.error('Error parsing CSV or writing file:', error);
        process.exit(1);
      }
    });

  }).on('error', (err) => {
    console.error('Error downloading file:', err.message);
    process.exit(1);
  });
}

downloadSheet(EXPORT_URL);
