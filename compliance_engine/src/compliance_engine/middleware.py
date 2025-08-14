"""Middleware for the NF C 15-100 Compliance Engine."""

from fastapi import Request, HTTPException
from fastapi.responses import Response
import time
import logging

from .config import get_settings

logger = logging.getLogger(__name__)



async def logging_middleware(request: Request, call_next):
    """Middleware for request logging."""
    start_time = time.time()
    
    # Log request
    logger.info(f"Request: {request.method} {request.url.path}")
    
    response = await call_next(request)
    
    # Log response
    process_time = time.time() - start_time
    logger.info(f"Response: {response.status_code} in {process_time:.3f}s")
    
    return response


async def security_headers_middleware(request: Request, call_next):
    """Middleware to add security headers."""
    response = await call_next(request)
    
    # Add security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    
    return response 