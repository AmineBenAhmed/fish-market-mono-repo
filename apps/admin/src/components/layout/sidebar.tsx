import { Button } from '@fishmarket/ui';
import {
  BarChart3,
  Bell,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Package,
  ShoppingCart,
  Store,
  Truck,
  Users,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { cn } from '../../lib/utils';
import { useAuthStore } from '../../stores/auth';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/users', icon: Users, label: 'Users' },
  { to: '/sellers', icon: Store, label: 'Sellers' },
  { to: '/drivers', icon: Truck, label: 'Drivers' },
  { to: '/orders', icon: ShoppingCart, label: 'Orders' },
  { to: '/payments', icon: CreditCard, label: 'Payments' },
  { to: '/deliveries', icon: Package, label: 'Deliveries' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
];

export function Sidebar() {
  const logout = useAuthStore((s) => s.logout);

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex h-14 items-center border-b px-6">
        <h1 className="text-lg font-bold tracking-tight">FishMarket</h1>
        <span className="ml-2 rounded-md bg-primary px-2 py-0.5 text-xs text-primary-foreground">
          Admin
        </span>
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
