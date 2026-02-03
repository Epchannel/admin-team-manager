import { useEffect, useRef, useCallback, useState } from 'react';
import { AdminAccount } from '@/types/admin';

interface UseRealtimeUpdatesOptions {
  enabled?: boolean;
  pollInterval?: number; // in milliseconds
  onUpdate?: (hasChanges: boolean) => void;
}

export function useRealtimeUpdates(
  accounts: AdminAccount[],
  refetch: () => Promise<void>,
  options: UseRealtimeUpdatesOptions = {}
) {
  const {
    enabled = true,
    pollInterval = 30000, // 30 seconds default
    onUpdate,
  } = options;

  const [isPolling, setIsPolling] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const previousDataRef = useRef<string>('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Create a hash of the current data for comparison
  const createDataHash = useCallback((data: AdminAccount[]) => {
    return JSON.stringify(
      data.map(acc => ({
        id: acc.id,
        membersCount: acc.members.length,
        pendingInvitesCount: acc.pendingInvites.length,
        status: acc.status,
        tokenHealth: acc.tokenHealth?.isValid,
      }))
    );
  }, []);

  // Check for changes
  const checkForChanges = useCallback(async () => {
    if (isPolling) return;
    
    setIsPolling(true);
    try {
      const previousHash = previousDataRef.current;
      await refetch();
      
      // After refetch, check if data changed
      const currentHash = createDataHash(accounts);
      const hasChanges = previousHash !== '' && previousHash !== currentHash;
      
      if (hasChanges) {
        setLastUpdate(new Date());
        onUpdate?.(true);
      }
      
      previousDataRef.current = currentHash;
    } catch (error) {
      console.error('Polling error:', error);
    } finally {
      setIsPolling(false);
    }
  }, [accounts, refetch, createDataHash, onUpdate, isPolling]);

  // Set up polling interval
  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initialize the hash on first render
    if (previousDataRef.current === '') {
      previousDataRef.current = createDataHash(accounts);
    }

    intervalRef.current = setInterval(checkForChanges, pollInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, pollInterval, checkForChanges, createDataHash, accounts]);

  // Manual trigger
  const triggerUpdate = useCallback(async () => {
    await checkForChanges();
  }, [checkForChanges]);

  return {
    isPolling,
    lastUpdate,
    triggerUpdate,
  };
}
