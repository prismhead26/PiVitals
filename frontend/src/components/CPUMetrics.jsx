import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CPUMetrics = ({ data, history }) => {
  if (!data) return null;

  const getTemperatureStatus = (temp) => {
    if (!temp) return 'temp-normal';
    if (temp < 60) return 'temp-cold';
    if (temp < 75) return 'temp-normal';
    return 'temp-hot';
  };

  const getUsageStatus = (usage) => {
    if (usage < 50) return 'status-good';
    if (usage < 80) return 'status-warning';
    return 'status-danger';
  };

  // Prepare chart data from history
  const chartData = history.slice(-30).map((item, index) => ({
    name: index,
    usage: item.cpu?.usage_percent || 0,
  }));

  return (
    <div className="metric-card">
      <div className="metric-card-header">
        <h2>CPU</h2>
        <span className={`status-indicator ${getUsageStatus(data.usage_percent)}`}>
          {data.usage_percent}%
        </span>
      </div>

      <div className="metric-row">
        <span className="metric-row-label">Overall Usage</span>
        <span className="metric-row-value">{data.usage_percent}%</span>
      </div>

      {data.temperature && (
        <div className="metric-row">
          <span className="metric-row-label">Temperature</span>
          <div className="temperature-gauge">
            <div className={`temp-icon ${getTemperatureStatus(data.temperature)}`}>
              {data.temperature < 60 ? '❄️' : data.temperature < 75 ? '🌡️' : '🔥'}
            </div>
            <span className="metric-row-value">{data.temperature}°C</span>
          </div>
        </div>
      )}

      {data.frequency && data.frequency.current && (
        <div className="metric-row">
          <span className="metric-row-label">Frequency</span>
          <span className="metric-row-value">
            {data.frequency.current} MHz
            {data.frequency.max && ` / ${data.frequency.max} MHz`}
          </span>
        </div>
      )}

      <div className="metric-row">
        <span className="metric-row-label">Cores</span>
        <span className="metric-row-value">
          {data.core_count} Physical {data.logical_count && `(${data.logical_count} Logical)`}
        </span>
      </div>

      {data.per_core_usage && data.per_core_usage.length > 0 && (
        <div style={{ marginTop: '15px' }}>
          <div className="metric-row-label" style={{ marginBottom: '10px' }}>Per-Core Usage</div>
          {data.per_core_usage.map((usage, index) => (
            <div key={index} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                <span>Core {index}</span>
                <span>{usage}%</span>
              </div>
              <div className="progress-bar" style={{ height: '12px' }}>
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${usage}%`,
                    background: usage < 50 ? '#28a745' : usage < 80 ? '#ffc107' : '#dc3545'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {chartData.length > 1 && (
        <div className="chart-container">
          <div className="metric-row-label" style={{ marginBottom: '10px', color: '#a0a0b0' }}>Usage History</div>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
              <XAxis dataKey="name" hide />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: '#a0a0b0', fontSize: 12 }}
              />
              <Tooltip
                formatter={(value) => `${value}%`}
                labelFormatter={() => 'CPU Usage'}
                contentStyle={{
                  backgroundColor: '#1e1e2f',
                  border: '1px solid #2a2a3e',
                  borderRadius: '8px',
                  color: '#e0e0e0'
                }}
              />
              <Line
                type="monotone"
                dataKey="usage"
                stroke="#8b9bff"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default CPUMetrics;
