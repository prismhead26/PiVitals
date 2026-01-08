import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const MemoryMetrics = ({ data, history }) => {
  if (!data) return null;

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const getUsageStatus = (percent) => {
    if (percent < 50) return 'status-good';
    if (percent < 80) return 'status-warning';
    return 'status-danger';
  };

  // Prepare pie chart data
  const pieData = [
    { name: 'Used', value: data.used, color: '#667eea' },
    { name: 'Available', value: data.available, color: '#e0e7ff' },
  ];

  return (
    <div className="metric-card">
      <div className="metric-card-header">
        <h2>Memory</h2>
        <span className={`status-indicator ${getUsageStatus(data.percent)}`}>
          {data.percent}%
        </span>
      </div>

      <div className="metric-row">
        <span className="metric-row-label">Total RAM</span>
        <span className="metric-row-value">{formatBytes(data.total)}</span>
      </div>

      <div className="metric-row">
        <span className="metric-row-label">Used</span>
        <span className="metric-row-value">{formatBytes(data.used)}</span>
      </div>

      <div className="metric-row">
        <span className="metric-row-label">Available</span>
        <span className="metric-row-value">{formatBytes(data.available)}</span>
      </div>

      <div style={{ marginTop: '15px' }}>
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{
              width: `${data.percent}%`,
              background: data.percent < 50 ? '#28a745' : data.percent < 80 ? '#ffc107' : '#dc3545'
            }}
          >
            {data.percent}%
          </div>
        </div>
      </div>

      {data.swap && (
        <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '2px solid #f0f0f0' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '10px', color: '#666' }}>Swap Memory</h3>

          <div className="metric-row">
            <span className="metric-row-label">Total Swap</span>
            <span className="metric-row-value">{formatBytes(data.swap.total)}</span>
          </div>

          <div className="metric-row">
            <span className="metric-row-label">Used Swap</span>
            <span className="metric-row-value">{formatBytes(data.swap.used)}</span>
          </div>

          <div className="metric-row">
            <span className="metric-row-label">Swap Usage</span>
            <span className={`status-indicator ${getUsageStatus(data.swap.percent)}`}>
              {data.swap.percent}%
            </span>
          </div>

          {data.swap.total > 0 && (
            <div style={{ marginTop: '10px' }}>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${data.swap.percent}%`,
                    background: data.swap.percent < 50 ? '#28a745' : data.swap.percent < 80 ? '#ffc107' : '#dc3545'
                  }}
                >
                  {data.swap.percent}%
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {pieData && (
        <div className="chart-container">
          <div className="metric-row-label" style={{ marginBottom: '10px' }}>Memory Distribution</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatBytes(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default MemoryMetrics;
