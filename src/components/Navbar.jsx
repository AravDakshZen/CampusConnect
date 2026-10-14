import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiBell, FiSearch, FiX, FiUser, FiUsers, FiLogOut, FiCalendar, FiDownload, FiFileText } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { usePWAInstall } from '../context/PWAInstallContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import toast from 'react-hot-toast';

const Navbar = () => {
    const { currentUser, userProfile } = useAuth();
    const { canInstall, isStandalone, promptInstall } = usePWAInstall();

    const [notifications, setNotifications] = useState([
        { id: 'n1', message: 'Shallini requested to join your "AI-Based Hospital Queue" project.', time: '10m ago', type: 'project', unread: true },
        { id: 'n2', message: '🔴 LIVE NOW: REC HackNova 2026 is currently ongoing at Tech Innovation Center!', time: 'Now', type: 'event', unread: true },
        { id: 'n3', message: 'New Event: Designova 2026 registration is now open.', time: '1h ago', type: 'event', unread: false }
    ]);
    const [showNotifs, setShowNotifs] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [search, setSearch] = useState('');

    const notifRef = useRef(null);
    const profileRef = useRef(null);

    const navigate = useNavigate();

    useEffect(() => {
        const handler = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setShowNotifs(false);
            }
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setShowProfileMenu(false);
            }
        };

        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const unreadCount = notifications.filter(n => n.unread).length;

    const handleSearchSubmit = (e) => {
        if (e.key === 'Enter' && search.trim()) {
            navigate(`/teammates?search=${encodeURIComponent(search.trim())}`);
        }
    };

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

    const displayName = userProfile?.name || currentUser?.displayName || 'REC Student';
    const initials = displayName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-slate-200 px-4 lg:px-6 py-3 transition-colors shadow-xs">
            <div className="flex items-center justify-between gap-4">

                {/* Search */}
                <div className="flex-1 max-w-xs lg:max-w-md ml-12 lg:ml-0">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search teammates, skills, events..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleSearchSubmit}
                            className="w-full pl-9 pr-8 py-2 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:border-[#681B97] focus:outline-none focus:ring-2 focus:ring-[#681B97]/20 text-slate-900 transition-all placeholder:text-slate-400"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <FiX className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 sm:gap-3">

                    {/* Discover Events Quick Pill */}
                    <Link
                        to="/events"
                        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#681B97] bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-all"
                    >
                        <FiCalendar className="w-3.5 h-3.5 text-[#681B97]" />
                        <span>Discover Events</span>
                    </Link>

                    {/* Install App button (desktop only, when installable) */}
                    {canInstall && !isStandalone && (
                        <button
                            onClick={promptInstall}
                            title="Install REC Campus Connect"
                            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-all"
                        >
                            <FiDownload className="w-3.5 h-3.5" />
                            <span>Install App</span>
                        </button>
                    )}

                    {/* Notification Bell */}
                    <div className="relative" ref={notifRef}>
                        <button
                            onClick={() => setShowNotifs(p => !p)}
                            className="relative p-2.5 rounded-xl text-slate-600 hover:bg-purple-50 border border-transparent hover:border-purple-200 transition-all"
                        >
                            <FiBell className="w-4 h-4" />
                            {unreadCount > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#681B97] text-white text-[10px] rounded-full flex items-center justify-center font-bold"
                                >
                                    {unreadCount}
                                </motion.span>
                            )}
                        </button>

                        <AnimatePresence>
                            {showNotifs && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50"
                                >
                                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                                        <h3 className="font-bold text-sm text-slate-900">
                                            REC Notifications
                                        </h3>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-[#681B97]">
                                            {unreadCount} New
                                        </span>
                                    </div>

                                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                                        {notifications.map((n) => (
                                            <div
                                                key={n.id}
                                                className={`p-3.5 hover:bg-purple-50/50 transition-colors cursor-pointer ${
                                                    n.unread ? 'bg-purple-50/40' : ''
                                                }`}
                                                onClick={() => {
                                                    setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, unread: false } : item));
                                                    if (n.type === 'project') navigate('/my-groups');
                                                    if (n.type === 'event') navigate('/events');
                                                }}
                                            >
                                                <div className="flex items-start gap-2.5">
                                                    {n.type === 'project' ? (
                                                        <FiUsers className="w-4 h-4 text-[#681B97] mt-0.5 flex-shrink-0" />
                                                    ) : (
                                                        <FiCalendar className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                                    )}
                                                    <div className="flex-1">
                                                        <p className="text-xs text-slate-800 leading-snug">
                                                            {n.message}
                                                        </p>
                                                        <span className="text-[10px] text-slate-400 mt-1 block">
                                                            {n.time}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="p-2.5 text-center border-t border-slate-100 bg-slate-50">
                                        <Link
                                            to="/events"
                                            onClick={() => setShowNotifs(false)}
                                            className="text-xs text-[#681B97] font-bold hover:underline"
                                        >
                                            View Campus Updates &rarr;
                                        </Link>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Student Profile Dropdown */}
                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => setShowProfileMenu(p => !p)}
                            className="flex items-center gap-2 p-1 rounded-xl hover:bg-purple-50 transition-all"
                        >
                            <div className="w-9 h-9 rounded-xl gradient-brand text-white font-black text-xs flex items-center justify-center shadow-md shadow-purple-900/20">
                                {userProfile?.profileImage ? (
                                    <img
                                        src={userProfile.profileImage}
                                        alt="avatar"
                                        className="w-full h-full object-cover rounded-xl"
                                    />
                                ) : (
                                    initials
                                )}
                            </div>
                        </button>

                        <AnimatePresence>
                            {showProfileMenu && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50"
                                >
                                    <div className="px-4 py-3 border-b border-slate-100">
                                        <p className="font-bold text-sm text-slate-900 truncate">
                                            {displayName}
                                        </p>
                                        <p className="text-xs text-[#681B97] font-semibold truncate">
                                            {userProfile?.department || 'REC'} • {userProfile?.year || 'Student'}
                                        </p>
                                    </div>

                                    <div className="py-1">
                                        <Link
                                            to="/profile"
                                            onClick={() => setShowProfileMenu(false)}
                                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#681B97] transition-colors"
                                        >
                                            <FiUser className="w-4 h-4" /> View REC Profile
                                        </Link>
                                        <Link
                                            to="/applications"
                                            onClick={() => setShowProfileMenu(false)}
                                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#681B97] transition-colors"
                                        >
                                            <FiFileText className="w-4 h-4" /> My Applications
                                        </Link>
                                        <Link
                                            to="/my-groups"
                                            onClick={() => setShowProfileMenu(false)}
                                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-[#681B97] transition-colors"
                                        >
                                            <FiUsers className="w-4 h-4" /> My Project Groups
                                        </Link>
                                    </div>

                                    <div className="pt-1 border-t border-slate-100">
                                        <button
                                            onClick={() => {
                                                setShowProfileMenu(false);
                                                handleLogout();
                                            }}
                                            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <FiLogOut className="w-4 h-4" /> Sign Out
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>

            </div>
        </header>
    );
};

export default Navbar;