import React from 'react';

const ProcessMetrics = ({ data }) => {
  if (!data) return null;

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatUptime = (seconds) => {
    if (!seconds && seconds !== 0) return 'n/a';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const topCpu = data.top_cpu || [];
  const topMemory = data.top_memory || [];

  return (
    <div className="metric-card">
      <div className="metric-card-header">
        <h2>Processes</h2>
        {data.summary && (
          <span className="status-indicator status-good">
            {data.summary.total_processes} Total
          </span>
        )}
      </div>

      {data.summary && data.summary.status_counts && (
        <div className="metric-row">
          <span className="metric-row-label">States</span>
          <span className="metric-row-value">
            {Object.entries(data.summary.status_counts).map(([state, count]) => (
              <span key={state} className="inline-chip">
                {state}: {count}
              </span>
            ))}
          </span>
        </div>
      )}

      <div className="list-section">
        <div className="list-title">Top CPU</div>
        {topCpu.length === 0 && <div className="list-empty">No data</div>}
        {topCpu.map((proc) => (
          <div key={`cpu-${proc.pid}`} className="list-row">
            <div className="list-main">
              <div className="list-item-main">{proc.name || 'Unknown'} <span className="list-muted">#{proc.pid}</span></div>
              <div className="list-item-sub">{proc.username || 'n/a'} - {formatUptime(proc.uptime_seconds)}</div>
            </div>
            <div className="list-metric">
              {proc.cpu_percent}%
            </div>
          </div>
        ))}
      </div>

      <div className="list-section" style={{ marginTop: '15px' }}>
        <div className="list-title">Top Memory</div>
        {topMemory.length === 0 && <div className="list-empty">No data</div>}
        {topMemory.map((proc) => (
          <div key={`mem-${proc.pid}`} className="list-row">
            <div className="list-main">
              <div className="list-item-main">{proc.name || 'Unknown'} <span className="list-muted">#{proc.pid}</span></div>
              <div className="list-item-sub">{formatBytes(proc.memory_rss)} - {proc.memory_percent}%</div>
            </div>
            <div className="list-metric">
              {proc.memory_percent}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProcessMetrics;
