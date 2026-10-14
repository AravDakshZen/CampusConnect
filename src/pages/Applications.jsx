import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiAlertCircle,
  FiCalendar,
  FiMapPin,
  FiUsers,
  FiFileText,
  FiTrash2,
  FiArrowRight,
  FiSearch,
  FiZap,
  FiInbox
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { getStoredApplications, withdrawApplication } from '../services/applicationService';
import { MASTER_REC_EVENTS, CATEGORY_STYLES } from '../services/eventService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STATUS_TABS = ['All', 'Upcoming', 'Applied', 'Accepted', 'Rejected', 'Completed'];

const STATUS_CONFIG = {
  Applied: { badge: 'bg-blue-100 text-blue-700 border-blue-200', icon: FiClock },
  'Under Review': { badge: 'bg-amber-100 text-amber-700 border-amber-200', icon: FiAlertCircle },
  Accepted: { badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: FiCheckCircle },
  Rejected: { badge: 'bg-red-100 text-red-700 border-red-200', icon: FiXCircle },
  Waitlisted: { badge: 'bg-purple-100 text-[#681B97] border-purple-200', icon: FiClock },
  Cancelled: { badge: 'bg-slate-100 text-slate-500 border-slate-200', icon: FiXCircle }
};

const Applications = () => {
  const { userProfile } = useAuth();
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setApplications(getStoredApplications());
  }, []);

  const handleWithdraw = async (id, eventTitle) => {
    if (!confirm(`Are you sure you want to withdraw your application for "${eventTitle}"?`)) return;
    const updated = await withdrawApplication(id);
    setApplications(updated);
    toast.success('Application withdrawn.');
  };

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        (app.eventTitle || '').toLowerCase().includes(search.toLowerCase()) ||
        (app.id || '').toLowerCase().includes(search.toLowerCase()) ||
        (app.teamName || '').toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (activeTab === 'All') return true;
      if (activeTab === 'Upcoming') {
        const isFuture = new Date(app.eventDate) >= new Date();
        return isFuture && app.status !== 'Rejected' && app.status !== 'Cancelled';
      }
      if (activeTab === 'Completed') {
        const isPast = new Date(app.eventDate) < new Date();
        return isPast || app.status === 'Completed';
      }
      return app.status.toLowerCase() === activeTab.toLowerCase();
    });
  }, [applications, activeTab, search]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#681B97] block mb-1">
            Rajalakshmi Engineering College • Student Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            My Applications
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
            Track your registrations, team submissions, acceptance notifications, and institutional participation status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/events"
            className="px-5 py-2.5 rounded-xl bg-[#681B97] text-white text-xs font-bold hover:bg-[#501476] transition shadow-sm flex items-center gap-1.5"
          >
            Discover More Events <FiArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Horizontal status tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {STATUS_TABS.map((tab) => {
              const count = applications.filter((app) => {
                if (tab === 'All') return true;
                if (tab === 'Upcoming') return new Date(app.eventDate) >= new Date() && app.status !== 'Rejected';
                if (tab === 'Completed') return new Date(app.eventDate) < new Date();
                return app.status.toLowerCase() === tab.toLowerCase();
              }).length;

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === tab
                      ? 'bg-[#681B97] text-white shadow-sm'
                      : 'bg-slate-50 text-slate-600 hover:bg-purple-50 hover:text-[#681B97]'
                  }`}
                >
                  <span>{tab}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeTab === tab ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search by event or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-[#681B97]"
            />
          </div>
        </div>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-[#681B97] flex items-center justify-center mx-auto">
            <FiInbox className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No Applications Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {activeTab === 'All'
              ? 'You have not submitted any event registrations yet.'
              : `No registrations found under the "${activeTab}" category.`}
          </p>
          <Link
            to="/events"
            className="inline-block mt-2 px-5 py-2 rounded-xl bg-[#681B97] text-white text-xs font-bold hover:bg-[#501476]"
          >
            Explore Events & Apply Now
          </Link>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredApplications.map((app) => {
            const statusStyle = STATUS_CONFIG[app.status] || STATUS_CONFIG['Applied'];
            const StatusIcon = statusStyle.icon;

            return (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-purple-200 transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  {/* Left: Event Details */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                        {app.category || 'Event'}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        ID: {app.id}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${statusStyle.badge}`}>
                        <StatusIcon className="w-3 h-3" /> {app.status}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug pt-1">
                      {app.eventTitle}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                      <span className="flex items-center gap-1">
                        <FiCalendar className="w-3.5 h-3.5 text-[#681B97]" />
                        {app.eventDate}
                      </span>
                      {app.eventVenue && (
                        <span className="flex items-center gap-1">
                          <FiMapPin className="w-3.5 h-3.5 text-rose-500" />
                          {app.eventVenue}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <FiUsers className="w-3.5 h-3.5 text-blue-500" />
                        {app.type === 'Team' ? `Team: ${app.teamName || 'Collaborative'}` : 'Individual Candidate'}
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <Link
                      to="/events"
                      className="px-4 py-1.5 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50 text-slate-700 text-xs font-bold transition"
                    >
                      View Event
                    </Link>

                    {app.status !== 'Cancelled' && app.status !== 'Rejected' && (
                      <button
                        onClick={() => handleWithdraw(app.id, app.eventTitle)}
                        className="text-[11px] font-semibold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1"
                      >
                        <FiTrash2 className="w-3 h-3" /> Withdraw
                      </button>
                    )}
                  </div>
                </div>

                {/* Team members or statement preview */}
                {app.type === 'Team' && app.teamMembers && app.teamMembers.length > 0 && (
                  <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 text-xs text-slate-700 flex flex-wrap items-center gap-1.5">
                    <span className="font-bold text-[#681B97] text-[11px]">Roster:</span>
                    {app.teamMembers.map((m, i) => (
                      <span key={i} className="bg-white border border-purple-200 px-2 py-0.5 rounded-md text-[10px] font-semibold">
                        {m}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Applications;
