import React from 'react';
import { useMetrics } from '../hooks/useMetrics';
import CPUMetrics from './CPUMetrics';
import MemoryMetrics from './MemoryMetrics';
import DiskMetrics from './DiskMetrics';
import NetworkMetrics from './NetworkMetrics';

const Dashboard = () => {
  const { metrics, history, loading, error, connected, lastUpdated, isPaused, togglePause, refresh } = useMetrics();

  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Never';
    return lastUpdated.toLocaleTimeString();
  };

  if (loading && !metrics) {
    return (
      <div className="loading">
        <h2>Loading PiVitals...</h2>
        <p>Connecting to backend...</p>
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <div className="error">
        <h2>Connection Error</h2>
        <p>{error}</p>
        <button onClick={refresh} style={{ marginTop: '10px', padding: '10px 20px', cursor: 'pointer', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600 }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>PiVitals</h1>
        <p>Raspberry Pi Health Monitor</p>
        <div style={{ marginTop: '15px', display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center' }}>
          <div className="connection-status">
            <div className={`connection-dot ${connected ? 'connected' : 'disconnected'}`}></div>
            <span>{connected ? 'Connected' : 'Disconnected'}</span>
          </div>
          <button
            onClick={togglePause}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: '1px solid #2a2a3e',
              background: '#1e1e2f',
              color: '#e0e0e0',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}
          >
            {isPaused ? '▶ Resume' : '⏸ Pause'}
          </button>
          <button
            onClick={refresh}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: '1px solid #2a2a3e',
              background: '#1e1e2f',
              color: '#e0e0e0',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {metrics && (
        <div className="metrics-grid">
          <CPUMetrics data={metrics.cpu} history={history} />
          <MemoryMetrics data={metrics.memory} history={history} />
          <DiskMetrics data={metrics.disk} history={history} />
          <NetworkMetrics data={metrics.network} history={history} />
        </div>
      )}

      <div className="dashboard-footer">
        <div className="last-updated">
          Last updated: {formatLastUpdated()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
