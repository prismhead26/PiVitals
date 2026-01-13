"""
Service monitoring module
Collects systemd service status information
"""
import subprocess
import shutil


def _parse_systemctl_output(output):
    services = []
    for line in output.splitlines():
        line = line.strip()
        if not line:
            continue
        parts = line.split(None, 4)
        if len(parts) < 4:
            continue
        name, load_state, active_state, sub_state = parts[:4]
        description = parts[4] if len(parts) == 5 else ''
        services.append({
            'name': name,
            'load_state': load_state,
            'active_state': active_state,
            'sub_state': sub_state,
            'description': description
        })
    return services


def _normalize_service_name(name):
    name = name.strip()
    if not name:
        return None
    if not name.endswith('.service'):
        return f"{name}.service"
    return name


def get_service_metrics(limit=15, watched=None):
    """
    Get systemd service metrics.
    Returns a dictionary with summary, failed services, and watched services.
    """
    systemctl_path = shutil.which('systemctl')
    if not systemctl_path:
        return {
            'error': 'systemctl not found - service monitoring unavailable',
            'summary': {},
            'failed': [],
            'watched': []
        }

    try:
        result = subprocess.run(
            [systemctl_path, 'list-units', '--type=service', '--all', '--no-pager', '--no-legend'],
            capture_output=True,
            text=True,
            timeout=3
        )
        if result.returncode != 0:
            return {
                'error': result.stderr.strip() or 'Failed to query systemctl',
                'summary': {},
                'failed': [],
                'watched': []
            }

        services = _parse_systemctl_output(result.stdout)
        summary = {
            'total': len(services),
            'active': 0,
            'failed': 0,
            'inactive': 0,
            'activating': 0,
            'deactivating': 0
        }

        for service in services:
            state = service['active_state']
            if state in summary:
                summary[state] += 1

        failed_services = [svc for svc in services if svc['active_state'] == 'failed'][:limit]

        watched_services = []
        if watched:
            normalized = [_normalize_service_name(name) for name in watched]
            normalized = [name for name in normalized if name]
            service_map = {svc['name']: svc for svc in services}
            for name in normalized:
                if name in service_map:
                    watched_services.append(service_map[name])

        running_services = [svc for svc in services if svc['active_state'] == 'active'][:limit]

        return {
            'summary': summary,
            'failed': failed_services,
            'watched': watched_services,
            'running_sample': running_services
        }
    except subprocess.TimeoutExpired:
        return {
            'error': 'systemctl timed out',
            'summary': {},
            'failed': [],
            'watched': []
        }
    except Exception as e:
        return {
            'error': str(e),
            'summary': {},
            'failed': [],
            'watched': []
        }
