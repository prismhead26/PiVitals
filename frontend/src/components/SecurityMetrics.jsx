import React from 'react';

const SecurityMetrics = ({ data }) => {
  if (!data) return null;

  const sessions = data.current_sessions || [];
  const logins = data.recent_logins || [];
  const failed = data.failed_logins || [];
  const sudo = data.sudo_events || [];
  const topIps = data.failed_login_summary?.top_ips || [];

  const getSessionType = (session) => {
    const tty = (session.tty || '').toLowerCase();
    const host = session.host || '';

    if (tty.startsWith('pts/') || host) {
      return host ? `SSH from ${host}` : 'Remote session';
    }

    if (tty.startsWith('tty') || tty.startsWith('seat') || tty === 'console') {
      return 'Local console';
    }

    return 'Session';
  };

  return (
    <div className="metric-card">
      <div className="metric-card-header">
        <h2>Security</h2>
        <span className={`status-indicator ${failed.length > 0 ? 'status-warning' : 'status-good'}`}>
          {failed.length} Failed
        </span>
      </div>

      {data.errors && data.errors.length > 0 && (
        <div className="inline-alert">
          {data.errors.join(' | ')}
        </div>
      )}

      <div className="list-section">
        <div className="list-title">Current Sessions</div>
        {sessions.length === 0 && <div className="list-empty">No active sessions</div>}
        {sessions.map((session, index) => (
          <div key={`session-${index}`} className="list-row">
            <div className="list-main">
              <div className="list-item-main">{session.user} @ {session.tty}</div>
              <div className="list-item-sub">{session.login_time} - {getSessionType(session)}</div>
            </div>
            <div className="list-metric">active</div>
          </div>
        ))}
      </div>

      <div className="list-section" style={{ marginTop: '15px' }}>
        <div className="list-title">Recent Logins</div>
        {logins.length === 0 && <div className="list-empty">No recent logins</div>}
        {logins.map((login, index) => (
          <div key={`login-${index}`} className="list-row">
            <div className="list-main">
              <div className="list-item-main">{login.user || 'Unknown'} {login.tty ? `@ ${login.tty}` : ''}</div>
              <div className="list-item-sub">
                {login.login || login.raw}
                {login.host ? ` - ${login.host}` : ''}
              </div>
            </div>
            <div className="list-metric">
              {login.still_logged_in ? 'online' : 'logged out'}
            </div>
          </div>
        ))}
      </div>

      <div className="list-section" style={{ marginTop: '15px' }}>
        <div className="list-title">Failed Logins</div>
        {failed.length === 0 && <div className="list-empty">No failed logins</div>}
        {failed.map((entry, index) => (
          <div key={`failed-${index}`} className="list-row">
            <div className="list-main">
              <div className="list-item-main">{entry.user || 'Unknown'} {entry.ip ? `from ${entry.ip}` : ''}</div>
              <div className="list-item-sub">{entry.timestamp}</div>
            </div>
            <div className="list-metric">failed</div>
          </div>
        ))}
        {topIps.length > 0 && (
          <div className="chip-row">
            {topIps.map((item) => (
              <span key={item.ip} className="inline-chip">{item.ip}: {item.count}</span>
            ))}
          </div>
        )}
      </div>

      <div className="list-section" style={{ marginTop: '15px' }}>
        <div className="list-title">Sudo Activity</div>
        {sudo.length === 0 && <div className="list-empty">No sudo activity</div>}
        {sudo.map((entry, index) => (
          <div key={`sudo-${index}`} className="list-row">
            <div className="list-main">
              <div className="list-item-main">{entry.user || 'Unknown'}</div>
              <div className="list-item-sub">{entry.command || entry.message}</div>
            </div>
            <div className="list-metric">{entry.timestamp || 'n/a'}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SecurityMetrics;
