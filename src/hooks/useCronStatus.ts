import { useState, useCallback, useEffect } from 'react';
import * as api from '@/lib/api';

export interface CronStatus {
  running: boolean;
  lastRun: string;
  stats: {
    totalChecks: number;
    successfulChecks: number;
    failedChecks: number;
  };
  interval: string;
}

export interface CronLog {
  id: number;
  adminId: string;
  adminEmail?: string;
  checkType: 'manual' | 'auto' | 'auto_remove';
  memberCount: number;
  status: 'success' | 'failed';
  createdAt: string;
  message?: string;
  errorMessage?: string;
}

export function useCronStatus() {
  const [cronStatus, setCronStatus] = useState<CronStatus | null>(null);
  const [cronLogs, setCronLogs] = useState<CronLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCronStatus = useCallback(async () => {
    try {
      const response = await api.getCronStatus();
      if (response.success !== false) {
        setCronStatus({
          running: response.running,
          lastRun: response.lastRun,
          stats: response.stats,
          interval: response.interval,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cron status');
    }
  }, []);

  const fetchCronLogs = useCallback(async (adminId?: string, limit: number = 100) => {
    setIsLoading(true);
    try {
      const response = await api.getCronLogs(adminId, limit);
      if (response.success) {
        setCronLogs(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cron logs');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const triggerCronRun = useCallback(async () => {
    setIsLoading(true);
    try {
      await api.triggerCronRun();
      // Refresh status after trigger
      await fetchCronStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger cron run');
    } finally {
      setIsLoading(false);
    }
  }, [fetchCronStatus]);

  const getLastCheckForAdmin = useCallback((adminId: string): string | null => {
    const adminLogs = cronLogs.filter(log => log.adminId === adminId);
    if (adminLogs.length === 0) return null;
    return adminLogs[0].createdAt;
  }, [cronLogs]);

  // Refetch logs after sync to get updated timestamps
  const refreshLogs = useCallback(async () => {
    await fetchCronLogs();
  }, [fetchCronLogs]);

  useEffect(() => {
    fetchCronStatus();
    fetchCronLogs();
  }, [fetchCronStatus, fetchCronLogs]);

  return {
    cronStatus,
    cronLogs,
    isLoading,
    error,
    fetchCronStatus,
    fetchCronLogs,
    triggerCronRun,
    getLastCheckForAdmin,
    refreshLogs,
  };
}
