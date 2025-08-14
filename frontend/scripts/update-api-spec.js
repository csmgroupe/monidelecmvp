#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKEND_URL = 'http://localhost:3000/api/v1/docs-json';
const API_SPEC_PATH = path.join(__dirname, '..', 'api-specs', 'open-api-v1.json');

async function updateApiSpec() {
  try {
    console.log('Fetching OpenAPI spec from backend...');
    
    const response = await fetch(BACKEND_URL);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch OpenAPI spec: ${response.status} ${response.statusText}`);
    }
    
    const apiSpec = await response.text();
    
    // Validate that it's valid JSON
    JSON.parse(apiSpec);
    
    // Write to file with proper formatting
    const formattedSpec = JSON.stringify(JSON.parse(apiSpec), null, 2);
    fs.writeFileSync(API_SPEC_PATH, formattedSpec);
    
    console.log('✅ Successfully updated api-specs/open-api-v1.json');
    console.log('📝 You can now run "npm run api-specs:create" to regenerate the API client');
    
  } catch (error) {
    console.error('❌ Error updating API spec:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Make sure the backend server is running on http://localhost:3000');
    }
    
    process.exit(1);
  }
}

updateApiSpec(); 