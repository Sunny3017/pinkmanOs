import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, Users, LogOut, LayoutDashboard, ShieldCheck, Activity, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  // Prevent scroll when mobile sidebar is open
  React.useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSidebarOpen]);

  // Handle window resize for responsive states
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsCollapsed(false);
        setIsSidebarOpen(false);
      }
      if (window.innerWidth >= 768 && window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const NavItem = ({ to, icon: Icon, label, adminOnly = false }) => {
    if (adminOnly && user?.role !== 'admin') return null;

    return (
      <Link
        to={to}
        onClick={() => setIsSidebarOpen(false)}
        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 group ${
          isActive(to)
            ? 'bg-cyber-cyan text-cyber-black shadow-neon-cyan'
            : 'text-gray-400 hover:text-cyber-cyan hover:bg-cyber-gray'
        } ${isCollapsed ? 'justify-center px-2' : ''}`}
      >
        <Icon size={20} className={`${isActive(to) ? 'text-cyber-black' : 'group-hover:text-cyber-cyan'} shrink-0`} />
        {!isCollapsed && (
          <span className="font-bold tracking-wider truncate overflow-hidden transition-opacity duration-300 whitespace-nowrap">
            {label}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-cyber-black text-white relative overflow-x-hidden">
      {/* Background Effects */}
      <div className="scanlines"></div>
      <div className="bg-grid absolute inset-0 opacity-20 pointer-events-none"></div>

      {/* Mobile/Tablet Header (Navbar) */}
      <header className="fixed top-0 left-0 right-0 bg-cyber-dark/90 backdrop-blur-xl border-b border-cyber-cyan/30 z-[60] p-4 flex items-center justify-between lg:hidden">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="text-cyber-cyan" size={24} />
          <h1 className="text-xl font-black tracking-tighter italic neon-text-cyan">
            PINKMAN<span className="text-cyber-magenta">OS</span>
          </h1>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Tablet Collapse Toggle (Visible only on md-lg) */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex lg:hidden p-2 text-cyber-cyan bg-cyber-black border border-cyber-cyan/30 rounded-lg hover:bg-cyber-gray transition-colors"
          >
            <Menu size={24} />
          </button>
          
          {/* Mobile Menu Toggle (Visible only below md) */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden p-2 text-cyber-cyan bg-cyber-black border border-cyber-cyan/30 rounded-lg hover:bg-cyber-gray transition-colors"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Overlay for Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[50] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-full bg-cyber-dark/90 backdrop-blur-xl border-r border-cyber-cyan/30 z-[55] flex flex-col transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isCollapsed ? 'md:w-20' : 'md:w-60'}
        w-[75%] md:w-60
      `}>
        {/* Desktop Logo Area */}
        <div className={`p-8 hidden lg:block transition-all duration-300 ${isCollapsed ? 'px-4' : 'px-8'}`}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2 overflow-hidden"
          >
            <ShieldCheck className="text-cyber-cyan shrink-0" size={32} />
            {!isCollapsed && (
              <h1 className="text-2xl font-black tracking-tighter italic neon-text-cyan truncate">
                PINKMAN<span className="text-cyber-magenta">OS</span>
              </h1>
            )}
          </motion.div>
        </div>

        {/* Mobile/Tablet Spacer */}
        <div className="lg:hidden h-20"></div>

        {/* Sidebar Nav Items */}
        <nav className={`flex-1 space-y-2 py-4 transition-all duration-300 ${isCollapsed ? 'px-2' : 'px-4'}`}>
          <NavItem to="/dashboard" icon={LayoutDashboard} label="DASHBOARD" />
          <NavItem to="/admin" icon={Users} label="USER MGMT" adminOnly />
          <NavItem to="/admin/logs" icon={Activity} label="SYSTEM LOGS" adminOnly />
        </nav>

        {/* User Status Area */}
        <div className={`p-4 mt-auto border-t border-cyber-cyan/10 transition-all duration-300 ${isCollapsed ? 'px-2' : 'px-4'}`}>
          {!isCollapsed ? (
            <div className="mb-4 px-4 py-3 rounded-lg bg-cyber-gray/50 border border-cyber-magenta/30 overflow-hidden">
              <div className="text-xs text-cyber-magenta font-bold uppercase tracking-widest mb-1 truncate">
                User Status
              </div>
              <div className="text-sm font-bold truncate">{user?.username}</div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-gray-500 uppercase">Usage:</span>
                <span className="text-xs font-mono text-cyber-cyan">
                  {user?.totalSearchUsed}/{user?.allowedSearchLimit}
                </span>
              </div>
              <div className="w-full h-1 bg-cyber-gray rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-cyber-cyan shadow-neon-cyan transition-all duration-500"
                  style={{ width: `${Math.min((user?.totalSearchUsed / user?.allowedSearchLimit) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <div className="mb-4 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-cyber-gray border border-cyber-magenta/30 flex items-center justify-center text-[10px] font-bold text-cyber-magenta">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
            </div>
          )}

          <button
            onClick={logout}
            className={`flex items-center w-full py-3 text-gray-400 hover:text-cyber-magenta hover:bg-cyber-gray transition-all rounded-lg group ${
              isCollapsed ? 'justify-center px-0' : 'space-x-3 px-4'
            }`}
            title="TERMINATE"
          >
            <LogOut size={20} className="shrink-0 group-hover:text-cyber-magenta" />
            {!isCollapsed && <span className="font-bold tracking-wider truncate">TERMINATE</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main 
        className={`min-h-screen relative z-10 flex flex-col pt-24 lg:pt-8 transition-all duration-300
        ${isCollapsed ? 'md:ml-20' : 'md:ml-60'}
        ml-0
      `}>
        <div className="flex-1 px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="mt-auto pt-8 pb-4 text-center border-t border-cyber-cyan/10">
          <p className="text-xs font-bold tracking-widest text-gray-500 uppercase">
            Developed by <span className="text-cyber-cyan neon-text-cyan ml-1">वीर निषाद शनि चौधरी</span>
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Layout;
