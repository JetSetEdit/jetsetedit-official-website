'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface StripeSyncStatusProps {
  onRefresh?: () => Promise<void>;
  lastSyncTime?: Date;
}

export function StripeSyncStatus({ onRefresh, lastSyncTime }: StripeSyncStatusProps) {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | undefined>(lastSyncTime);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'stale' | 'error'>('synced');

  useEffect(() => {
    // Check if data is stale (more than 5 minutes old)
    if (lastSync) {
      const now = new Date();
      const diffMinutes = (now.getTime() - lastSync.getTime()) / (1000 * 60);
      setSyncStatus(diffMinutes > 5 ? 'stale' : 'synced');
    }
  }, [lastSync]);

  const handleRefresh = async () => {
    if (!onRefresh) return;

    setSyncing(true);
    try {
      await onRefresh();
      setLastSync(new Date());
      setSyncStatus('synced');
      toast.success('Successfully synced with Stripe');
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
      toast.error('Failed to sync with Stripe');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Badge
        variant={
          syncStatus === 'synced' ? 'success' :
          syncStatus === 'stale' ? 'warning' : 'destructive'
        }
      >
        {syncStatus === 'synced' ? 'In Sync' :
         syncStatus === 'stale' ? 'Sync Required' : 'Sync Error'}
      </Badge>
      {lastSync && (
        <span className="text-sm text-gray-500">
          Last synced: {lastSync.toLocaleTimeString()}
        </span>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={handleRefresh}
        disabled={syncing || !onRefresh}
      >
        {syncing ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mr-2" />
            Syncing...
          </>
        ) : (
          'Refresh'
        )}
      </Button>
    </div>
  );
} 