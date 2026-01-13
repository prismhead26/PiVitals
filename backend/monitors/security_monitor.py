"""
Security monitoring module
Collects login activity and authentication events
"""
import os
import re
import subprocess
from collections import deque, Counter


AUTH_LOG_PATHS = [
    '/var/log/auth.log',
    '/var/log/secure'
]


FAILED_PATTERNS = [
    re.compile(r'Failed password for (invalid user )?(?P<user>\\S+) from (?P<ip>\\S+)'),
    re.compile(r'Invalid user (?P<user>\\S+) from (?P<ip>\\S+)')
]


def _read_log_tail(paths, max_lines=2000):
    for path in paths:
        if not os.path.exists(path):
            continue
        try:
            with open(path, 'r', errors='ignore') as log_file:
                return list(deque(log_file, maxlen=max_lines)), None, path
        except PermissionError:
            return [], f'Permission denied reading {path}', path
        except Exception as e:
            return [], str(e), path
    return [], 'Auth log file not found', None


def _parse_syslog_timestamp(line):
    parts = line.split()
    if len(parts) < 3:
        return None
    return f"{parts[0]} {parts[1]} {parts[2]}"


def _parse_failed_logins(lines, limit=10):
    entries = []
    ip_counter = Counter()

    for line in lines:
        if 'Failed password' not in line and 'Invalid user' not in line:
            continue
        for pattern in FAILED_PATTERNS:
            match = pattern.search(line)
            if match:
                user = match.group('user')
                ip_addr = match.group('ip')
                ip_counter[ip_addr] += 1
                entries.append({
                    'timestamp': _parse_syslog_timestamp(line),
                    'user': user,
                    'ip': ip_addr,
                    'message': line.strip()
                })
                break

    entries = entries[-limit:]
    top_ips = [{'ip': ip_addr, 'count': count} for ip_addr, count in ip_counter.most_common(5)]

    return entries, top_ips


def _parse_sudo_events(lines, limit=10):
    entries = []
    for line in lines:
        if 'sudo:' not in line or 'COMMAND=' not in line:
            continue
        timestamp = _parse_syslog_timestamp(line)
        user_match = re.search(r'^(\\w+)', line.split('sudo:')[-1].strip())
        command_match = re.search(r'COMMAND=([^;]+)$', line.strip())
        entries.append({
            'timestamp': timestamp,
            'user': user_match.group(1) if user_match else None,
            'command': command_match.group(1).strip() if command_match else None,
            'message': line.strip()
        })
    return entries[-limit:]


def _parse_last_line(line):
    line = line.strip()
    if not line or line.startswith('wtmp begins'):
        return None
    tokens = line.split()
    if not tokens:
        return None
    if tokens[0] in ('reboot', 'shutdown', 'runlevel'):
        return None
    if '-' not in tokens:
        return {'raw': line}

    dash_index = tokens.index('-')
    if dash_index < 3:
        return {'raw': line}

    user = tokens[0]
    tty = tokens[1]
    login = f"{tokens[dash_index - 2]} {tokens[dash_index - 1]}"
    host_tokens = tokens[2:dash_index - 2]
    host = " ".join(host_tokens).strip() or None

    logout_tokens = tokens[dash_index + 1:]
    still_logged_in = False
    logout = None
    duration = None

    if len(logout_tokens) >= 3 and logout_tokens[:3] == ['still', 'logged', 'in']:
        still_logged_in = True
    elif len(logout_tokens) >= 2:
        logout = f"{logout_tokens[0]} {logout_tokens[1]}"

    for token in logout_tokens:
        if token.startswith('(') and token.endswith(')'):
            duration = token.strip('()')
            break

    return {
        'user': user,
        'tty': tty,
        'host': host,
        'login': login,
        'logout': logout,
        'duration': duration,
        'still_logged_in': still_logged_in,
        'raw': line
    }


def get_current_sessions():
    try:
        result = subprocess.run(
            ['who'],
            capture_output=True,
            text=True,
            timeout=2
        )
        if result.returncode != 0:
            return {
                'error': result.stderr.strip() or 'Failed to read sessions',
                'sessions': []
            }

        sessions = []
        for line in result.stdout.strip().splitlines():
            parts = line.split()
            if len(parts) < 4:
                continue
            user = parts[0]
            tty = parts[1]
            login_time = f"{parts[2]} {parts[3]}"
            host = None
            if len(parts) > 4:
                host = " ".join(parts[4:]).strip()
                host = host.strip('()')
            sessions.append({
                'user': user,
                'tty': tty,
                'login_time': login_time,
                'host': host
            })

        return {
            'sessions': sessions
        }
    except Exception as e:
        return {
            'error': str(e),
            'sessions': []
        }


def get_recent_logins(limit=10):
    try:
        raw_only = False
        result = subprocess.run(
            ['last', '-n', str(limit), '--time-format', 'iso'],
            capture_output=True,
            text=True,
            timeout=3
        )
        if result.returncode != 0:
            if 'time-format' in result.stderr:
                raw_only = True
                result = subprocess.run(
                    ['last', '-n', str(limit)],
                    capture_output=True,
                    text=True,
                    timeout=3
                )

        if result.returncode != 0:
            return {
                'error': result.stderr.strip() or 'Failed to read login history',
                'entries': []
            }

        entries = []
        for line in result.stdout.splitlines():
            if raw_only:
                if line.strip() and not line.startswith('wtmp begins'):
                    entries.append({'raw': line.strip()})
                continue
            parsed = _parse_last_line(line)
            if parsed:
                entries.append(parsed)

        return {
            'entries': entries[:limit]
        }
    except subprocess.TimeoutExpired:
        return {
            'error': 'last command timed out',
            'entries': []
        }
    except Exception as e:
        return {
            'error': str(e),
            'entries': []
        }


def get_security_metrics(login_limit=10, failed_limit=10, sudo_limit=10):
    """
    Aggregate security-related metrics: sessions, logins, failed attempts, sudo.
    """
    auth_lines, auth_error, auth_path = _read_log_tail(AUTH_LOG_PATHS, max_lines=5000)
    failed_logins, top_ips = _parse_failed_logins(auth_lines, limit=failed_limit)
    sudo_events = _parse_sudo_events(auth_lines, limit=sudo_limit)

    current_sessions = get_current_sessions()
    recent_logins = get_recent_logins(limit=login_limit)

    errors = []
    if auth_error:
        errors.append(auth_error)
    if current_sessions.get('error'):
        errors.append(current_sessions['error'])
    if recent_logins.get('error'):
        errors.append(recent_logins['error'])

    return {
        'current_sessions': current_sessions.get('sessions', []),
        'recent_logins': recent_logins.get('entries', []),
        'failed_logins': failed_logins,
        'failed_login_summary': {
            'total': len(failed_logins),
            'top_ips': top_ips
        },
        'sudo_events': sudo_events,
        'auth_log_path': auth_path,
        'errors': errors
    }
