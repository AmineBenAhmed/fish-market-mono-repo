import { Outlet } from 'react-router-dom';

import { Navbar } from './navbar';
import { Sidebar } from './sidebar';

export function DashboardShell() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="ml-64 flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
