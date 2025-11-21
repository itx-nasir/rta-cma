"""Configuration settings for RTA Camera Management System"""

import os
from typing import List
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Settings:
    """Application settings"""
    
    def __init__(self):
        # Application Info
        self.APP_NAME = "RTA Camera Management System"
        self.APP_VERSION = "1.0.0"
        self.APP_DESCRIPTION = "Camera Management Application for Roads and Transport Authority"
        
        # Environment
        self.ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
        self.DEBUG = os.getenv("DEBUG", "false").lower() == "true"
        
        # Database
        self.DATABASE_URL = self._get_database_url()
        self.SQL_ECHO = os.getenv("SQL_ECHO", "false").lower() == "true"
        
        # Security
        self.SECRET_KEY = self._get_secret_key()
        self.ALGORITHM = "HS256"
        self.ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
        
        # Admin Settings (for initial setup)
        self.ADMIN_USERNAME = os.getenv("ADMIN_USERNAME")
        self.ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
        self.ADMIN_FULL_NAME = os.getenv("ADMIN_FULL_NAME")
        self.ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")
        self.ADMIN_ROLE = os.getenv("ADMIN_ROLE")
        
        # CORS
        self.CORS_ORIGINS = self._get_cors_origins()
        
        # API Settings
        self.API_V1_STR = "/api/v1"
        
        # Pagination
        self.DEFAULT_PAGE_SIZE = 100
        self.MAX_PAGE_SIZE = 1000
    
    def _get_database_url(self) -> str:
        """Get database URL from environment or build from components"""
        database_url = os.getenv("DATABASE_URL")
        if database_url:
            return database_url
        
        # Build from individual components
        db_name = os.getenv("DATABASE_NAME", "rta_cma")
        db_user = os.getenv("DATABASE_USER", "rta")
        db_password = os.getenv("DATABASE_PASSWORD", "")
        db_host = os.getenv("DATABASE_HOST", "localhost")
        db_port = os.getenv("DATABASE_PORT", "5432")
        
        if db_password:
            return f"postgresql+psycopg2://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
        else:
            return f"postgresql+psycopg2://{db_user}@{db_host}:{db_port}/{db_name}"
    
    def _get_secret_key(self) -> str:
        """Get secret key with validation"""
        secret_key = os.getenv("SECRET_KEY", "")
        if not secret_key:
            if self.ENVIRONMENT.lower() == "production":
                raise ValueError("SECRET_KEY must be set in production")
            # Provide default for development
            return "dev-secret-key-change-in-production-32-chars-long!"
        return secret_key
    
    def _get_cors_origins(self) -> List[str]:
        """Get CORS origins as a list"""
        cors_str = os.getenv("CORS_ORIGINS", "")
        if not cors_str.strip():
            return ["http://localhost:3000", "http://127.0.0.1:3000"]
        
        # Split by comma and clean up
        origins = [origin.strip() for origin in cors_str.split(",") if origin.strip()]
        return origins if origins else ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    @property
    def is_production(self) -> bool:
        """Check if running in production"""
        return self.ENVIRONMENT.lower() == "production"
    
    @property
    def is_development(self) -> bool:
        """Check if running in development"""
        return self.ENVIRONMENT.lower() == "development"


# Global settings instance
settings = Settings()