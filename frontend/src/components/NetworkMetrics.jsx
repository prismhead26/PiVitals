import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const NetworkMetrics = ({ data, history }) => {
  if (!data) return null;

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  // Calculate bandwidth changes from history
  const calculateBandwidth = () => {
    if (history.length < 2) return null;

    const recent = history.slice(-2);
    const timeDiff = (recent[1].timestamp - recent[0].timestamp) / 1000; // seconds

    const interfaces = Object.keys(data.interfaces);
    const bandwidthData = {};

    interfaces.forEach(iface => {
      const oldStats = recent[0].network?.interfaces?.[iface];
      const newStats = recent[1].network?.interfaces?.[iface];

      if (oldStats && newStats) {
        const sentDiff = newStats.bytes_sent - oldStats.bytes_sent;
        const recvDiff = newStats.bytes_recv - oldStats.bytes_recv;

        bandwidthData[iface] = {
          sent: sentDiff / timeDiff,  // bytes per second
          recv: recvDiff / timeDiff,
        };
      }
    });

    return bandwidthData;
  };

  const bandwidth = calculateBandwidth();

  // Prepare chart data for bandwidth history
  const chartData = history.slice(-30).map((item, index) => {
    const dataPoint = { name: index };

    Object.keys(data.interfaces).forEach(iface => {
      if (item.network?.interfaces?.[iface]) {
        dataPoint[`${iface}_sent`] = item.network.interfaces[iface].bytes_sent;
        dataPoint[`${iface}_recv`] = item.network.interfaces[iface].bytes_recv;
      }
    });

    return dataPoint;
  });

  // Get primary interface (usually the one with most traffic)
  const getPrimaryInterface = () => {
    if (!data.interfaces) return null;

    let maxBytes = 0;
    let primary = null;

    Object.entries(data.interfaces).forEach(([name, stats]) => {
      const totalBytes = stats.bytes_sent + stats.bytes_recv;
      if (totalBytes > maxBytes) {
        maxBytes = totalBytes;
        primary = name;
      }
    });

    return primary;
  };

  const primaryInterface = getPrimaryInterface();

  return (
    <div className="metric-card">
      <div className="metric-card-header">
        <h2>Network</h2>
        {data.connections && data.connections.total !== null && (
          <span className="status-indicator status-good">
            {data.connections.established || 0} Active
          </span>
        )}
      </div>

      {data.connections && (
        <div style={{ marginBottom: '15px' }}>
          <div className="metric-row-label" style={{ marginBottom: '10px' }}>Connections</div>

          <div className="metric-row">
            <span className="metric-row-label">Established</span>
            <span className="metric-row-value">{data.connections.established || 0}</span>
          </div>

          <div className="metric-row">
            <span className="metric-row-label">Listening</span>
            <span className="metric-row-value">{data.connections.listen || 0}</span>
          </div>

          {data.connections.total !== null && (
            <div className="metric-row">
              <span className="metric-row-label">Total</span>
              <span className="metric-row-value">{data.connections.total}</span>
            </div>
          )}

          {data.connections.error && (
            <div style={{ fontSize: '0.85rem', color: '#856404', marginTop: '10px', padding: '10px', background: '#fff3cd', borderRadius: '6px' }}>
              {data.connections.error}
            </div>
          )}
        </div>
      )}

      {data.interfaces && Object.keys(data.interfaces).length > 0 && (
        <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '2px solid #f0f0f0' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '10px', color: '#666' }}>Network Interfaces</h3>

          {Object.entries(data.interfaces).map(([name, stats]) => (
            <div key={name} style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontWeight: 600, fontSize: '1rem', color: '#667eea' }}>{name}</span>
                {name === primaryInterface && (
                  <span className="status-indicator status-good" style={{ fontSize: '0.75rem' }}>Primary</span>
                )}
              </div>

              <div className="metric-row" style={{ fontSize: '0.9rem' }}>
                <span className="metric-row-label">Sent</span>
                <span className="metric-row-value">
                  {formatBytes(stats.bytes_sent)}
                  {bandwidth && bandwidth[name] && (
                    <span style={{ fontSize: '0.8rem', color: '#666', marginLeft: '8px' }}>
                      ({formatBytes(bandwidth[name].sent)}/s)
                    </span>
                  )}
                </span>
              </div>

              <div className="metric-row" style={{ fontSize: '0.9rem' }}>
                <span className="metric-row-label">Received</span>
                <span className="metric-row-value">
                  {formatBytes(stats.bytes_recv)}
                  {bandwidth && bandwidth[name] && (
                    <span style={{ fontSize: '0.8rem', color: '#666', marginLeft: '8px' }}>
                      ({formatBytes(bandwidth[name].recv)}/s)
                    </span>
                  )}
                </span>
              </div>

              <div className="metric-row" style={{ fontSize: '0.85rem' }}>
                <span className="metric-row-label">Packets</span>
                <span className="metric-row-value">
                  ↑ {stats.packets_sent.toLocaleString()} / ↓ {stats.packets_recv.toLocaleString()}
                </span>
              </div>

              {(stats.errin > 0 || stats.errout > 0) && (
                <div className="metric-row" style={{ fontSize: '0.85rem' }}>
                  <span className="metric-row-label" style={{ color: '#dc3545' }}>Errors</span>
                  <span className="metric-row-value" style={{ color: '#dc3545' }}>
                    In: {stats.errin} / Out: {stats.errout}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {chartData.length > 1 && primaryInterface && (
        <div className="chart-container">
          <div className="metric-row-label" style={{ marginBottom: '10px' }}>
            Bandwidth History ({primaryInterface})
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" hide />
              <YAxis tickFormatter={(value) => formatBytes(value)} />
              <Tooltip
                formatter={(value) => formatBytes(value)}
                labelFormatter={() => 'Network Traffic'}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey={`${primaryInterface}_sent`}
                stroke="#667eea"
                strokeWidth={2}
                dot={false}
                name="Sent"
              />
              <Line
                type="monotone"
                dataKey={`${primaryInterface}_recv`}
                stroke="#764ba2"
                strokeWidth={2}
                dot={false}
                name="Received"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default NetworkMetrics;
