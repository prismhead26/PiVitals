"""
Metrics API endpoints
Provides REST API for system metrics
"""
from flask import Blueprint, jsonify
from functools import lru_cache
import time
from monitors import (
    get_cpu_metrics,
    get_memory_metrics,
    get_disk_metrics,
    get_network_metrics
)

metrics_bp = Blueprint('metrics', __name__, url_prefix='/api/v1/metrics')

# Cache timestamp for cache invalidation
_cache_timestamp = {'time': 0}


def should_update_cache():
    """Check if cache should be updated (1 second interval)"""
    current_time = time.time()
    if current_time - _cache_timestamp['time'] >= 1:
        _cache_timestamp['time'] = current_time
        # Clear LRU cache to force new data fetch
        get_cpu_metrics_cached.cache_clear()
        get_memory_metrics_cached.cache_clear()
        get_disk_metrics_cached.cache_clear()
        get_network_metrics_cached.cache_clear()
        return True
    return False


@lru_cache(maxsize=1)
def get_cpu_metrics_cached():
    """Cached CPU metrics"""
    return get_cpu_metrics()


@lru_cache(maxsize=1)
def get_memory_metrics_cached():
    """Cached memory metrics"""
    return get_memory_metrics()


@lru_cache(maxsize=1)
def get_disk_metrics_cached():
    """Cached disk metrics"""
    return get_disk_metrics()


@lru_cache(maxsize=1)
def get_network_metrics_cached():
    """Cached network metrics"""
    return get_network_metrics()


@metrics_bp.route('/cpu', methods=['GET'])
def cpu_metrics():
    """Get CPU metrics"""
    should_update_cache()
    data = get_cpu_metrics_cached()
    return jsonify(data), 200


@metrics_bp.route('/memory', methods=['GET'])
def memory_metrics():
    """Get memory metrics"""
    should_update_cache()
    data = get_memory_metrics_cached()
    return jsonify(data), 200


@metrics_bp.route('/disk', methods=['GET'])
def disk_metrics():
    """Get disk metrics"""
    should_update_cache()
    data = get_disk_metrics_cached()
    return jsonify(data), 200


@metrics_bp.route('/network', methods=['GET'])
def network_metrics():
    """Get network metrics"""
    should_update_cache()
    data = get_network_metrics_cached()
    return jsonify(data), 200


@metrics_bp.route('/all', methods=['GET'])
def all_metrics():
    """Get all metrics in a single call"""
    should_update_cache()

    return jsonify({
        'cpu': get_cpu_metrics_cached(),
        'memory': get_memory_metrics_cached(),
        'disk': get_disk_metrics_cached(),
        'network': get_network_metrics_cached(),
        'timestamp': time.time()
    }), 200
