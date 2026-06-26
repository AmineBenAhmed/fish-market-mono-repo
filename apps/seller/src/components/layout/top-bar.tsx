import { Bell, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useAuthStore } from '../../stores/auth';

interface TopBarProps {
  title?: string;
  onNotificationClick?: () => void;
}

export function TopBar({ title = 'FishMarket', onNotificationClick }: TopBarProps) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b bg-background px-4 h-14">
      <div>
        <h1 className="text-lg font-bold">{title}</h1>
        <p className="text-xs text-muted-foreground">{user?.name}</p>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={onNotificationClick} className="relative p-2 rounded-full hover:bg-accent">
          <Bell className="h-5 w-5" />
        </button>
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="p-2 rounded-full hover:bg-accent"
        >
          <LogOut className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}
