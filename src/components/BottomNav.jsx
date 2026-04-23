import { NavLink } from 'react-router-dom';
import { Home, Clock, Utensils, Wallet, User } from 'lucide-react';

const links = [
  { to: '/',            icon: Home,     label: 'Home'        },
  { to: '/history',     icon: Clock,    label: 'History'     },
  { to: '/restaurants', icon: Utensils, label: 'Restaurants' },
  { to: '/wallet',      icon: Wallet,   label: 'Wallet'      },
  { to: '/profile',     icon: User,     label: 'Account'     },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#080a0f]/95 backdrop-blur border-t border-white/[0.06] px-1 z-50">
      <div className="flex justify-around">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-3 px-2 text-[10px] font-medium transition-colors ${
                isActive ? 'text-amber-400' : 'text-neutral-500'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.6} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
