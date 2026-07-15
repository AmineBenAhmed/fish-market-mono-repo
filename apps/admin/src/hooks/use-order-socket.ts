import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://178.162.242.127:4000';

interface OrderCreatedPayload {
  orderId: string;
  orderNumber: string;
  customerId: string;
  sellerId: string | null;
  total: number;
}

function generateBeepWav(duration = 0.4): Blob {
  const sampleRate = 8000;
  const numSamples = Math.floor(sampleRate * duration);
  const buffer = new ArrayBuffer(44 + numSamples);
  const view = new DataView(buffer);

  const writeStr = (off: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(off + i, str.charCodeAt(i));
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + numSamples, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate, true);
  view.setUint16(32, 1, true);
  view.setUint16(34, 8, true);
  writeStr(36, 'data');
  view.setUint32(40, numSamples, true);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let freq = 660;
    if (t > 0.14) freq = 880;
    if (t > 0.28) freq = 1100;
    const sample = Math.sin(2 * Math.PI * freq * t) * 0.45 + 0.5;
    view.setUint8(44 + i, Math.min(255, Math.floor(sample * 255)));
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

let _beepBlobUrl: string | null = null;

function playNotificationSound(): void {
  try {
    if (!_beepBlobUrl) {
      const blob = generateBeepWav();
      _beepBlobUrl = URL.createObjectURL(blob);
    }
    const audio = new Audio(_beepBlobUrl);
    audio.volume = 1;
    audio.play().catch(() => {});
  } catch {
    // audio unavailable
  }
}

export function useOrderSocket(): void {
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket: Socket = io(`${WS_URL}/admin`, {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    socket.on('order.created', (payload: OrderCreatedPayload) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      playNotificationSound();

      toast(`New Order: #${payload.orderNumber}`, {
        description: `Total: $${Number(payload.total).toFixed(2)}`,
        action: {
          label: 'View',
          onClick: () => {
            window.open(`/orders/${payload.orderId}`, '_self');
          },
        },
        duration: 8000,
      });
    });

    const deliveryEvents = [
      'delivery.assigned',
      'delivery.accepted',
      'delivery.rejected',
      'delivery.picking-up',
      'delivery.picked-up',
      'delivery.in-transit',
      'delivery.completed',
      'delivery.failed',
      'delivery.cancelled',
    ] as const;

    for (const event of deliveryEvents) {
      socket.on(event, (payload: { orderId: string }) => {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        queryClient.invalidateQueries({ queryKey: ['order', payload.orderId] });
      });
    }

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [queryClient]);
}
