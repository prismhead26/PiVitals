"""
Process monitoring module
Collects top CPU and memory processes
"""
import time
import psutil


def _safe_cpu_percent(proc):
    try:
        return proc.cpu_percent(interval=None)
    except (psutil.NoSuchProcess, psutil.AccessDenied):
        return None


def get_process_metrics(limit=10):
    """
    Get process metrics including top CPU and memory usage.
    Returns a dictionary with summary and top process lists.
    """
    try:
        processes = []
        for proc in psutil.process_iter([
            'pid',
            'name',
            'username',
            'status',
            'create_time',
            'memory_info',
            'memory_percent'
        ]):
            processes.append(proc)

        # Prime CPU percent for all processes
        for proc in processes:
            _safe_cpu_percent(proc)

        time.sleep(0.1)

        entries = []
        status_counts = {}
        now = time.time()

        for proc in processes:
            try:
                info = proc.info
                cpu_percent = _safe_cpu_percent(proc)
                if cpu_percent is None:
                    continue

                status = info.get('status')
                status_counts[status] = status_counts.get(status, 0) + 1

                mem_info = info.get('memory_info')
                mem_rss = mem_info.rss if mem_info else None

                entries.append({
                    'pid': info.get('pid'),
                    'name': info.get('name'),
                    'username': info.get('username'),
                    'status': status,
                    'cpu_percent': round(cpu_percent, 1),
                    'memory_percent': round(info.get('memory_percent') or 0.0, 1),
                    'memory_rss': mem_rss,
                    'uptime_seconds': int(now - info.get('create_time', now))
                })
            except (psutil.NoSuchProcess, psutil.AccessDenied, KeyError):
                continue

        top_cpu = sorted(entries, key=lambda item: item['cpu_percent'], reverse=True)[:limit]
        top_memory = sorted(entries, key=lambda item: item['memory_percent'], reverse=True)[:limit]

        return {
            'summary': {
                'total_processes': len(psutil.pids()),
                'status_counts': status_counts
            },
            'top_cpu': top_cpu,
            'top_memory': top_memory
        }
    except Exception as e:
        return {
            'error': str(e),
            'summary': {
                'total_processes': None,
                'status_counts': {}
            },
            'top_cpu': [],
            'top_memory': []
        }
