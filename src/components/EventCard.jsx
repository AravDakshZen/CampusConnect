import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiMapPin, FiUsers, FiBookmark, FiZap, FiExternalLink, FiClock } from 'react-icons/fi';
import { getEventStatus, CATEGORY_STYLES, calculateEventMatch } from '../services/eventService';
import { useAuth } from '../context/AuthContext';

const EventCard = ({ event, onBookmark, bookmarked = false, onSelect, onApply }) => {
  const { userProfile } = useAuth();
  const [statusInfo, setStatusInfo] = useState(() => getEventStatus(event));

  useEffect(() => {
    const update = () => setStatusInfo(getEventStatus(event));
    update();
    const timer = setInterval(update, 60000);
    return () => clearInterval(timer);
  }, [event]);

  const catStyle = CATEGORY_STYLES[event.category] || {
    badge: 'bg-purple-100 text-[#681B97] border-purple-200',
    icon: '🎓'
  };

  const matchPercent = calculateEventMatch(userProfile, event);

  // Determine top 1-2 badges (Requirement #13)
  const badges = [];
  if (statusInfo.isHappeningNow) {
    badges.push({ text: '🔴 LIVE', color: 'bg-red-600 text-white' });
  } else if (statusInfo.isToday) {
    badges.push({ text: 'TODAY', color: 'bg-emerald-600 text-white' });
  } else if (statusInfo.isClosingSoon) {
    badges.push({ text: `CLOSING SOON (${statusInfo.deadlineDays}d)`, color: 'bg-amber-500 text-white' });
  } else if (event.featured) {
    badges.push({ text: 'FEATURED', color: 'bg-[#681B97] text-white' });
  } else if (matchPercent >= 90) {
    badges.push({ text: 'RECOMMENDED', color: 'bg-purple-700 text-white' });
  }

  // Format team size
  const teamText = typeof event.teamSize === 'object'
    ? (event.teamSize.min === event.teamSize.max ? (event.teamSize.min === 1 ? 'Individual' : `Team: ${event.teamSize.min}`) : `Team: ${event.teamSize.min}–${event.teamSize.max}`)
    : (event.teamSize || 'Team: 2–4');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-purple-300 transition-all flex flex-col justify-between overflow-hidden"
    >
      <div>
        {/* Poster Image Area */}
        <div className="relative h-44 w-full bg-slate-100 overflow-hidden cursor-pointer" onClick={() => onSelect?.(event)}>
          {event.poster || event.posterURL ? (
            <img
              src={event.poster || event.posterURL}
              alt={event.title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#4A126D] to-[#681B97] flex items-center justify-center p-4">
              <span className="text-white text-3xl font-black">{catStyle.icon}</span>
            </div>
          )}

          {/* Top Badges (Maximum 1-2 important badges) */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
            {badges.slice(0, 2).map((b, idx) => (
              <span
                key={idx}
                className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm ${b.color}`}
              >
                {b.text}
              </span>
            ))}
          </div>

          {/* Bookmark Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBookmark?.(event.id);
            }}
            title={bookmarked ? "Saved" : "Save Event"}
            className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-white/90 backdrop-blur-sm hover:bg-white text-slate-700 hover:text-[#681B97] shadow-sm transition"
          >
            <FiBookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-[#681B97] text-[#681B97]' : ''}`} />
          </button>

          {/* Bottom Overlay: Category & Match % */}
          <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
            <span className="bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-800 shadow-sm">
              {catStyle.icon} {event.category || 'Event'}
            </span>

            <span className="bg-[#681B97]/95 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-black text-white shadow-sm flex items-center gap-1">
              <FiZap className="w-2.5 h-2.5 text-[#F5C842]" />
              {matchPercent}% Match
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-2">
          {/* College / Organizer */}
          <p className="text-[11px] font-semibold text-purple-700 truncate">
            {event.college || event.organizer || "Rajalakshmi Engineering College"}
          </p>

          {/* Title */}
          <h3
            onClick={() => onSelect?.(event)}
            className="font-bold text-sm text-slate-900 leading-snug hover:text-[#681B97] transition-colors cursor-pointer line-clamp-2"
          >
            {event.title}
          </h3>

          {/* Metadata Row */}
          <div className="pt-1 space-y-1 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <FiCalendar className="w-3.5 h-3.5 text-[#681B97] flex-shrink-0" />
              <span className="font-medium">{event.startDate || event.date}</span>
              {event.startTime && <span className="text-slate-400">• {event.startTime}</span>}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-1 truncate max-w-[65%]">
                <FiMapPin className="w-3 h-3 text-rose-500 flex-shrink-0" />
                <span className="truncate">{event.location || event.venue || "REC Campus"}</span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0 font-medium text-slate-600">
                <FiUsers className="w-3 h-3 text-blue-500" />
                <span>{teamText}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="p-4 pt-0 flex items-center gap-2">
        <button
          onClick={() => onSelect?.(event)}
          className="flex-1 py-2 px-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 text-slate-800 text-xs font-bold transition text-center"
        >
          View Event
        </button>

        {event.isInternalRegistration ? (
          <button
            onClick={() => onApply ? onApply(event) : onSelect?.(event)}
            className="flex-1 py-2 px-3 rounded-xl bg-[#681B97] hover:bg-[#501476] text-white text-xs font-bold transition shadow-sm text-center"
          >
            Apply Now
          </button>
        ) : (
          <a
            href={event.registrationUrl || event.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-1 text-center"
          >
            Apply External <FiExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </motion.div>
  );
};

export default EventCard;
