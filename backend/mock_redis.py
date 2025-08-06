"""
Mock Redis client for development
This provides a Redis-like interface without requiring a Redis server
"""

import time
import json
import threading
from typing import Optional, List, Any

class MockRedisClient:
    """Mock Redis client for development"""
    
    def __init__(self, host='localhost', port=6379, db=0, decode_responses=True):
        self.host = host
        self.port = port
        self.db = db
        self.decode_responses = decode_responses
        self.data = {}
        self.expiry = {}
        self.lock = threading.Lock()
        
    def set(self, key: str, value: str, ex: Optional[int] = None) -> bool:
        """Set a key-value pair"""
        with self.lock:
            self.data[key] = value
            if ex:
                self.expiry[key] = time.time() + ex
            else:
                self.expiry.pop(key, None)
        return True
    
    def setex(self, key: str, time: int, value: str) -> bool:
        """Set a key with expiration"""
        return self.set(key, value, ex=time)
    
    def get(self, key: str) -> Optional[str]:
        """Get a value by key"""
        with self.lock:
            # Check if key exists and is not expired
            if key in self.data:
                if key in self.expiry and time.time() > self.expiry[key]:
                    # Key has expired, remove it
                    del self.data[key]
                    del self.expiry[key]
                    return None
                return self.data[key]
            return None
    
    def delete(self, key: str) -> int:
        """Delete a key"""
        with self.lock:
            if key in self.data:
                del self.data[key]
                self.expiry.pop(key, None)
                return 1
            return 0
    
    def keys(self, pattern: str) -> List[str]:
        """Get keys matching pattern"""
        with self.lock:
            # Simple pattern matching
            if pattern == "*":
                return list(self.data.keys())
            elif pattern.endswith("*"):
                prefix = pattern[:-1]
                return [key for key in self.data.keys() if key.startswith(prefix)]
            else:
                return [key for key in self.data.keys() if key == pattern]
    
    def ping(self) -> bool:
        """Health check"""
        return True
    
    def exists(self, key: str) -> int:
        """Check if key exists"""
        with self.lock:
            if key in self.data:
                if key in self.expiry and time.time() > self.expiry[key]:
                    # Key has expired, remove it
                    del self.data[key]
                    del self.expiry[key]
                    return 0
                return 1
            return 0
    
    def ttl(self, key: str) -> int:
        """Get time to live for a key"""
        with self.lock:
            if key in self.expiry:
                ttl = self.expiry[key] - time.time()
                return max(0, int(ttl))
            return -1
    
    def expire(self, key: str, time: int) -> bool:
        """Set expiration for a key"""
        with self.lock:
            if key in self.data:
                self.expiry[key] = time.time() + time
                return True
            return False
    
    def flushdb(self) -> bool:
        """Clear all data"""
        with self.lock:
            self.data.clear()
            self.expiry.clear()
        return True
    
    def dbsize(self) -> int:
        """Get number of keys"""
        with self.lock:
            return len(self.data)
    
    def cleanup_expired(self) -> int:
        """Remove expired keys"""
        with self.lock:
            current_time = time.time()
            expired_keys = [
                key for key, expiry in self.expiry.items()
                if current_time > expiry
            ]
            for key in expired_keys:
                del self.data[key]
                del self.expiry[key]
            return len(expired_keys)

# Mock Redis connection function
def from_url(url: str, decode_responses: bool = True):
    """Create a mock Redis client from URL"""
    # Parse URL (simple parsing)
    if url.startswith('redis://'):
        url = url[8:]  # Remove 'redis://'
    
    # Extract host, port, db
    parts = url.split('/')
    host_port = parts[0].split(':')
    host = host_port[0] if host_port[0] else 'localhost'
    port = int(host_port[1]) if len(host_port) > 1 else 6379
    db = int(parts[1]) if len(parts) > 1 else 0
    
    return MockRedisClient(host=host, port=port, db=db, decode_responses=decode_responses)

# Mock RedisError for compatibility
class RedisError(Exception):
    pass 