"""
CPU monitoring module
Collects CPU usage, temperature, and frequency data
"""
import psutil
import os


def get_cpu_temperature():
    """
    Get CPU temperature from Raspberry Pi thermal zone
    Returns temperature in Celsius
    """
    try:
        # Raspberry Pi thermal zone path
        thermal_file = '/sys/class/thermal/thermal_zone0/temp'
        if os.path.exists(thermal_file):
            with open(thermal_file, 'r') as f:
                temp = float(f.read().strip()) / 1000.0
                return round(temp, 1)
    except Exception as e:
        print(f"Error reading CPU temperature: {e}")

    # Fallback: try psutil sensors_temperatures (may not work on all systems)
    try:
        temps = psutil.sensors_temperatures()
        if temps:
            # Try common sensor names
            for name in ['cpu_thermal', 'coretemp', 'k10temp']:
                if name in temps and temps[name]:
                    return round(temps[name][0].current, 1)
    except (AttributeError, Exception):
        pass

    return None


def get_cpu_metrics():
    """
    Get comprehensive CPU metrics
    Returns a dictionary with usage, temperature, frequency, and core information
    """
    try:
        # Get CPU usage percentage (interval=1 for more accurate reading)
        cpu_percent = psutil.cpu_percent(interval=1)

        # Get per-core usage
        per_core_usage = psutil.cpu_percent(interval=0.1, percpu=True)

        # Get CPU frequency
        cpu_freq = psutil.cpu_freq()
        frequency = {
            'current': round(cpu_freq.current, 0) if cpu_freq else None,
            'min': round(cpu_freq.min, 0) if cpu_freq else None,
            'max': round(cpu_freq.max, 0) if cpu_freq else None
        }

        # Get core count
        core_count = psutil.cpu_count(logical=False)
        logical_count = psutil.cpu_count(logical=True)

        # Get temperature
        temperature = get_cpu_temperature()

        return {
            'usage_percent': round(cpu_percent, 1),
            'temperature': temperature,
            'frequency': frequency,
            'core_count': core_count,
            'logical_count': logical_count,
            'per_core_usage': [round(usage, 1) for usage in per_core_usage]
        }

    except Exception as e:
        return {
            'error': str(e),
            'usage_percent': None,
            'temperature': None,
            'frequency': None,
            'core_count': None,
            'logical_count': None,
            'per_core_usage': []
        }
