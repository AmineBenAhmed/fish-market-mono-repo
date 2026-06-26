import { Home, ClipboardList, ShoppingCart, Wallet, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const items = [
  { to: '/', icon: Home, label: 'Today' },
  { to: '/listings', icon: ClipboardList, label: 'Listings' },
  { to: '/orders', icon: ShoppingCart, label: 'Orders' },
  { to: '/earnings', icon: Wallet, label: 'Earnings' },
  { to: '/settings', icon: User, label: 'Store' },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background pb-safe">
      <div className="flex items-center justify-around h-16">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className="flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-medium transition-colors [&.active]:text-primary [&.active]:font-bold"
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
