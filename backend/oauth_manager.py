import json
import time
import secrets
import hashlib
import base64
from typing import Optional, Dict, Any
from config import settings

# Try to import real Redis, fallback to mock
try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    from mock_redis import from_url, RedisError
    REDIS_AVAILABLE = False

class OAuthStateManager:
    """Manages OAuth state tokens using Redis for persistence with fallback to memory"""
    
    def __init__(self):
        if REDIS_AVAILABLE:
            self.redis_client = redis.from_url(settings.redis_url, decode_responses=True)
        else:
            self.redis_client = from_url(settings.redis_url, decode_responses=True)
        self.state_ttl = 600  # 10 minutes
        self.fallback_storage = {}  # In-memory fallback
        self.use_fallback = False
    
    def _check_redis_availability(self):
        """Check if Redis is available, fallback to memory if not"""
        if not self.use_fallback:
            try:
                self.redis_client.ping()
                return True
            except redis.RedisError:
                if settings.debug:
                    print("⚠️  Redis not available, falling back to in-memory storage")
                self.use_fallback = True
        return False
    
    def generate_state_and_pkce(self) -> Dict[str, str]:
        """Generate state parameter and PKCE code verifier/challenge"""
        # Generate state parameter for CSRF protection
        state = secrets.token_urlsafe(32)
        
        # Generate PKCE code verifier and challenge
        code_verifier = secrets.token_urlsafe(32)
        code_challenge = base64.urlsafe_b64encode(
            hashlib.sha256(code_verifier.encode()).digest()
        ).decode().rstrip('=')
        
        # Store state data
        state_data = {
            'code_verifier': code_verifier,
            'timestamp': time.time(),
            'used': False
        }
        
        if self._check_redis_availability():
            # Use Redis
            self.redis_client.setex(
                f"oauth_state:{state}", 
                self.state_ttl, 
                json.dumps(state_data)
            )
        else:
            # Use in-memory fallback
            self.fallback_storage[state] = state_data
        
        return {
            'state': state,
            'code_challenge': code_challenge
        }
    
    def get_state_data(self, state: str) -> Optional[Dict[str, Any]]:
        """Retrieve state data from Redis or fallback storage"""
        if self._check_redis_availability():
            # Try Redis first
            try:
                data = self.redis_client.get(f"oauth_state:{state}")
                if data:
                    return json.loads(data)
            except (json.JSONDecodeError, redis.RedisError) as e:
                if settings.debug:
                    print(f"Error retrieving OAuth state from Redis: {e}")
        
        # Fallback to in-memory storage
        return self.fallback_storage.get(state)
    
    def mark_state_used(self, state: str) -> bool:
        """Mark state as used to prevent replay attacks"""
        if self._check_redis_availability():
            # Try Redis first
            try:
                data = self.get_state_data(state)
                if data and not data.get('used'):
                    data['used'] = True
                    self.redis_client.setex(
                        f"oauth_state:{state}", 
                        self.state_ttl, 
                        json.dumps(data)
                    )
                    return True
            except redis.RedisError as e:
                if settings.debug:
                    print(f"Error marking OAuth state as used in Redis: {e}")
        
        # Fallback to in-memory storage
        data = self.fallback_storage.get(state)
        if data and not data.get('used'):
            data['used'] = True
            return True
        
        return False
    
    def cleanup_expired_states(self) -> int:
        """Clean up expired state tokens"""
        if self._check_redis_availability():
            # Redis handles expiration automatically
            try:
                pattern = "oauth_state:*"
                active_states = len(self.redis_client.keys(pattern))
                if settings.debug:
                    print(f"Active OAuth states in Redis: {active_states}")
                return active_states
            except redis.RedisError as e:
                if settings.debug:
                    print(f"Error cleaning up OAuth states in Redis: {e}")
        
        # Clean up expired states in fallback storage
        current_time = time.time()
        expired_states = [
            state for state, data in self.fallback_storage.items()
            if current_time - data.get('timestamp', 0) > self.state_ttl
        ]
        for state in expired_states:
            del self.fallback_storage[state]
        
        if settings.debug:
            print(f"Active OAuth states in fallback: {len(self.fallback_storage)}")
        
        return len(self.fallback_storage)
    
    def is_redis_available(self) -> bool:
        """Check if Redis is available"""
        if self.use_fallback:
            return False
        try:
            self.redis_client.ping()
            return True
        except redis.RedisError:
            return False

# Global OAuth state manager instance
oauth_state_manager = OAuthStateManager() 