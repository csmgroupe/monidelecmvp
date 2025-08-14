#!/usr/bin/env python3
import sys
sys.path.append('src')
from compliance_engine.main import app
import uvicorn

if __name__ == "__main__":
    print("Starting NF C 15-100 Compliance Engine server...")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info") 