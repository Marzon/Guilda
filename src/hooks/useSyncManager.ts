import { useEffect, useState, useCallback, useRef } from 'react';
import { useOnlineStatus } from './useOnlineStatus';
import { useOfflineQueue } from './useOfflineQueue';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useLanguage } from './useLanguage';

const MAX_RETRIES = 3;

export const useSyncManager = () => {
  const { t } = useLanguage();
  const isOnline = useOnlineStatus();
  const { queue, removeFromQueue, updateOperation, refreshQueue, pendingCount } = useOfflineQueue();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 });
  const queryClient = useQueryClient();
  const wasOffline = useRef(false);
  const isSyncingRef = useRef(false);

  const processMessage = async (payload: any) => {
    const { matchId, content, fileData } = payload;
    
    let fileUrl = null;
    let fileName = null;
    let fileType = null;
    let fileSize = null;

    if (fileData) {
      const { file, filePath } = fileData;
      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath);
      
      fileUrl = urlData.publicUrl;
      fileName = file.name;
      fileType = file.type;
      fileSize = file.size;
    }

    const { error } = await supabase.from('messages').insert({
      match_id: matchId,
      sender_id: payload.senderId,
      content: content || '',
      file_url: fileUrl,
      file_name: fileName,
      file_type: fileType,
      file_size: fileSize,
    });

    if (error) throw error;
  };

  const processOperation = async (operation: any) => {
    switch (operation.type) {
      case 'message':
        await processMessage(operation.payload);
        break;
      case 'match_action':
        // Implementar outras operações conforme necessário
        break;
      case 'reaction':
        // Implementar
        break;
      default:
        console.warn('Unknown operation type:', operation.type);
    }
  };

  const syncQueue = useCallback(async () => {
    if (isSyncingRef.current || !isOnline) return;
    
    const pendingOps = queue.filter(op => op.status === 'pending');
    if (pendingOps.length === 0) return;

    isSyncingRef.current = true;
    setIsSyncing(true);
    setSyncProgress({ current: 0, total: pendingOps.length });

    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < pendingOps.length; i++) {
      const operation = pendingOps[i];
      setSyncProgress({ current: i + 1, total: pendingOps.length });

      try {
        await updateOperation(operation.id, { status: 'processing' });
        await processOperation(operation);
        await removeFromQueue(operation.id);
        successCount++;
      } catch (error) {
        console.error('Error processing operation:', error);
        
        const newRetries = operation.retries + 1;
        
        if (newRetries >= MAX_RETRIES) {
          await updateOperation(operation.id, {
            status: 'failed',
            retries: newRetries,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          failedCount++;
        } else {
          await updateOperation(operation.id, {
            status: 'pending',
            retries: newRetries
          });
        }
      }
    }

    // Invalidate relevant queries
    queryClient.invalidateQueries({ queryKey: ['matches'] });
    queryClient.invalidateQueries({ queryKey: ['messages'] });

    setIsSyncing(false);
    isSyncingRef.current = false;
    await refreshQueue();

    // Show toast with results
    if (successCount > 0) {
      toast.success(t('sync.successToast', { count: successCount }), {
        duration: 3000,
      });
    }

    if (failedCount > 0) {
      toast.error(t('sync.errorToast'), {
        duration: 5000,
      });
    }
  }, [isOnline, queue, removeFromQueue, updateOperation, queryClient, refreshQueue, t]);

  // Trigger sync when coming back online
  useEffect(() => {
    if (!isOnline) {
      wasOffline.current = true;
    } else if (wasOffline.current && isOnline) {
      wasOffline.current = false;
      // Small delay to ensure connection is stable
      setTimeout(() => {
        syncQueue();
      }, 1000);
    }
  }, [isOnline, syncQueue]);

  const retrySingleOperation = useCallback(async (operationId: string) => {
    const operation = queue.find(op => op.id === operationId);
    if (!operation || !isOnline) return;

    try {
      await updateOperation(operationId, { status: 'processing', retries: 0 });
      await processOperation(operation);
      await removeFromQueue(operationId);
      toast.success(t('sync.successToast', { count: 1 }));
      
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    } catch (error) {
      await updateOperation(operationId, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      toast.error(t('sync.errorToast'));
    }
  }, [queue, isOnline, updateOperation, removeFromQueue, queryClient, t]);

  return {
    isSyncing,
    syncProgress,
    pendingCount,
    syncQueue,
    retrySingleOperation
  };
};
