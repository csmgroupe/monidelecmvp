"""Configuration settings for the NF C 15-100 Compliance Engine."""

from functools import lru_cache
from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings."""
    
    # API Configuration
    app_name: str = "NF C 15-100 Compliance Engine"
    app_version: str = "0.1.0"
    debug: bool = False
    
    # CORS settings
    allowed_origins: List[str] = ["*"]
    
    # Server settings
    host: str = "0.0.0.0"
    port: int = 8000
    
    # Security settings
    production_mode: bool = os.getenv("NODE_ENV") == "production"
    
    # File paths
    ontology_path: str = "ontologies/nfc15100_ontology.ttl"
    shapes_path: str = "shapes/nfc15100_shapes.ttl"
    
    # Validation settings
    validation_timeout: int = 60  # seconds
    max_rooms_per_validation: int = 50
    max_equipment_per_room: int = 100
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings() 