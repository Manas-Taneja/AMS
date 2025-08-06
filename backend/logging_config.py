"""
Logging configuration for AMS Backend.
Centralizes logging setup and provides consistent logging across the application.
"""

import logging
import logging.config
import os
from datetime import datetime

def setup_logging():
    """Setup logging configuration for the application"""
    
    # Create logs directory if it doesn't exist
    os.makedirs('logs', exist_ok=True)
    
    # Logging configuration
    logging_config = {
        'version': 1,
        'disable_existing_loggers': False,
        'formatters': {
            'standard': {
                'format': '%(asctime)s [%(levelname)s] %(name)s: %(message)s',
                'datefmt': '%Y-%m-%d %H:%M:%S'
            },
            'detailed': {
                'format': '%(asctime)s [%(levelname)s] %(name)s:%(lineno)d: %(message)s',
                'datefmt': '%Y-%m-%d %H:%M:%S'
            },
            'json': {
                'format': '{"timestamp": "%(asctime)s", "level": "%(levelname)s", "logger": "%(name)s", "message": "%(message)s"}',
                'datefmt': '%Y-%m-%d %H:%M:%S'
            }
        },
        'handlers': {
            'console': {
                'class': 'logging.StreamHandler',
                'level': 'INFO',
                'formatter': 'standard',
                'stream': 'ext://sys.stdout'
            },
            'file': {
                'class': 'logging.handlers.RotatingFileHandler',
                'level': 'DEBUG',
                'formatter': 'detailed',
                'filename': f'logs/ams_{datetime.now().strftime("%Y%m%d")}.log',
                'maxBytes': 10485760,  # 10MB
                'backupCount': 5
            },
            'error_file': {
                'class': 'logging.handlers.RotatingFileHandler',
                'level': 'ERROR',
                'formatter': 'detailed',
                'filename': f'logs/ams_errors_{datetime.now().strftime("%Y%m%d")}.log',
                'maxBytes': 10485760,  # 10MB
                'backupCount': 5
            }
        },
        'loggers': {
            '': {  # Root logger
                'handlers': ['console', 'file', 'error_file'],
                'level': 'INFO',
                'propagate': False
            },
            'uvicorn': {
                'handlers': ['console', 'file'],
                'level': 'INFO',
                'propagate': False
            },
            'fastapi': {
                'handlers': ['console', 'file'],
                'level': 'INFO',
                'propagate': False
            },
            'sqlalchemy': {
                'handlers': ['file'],
                'level': 'WARNING',
                'propagate': False
            }
        }
    }
    
    # Apply configuration
    logging.config.dictConfig(logging_config)
    
    # Set environment-specific log levels
    if os.getenv("ENVIRONMENT") == "development":
        logging.getLogger().setLevel(logging.DEBUG)
        logging.getLogger('uvicorn').setLevel(logging.DEBUG)
    else:
        logging.getLogger().setLevel(logging.INFO)
        logging.getLogger('uvicorn').setLevel(logging.WARNING)

def get_logger(name: str) -> logging.Logger:
    """Get a logger instance with the given name"""
    return logging.getLogger(name)

# Initialize logging when module is imported
setup_logging() 