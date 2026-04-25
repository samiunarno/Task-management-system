import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, RootState } from '../store';
import { motion, AnimatePresence } from 'motion/react';

export default function Layout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navLinks = user ? [
    { name: 'Dashboard', path: '/', roles: ['User', 'Admin'], icon: 'dashboard' },
    { name: 'Tasks', path: '/tasks', roles: ['User', 'Admin'], icon: 'task_alt' },
    { name: 'Schedule', path: '/routine', roles: ['User'], icon: 'calendar_month' },
    { name: 'Focus Room', path: '/focus', roles: ['User', 'Admin'], icon: 'timer' },
  ] : [];

  return (
    <div className="flex bg-background text-on-background h-screen overflow-hidden font-sans">
      {/* SideNavBar (Hidden on Mobile, Visible on md+) */}
      <nav className="hidden md:flex flex-col h-screen w-64 border-r border-outline-variant/50 bg-surface transition-all duration-300 ease-in-out p-5 space-y-2 shrink-0 z-20">
        {/* Brand/Header */}
        <div className="flex items-center gap-3 px-2 py-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-[18px]">eco</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-on-surface tracking-tight leading-tight">Joyce Study</h1>
            <p className="text-[11px] text-on-surface-variant font-medium tracking-widest uppercase">Workspace</p>
          </div>
        </div>

        {/* Action Button */}
        <button className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-surface-container-low border border-outline-variant text-on-surface rounded-xl hover:bg-surface-variant transition-colors shadow-sm mb-6 font-semibold text-sm">
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Session
        </button>

        {/* Main Navigation Tabs */}
        <div className="flex-1 space-y-1 mt-4">
          <div className="px-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Menu</div>
          {navLinks.filter(link => link.roles.includes(user?.role || '')).map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm group ${isActive ? 'bg-primary-container/50 text-primary font-semibold' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}`}
              >
                <span className={`material-symbols-outlined text-[20px] transition-colors ${isActive ? 'text-primary' : 'text-outline group-hover:text-on-surface-variant'}`} style={{ fontVariationSettings: isActive ? "'FILL' 1" : "" }}>{link.icon}</span>
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Footer Navigation */}
        <div className="mt-auto space-y-1 pt-4 border-t border-outline-variant/50">
          <Link 
             to="/settings" 
             className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm group ${location.pathname === '/settings' ? 'bg-primary-container/50 text-primary font-semibold' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}`}
          >
            <span className={`material-symbols-outlined text-[20px] ${location.pathname === '/settings' ? 'text-primary' : 'text-outline group-hover:text-on-surface-variant'}`}>settings</span>
            <span>Settings</span>
          </Link>
          <button 
             onClick={handleLogout} 
             className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors font-medium text-sm group"
          >
            <span className="material-symbols-outlined text-[20px] text-outline group-hover:text-on-surface-variant">logout</span>
            <span>Log out</span>
          </button>
        </div>
        
        {/* User profile snippet */}
        <div className="mt-4 pt-4 border-t border-outline-variant/50 flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center text-on-surface font-semibold text-xs shrink-0">
               {user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="truncate flex-1">
               <div className="text-sm font-semibold text-on-surface truncate">{user?.fullName || 'Operator'}</div>
               <div className="text-xs text-on-surface-variant truncate">{user?.email}</div>
            </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
        {/* TopAppBar */}
        <header className="flex justify-between items-center w-full px-6 py-4 h-16 bg-surface/80 backdrop-blur-md border-b border-outline-variant/50 shrink-0 z-10 sticky top-0">
          {/* Mobile Brand (Hidden on md+) */}
          <div className="md:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[18px]">eco</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-on-surface">Joyce</span>
          </div>

          <div className="hidden sm:flex items-center bg-surface-container-low rounded-lg px-3 py-1.5 border border-outline-variant/50 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all w-80 max-w-full shadow-sm">
            <span className="material-symbols-outlined text-outline text-[18px] mr-2">search</span>
            <input className="bg-transparent border-none focus:ring-0 text-sm w-full text-on-surface placeholder:text-outline-variant font-medium outline-none" placeholder="Search resources..." type="text" />
            <div className="hidden md:flex items-center justify-center border border-outline-variant/60 rounded px-1.5 py-0.5 bg-surface text-[10px] text-on-surface-variant font-mono ml-2">⌘K</div>
          </div>

          {/* Trailing Actions */}
          <div className="flex items-center gap-3 ml-auto">
             <button className="relative w-8 h-8 flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface rounded-full transition-colors cursor-pointer">
               <span className="material-symbols-outlined text-[20px]">notifications</span>
               <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full border-2 border-surface"></span>
             </button>
             <button className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface rounded-full transition-colors cursor-pointer hidden sm:flex">
               <span className="material-symbols-outlined text-[20px]">help_center</span>
             </button>
             <button className="md:hidden p-1 ml-2 text-on-surface-variant hover:bg-surface-container rounded-md flex items-center justify-center" onClick={() => setMobileMenuOpen(true)}>
               <span className="material-symbols-outlined text-[24px]">menu</span>
             </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto w-full relative p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
             className="md:hidden fixed inset-0 z-50 flex"
          >
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
            <motion.div 
               initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
               transition={{ type: "spring", damping: 25, stiffness: 200 }}
               className="relative w-64 bg-surface h-full shadow-2xl flex flex-col p-5 border-r border-outline-variant/50"
            >
               <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center shadow-sm">
                      <span className="material-symbols-outlined text-[18px]">eco</span>
                    </div>
                    <h1 className="text-lg font-bold tracking-tight text-on-surface">Joyce</h1>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container">
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
               </div>

               <div className="flex-1 space-y-1 mt-4">
                  <div className="px-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Menu</div>
                 {navLinks.filter(link => link.roles.includes(user?.role || '')).map((link) => {
                    const isActive = location.pathname === link.path;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setMobileMenuOpen(false)}
                         className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm group ${isActive ? 'bg-primary-container/50 text-primary font-semibold' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}`}
                      >
                        <span className={`material-symbols-outlined text-[20px] transition-colors ${isActive ? 'text-primary' : 'text-outline group-hover:text-on-surface-variant'}`} style={{ fontVariationSettings: isActive ? "'FILL' 1" : "" }}>{link.icon}</span>
                        <span>{link.name}</span>
                      </Link>
                    );
                  })}
               </div>
               <div className="mt-auto space-y-1 pt-4 border-t border-outline-variant/50">
                 <Link to="/settings" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors font-medium text-sm">
                   <span className="material-symbols-outlined text-[20px] text-outline">settings</span>
                   <span>Settings</span>
                 </Link>
                 <button onClick={() => { setMobileMenuOpen(false); handleLogout(); }} className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors font-medium text-sm">
                   <span className="material-symbols-outlined text-[20px] text-outline">logout</span>
                   <span>Log out</span>
                 </button>
                 
                 <div className="mt-4 pt-4 border-t border-outline-variant/50 flex items-center gap-3 px-2">
                    <div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center text-on-surface font-semibold text-xs shrink-0">
                       {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="truncate flex-1">
                       <div className="text-sm font-semibold text-on-surface truncate">{user?.fullName || 'Operator'}</div>
                       <div className="text-xs text-on-surface-variant truncate">{user?.email}</div>
                    </div>
                </div>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
