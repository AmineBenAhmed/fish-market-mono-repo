import { Outlet, useNavigate } from 'react-router-dom';
import { BottomNav } from './bottom-nav';
import { TopBar } from './top-bar';

export function Shell() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-16">
      <TopBar onNotificationClick={() => navigate('/notifications')} />
      <main className="px-4 py-4 max-w-7xl mx-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
