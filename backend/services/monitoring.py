"""
Monitoring and logging service for AMS Backend.
Provides structured logging, correlation IDs, performance monitoring, and error tracking.
"""

import logging
import time
import uuid
import json
import traceback
from typing import Any, Dict, Optional, Callable, List
from datetime import datetime
from functools import wraps
from contextvars import ContextVar
import threading
from dataclasses import dataclass, asdict
from collections import defaultdict
import psutil
import os

# Context variables for request tracking
correlation_id: ContextVar[str] = ContextVar('correlation_id', default='')
user_id: ContextVar[str] = ContextVar('user_id', default='')
request_path: ContextVar[str] = ContextVar('request_path', default='')

@dataclass
class PerformanceMetrics:
    """Performance metrics data class"""
    endpoint: str
    method: str
    duration_ms: float
    status_code: int
    user_id: Optional[str] = None
    correlation_id: str = ''
    timestamp: str = ''
    memory_usage_mb: float = 0.0
    cpu_usage_percent: float = 0.0

@dataclass
class ErrorEvent:
    """Error event data class"""
    error_type: str
    message: str
    stack_trace: str
    correlation_id: str = ''
    user_id: Optional[str] = None
    endpoint: str = ''
    method: str = ''
    timestamp: str = ''
    severity: str = 'error'

class StructuredFormatter(logging.Formatter):
    """Custom formatter for structured logging"""
    
    def format(self, record):
        # Add correlation ID and user ID to log record
        record.correlation_id = correlation_id.get('')
        record.user_id = user_id.get('')
        record.request_path = request_path.get('')
        
        # Create structured log entry
        log_entry = {
            'timestamp': datetime.utcnow().isoformat(),
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'correlation_id': record.correlation_id,
            'user_id': record.user_id,
            'request_path': record.request_path,
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno,
        }
        
        # Add exception info if present
        if record.exc_info:
            log_entry['exception'] = {
                'type': record.exc_info[0].__name__,
                'message': str(record.exc_info[1]),
                'traceback': traceback.format_exception(*record.exc_info)
            }
        
        # Add extra fields if present
        if hasattr(record, 'extra_fields'):
            log_entry.update(record.extra_fields)
        
        return json.dumps(log_entry)

class MonitoringService:
    """Centralized monitoring and logging service"""
    
    def __init__(self):
        self.performance_metrics: List[PerformanceMetrics] = []
        self.error_events: List[ErrorEvent] = []
        self.metrics_lock = threading.Lock()
        self.error_thresholds = {
            'response_time_ms': 1000,  # 1 second
            'error_rate_percent': 5.0,  # 5%
            'memory_usage_mb': 512,     # 512 MB
            'cpu_usage_percent': 80.0   # 80%
        }
        self.alert_handlers: List[Callable] = []
        
        # Setup logging
        self._setup_logging()
        
        # Start monitoring thread
        self._start_monitoring_thread()
    
    def _setup_logging(self):
        """Setup structured logging"""
        # Create logger
        logger = logging.getLogger('ams')
        logger.setLevel(logging.INFO)
        
        # Remove existing handlers
        for handler in logger.handlers[:]:
            logger.removeHandler(handler)
        
        # Console handler with structured formatting
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(StructuredFormatter())
        logger.addHandler(console_handler)
        
        # File handler for persistent logs
        if not os.path.exists('logs'):
            os.makedirs('logs')
        
        file_handler = logging.FileHandler('logs/ams.log')
        file_handler.setFormatter(StructuredFormatter())
        logger.addHandler(file_handler)
        
        # Error file handler
        error_handler = logging.FileHandler('logs/errors.log')
        error_handler.setLevel(logging.ERROR)
        error_handler.setFormatter(StructuredFormatter())
        logger.addHandler(error_handler)
        
        self.logger = logger
    
    def _start_monitoring_thread(self):
        """Start background monitoring thread"""
        def monitor_system():
            while True:
                try:
                    self._collect_system_metrics()
                    time.sleep(60)  # Collect metrics every minute
                except Exception as e:
                    self.logger.error(f"Error in monitoring thread: {e}")
        
        monitor_thread = threading.Thread(target=monitor_system, daemon=True)
        monitor_thread.start()
    
    def _collect_system_metrics(self):
        """Collect system performance metrics"""
        try:
            process = psutil.Process()
            memory_info = process.memory_info()
            cpu_percent = process.cpu_percent()
            
            # Check thresholds and trigger alerts
            if memory_info.rss / 1024 / 1024 > self.error_thresholds['memory_usage_mb']:
                self._trigger_alert('high_memory_usage', {
                    'memory_usage_mb': memory_info.rss / 1024 / 1024,
                    'threshold': self.error_thresholds['memory_usage_mb']
                })
            
            if cpu_percent > self.error_thresholds['cpu_usage_percent']:
                self._trigger_alert('high_cpu_usage', {
                    'cpu_usage_percent': cpu_percent,
                    'threshold': self.error_thresholds['cpu_usage_percent']
                })
                
        except Exception as e:
            self.logger.error(f"Error collecting system metrics: {e}")
    
    def _trigger_alert(self, alert_type: str, data: Dict[str, Any]):
        """Trigger an alert"""
        alert = {
            'type': alert_type,
            'timestamp': datetime.utcnow().isoformat(),
            'data': data,
            'correlation_id': correlation_id.get(''),
            'user_id': user_id.get('')
        }
        
        self.logger.warning(f"Alert triggered: {alert_type}", extra={'alert': alert})
        
        # Call alert handlers
        for handler in self.alert_handlers:
            try:
                handler(alert)
            except Exception as e:
                self.logger.error(f"Error in alert handler: {e}")
    
    def add_alert_handler(self, handler: Callable):
        """Add custom alert handler"""
        self.alert_handlers.append(handler)
    
    def log_request_start(self, path: str, method: str, user_id_param: Optional[str] = None):
        """Log the start of a request"""
        corr_id = str(uuid.uuid4())
        correlation_id.set(corr_id)
        request_path.set(path)
        if user_id_param:
            user_id.set(str(user_id_param))
        
        self.logger.info(f"Request started: {method} {path}", extra={
            'extra_fields': {
                'event_type': 'request_start',
                'method': method,
                'path': path,
                'user_id': user_id_param
            }
        })
        
        return corr_id
    
    def log_request_end(self, path: str, method: str, status_code: int, 
                       duration_ms: float, user_id_param: Optional[str] = None):
        """Log the end of a request with performance metrics"""
        # Record performance metrics
        metrics = PerformanceMetrics(
            endpoint=path,
            method=method,
            duration_ms=duration_ms,
            status_code=status_code,
            user_id=str(user_id_param) if user_id_param else None,
            correlation_id=correlation_id.get(''),
            timestamp=datetime.utcnow().isoformat(),
            memory_usage_mb=psutil.Process().memory_info().rss / 1024 / 1024,
            cpu_usage_percent=psutil.Process().cpu_percent()
        )
        
        with self.metrics_lock:
            self.performance_metrics.append(metrics)
            # Keep only last 1000 metrics
            if len(self.performance_metrics) > 1000:
                self.performance_metrics = self.performance_metrics[-1000:]
        
        # Check for performance issues
        if duration_ms > self.error_thresholds['response_time_ms']:
            self._trigger_alert('slow_response', {
                'endpoint': path,
                'duration_ms': duration_ms,
                'threshold': self.error_thresholds['response_time_ms']
            })
        
        # Log request completion
        self.logger.info(f"Request completed: {method} {path} - {status_code} ({duration_ms:.2f}ms)", extra={
            'extra_fields': {
                'event_type': 'request_end',
                'method': method,
                'path': path,
                'status_code': status_code,
                'duration_ms': duration_ms,
                'user_id': user_id_param
            }
        })
    
    def log_error(self, error: Exception, context: Optional[Dict[str, Any]] = None):
        """Log an error with full context"""
        error_event = ErrorEvent(
            error_type=type(error).__name__,
            message=str(error),
            stack_trace=traceback.format_exc(),
            correlation_id=correlation_id.get(''),
            user_id=user_id.get(''),
            endpoint=request_path.get(''),
            method='',  # Would need to be set from request context
            timestamp=datetime.utcnow().isoformat(),
            severity='error'
        )
        
        with self.metrics_lock:
            self.error_events.append(error_event)
            # Keep only last 1000 errors
            if len(self.error_events) > 1000:
                self.error_events = self.error_events[-1000:]
        
        # Log error
        self.logger.error(f"Error occurred: {error}", extra={
            'extra_fields': {
                'event_type': 'error',
                'error_type': error_event.error_type,
                'stack_trace': error_event.stack_trace,
                'context': context or {}
            }
        })
        
        # Check error rate
        self._check_error_rate()
    
    def _check_error_rate(self):
        """Check if error rate exceeds threshold"""
        with self.metrics_lock:
            if len(self.performance_metrics) > 0:
                recent_metrics = self.performance_metrics[-100:]  # Last 100 requests
                error_count = sum(1 for m in recent_metrics if m.status_code >= 400)
                error_rate = (error_count / len(recent_metrics)) * 100
                
                if error_rate > self.error_thresholds['error_rate_percent']:
                    self._trigger_alert('high_error_rate', {
                        'error_rate_percent': error_rate,
                        'threshold': self.error_thresholds['error_rate_percent'],
                        'total_requests': len(recent_metrics),
                        'error_count': error_count
                    })
    
    def get_performance_stats(self) -> Dict[str, Any]:
        """Get performance statistics"""
        with self.metrics_lock:
            if not self.performance_metrics:
                return {}
            
            recent_metrics = self.performance_metrics[-100:]  # Last 100 requests
            
            # Calculate statistics
            durations = [m.duration_ms for m in recent_metrics]
            status_codes = [m.status_code for m in recent_metrics]
            
            stats = {
                'total_requests': len(recent_metrics),
                'avg_response_time_ms': sum(durations) / len(durations),
                'min_response_time_ms': min(durations),
                'max_response_time_ms': max(durations),
                'success_rate_percent': (sum(1 for s in status_codes if s < 400) / len(status_codes)) * 100,
                'error_rate_percent': (sum(1 for s in status_codes if s >= 400) / len(status_codes)) * 100,
                'requests_per_minute': len(recent_metrics) / 1.67,  # Assuming 100 requests over 1.67 minutes
                'memory_usage_mb': psutil.Process().memory_info().rss / 1024 / 1024,
                'cpu_usage_percent': psutil.Process().cpu_percent()
            }
            
            return stats
    
    def get_error_summary(self) -> Dict[str, Any]:
        """Get error summary"""
        with self.metrics_lock:
            if not self.error_events:
                return {'total_errors': 0, 'error_types': {}}
            
            recent_errors = self.error_events[-100:]  # Last 100 errors
            
            # Count error types
            error_types = defaultdict(int)
            for error in recent_errors:
                error_types[error.error_type] += 1
            
            return {
                'total_errors': len(recent_errors),
                'error_types': dict(error_types),
                'recent_errors': [asdict(error) for error in recent_errors[-10:]]  # Last 10 errors
            }

# Global monitoring instance
monitoring_service = MonitoringService()

# Decorators for easy monitoring
def monitor_performance(func):
    """Decorator to monitor function performance"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        corr_id = monitoring_service.log_request_start(
            path=func.__name__,
            method='FUNCTION',
            user_id=user_id.get('')
        )
        
        try:
            result = func(*args, **kwargs)
            duration_ms = (time.time() - start_time) * 1000
            
            monitoring_service.log_request_end(
                path=func.__name__,
                method='FUNCTION',
                status_code=200,
                duration_ms=duration_ms,
                user_id=user_id.get('')
            )
            
            return result
        except Exception as e:
            duration_ms = (time.time() - start_time) * 1000
            
            monitoring_service.log_request_end(
                path=func.__name__,
                method='FUNCTION',
                status_code=500,
                duration_ms=duration_ms,
                user_id=user_id.get('')
            )
            
            monitoring_service.log_error(e)
            raise
    
    return wrapper

def log_operation(operation_name: str):
    """Decorator to log operations"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            monitoring_service.logger.info(f"Operation started: {operation_name}", extra={
                'extra_fields': {
                    'event_type': 'operation_start',
                    'operation': operation_name,
                    'args_count': len(args),
                    'kwargs_keys': list(kwargs.keys())
                }
            })
            
            try:
                result = func(*args, **kwargs)
                
                monitoring_service.logger.info(f"Operation completed: {operation_name}", extra={
                    'extra_fields': {
                        'event_type': 'operation_end',
                        'operation': operation_name,
                        'success': True
                    }
                })
                
                return result
            except Exception as e:
                monitoring_service.logger.error(f"Operation failed: {operation_name}", extra={
                    'extra_fields': {
                        'event_type': 'operation_end',
                        'operation': operation_name,
                        'success': False,
                        'error': str(e)
                    }
                })
                raise
        
        return wrapper
    return decorator 