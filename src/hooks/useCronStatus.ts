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
  
  // Track manual sync times locally for immediate UI update
  const [localSyncTimes, setLocalSyncTimes] = useState<Record<string, string>>({});

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

  // Mark admin as just synced (updates local state immediately)
  const markAdminSynced = useCallback((adminId: string) => {
    setLocalSyncTimes(prev => ({
      ...prev,
      [adminId]: new Date().toISOString(),
    }));
  }, []);

  // Mark all admins as just synced
  const markAllAdminsSynced = useCallback((adminIds: string[]) => {
    const now = new Date().toISOString();
    setLocalSyncTimes(prev => {
      const updated = { ...prev };
      adminIds.forEach(id => {
        updated[id] = now;
      });
      return updated;
    });
  }, []);

  const getLastCheckForAdmin = useCallback((adminId: string): string | null => {
    // First check local sync time (most recent manual sync)
    const localTime = localSyncTimes[adminId];
    const logTime = cronLogs.filter(log => log.adminId === adminId)[0]?.createdAt;
    
    // Return the most recent of local sync or cron log
    if (localTime && logTime) {
      return new Date(localTime) > new Date(logTime) ? localTime : logTime;
    }
    
    return localTime || logTime || null;
  }, [cronLogs, localSyncTimes]);

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
    markAdminSynced,
    markAllAdminsSynced,
  };
}
