import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiX,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUsers,
  FiAward,
  FiCheckCircle,
  FiFileText,
  FiMail,
  FiPhone,
  FiExternalLink,
  FiBookmark,
  FiShare2,
  FiZap,
  FiShield,
  FiUserPlus
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { CATEGORY_STYLES, getEventStatus, calculateEventMatch } from '../services/eventService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const EventDetailModal = ({
  isOpen,
  onClose,
  event,
  onApply,
  onBookmark,
  bookmarked = false
}) => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  if (!isOpen || !event) return null;

  const statusInfo = getEventStatus(event);
  const matchPercent = calculateEventMatch(userProfile, event);
  const catStyle = CATEGORY_STYLES[event.category] || { badge: 'bg-purple-100 text-[#681B97]', icon: '🎓' };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.origin + `/events?id=${event.id}`);
      toast.success('Event link copied to clipboard! 📋');
    } else {
      toast.success('Event details ready to share!');
    }
  };

  const handleFindTeam = () => {
    onClose();
    navigate(`/teammates?search=${encodeURIComponent(event.title)}`);
  };

  const handleCreateTeam = () => {
    onClose();
    navigate(`/projects`);
  };

  const teamText = typeof event.teamSize === 'object'
    ? (event.teamSize.min === event.teamSize.max ? (event.teamSize.min === 1 ? 'Individual' : `Team: ${event.teamSize.min}`) : `Team: ${event.teamSize.min}–${event.teamSize.max}`)
    : (event.teamSize || 'Team: 2–4 members');

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-8"
      >
        {/* Poster Header */}
        <div className="relative h-60 w-full overflow-hidden bg-slate-900">
          {event.poster || event.posterURL ? (
            <img
              src={event.poster || event.posterURL}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#4A126D] to-[#681B97] flex items-center justify-center">
              <span className="text-white text-5xl">{catStyle.icon}</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-black/40 backdrop-blur-md hover:bg-black/60 text-white transition z-10"
          >
            <FiX className="w-5 h-5" />
          </button>

          {/* Top category & match badge */}
          <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
            <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-bold text-slate-800 shadow-sm">
              {catStyle.icon} {event.category}
            </span>
            <span className="px-3 py-1 rounded-full bg-[#681B97] text-white text-[11px] font-black shadow-sm flex items-center gap-1">
              <FiZap className="w-3 h-3 text-[#F5C842]" /> {matchPercent}% Match
            </span>
          </div>

          {/* Event title & organizer overlay */}
          <div className="absolute bottom-4 left-6 right-6 text-white">
            <p className="text-xs font-semibold text-purple-200">
              {event.college || event.organizer}
            </p>
            <h1 className="text-xl sm:text-2xl font-black mt-1 leading-tight text-white">
              {event.title}
            </h1>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto text-xs">
          {/* Key Quick Facts Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Date & Time</span>
              <p className="font-bold text-slate-800">{event.startDate || event.date}</p>
              {event.startTime && <p className="text-[10px] text-slate-500">{event.startTime} - {event.endTime || 'End'}</p>}
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Location & Mode</span>
              <p className="font-bold text-slate-800 truncate">{event.venue || event.location}</p>
              <span className="inline-block px-1.5 py-0.2 text-[9px] font-bold rounded bg-purple-100 text-[#681B97]">
                {event.mode || 'In-Person'}
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Team Format</span>
              <p className="font-bold text-slate-800">{teamText}</p>
              <p className="text-[10px] text-slate-500">Collaborative</p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Registration Deadline</span>
              <p className="font-bold text-amber-700">{event.registrationDeadline || 'Closing Soon'}</p>
              <p className="text-[10px] text-slate-500">{statusInfo.label}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-bold text-slate-900 uppercase text-[11px] mb-1">About the Event</h3>
            <p className="text-slate-600 leading-relaxed text-xs">
              {event.description}
            </p>
          </div>

          {/* Required Skills */}
          {event.skills && event.skills.length > 0 && (
            <div>
              <h3 className="font-bold text-slate-900 uppercase text-[11px] mb-1.5">Required & Recommended Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {event.skills.map((sk, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-purple-50 text-[#681B97] border border-purple-200 font-semibold text-[11px]"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Prize & Certification */}
          <div className="grid sm:grid-cols-2 gap-3">
            {event.prize && (
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start gap-2.5">
                <FiAward className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold uppercase text-[10px] text-amber-800">Prize Pool / Rewards</span>
                  <p className="font-black text-xs text-amber-950 mt-0.5">{event.prize}</p>
                </div>
              </div>
            )}

            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-2.5">
              <FiCheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold uppercase text-[10px] text-emerald-800">Certificate of Participation</span>
                <p className="font-black text-xs text-emerald-950 mt-0.5">
                  {event.certificate ? "Official Institutional Certificate Provided" : "Merit & Winner Certificates"}
                </p>
              </div>
            </div>
          </div>

          {/* Eligibility & Rules */}
          {(event.eligibility || event.rules) && (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              {event.eligibility && (
                <div>
                  <span className="font-bold text-slate-700 uppercase text-[10px] block">Eligibility:</span>
                  <p className="text-slate-600 text-xs mt-0.5">{event.eligibility}</p>
                </div>
              )}
              {event.rules && (
                <div>
                  <span className="font-bold text-slate-700 uppercase text-[10px] block">Guidelines & Rules:</span>
                  <p className="text-slate-600 text-xs mt-0.5">{event.rules}</p>
                </div>
              )}
            </div>
          )}

          {/* Source Attribution (Requirements #8, #10) */}
          <div className="p-3.5 rounded-2xl bg-purple-50/40 border border-purple-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Verified Discovery Source:</span>
              <p className="text-xs font-bold text-slate-800 mt-0.5">
                SOURCE: <span className="text-[#681B97]">{event.sourceName || "REC Official Portal"}</span>
              </p>
            </div>
            {event.sourceUrl && (
              <a
                href={event.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl border border-purple-200 bg-white hover:bg-purple-50 text-[#681B97] font-bold text-xs flex items-center gap-1 shadow-sm transition"
              >
                View Source <FiExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Contact Person */}
          {event.contact && (
            <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-3 pt-1">
              <span><strong>Contact:</strong> {event.contact.person}</span>
              {event.contact.email && <span>• {event.contact.email}</span>}
              {event.contact.phone && <span>• {event.contact.phone}</span>}
            </div>
          )}
        </div>

        {/* Modal Action Bar */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Secondary Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => onBookmark?.(event.id)}
              className={`p-2.5 rounded-xl border transition ${
                bookmarked ? 'border-purple-300 bg-purple-100 text-[#681B97]' : 'border-slate-200 text-slate-600 hover:bg-white'
              }`}
              title={bookmarked ? "Remove Bookmark" : "Save Event"}
            >
              <FiBookmark className={`w-4 h-4 ${bookmarked ? 'fill-[#681B97]' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-white transition"
              title="Share event link"
            >
              <FiShare2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleFindTeam}
              className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-white font-bold text-xs flex items-center gap-1 transition"
            >
              <FiUsers className="w-3.5 h-3.5 text-blue-600" /> Find Team
            </button>
            <button
              onClick={handleCreateTeam}
              className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-white font-bold text-xs flex items-center gap-1 transition"
            >
              <FiUserPlus className="w-3.5 h-3.5 text-[#681B97]" /> Create Team
            </button>
          </div>

          {/* Main CTA: Apply Now or Apply External */}
          <div className="w-full sm:w-auto flex-1 sm:flex-initial">
            {event.isInternalRegistration ? (
              <button
                onClick={() => onApply?.(event)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#681B97] hover:bg-[#501476] text-white text-xs font-bold transition shadow-md shadow-purple-900/20 text-center"
              >
                Apply Now (CampusConnect)
              </button>
            ) : (
              <a
                href={event.registrationUrl || event.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-md flex items-center justify-center gap-1.5 text-center"
              >
                Apply on Official Website <FiExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EventDetailModal;
