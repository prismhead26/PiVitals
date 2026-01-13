/**
 * Custom hook for fetching process/service/security info
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { systemAPI } from '../services/api';

const DEFAULT_INTERVAL = 10000; // 10 seconds

export const useSystemInfo = (interval = DEFAULT_INTERVAL) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [connected, setConnected] = useState(false);

  const intervalRef = useRef(null);

  const fetchSystemInfo = useCallback(async () => {
    try {
      const response = await systemAPI.getOverview();
      setData(response);
      setError(null);
      setConnected(true);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch system info:', err);
      setError(err.message || 'Failed to fetch system info');
      setConnected(false);
      setLoading(false);
    }
  }, []);

  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    fetchSystemInfo();

    intervalRef.current = setInterval(() => {
      fetchSystemInfo();
    }, interval);
  }, [interval, fetchSystemInfo]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const refresh = useCallback(() => {
    fetchSystemInfo();
  }, [fetchSystemInfo]);

  useEffect(() => {
    startPolling();
    return () => {
      stopPolling();
    };
  }, [startPolling, stopPolling]);

  return {
    data,
    loading,
    error,
    connected,
    lastUpdated,
    refresh
  };
};

export default useSystemInfo;
