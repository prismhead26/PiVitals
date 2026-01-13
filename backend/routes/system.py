"""
System API endpoints for processes, services, and security info
"""
from flask import Blueprint, jsonify, current_app
from functools import lru_cache
import time
from monitors import (
    get_process_metrics,
    get_service_metrics,
    get_security_metrics
)

system_bp = Blueprint('system', __name__, url_prefix='/api/v1/system')

_system_cache_timestamp = {'time': 0}


def _should_update_cache():
    ttl = current_app.config.get('SYSTEM_CACHE_SECONDS', 5)
    current_time = time.time()
    if current_time - _system_cache_timestamp['time'] >= ttl:
        _system_cache_timestamp['time'] = current_time
        get_process_metrics_cached.cache_clear()
        get_service_metrics_cached.cache_clear()
        get_security_metrics_cached.cache_clear()
        get_system_overview_cached.cache_clear()
        return True
    return False


@lru_cache(maxsize=1)
def get_process_metrics_cached():
    limit = current_app.config.get('SYSTEM_PROCESS_LIMIT', 10)
    return get_process_metrics(limit=limit)


@lru_cache(maxsize=1)
def get_service_metrics_cached():
    limit = current_app.config.get('SYSTEM_SERVICE_LIMIT', 15)
    watched = current_app.config.get('WATCHED_SERVICES', [])
    return get_service_metrics(limit=limit, watched=watched)


@lru_cache(maxsize=1)
def get_security_metrics_cached():
    login_limit = current_app.config.get('SYSTEM_SECURITY_LIMIT', 10)
    failed_limit = current_app.config.get('SYSTEM_SECURITY_LIMIT', 10)
    sudo_limit = current_app.config.get('SYSTEM_SECURITY_LIMIT', 10)
    return get_security_metrics(
        login_limit=login_limit,
        failed_limit=failed_limit,
        sudo_limit=sudo_limit
    )


@lru_cache(maxsize=1)
def get_system_overview_cached():
    return {
        'processes': get_process_metrics_cached(),
        'services': get_service_metrics_cached(),
        'security': get_security_metrics_cached(),
        'timestamp': time.time()
    }


@system_bp.route('/processes', methods=['GET'])
def process_metrics():
    _should_update_cache()
    return jsonify(get_process_metrics_cached()), 200


@system_bp.route('/services', methods=['GET'])
def service_metrics():
    _should_update_cache()
    return jsonify(get_service_metrics_cached()), 200


@system_bp.route('/security', methods=['GET'])
def security_metrics():
    _should_update_cache()
    return jsonify(get_security_metrics_cached()), 200


@system_bp.route('/overview', methods=['GET'])
def system_overview():
    _should_update_cache()
    return jsonify(get_system_overview_cached()), 200
