import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

import { toast } from 'sonner';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:4000';

interface OrderCreatedPayload {
  orderId: string;
  orderNumber: string;
  customerId: string;
  sellerId: string | null;
  total: number;
}

export function useOrderSocket(): void {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket: Socket = io(`${WS_URL}/admin`, {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    socket.on('order.created', (payload: OrderCreatedPayload) => {
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

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);
}
