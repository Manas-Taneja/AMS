"""
Caching service for AMS Backend.
Provides Redis caching with fallback to in-memory caching for development.
"""

import json
import hashlib
import logging
from typing import Any, Optional, Union, Dict, List
from datetime import datetime, timedelta
import redis
from functools import wraps
import pickle
from config import settings

logger = logging.getLogger(__name__)

class CacheService:
    """Centralized caching service with Redis and in-memory fallback"""
    
    def __init__(self):
        self.redis_client = None
        self.memory_cache = {}
        self.memory_expiry = {}
        self.use_redis = False
        
        # Try to connect to Redis
        try:
            self.redis_client = redis.from_url(settings.redis_url)
            self.redis_client.ping()
            self.use_redis = True
            logger.info("Connected to Redis cache")
        except Exception as e:
            logger.warning(f"Redis not available, using in-memory cache: {e}")
            self.use_redis = False
    
    def _generate_key(self, prefix: str, *args, **kwargs) -> str:
        """Generate a cache key from prefix and arguments"""
        key_parts = [prefix]
        
        # Add positional arguments
        for arg in args:
            key_parts.append(str(arg))
        
        # Add keyword arguments (sorted for consistency)
        for key, value in sorted(kwargs.items()):
            key_parts.append(f"{key}:{value}")
        
        # Create hash for long keys
        key_string = ":".join(key_parts)
        if len(key_string) > 250:  # Redis key length limit
            return f"{prefix}:{hashlib.md5(key_string.encode()).hexdigest()}"
        
        return key_string
    
    def get(self, key: str, default: Any = None) -> Any:
        """Get value from cache"""
        try:
            if self.use_redis:
                value = self.redis_client.get(key)
                if value is not None:
                    return pickle.loads(value)
            else:
                # In-memory cache
                if key in self.memory_cache:
                    if key in self.memory_expiry and datetime.now() > self.memory_expiry[key]:
                        # Expired, remove it
                        del self.memory_cache[key]
                        del self.memory_expiry[key]
                    else:
                        return self.memory_cache[key]
            
            return default
        except Exception as e:
            logger.error(f"Error getting cache key {key}: {e}")
            return default
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Set value in cache with optional TTL (seconds)"""
        try:
            if self.use_redis:
                serialized_value = pickle.dumps(value)
                if ttl:
                    return self.redis_client.setex(key, ttl, serialized_value)
                else:
                    return self.redis_client.set(key, serialized_value)
            else:
                # In-memory cache
                self.memory_cache[key] = value
                if ttl:
                    self.memory_expiry[key] = datetime.now() + timedelta(seconds=ttl)
                else:
                    self.memory_expiry.pop(key, None)
                return True
        except Exception as e:
            logger.error(f"Error setting cache key {key}: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """Delete a key from cache"""
        try:
            if self.use_redis:
                return bool(self.redis_client.delete(key))
            else:
                # In-memory cache
                if key in self.memory_cache:
                    del self.memory_cache[key]
                    self.memory_expiry.pop(key, None)
                    return True
                return False
        except Exception as e:
            logger.error(f"Error deleting cache key {key}: {e}")
            return False
    
    def delete_pattern(self, pattern: str) -> int:
        """Delete keys matching pattern"""
        try:
            if self.use_redis:
                keys = self.redis_client.keys(pattern)
                if keys:
                    return self.redis_client.delete(*keys)
                return 0
            else:
                # In-memory cache - simple pattern matching
                deleted_count = 0
                keys_to_delete = [k for k in self.memory_cache.keys() if pattern in k]
                for key in keys_to_delete:
                    if self.delete(key):
                        deleted_count += 1
                return deleted_count
        except Exception as e:
            logger.error(f"Error deleting cache pattern {pattern}: {e}")
            return 0
    
    def exists(self, key: str) -> bool:
        """Check if key exists in cache"""
        try:
            if self.use_redis:
                return bool(self.redis_client.exists(key))
            else:
                if key in self.memory_cache:
                    if key in self.memory_expiry and datetime.now() > self.memory_expiry[key]:
                        # Expired, remove it
                        del self.memory_cache[key]
                        del self.memory_expiry[key]
                        return False
                    return True
                return False
        except Exception as e:
            logger.error(f"Error checking cache key {key}: {e}")
            return False
    
    def get_or_set(self, key: str, default_func, ttl: Optional[int] = None) -> Any:
        """Get value from cache or set default if not exists"""
        value = self.get(key)
        if value is None:
            value = default_func()
            self.set(key, value, ttl)
        return value
    
    def invalidate_model(self, model_name: str, model_id: Optional[int] = None):
        """Invalidate cache for a specific model"""
        pattern = f"model:{model_name}"
        if model_id:
            pattern += f":{model_id}"
        pattern += "*"
        
        deleted_count = self.delete_pattern(pattern)
        logger.info(f"Invalidated {deleted_count} cache entries for {pattern}")
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        try:
            if self.use_redis:
                info = self.redis_client.info()
                return {
                    "type": "redis",
                    "connected_clients": info.get("connected_clients", 0),
                    "used_memory_human": info.get("used_memory_human", "0B"),
                    "keyspace_hits": info.get("keyspace_hits", 0),
                    "keyspace_misses": info.get("keyspace_misses", 0),
                }
            else:
                return {
                    "type": "memory",
                    "total_keys": len(self.memory_cache),
                    "expired_keys": len(self.memory_expiry),
                }
        except Exception as e:
            logger.error(f"Error getting cache stats: {e}")
            return {"type": "unknown", "error": str(e)}

# Global cache instance
cache_service = CacheService()

# Cache decorators
def cached(prefix: str, ttl: Optional[int] = None):
    """Decorator to cache function results"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = cache_service._generate_key(prefix, *args, **kwargs)
            
            # Try to get from cache
            cached_result = cache_service.get(cache_key)
            if cached_result is not None:
                logger.debug(f"Cache hit for {cache_key}")
                return cached_result
            
            # Execute function and cache result
            result = func(*args, **kwargs)
            cache_service.set(cache_key, result, ttl)
            logger.debug(f"Cache miss for {cache_key}, stored result")
            
            return result
        return wrapper
    return decorator

def cache_invalidate(prefix: str):
    """Decorator to invalidate cache after function execution"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            result = func(*args, **kwargs)
            
            # Invalidate cache
            pattern = f"{prefix}*"
            deleted_count = cache_service.delete_pattern(pattern)
            logger.debug(f"Invalidated {deleted_count} cache entries for {pattern}")
            
            return result
        return wrapper
    return decorator

# Cache keys constants
class CacheKeys:
    """Constants for cache key prefixes"""
    USER = "user"
    TRAINING = "training"
    STAFF = "staff"
    PROJECT = "project"
    LOCATION = "location"
    COMPONENT = "component"
    BILL = "bill"
    DASHBOARD = "dashboard"
    STATS = "stats"
    
    @staticmethod
    def user_profile(user_id: int) -> str:
        return f"user:profile:{user_id}"
    
    @staticmethod
    def training_list(filters: Dict[str, Any]) -> str:
        return f"training:list:{hashlib.md5(json.dumps(filters, sort_keys=True).encode()).hexdigest()}"
    
    @staticmethod
    def training_detail(training_id: int) -> str:
        return f"training:detail:{training_id}"
    
    @staticmethod
    def dashboard_stats(user_id: int) -> str:
        return f"dashboard:stats:{user_id}" 