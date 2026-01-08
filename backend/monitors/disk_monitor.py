"""
Disk monitoring module
Collects disk usage and I/O statistics
"""
import psutil


def get_disk_metrics():
    """
    Get comprehensive disk metrics
    Returns a dictionary with partition usage and I/O statistics
    """
    try:
        # Get disk partitions
        partitions = []
        for partition in psutil.disk_partitions():
            try:
                usage = psutil.disk_usage(partition.mountpoint)
                partitions.append({
                    'device': partition.device,
                    'mountpoint': partition.mountpoint,
                    'fstype': partition.fstype,
                    'total': usage.total,
                    'used': usage.used,
                    'free': usage.free,
                    'percent': round(usage.percent, 1)
                })
            except PermissionError:
                # Skip partitions we can't access
                continue

        # Get I/O counters
        io_counters = psutil.disk_io_counters()
        io_data = None
        if io_counters:
            io_data = {
                'read_count': io_counters.read_count,
                'write_count': io_counters.write_count,
                'read_bytes': io_counters.read_bytes,
                'write_bytes': io_counters.write_bytes,
                'read_time': io_counters.read_time,
                'write_time': io_counters.write_time
            }

        return {
            'partitions': partitions,
            'io_counters': io_data
        }

    except Exception as e:
        return {
            'error': str(e),
            'partitions': [],
            'io_counters': None
        }
