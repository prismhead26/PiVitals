import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const DiskMetrics = ({ data, history }) => {
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

  // Prepare bar chart data for I/O
  const ioChartData = data.io_counters ? [
    {
      name: 'I/O Operations',
      Read: data.io_counters.read_count,
      Write: data.io_counters.write_count,
    }
  ] : [];

  return (
    <div className="metric-card">
      <div className="metric-card-header">
        <h2>Disk</h2>
        {data.partitions && data.partitions.length > 0 && (
          <span className={`status-indicator ${getUsageStatus(data.partitions[0].percent)}`}>
            {data.partitions[0].percent}%
          </span>
        )}
      </div>

      {data.partitions && data.partitions.length > 0 && (
        <div>
          <div className="metric-row-label" style={{ marginBottom: '10px' }}>Partitions</div>
          {data.partitions.map((partition, index) => (
            <div key={index} style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: index < data.partitions.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              <div className="metric-row">
                <span className="metric-row-label" style={{ fontWeight: 600 }}>{partition.mountpoint}</span>
                <span className={`status-indicator ${getUsageStatus(partition.percent)}`}>
                  {partition.percent}%
                </span>
              </div>

              <div className="metric-row" style={{ fontSize: '0.85rem' }}>
                <span style={{ color: '#999' }}>{partition.device}</span>
                <span style={{ color: '#666' }}>{partition.fstype}</span>
              </div>

              <div className="metric-row">
                <span className="metric-row-label">Used / Total</span>
                <span className="metric-row-value">
                  {formatBytes(partition.used)} / {formatBytes(partition.total)}
                </span>
              </div>

              <div className="metric-row">
                <span className="metric-row-label">Free</span>
                <span className="metric-row-value">{formatBytes(partition.free)}</span>
              </div>

              <div style={{ marginTop: '10px' }}>
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${partition.percent}%`,
                      background: partition.percent < 50 ? '#28a745' : partition.percent < 80 ? '#ffc107' : '#dc3545'
                    }}
                  >
                    {partition.percent}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {data.io_counters && (
        <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '2px solid #f0f0f0' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '10px', color: '#666' }}>I/O Statistics</h3>

          <div className="metric-row">
            <span className="metric-row-label">Read Count</span>
            <span className="metric-row-value">{data.io_counters.read_count.toLocaleString()}</span>
          </div>

          <div className="metric-row">
            <span className="metric-row-label">Write Count</span>
            <span className="metric-row-value">{data.io_counters.write_count.toLocaleString()}</span>
          </div>

          <div className="metric-row">
            <span className="metric-row-label">Bytes Read</span>
            <span className="metric-row-value">{formatBytes(data.io_counters.read_bytes)}</span>
          </div>

          <div className="metric-row">
            <span className="metric-row-label">Bytes Written</span>
            <span className="metric-row-value">{formatBytes(data.io_counters.write_bytes)}</span>
          </div>

          {ioChartData.length > 0 && (
            <div className="chart-container" style={{ marginTop: '15px' }}>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={ioChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => value.toLocaleString()} />
                  <Legend />
                  <Bar dataKey="Read" fill="#667eea" />
                  <Bar dataKey="Write" fill="#764ba2" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DiskMetrics;
