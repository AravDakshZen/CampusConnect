import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiHome,
    FiBook,
    FiCalendar,
    FiSearch,
    FiMessageSquare,
    FiUser,
    FiLogOut,
    FiShield,
    FiMenu,
    FiX,
    FiBell,
    FiZap,
    FiBriefcase,
    FiUsers,
    FiLayers,
    FiDownload,
    FiFileText
} from 'react-icons/fi';

import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useAuth } from '../context/AuthContext';
import { usePWAInstall } from '../context/PWAInstallContext';
import { RECTorchIcon } from './RECLogo';
import toast from 'react-hot-toast';

const navItems = [
    { to: '/dashboard', icon: FiHome, label: 'Home' },
    { to: '/events', icon: FiCalendar, label: 'Discover Events', highlight: true, badge: 'EXPLORE' },
    { to: '/applications', icon: FiFileText, label: 'My Applications', badge: 'STATUS' },
    { to: '/teammates', icon: FiUsers, label: 'Find Teammates', highlight: true, badge: 'AI' },
    { to: '/projects', icon: FiLayers, label: 'Projects' },
    { to: '/my-groups', icon: FiUsers, label: 'My Groups' },
    { to: '/notes', icon: FiBook, label: 'Academics' },
    { to: '/ai-assistant', icon: FiZap, label: 'Research AI' },
    { to: '/announcements', icon: FiBell, label: 'Announcements' },
    { to: '/placements', icon: FiBriefcase, label: 'Placements' },
    { to: '/lost-found', icon: FiSearch, label: 'Lost & Found' },
    { to: '/chat', icon: FiMessageSquare, label: 'Chat' },
    { to: '/profile', icon: FiUser, label: 'Profile' },
];

const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const { userProfile } = useAuth();
    const { canInstall, isStandalone, promptInstall } = usePWAInstall();

    const navigate = useNavigate();

    useEffect(() => {
        const handleOpen = () => setMobileOpen(true);
        window.addEventListener('toggle-mobile-menu', handleOpen);
        return () => window.removeEventListener('toggle-mobile-menu', handleOpen);
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            toast.success('Logged out successfully');
            navigate('/login');
        } catch (error) {
            console.error(error);
            toast.error('Failed to logout');
        }
    };

    const renderSidebarContent = (isMobile = false) => (
        <div className="flex flex-col h-full bg-[#18121F] text-white border-r border-[#2D2239]">

            {/* Header Brand */}
            <div className={`flex items-center gap-3 p-4 border-b border-white/10 ${collapsed && !isMobile ? 'justify-center' : ''}`}>
                <RECTorchIcon className="w-10 h-10 flex-shrink-0 shadow-lg shadow-purple-950/40" />

                {(!collapsed || isMobile) && (
                    <div className="min-w-0 flex-1">
                        <p className="text-white font-black text-sm leading-tight truncate">
                            Campus<span className="text-[#D4A017]">Connect</span>
                        </p>
                        <p className="text-purple-300 text-[11px] font-semibold truncate">
                            Rajalakshmi Eng. College
                        </p>
                    </div>
                )}
            </div>

            {/* Navigation items */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {navItems.map(({ to, icon: Icon, label, highlight, badge }) => (
                    <NavLink
                        key={to}
                        to={to}
                        onClick={() => isMobile && setMobileOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                            ${isActive
                                ? 'bg-[#681B97] text-white font-bold shadow-lg shadow-purple-950/50'
                                : highlight
                                    ? 'text-purple-200 hover:bg-[#681B97]/25 hover:text-white'
                                    : 'text-slate-300 hover:bg-white/10 hover:text-white'}
                            ${collapsed && !isMobile ? 'justify-center' : ''}`
                        }
                    >
                        <Icon className="w-4 h-4 flex-shrink-0 group-hover:scale-110 transition-transform" />

                        {(!collapsed || isMobile) && (
                            <span className="text-xs font-semibold flex items-center justify-between flex-1">
                                <span className="truncate">{label}</span>
                                {badge && (
                                    <span className="text-[9px] bg-purple-400 text-[#18121F] px-1.5 py-0.5 rounded-full font-black leading-none ml-1">
                                        {badge}
                                    </span>
                                )}
                            </span>
                        )}
                    </NavLink>
                ))}

                {userProfile?.role === 'admin' && (
                    <NavLink
                        to="/admin"
                        onClick={() => isMobile && setMobileOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                            ${isActive
                                ? 'bg-amber-500/30 text-amber-300 font-bold'
                                : 'text-amber-400/80 hover:bg-amber-500/20 hover:text-amber-300'}
                            ${collapsed && !isMobile ? 'justify-center' : ''}`
                        }
                    >
                        <FiShield className="w-4 h-4 flex-shrink-0" />
                        {(!collapsed || isMobile) && (
                            <span className="text-xs font-bold">Admin Panel</span>
                        )}
                    </NavLink>
                )}
            </nav>

            {/* Bottom Actions: Install PWA, Theme & Logout */}
            <div className="p-3 border-t border-white/10 space-y-1">
                {canInstall && !isStandalone && (
                    <button
                        onClick={promptInstall}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 font-semibold transition-all ${collapsed && !isMobile ? 'justify-center' : ''}`}
                        title="Install REC Campus Connect app"
                    >
                        <FiDownload className="w-4 h-4 text-amber-400 flex-shrink-0 animate-bounce" />
                        {(!collapsed || isMobile) && (
                            <span className="text-xs font-bold">Install App</span>
                        )}
                    </button>
                )}


                <button
                    onClick={handleLogout}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-rose-300 hover:bg-rose-500/20 hover:text-rose-200 transition-all ${collapsed && !isMobile ? 'justify-center' : ''}`}
                >
                    <FiLogOut className="w-4 h-4" />
                    {(!collapsed || isMobile) && (
                        <span className="text-xs font-medium">Logout</span>
                    )}
                </button>
            </div>

        </div>
    );

    return (
        <>
            <motion.aside
                animate={{ width: collapsed ? 68 : 220 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="hidden lg:flex flex-col h-screen sticky top-0 flex-shrink-0 overflow-hidden shadow-2xl z-40"
            >
                <button
                    onClick={() => setCollapsed(p => !p)}
                    className="absolute top-4 right-3 z-20 text-white/60 hover:text-white transition-colors"
                    title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    <FiMenu className="w-4 h-4" />
                </button>

                {renderSidebarContent()}
            </motion.aside>

            {/* Mobile Menu Trigger */}
            <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden fixed top-3 left-4 z-40 p-2.5 rounded-xl bg-[#681B97] text-white shadow-lg"
            >
                <FiMenu className="w-4 h-4" />
            </button>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            className="lg:hidden fixed inset-0 bg-black/70 z-50 backdrop-blur-sm"
                        />

                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="lg:hidden fixed left-0 top-0 h-full w-64 z-50 shadow-2xl"
                        >
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="absolute top-4 right-4 text-white/60 hover:text-white z-10"
                            >
                                <FiX className="w-5 h-5" />
                            </button>

                            {renderSidebarContent(true)}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;