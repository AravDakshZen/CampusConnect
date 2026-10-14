import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBriefcase, FiPlus, FiX, FiSearch, FiCalendar, FiMapPin,
  FiUsers, FiDollarSign, FiExternalLink, FiChevronDown, FiChevronUp,
  FiBookmark, FiClock, FiCheck, FiAward, FiFilter
} from 'react-icons/fi';
import {
  collection, addDoc, deleteDoc, doc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import useFirestore from '../hooks/useFirestore';
import toast from 'react-hot-toast';

// ─── Helpers ────────────────────────────────────────────────────────────────
const TYPES = ['All', 'Placement', 'Internship', 'PPO', 'Scholarship'];
const DEPARTMENTS = ['All', 'CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT'];
const TYPE_COLORS = {
  Placement: 'from-blue-600 to-cyan-500',
  Internship: 'from-emerald-500 to-teal-500',
  PPO: 'from-violet-600 to-purple-600',
  Scholarship: 'from-amber-500 to-orange-500',
};
const TYPE_BADGE = {
  Placement: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Internship: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  PPO: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  Scholarship: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
};

const formatDate = (ts) => {
  if (!ts) return 'N/A';
  const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const daysLeft = (deadline) => {
  if (!deadline) return null;
  const d = deadline.seconds ? new Date(deadline.seconds * 1000) : new Date(deadline);
  const diff = Math.ceil((d - Date.now()) / 86400000);
  return diff;
};

// ─── Drive Card ──────────────────────────────────────────────────────────────
const DriveCard = ({ drive, onApply, onDelete, isAdmin, appliedIds }) => {
  const [expanded, setExpanded] = useState(false);
  const days = daysLeft(drive.deadline);
  const isApplied = appliedIds.includes(drive.id);
  const isExpired = days !== null && days < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-slate-800/60 border rounded-2xl overflow-hidden transition-all ${
        isExpired ? 'border-slate-700/30 opacity-60' : 'border-slate-700/50 hover:border-slate-600/50'
      }`}
    >
      {/* Top gradient bar */}
      <div className={`h-1 bg-gradient-to-r ${TYPE_COLORS[drive.type] || 'from-slate-600 to-slate-500'}`} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3">
            {/* Company logo placeholder */}
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${TYPE_COLORS[drive.type] || 'from-slate-600 to-slate-500'} flex items-center justify-center flex-shrink-0 shadow-lg`}>
              <FiBriefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-base leading-tight">{drive.company}</h3>
              <p className="text-slate-400 text-sm">{drive.role}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${TYPE_BADGE[drive.type] || 'bg-slate-700 text-slate-300 border-slate-600'}`}>
              {drive.type}
            </span>
            {days !== null && (
              <span className={`text-xs font-medium ${isExpired ? 'text-red-400' : days <= 3 ? 'text-amber-400' : 'text-slate-400'}`}>
                {isExpired ? 'Expired' : `${days}d left`}
              </span>
            )}
          </div>
        </div>

        {/* Info pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {drive.package && (
            <span className="flex items-center gap-1 text-xs text-slate-300 bg-slate-700/60 rounded-lg px-2.5 py-1">
              <FiDollarSign className="w-3 h-3 text-emerald-400" /> {drive.package}
            </span>
          )}
          {drive.location && (
            <span className="flex items-center gap-1 text-xs text-slate-300 bg-slate-700/60 rounded-lg px-2.5 py-1">
              <FiMapPin className="w-3 h-3 text-rose-400" /> {drive.location}
            </span>
          )}
          {drive.eligibility && (
            <span className="flex items-center gap-1 text-xs text-slate-300 bg-slate-700/60 rounded-lg px-2.5 py-1">
              <FiAward className="w-3 h-3 text-violet-400" /> {drive.eligibility}
            </span>
          )}
          {drive.deadline && (
            <span className="flex items-center gap-1 text-xs text-slate-300 bg-slate-700/60 rounded-lg px-2.5 py-1">
              <FiCalendar className="w-3 h-3 text-blue-400" /> {formatDate(drive.deadline)}
            </span>
          )}
        </div>

        {/* Department tags */}
        {drive.departments?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {drive.departments.map(d => (
              <span key={d} className="text-xs bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded-lg px-2 py-0.5">{d}</span>
            ))}
          </div>
        )}

        {/* Description toggle */}
        {drive.description && (
          <button
            onClick={() => setExpanded(p => !p)}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 mb-3 transition-colors"
          >
            {expanded ? <FiChevronUp className="w-3 h-3" /> : <FiChevronDown className="w-3 h-3" />}
            {expanded ? 'Hide details' : 'View details'}
          </button>
        )}
        <AnimatePresence>
          {expanded && drive.description && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-3"
            >
              <p className="text-slate-300 text-sm leading-relaxed bg-slate-900/40 rounded-xl p-3 border border-slate-700/40">
                {drive.description}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {!isExpired && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onApply(drive)}
              disabled={isApplied}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                isApplied
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                  : `bg-gradient-to-r ${TYPE_COLORS[drive.type] || 'from-slate-600 to-slate-500'} text-white shadow-lg hover:shadow-xl`
              }`}
            >
              {isApplied ? <><FiCheck className="w-4 h-4" /> Applied</> : 'Apply Now'}
            </motion.button>
          )}
          {drive.applyLink && (
            <a
              href={drive.applyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
            >
              <FiExternalLink className="w-4 h-4" />
            </a>
          )}
          {isAdmin && (
            <button
              onClick={() => onDelete(drive.id)}
              className="p-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Post Drive Modal ────────────────────────────────────────────────────────
const PostModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    company: '', role: '', type: 'Placement', package: '',
    location: '', eligibility: '', description: '', applyLink: '',
    deadline: '', departments: []
  });
  const [submitting, setSubmitting] = useState(false);

  const toggleDept = (d) => {
    setForm(p => ({
      ...p,
      departments: p.departments.includes(d)
        ? p.departments.filter(x => x !== d)
        : [...p.departments, d]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.company || !form.role) return toast.error('Company and Role are required');
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'placements'), {
        ...form,
        deadline: form.deadline ? new Date(form.deadline) : null,
        createdAt: serverTimestamp()
      });
      toast.success('Drive posted successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to post drive');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-700/50 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-slate-900 border border-slate-700/50 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FiPlus className="w-5 h-5 text-blue-400" /> Post New Drive
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input className={inputCls} placeholder="Company Name *" value={form.company}
              onChange={e => setForm(p => ({ ...p, company: e.target.value }))} />
            <input className={inputCls} placeholder="Job Role *" value={form.role}
              onChange={e => setForm(p => ({ ...p, role: e.target.value }))} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <select className={inputCls} value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
              {TYPES.filter(t => t !== 'All').map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input className={inputCls} placeholder="Package (e.g. 6 LPA, 20k/month)" value={form.package}
              onChange={e => setForm(p => ({ ...p, package: e.target.value }))} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input className={inputCls} placeholder="Location (e.g. Bangalore, Remote)" value={form.location}
              onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
            <input className={inputCls} placeholder="Eligibility (e.g. CGPA ≥ 7.0)" value={form.eligibility}
              onChange={e => setForm(p => ({ ...p, eligibility: e.target.value }))} />
          </div>

          <input className={inputCls} placeholder="Apply Link (optional)" value={form.applyLink}
            onChange={e => setForm(p => ({ ...p, applyLink: e.target.value }))} />

          <div>
            <label className="text-slate-400 text-xs mb-2 block">Application Deadline</label>
            <input className={inputCls} type="date" value={form.deadline}
              onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} />
          </div>

          <div>
            <label className="text-slate-400 text-xs mb-2 block">Eligible Departments</label>
            <div className="flex flex-wrap gap-2">
              {DEPARTMENTS.filter(d => d !== 'All').map(d => (
                <button
                  key={d} type="button"
                  onClick={() => toggleDept(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    form.departments.includes(d)
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <textarea
            className={`${inputCls} resize-none`}
            placeholder="Description, requirements, selection process..."
            rows={4}
            value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
          />

          <motion.button
            type="submit"
            disabled={submitting}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-sm shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Posting...' : 'Post Drive'}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const Placements = () => {
  const { isAdmin, currentUser } = useAuth();
  const [showPostModal, setShowPostModal] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [appliedIds, setAppliedIds] = useState(
    () => JSON.parse(localStorage.getItem(`applied_placements_${currentUser?.uid}`) || '[]')
  );
  const [reload, setReload] = useState(0);

  const { docs: drives, loading } = useFirestore('placements', [], { field: 'createdAt', direction: 'desc' });

  const handleApply = (drive) => {
    if (appliedIds.includes(drive.id)) return;
    const next = [...appliedIds, drive.id];
    setAppliedIds(next);
    localStorage.setItem(`applied_placements_${currentUser?.uid}`, JSON.stringify(next));
    toast.success(`Applied to ${drive.company} – ${drive.role}! 🎉`);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'placements', id));
      toast.success('Drive removed');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const filtered = drives.filter(d => {
    const matchSearch = !search ||
      d.company?.toLowerCase().includes(search.toLowerCase()) ||
      d.role?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'All' || d.type === typeFilter;
    const matchDept = deptFilter === 'All' || d.departments?.includes(deptFilter);
    return matchSearch && matchType && matchDept;
  });

  const stats = {
    total: drives.length,
    active: drives.filter(d => {
      if (!d.deadline) return true;
      const dd = d.deadline.seconds ? new Date(d.deadline.seconds * 1000) : new Date(d.deadline);
      return dd > new Date();
    }).length,
    applied: appliedIds.length,
    placements: drives.filter(d => d.type === 'Placement').length,
  };

  return (
    <div className="space-y-6 pb-8">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <FiBriefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Placements</h1>
              <p className="text-slate-400 text-sm">Campus recruitment drives & opportunities</p>
            </div>
          </div>
        </div>
        {isAdmin && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowPostModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/30"
          >
            <FiPlus className="w-4 h-4" /> Post Drive
          </motion.button>
        )}
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Drives', value: stats.total, color: 'from-blue-600 to-cyan-500', icon: FiBriefcase },
          { label: 'Active', value: stats.active, color: 'from-emerald-500 to-teal-500', icon: FiClock },
          { label: 'You Applied', value: stats.applied, color: 'from-violet-600 to-purple-600', icon: FiCheck },
          { label: 'Placements', value: stats.placements, color: 'from-amber-500 to-orange-500', icon: FiAward },
        ].map(stat => (
          <div key={stat.label} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center flex-shrink-0`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{stat.value}</p>
              <p className="text-slate-400 text-xs">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search company or role..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all"
          />
        </div>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        >
          {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          value={deptFilter}
          onChange={e => setDeptFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        >
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* ── Results count ── */}
      {!loading && (
        <p className="text-slate-500 text-sm">
          Showing <span className="text-white font-medium">{filtered.length}</span> {filtered.length === 1 ? 'drive' : 'drives'}
        </p>
      )}

      {/* ── Drives Grid ── */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-slate-800/40 rounded-2xl h-48 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mx-auto mb-4">
            <FiBriefcase className="w-8 h-8 text-slate-500" />
          </div>
          <p className="text-slate-400 font-medium">No drives found</p>
          <p className="text-slate-500 text-sm mt-1">
            {isAdmin ? 'Post the first placement drive!' : 'Check back soon for new opportunities.'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map(drive => (
            <DriveCard
              key={drive.id}
              drive={drive}
              onApply={handleApply}
              onDelete={handleDelete}
              isAdmin={isAdmin}
              appliedIds={appliedIds}
            />
          ))}
        </div>
      )}

      {/* ── Post Modal ── */}
      <AnimatePresence>
        {showPostModal && (
          <PostModal
            onClose={() => setShowPostModal(false)}
            onSuccess={() => setReload(r => r + 1)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Placements;
