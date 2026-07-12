// src/components/layout/Sidebar.jsx
import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';

const Sidebar = ({ links = [], title, children }) => {
  const { pathname } = useLocation();

  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <div className="sticky top-20 glass rounded-2xl border border-zinc-800 p-4">
        {title && (
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4 px-2">
            {title}
          </p>
        )}
        <nav className="space-y-1">
          {links.map(({ to, icon: Icon, label, badge }) => {
            const active = pathname === to || (to !== '/' && pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                  active
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                )}
              >
                <Icon className={clsx('w-4 h-4', active ? 'text-indigo-400' : 'text-zinc-500')} />
                <span className="flex-1">{label}</span>
                {badge !== undefined && (
                  <span className={clsx(
                    'text-xs font-bold rounded-full px-1.5 py-0.5',
                    badge > 0 ? 'bg-indigo-500/20 text-indigo-400' : 'bg-zinc-700 text-zinc-500'
                  )}>
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        {children}
      </div>
    </aside>
  );
};

export default Sidebar;
