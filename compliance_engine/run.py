#!/usr/bin/env python3
"""Run script for the NF C 15-100 Compliance Engine."""

import uvicorn
from src.compliance_engine.config import get_settings

if __name__ == "__main__":
    settings = get_settings()
    
    uvicorn.run(
        "src.compliance_engine.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level="info"
    ) 