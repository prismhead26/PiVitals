"""
Configuration settings for PiVitals backend
"""
import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Base configuration"""

    # Flask settings
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    DEBUG = FLASK_ENV == 'development'
    PORT = int(os.getenv('FLASK_PORT', 5001))
    HOST = os.getenv('FLASK_HOST', '0.0.0.0')

    # CORS settings
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:5173,http://localhost:3000').split(',')

    # Application settings
    APP_VERSION = '1.0.0'
    METRICS_CACHE_SECONDS = int(os.getenv('METRICS_CACHE_SECONDS', 1))

    # Logging
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')

    # System monitoring settings
    SYSTEM_CACHE_SECONDS = int(os.getenv('SYSTEM_CACHE_SECONDS', 5))
    SYSTEM_PROCESS_LIMIT = int(os.getenv('SYSTEM_PROCESS_LIMIT', 10))
    SYSTEM_SERVICE_LIMIT = int(os.getenv('SYSTEM_SERVICE_LIMIT', 15))
    SYSTEM_SECURITY_LIMIT = int(os.getenv('SYSTEM_SECURITY_LIMIT', 10))
    WATCHED_SERVICES = [
        name.strip() for name in os.getenv('WATCHED_SERVICES', 'pivitals,ssh').split(',')
        if name.strip()
    ]


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False


# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}


def get_config():
    """Get the appropriate configuration based on environment"""
    env = os.getenv('FLASK_ENV', 'development')
    return config.get(env, config['default'])
