import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useRoomSync(roomId: string) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const channelRef = useRef(channel);
  const isConnectedRef = useRef(isConnected);

  useEffect(() => {
    channelRef.current = channel;
    isConnectedRef.current = isConnected;
  }, [channel, isConnected]);

  useEffect(() => {
    if (!roomId) return;

    // Create a unique channel for this room
    const roomChannel = supabase.channel(`room-${roomId}`, {
      config: {
        broadcast: {
          ack: false,
        },
      },
    });

    roomChannel
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
        } else {
          setIsConnected(false);
        }
      });

    setChannel(roomChannel);

    return () => {
      roomChannel.unsubscribe();
    };
  }, [roomId]);

  const broadcastMessage = useCallback(async (event: string, payload: any) => {
    if (!channelRef.current || !isConnectedRef.current) return;
    await channelRef.current.send({
      type: 'broadcast',
      event: event,
      payload: payload,
    });
  }, []);

  return { channel, isConnected, broadcastMessage };
}
