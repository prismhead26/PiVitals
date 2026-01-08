"""
Memory monitoring module
Collects RAM and swap memory usage data
"""
import psutil


def get_memory_metrics():
    """
    Get comprehensive memory metrics
    Returns a dictionary with RAM and swap usage information
    """
    try:
        # Get virtual memory (RAM) stats
        vm = psutil.virtual_memory()

        # Get swap memory stats
        swap = psutil.swap_memory()

        return {
            'total': vm.total,
            'available': vm.available,
            'used': vm.used,
            'percent': round(vm.percent, 1),
            'free': vm.free,
            'active': vm.active if hasattr(vm, 'active') else None,
            'inactive': vm.inactive if hasattr(vm, 'inactive') else None,
            'buffers': vm.buffers if hasattr(vm, 'buffers') else None,
            'cached': vm.cached if hasattr(vm, 'cached') else None,
            'swap': {
                'total': swap.total,
                'used': swap.used,
                'free': swap.free,
                'percent': round(swap.percent, 1),
                'sin': swap.sin if hasattr(swap, 'sin') else None,
                'sout': swap.sout if hasattr(swap, 'sout') else None
            }
        }

    except Exception as e:
        return {
            'error': str(e),
            'total': None,
            'available': None,
            'used': None,
            'percent': None,
            'swap': {
                'total': None,
                'used': None,
                'free': None,
                'percent': None
            }
        }
