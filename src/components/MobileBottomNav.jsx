import { NavLink } from 'react-router-dom';
import { FiHome, FiCalendar, FiUsers, FiFileText, FiGrid } from 'react-icons/fi';

const navItems = [
  { to: '/dashboard', icon: FiHome, label: 'Home' },
  { to: '/events', icon: FiCalendar, label: 'Events', badge: 'NEW' },
  { to: '/teammates', icon: FiUsers, label: 'Match' },
  { to: '/applications', icon: FiFileText, label: 'Applied' },
];

const MobileBottomNav = () => {
  const handleOpenMenu = () => {
    window.dispatchEvent(new CustomEvent('toggle-mobile-menu'));
  };

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-purple-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5 transition-colors"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-3 rounded-2xl relative transition-all duration-200 ${
                isActive
                  ? 'text-[#681B97] font-bold scale-105'
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <div
                    className={`p-1 rounded-xl transition-colors ${
                      isActive
                        ? 'bg-purple-100 text-[#681B97]'
                        : ''
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  {badge && (
                    <span className="absolute -top-1 -right-2 text-[9px] bg-[#681B97] text-white px-1 py-0.2 rounded-full font-black scale-90">
                      {badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight leading-tight">
                  {label}
                </span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#681B97] mt-0.5" />
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* Menu Drawer Toggle */}
        <button
          onClick={handleOpenMenu}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl text-slate-500 hover:text-slate-900 font-medium transition-all"
        >
          <div className="p-1 rounded-xl">
            <FiGrid className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight leading-tight">More</span>
        </button>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
