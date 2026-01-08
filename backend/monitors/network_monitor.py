"""
Network monitoring module
Collects network interface and connection statistics
"""
import psutil


def get_network_metrics():
    """
    Get comprehensive network metrics
    Returns a dictionary with interface stats and connection information
    """
    try:
        # Get network I/O counters per interface
        net_io = psutil.net_io_counters(pernic=True)
        interfaces = {}

        for interface, stats in net_io.items():
            interfaces[interface] = {
                'bytes_sent': stats.bytes_sent,
                'bytes_recv': stats.bytes_recv,
                'packets_sent': stats.packets_sent,
                'packets_recv': stats.packets_recv,
                'errin': stats.errin,
                'errout': stats.errout,
                'dropin': stats.dropin,
                'dropout': stats.dropout
            }

        # Get network connections count by status
        try:
            connections = psutil.net_connections()
            connection_stats = {
                'established': 0,
                'listen': 0,
                'time_wait': 0,
                'close_wait': 0,
                'total': len(connections)
            }

            for conn in connections:
                status = conn.status.lower()
                if status == 'established':
                    connection_stats['established'] += 1
                elif status == 'listen':
                    connection_stats['listen'] += 1
                elif status == 'time_wait':
                    connection_stats['time_wait'] += 1
                elif status == 'close_wait':
                    connection_stats['close_wait'] += 1

        except (psutil.AccessDenied, PermissionError):
            # Some systems require root to access connection info
            connection_stats = {
                'error': 'Permission denied - run with elevated privileges to see connections',
                'established': None,
                'listen': None,
                'time_wait': None,
                'close_wait': None,
                'total': None
            }

        # Get network addresses
        addrs = psutil.net_if_addrs()
        addresses = {}
        for interface, addr_list in addrs.items():
            addresses[interface] = []
            for addr in addr_list:
                addresses[interface].append({
                    'family': str(addr.family),
                    'address': addr.address,
                    'netmask': addr.netmask,
                    'broadcast': addr.broadcast
                })

        return {
            'interfaces': interfaces,
            'connections': connection_stats,
            'addresses': addresses
        }

    except Exception as e:
        return {
            'error': str(e),
            'interfaces': {},
            'connections': {},
            'addresses': {}
        }
