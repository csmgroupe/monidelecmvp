# Frontend Scripts

This directory contains utility scripts for the frontend project.

## API Specification Scripts

### update-api-spec.js

Fetches the latest OpenAPI specification from the backend server and updates the local `api-specs/open-api-v1.json` file.

**Requirements:**
- Backend server must be running on `http://localhost:3000`

**Usage:**
```bash
# Update the API spec file
npm run api-specs:update

# Generate API client from updated spec
npm run api-specs:create

# Do both in one command
npm run api-specs:sync
```

**What it does:**
1. Fetches OpenAPI spec from `http://localhost:3000/api/v1/docs-json`
2. Validates the JSON format
3. Updates `frontend/api-specs/open-api-v1.json` with proper formatting
4. Provides next steps for regenerating the API client

This ensures your frontend API client stays in sync with backend changes. 