import { useState, useEffect, useCallback, useRef } from 'react';
import { AdminAccount } from '@/types/admin';
import * as api from '@/lib/api';
import { toast } from 'sonner';

interface UseAutoRefreshOptions {
  enabled?: boolean;
  interval?: number; // in milliseconds
  onDataChange?: (oldData: AdminAccount[], newData: AdminAccount[]) => void;
}

export function useAutoRefresh(
  currentAccounts: AdminAccount[],
  refetch: () => Promise<void>,
  options: UseAutoRefreshOptions = {}
) {
  const { enabled = true, interval = 30000, onDataChange } = options;
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [countdown, setCountdown] = useState(interval / 1000);
  const previousDataRef = useRef<string>('');

  const checkForChanges = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      // Store current data hash before refresh
      const previousHash = JSON.stringify(currentAccounts.map(a => ({
        id: a.id,
        membersCount: a.members.length,
        invitesCount: a.pendingInvites.length,
      })));
      
      await refetch();
      setLastRefresh(new Date());
      
      // After refetch, compare with previous
      // Note: The actual comparison happens in the parent component
      // since currentAccounts will be updated after refetch
      if (previousDataRef.current && previousDataRef.current !== previousHash) {
        onDataChange?.([], []);
      }
      
      previousDataRef.current = previousHash;
    } catch (error) {
      console.error('Auto-refresh failed:', error);
    } finally {
      setIsRefreshing(false);
      setCountdown(interval / 1000);
    }
  }, [currentAccounts, refetch, interval, isRefreshing, onDataChange]);

  // Auto-refresh interval
  useEffect(() => {
    if (!enabled) return;

    const refreshInterval = setInterval(() => {
      checkForChanges();
    }, interval);

    return () => clearInterval(refreshInterval);
  }, [enabled, interval, checkForChanges]);

  // Countdown timer
  useEffect(() => {
    if (!enabled) return;

    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) return interval / 1000;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [enabled, interval]);

  const manualRefresh = useCallback(async () => {
    await checkForChanges();
    toast.success('Dữ liệu đã được cập nhật');
  }, [checkForChanges]);

  return {
    lastRefresh,
    isRefreshing,
    countdown,
    manualRefresh,
  };
}
