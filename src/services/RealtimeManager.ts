import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting';

interface ChannelConfig {
  onPostgresChange?: (table: string, payload: any) => void;
  onPresenceSync?: (state: Record<string, any[]>) => void;
  onPresenceJoin?: (key: string, newPresences: any[]) => void;
  onPresenceLeave?: (key: string, leftPresences: any[]) => void;
  onReconnect?: () => void;
  postgresChanges?: Array<{
    event: '*' | 'INSERT' | 'UPDATE' | 'DELETE';
    table: string;
    filter?: string;
  }>;
  presence?: {
    key: string;
    data?: Record<string, any>;
  };
}

interface ManagedChannel {
  channel: RealtimeChannel;
  config: ChannelConfig;
  subscribed: boolean;
}

class RealtimeManager {
  private static instance: RealtimeManager;
  private channels: Map<string, ManagedChannel> = new Map();
  private connectionStatus: ConnectionStatus = 'disconnected';
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private baseDelay: number = 1000;
  private listeners: Set<(status: ConnectionStatus) => void> = new Set();
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private lastHeartbeat: number = Date.now();
  private heartbeatInterval: number = 30000; // 30 seconds
  private heartbeatTimeout: number = 60000; // 60 seconds - consider zombie if no heartbeat

  private constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.handleOffline());
      window.addEventListener('visibilitychange', () => this.handleVisibilityChange());
      this.startHeartbeat();
    }
  }

  static getInstance(): RealtimeManager {
    if (!RealtimeManager.instance) {
      RealtimeManager.instance = new RealtimeManager();
    }
    return RealtimeManager.instance;
  }

  getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  onStatusChange(callback: (status: ConnectionStatus) => void): () => void {
    this.listeners.add(callback);
    callback(this.connectionStatus);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.connectionStatus));
  }

  private setStatus(status: ConnectionStatus): void {
    if (this.connectionStatus !== status) {
      this.connectionStatus = status;
      this.notifyListeners();
    }
  }

  subscribe(channelName: string, config: ChannelConfig, forceRecreate = false): ManagedChannel {
    const existing = this.channels.get(channelName);
    if (existing) {
      // Se callbacks mudaram ou forceRecreate, recriar o canal
      const configChanged = 
        existing.config.onPostgresChange !== config.onPostgresChange ||
        existing.config.onPresenceSync !== config.onPresenceSync ||
        existing.config.onReconnect !== config.onReconnect;
      
      if (configChanged || forceRecreate) {
        this.unsubscribe(channelName);
      } else {
        return existing;
      }
    }

    const channel = supabase.channel(channelName);

    if (config.postgresChanges) {
      config.postgresChanges.forEach(({ event, table, filter }) => {
        const channelConfig: {
          event: '*' | 'INSERT' | 'UPDATE' | 'DELETE';
          schema: 'public';
          table: string;
          filter?: string;
        } = {
          event,
          schema: 'public',
          table,
        };
        
        if (filter) {
          channelConfig.filter = filter;
        }
        
        channel.on(
          'postgres_changes' as any,
          channelConfig,
          (payload: any) => {
            config.onPostgresChange?.(table, payload);
          }
        );
      });
    }

    if (config.presence || config.onPresenceSync) {
      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          config.onPresenceSync?.(state);
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          config.onPresenceJoin?.(key, newPresences);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          config.onPresenceLeave?.(key, leftPresences);
        });
    }

    const managedChannel: ManagedChannel = {
      channel,
      config,
      subscribed: false,
    };

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        managedChannel.subscribed = true;
        this.setStatus('connected');
        this.reconnectAttempts = 0;

        if (config.presence) {
          await channel.track({
            ...config.presence.data,
            user_id: config.presence.key,
            online_at: new Date().toISOString(),
          });
        }
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        managedChannel.subscribed = false;
        this.handleChannelError(channelName);
      } else if (status === 'CLOSED') {
        managedChannel.subscribed = false;
      }
    });

    this.channels.set(channelName, managedChannel);
    return managedChannel;
  }

  unsubscribe(channelName: string): void {
    const managed = this.channels.get(channelName);
    if (managed) {
      supabase.removeChannel(managed.channel);
      this.channels.delete(channelName);
    }
  }

  unsubscribeAll(): void {
    this.channels.forEach((_, name) => this.unsubscribe(name));
  }

  private handleOnline(): void {
    if (this.connectionStatus === 'disconnected') {
      this.reconnectAll();
    }
  }

  private handleOffline(): void {
    this.setStatus('disconnected');
    this.stopHeartbeat();
  }

  private handleVisibilityChange(): void {
    if (document.visibilityState === 'visible') {
      // Check if connection might be stale
      const timeSinceHeartbeat = Date.now() - this.lastHeartbeat;
      if (timeSinceHeartbeat > this.heartbeatTimeout) {
        console.log('[RealtimeManager] Zombie connection detected, reconnecting...');
        this.reconnectAll();
      }
      this.startHeartbeat();
    } else {
      this.stopHeartbeat();
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.lastHeartbeat = Date.now();
    
    this.heartbeatTimer = setInterval(() => {
      this.lastHeartbeat = Date.now();
      
      // Check if any channel appears connected but might be zombie
      const hasSubscribedChannels = Array.from(this.channels.values()).some(c => c.subscribed);
      
      if (hasSubscribedChannels && this.connectionStatus === 'disconnected') {
        console.log('[RealtimeManager] Heartbeat detected inconsistent state, reconnecting...');
        this.reconnectAll();
      }
    }, this.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private handleChannelError(channelName: string): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.setStatus('reconnecting');
      this.scheduleReconnect();
    } else {
      this.setStatus('disconnected');
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    const delay = Math.min(
      this.baseDelay * Math.pow(2, this.reconnectAttempts),
      32000
    );

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      this.reconnectAll();
    }, delay);
  }

  private async reconnectAll(): Promise<void> {
    this.setStatus('reconnecting');

    const channelConfigs = Array.from(this.channels.entries());
    
    for (const [name, managed] of channelConfigs) {
      supabase.removeChannel(managed.channel);
      this.channels.delete(name);
      
      const newManaged = this.subscribe(name, managed.config);
      
      if (newManaged.config.onReconnect) {
        setTimeout(() => {
          if (newManaged.subscribed) {
            newManaged.config.onReconnect?.();
          }
        }, 1000);
      }
    }
  }
}

export const realtimeManager = RealtimeManager.getInstance();
export default RealtimeManager;
