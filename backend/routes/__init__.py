"""
API route handlers
"""
from .metrics import metrics_bp
from .system import system_bp

__all__ = ['metrics_bp', 'system_bp']
