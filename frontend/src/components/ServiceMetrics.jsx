import React from 'react';

const ServiceMetrics = ({ data }) => {
  if (!data) return null;

  const summary = data.summary || {};
  const failed = data.failed || [];
  const watched = data.watched || [];
  const runningSample = data.running_sample || [];
  const error = data.error;

  const getStatusClass = (state) => {
    if (state === 'active') return 'status-active';
    if (state === 'failed') return 'status-failed';
    if (state === 'activating') return 'status-warning';
    return 'status-inactive';
  };

  const renderServiceRow = (service) => (
    <div key={service.name} className="list-row">
      <div className="list-main">
        <div className="list-item-main">{service.name}</div>
        <div className="list-item-sub">{service.description || service.sub_state}</div>
      </div>
      <div className={`status-badge ${getStatusClass(service.active_state)}`}>
        {service.active_state}
      </div>
    </div>
  );

  return (
    <div className="metric-card">
      <div className="metric-card-header">
        <h2>Services</h2>
        <span className={`status-indicator ${summary.failed > 0 ? 'status-danger' : 'status-good'}`}>
          {summary.failed || 0} Failed
        </span>
      </div>

      {error && (
        <div className="inline-alert">
          {error}
        </div>
      )}

      <div className="metric-row">
        <span className="metric-row-label">Active</span>
        <span className="metric-row-value">{summary.active || 0}</span>
      </div>

      <div className="metric-row">
        <span className="metric-row-label">Inactive</span>
        <span className="metric-row-value">{summary.inactive || 0}</span>
      </div>

      <div className="list-section">
        <div className="list-title">Failed Services</div>
        {failed.length === 0 && <div className="list-empty">No failed services</div>}
        {failed.map(renderServiceRow)}
      </div>

      {watched.length > 0 && (
        <div className="list-section" style={{ marginTop: '15px' }}>
          <div className="list-title">Watched Services</div>
          {watched.map(renderServiceRow)}
        </div>
      )}

      {watched.length === 0 && runningSample.length > 0 && (
        <div className="list-section" style={{ marginTop: '15px' }}>
          <div className="list-title">Running Sample</div>
          {runningSample.map(renderServiceRow)}
        </div>
      )}
    </div>
  );
};

export default ServiceMetrics;
