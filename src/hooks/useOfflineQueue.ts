import { useState, useEffect, useCallback } from 'react';
import { offlineStorage, QueuedOperation } from '@/services/offlineStorage';

export const useOfflineQueue = () => {
  const [queue, setQueue] = useState<QueuedOperation[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadQueue = useCallback(async () => {
    try {
      const operations = await offlineStorage.getQueue();
      setQueue(operations);
      const count = await offlineStorage.getPendingCount();
      setPendingCount(count);
    } catch (error) {
      console.error('Error loading queue:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addToQueue = useCallback(async (
    type: QueuedOperation['type'],
    payload: any
  ): Promise<string> => {
    try {
      const id = await offlineStorage.addToQueue({ type, payload });
      await loadQueue();
      return id;
    } catch (error) {
      console.error('Error adding to queue:', error);
      throw error;
    }
  }, [loadQueue]);

  const removeFromQueue = useCallback(async (id: string) => {
    try {
      await offlineStorage.removeFromQueue(id);
      await loadQueue();
    } catch (error) {
      console.error('Error removing from queue:', error);
    }
  }, [loadQueue]);

  const updateOperation = useCallback(async (
    id: string,
    updates: Partial<QueuedOperation>
  ) => {
    try {
      await offlineStorage.updateOperation(id, updates);
      await loadQueue();
    } catch (error) {
      console.error('Error updating operation:', error);
    }
  }, [loadQueue]);

  const clearQueue = useCallback(async () => {
    try {
      await offlineStorage.clearQueue();
      await loadQueue();
    } catch (error) {
      console.error('Error clearing queue:', error);
    }
  }, [loadQueue]);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  return {
    queue,
    pendingCount,
    isLoading,
    addToQueue,
    removeFromQueue,
    updateOperation,
    clearQueue,
    refreshQueue: loadQueue
  };
};
