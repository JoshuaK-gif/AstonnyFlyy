import React, { useState } from 'react';
import { LayoutDashboard, Package, ShoppingBag, Settings, LogOut, ChevronLeft, Menu, X, Grid, Boxes, Mail, Users, Image as ImageIcon } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import logo from "@/assets/logo.png";

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Package, label: 'Products', path: '/admin/products' },
    { icon: Boxes, label: 'Inventory', path: '/admin/inventory' },
    { icon: ShoppingBag, label: 'Orders', path: '/admin/orders' },
    { icon: ImageIcon, label: 'Editorial', path: '/admin/editorial' },
    { icon: Grid, label: 'Collections', path: '/admin/collections' },
    { icon: Users, label: 'Community', path: '/admin/community' },
    { icon: Mail, label: 'Messages', path: '/admin/messages' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  const SidebarContent = ({ isMobile = false }) => (
    <>
      <div className="flex h-16 items-center justify-between px-6">
        {(isSidebarOpen || isMobile) && (
          <span className="font-display text-xl font-black tracking-tighter text-white">
            ADMIN PANEL
          </span>
        )}
        {!isMobile && (
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="rounded-lg p-1 hover:bg-accent hover:text-primary transition-all"
          >
            <ChevronLeft className={`h-5 w-5 transition-transform ${!isSidebarOpen ? 'rotate-180' : ''}`} />
          </button>
        )}
        {isMobile && (
          <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:bg-accent hover:text-primary rounded-lg p-1 transition-all">
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => isMobile && setIsMobileMenuOpen(false)}
              className={`flex items-center gap-4 rounded-lg px-3 py-2 text-sm font-bold transition-all ${
                isActive 
                  ? 'bg-accent text-primary shadow-lg shadow-accent/20' 
                  : 'text-slate-400 hover:bg-accent hover:text-primary'
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {(isSidebarOpen || isMobile) && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-4 space-y-2">
        <Link
          to="/"
          className="flex items-center gap-4 rounded-lg px-3 py-2 text-sm font-bold text-slate-400 hover:bg-accent hover:text-primary transition-all"
        >
          <LogOut className="h-5 w-5 rotate-180" />
          {(isSidebarOpen || isMobile) && <span>View Store</span>}
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 rounded-lg px-3 py-2 text-sm font-bold text-red-400 hover:bg-accent hover:text-primary transition-all"
        >
          <LogOut className="h-5 w-5" />
          {(isSidebarOpen || isMobile) && <span>Sign Out</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-body overflow-hidden text-slate-900">
      {/* Desktop Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } hidden md:flex fixed inset-y-0 left-0 z-50 flex-col bg-slate-900 text-slate-300 transition-all duration-300 shadow-2xl`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-[70] flex w-72 flex-col bg-slate-900 text-slate-300 md:hidden shadow-2xl"
            >
              <SidebarContent isMobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`flex flex-1 flex-col ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'} transition-all duration-300 min-w-0 min-h-0`}>
        <header className="flex shrink-0 h-16 items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 md:px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="rounded-lg p-2 hover:bg-slate-100 md:hidden"
            >
              <Menu className="h-6 w-6 text-slate-600" />
            </button>
            <h2 className="text-sm md:text-lg font-black uppercase tracking-widest text-slate-800 truncate">
              {menuItems.find(item => location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path)))?.label || 'Admin'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-xs font-black uppercase text-slate-900 leading-none">Admin User</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Super Admin</span>
            </div>
            <img src={logo} alt="AstonnyFlyy Logo" className="h-9 w-9 rounded-full object-cover border-2 border-white shadow-sm" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar min-h-0">
          <div className="mx-auto max-w-[1600px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
