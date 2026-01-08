/**
 * Custom hook for fetching and managing metrics data
 * Handles polling, error states, and historical data
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { metricsAPI } from '../services/api';

const DEFAULT_INTERVAL = 3000; // 3 seconds
const MAX_HISTORY_LENGTH = 60; // Keep last 60 data points (~3 minutes at 3s intervals)

export const useMetrics = (interval = DEFAULT_INTERVAL) => {
  const [metrics, setMetrics] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

  const intervalRef = useRef(null);
  const retryCountRef = useRef(0);
  const maxRetries = 5;

  /**
   * Fetch metrics from API
   */
  const fetchMetrics = useCallback(async () => {
    try {
      const data = await metricsAPI.getAllMetrics();

      setMetrics(data);
      setError(null);
      setConnected(true);
      setLastUpdated(new Date());
      setLoading(false);
      retryCountRef.current = 0;

      // Add to history (circular buffer)
      setHistory((prev) => {
        const newHistory = [...prev, {
          timestamp: Date.now(),
          cpu: data.cpu,
          memory: data.memory,
          disk: data.disk,
          network: data.network,
        }];

        // Keep only last MAX_HISTORY_LENGTH items
        if (newHistory.length > MAX_HISTORY_LENGTH) {
          return newHistory.slice(-MAX_HISTORY_LENGTH);
        }
        return newHistory;
      });

    } catch (err) {
      console.error('Failed to fetch metrics:', err);
      setError(err.message || 'Failed to fetch metrics');
      setConnected(false);
      retryCountRef.current += 1;

      // Exponential backoff for retries
      if (retryCountRef.current >= maxRetries) {
        setError('Connection lost. Please check if the backend is running.');
      }
    }
  }, []);

  /**
   * Start polling
   */
  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Fetch immediately
    fetchMetrics();

    // Then poll at interval
    intervalRef.current = setInterval(() => {
      if (!isPaused) {
        fetchMetrics();
      }
    }, interval);
  }, [interval, isPaused, fetchMetrics]);

  /**
   * Stop polling
   */
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /**
   * Toggle pause/resume
   */
  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  /**
   * Manual refresh
   */
  const refresh = useCallback(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  /**
   * Clear history
   */
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  // Start polling on mount
  useEffect(() => {
    startPolling();

    // Cleanup on unmount
    return () => {
      stopPolling();
    };
  }, [startPolling, stopPolling]);

  // Handle visibility change (pause when tab is hidden)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        startPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [startPolling, stopPolling]);

  return {
    metrics,
    history,
    loading,
    error,
    connected,
    lastUpdated,
    isPaused,
    togglePause,
    refresh,
    clearHistory,
  };
};

export default useMetrics;
