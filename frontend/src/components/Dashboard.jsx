import React from 'react';
import { useMetrics } from '../hooks/useMetrics';
import { useSystemInfo } from '../hooks/useSystemInfo';
import CPUMetrics from './CPUMetrics';
import MemoryMetrics from './MemoryMetrics';
import DiskMetrics from './DiskMetrics';
import NetworkMetrics from './NetworkMetrics';
import ProcessMetrics from './ProcessMetrics';
import ServiceMetrics from './ServiceMetrics';
import SecurityMetrics from './SecurityMetrics';

const Dashboard = () => {
  const { metrics, history, loading, error, connected, lastUpdated, isPaused, togglePause, refresh } = useMetrics();
  const { data: systemInfo, error: systemError, refresh: refreshSystem } = useSystemInfo();

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
        <button className="pill-button primary" onClick={refresh}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-hero">
        <div className="hero-text">
          <p className="eyebrow">Raspberry Pi 4 • Live health & security</p>
          <h1>PiVitals</h1>
          <p className="lede">Transparent, real-time observability for your Pi—CPU, services, security, and more.</p>
        </div>
        <div className="hero-actions">
          <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
            <div className="connection-dot"></div>
            <span>{connected ? 'Connected' : 'Disconnected'}</span>
          </div>
          <div className="action-group">
            <button className="pill-button ghost" onClick={togglePause}>
              {isPaused ? '▶ Resume' : '⏸ Pause'}
            </button>
            <button className="pill-button primary" onClick={refresh}>
              🔄 Refresh
            </button>
            {systemError && (
              <button className="pill-button warning" onClick={refreshSystem}>
                System Retry
              </button>
            )}
          </div>
        </div>
      </div>

      {metrics && (
        <div className="metrics-grid">
          <CPUMetrics data={metrics.cpu} history={history} />
          <MemoryMetrics data={metrics.memory} history={history} />
          <DiskMetrics data={metrics.disk} history={history} />
          <NetworkMetrics data={metrics.network} history={history} />
          <ProcessMetrics data={systemInfo?.processes} />
          <ServiceMetrics data={systemInfo?.services} />
          <SecurityMetrics data={systemInfo?.security} />
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
