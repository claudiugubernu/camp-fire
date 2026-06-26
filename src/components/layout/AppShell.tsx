import { type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '@/store/AppContext';

interface NavItem {
  to: string;
  label: string;
  icon: string;
  activeIcon: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Acasa', icon: '🏠', activeIcon: '🏡' },
  { to: '/scan', label: 'Scaneaza', icon: '📷', activeIcon: '📸' },
  { to: '/badges', label: 'Insigne', icon: '🏅', activeIcon: '🥇' },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { state } = useApp();

  return (
    <div className='flex flex-col h-full bg-surface-950'>
      {/* Header */}
      <header className='flex items-center justify-between p-5 border-b border-surface-800'>
        <div className='flex items-center gap-2'>
          <span className='text-2xl animate-flicker'>🔥</span>
          <span className='font-black text-lg gradient-fire tracking-tight'>
            Camp Fire
          </span>
        </div>
        <div className='flex items-center gap-3'>
          {state.user && (
            <>
              <div className='flex items-center gap-1.5 bg-surface-800 rounded-full px-3 py-1.5'>
                <span className='text-sm'>🔥</span>
                <span className='text-sm font-bold text-fire-400'>
                  {state.streak.current}
                </span>
              </div>
              <div className='flex items-center gap-1.5 bg-surface-800 rounded-full px-3 py-1.5'>
                <span className='text-xs text-text-secondary'>
                  {state.user.teamId.toUpperCase()}
                </span>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className='flex-1 overflow-y-auto overflow-x-hidden'>
        {children}
      </main>

      {/* Bottom nav */}
      <nav className='safe-bottom border-t border-surface-800 bg-surface-900/95 backdrop-blur-md'>
        <div className='flex items-center justify-around px-2 py-2'>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className='flex-1'>
              {({ isActive }) => (
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className='flex flex-col items-center gap-0.5 py-2 rounded-xl transition-colors'>
                  <span
                    className={`text-2xl transition-all ${isActive ? 'scale-110' : 'opacity-60'}`}>
                    {isActive ? item.activeIcon : item.icon}
                  </span>
                  <span
                    className={`text-[10px] font-semibold transition-colors ${
                      isActive ? 'text-fire-400' : 'text-text-muted'
                    }`}>
                    {item.label}
                  </span>
                </motion.div>
              )}
            </NavLink>
          ))}

          {/* Admin link - only show for admins */}
          {state.user?.isAdmin && (
            <NavLink
              to='/admin'
              className='flex-1'>
              {({ isActive }) => (
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className='flex flex-col items-center gap-0.5 py-2'>
                  <span className={`text-2xl ${isActive ? '' : 'opacity-60'}`}>
                    ⚙️
                  </span>
                  <span
                    className={`text-[10px] font-semibold ${isActive ? 'text-fire-400' : 'text-text-muted'}`}>
                    Admin
                  </span>
                </motion.div>
              )}
            </NavLink>
          )}
        </div>
      </nav>
    </div>
  );
}
