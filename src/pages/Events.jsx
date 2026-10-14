import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiPlus,
  FiSearch,
  FiFilter,
  FiExternalLink,
  FiX,
  FiBookmark,
  FiUsers,
  FiZap,
  FiRefreshCw,
  FiGrid,
  FiSliders,
  FiAward,
  FiCheckCircle
} from "react-icons/fi";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import EventCard from "../components/EventCard";
import EventDetailModal from "../components/EventDetailModal";
import EventApplicationModal from "../components/EventApplicationModal";
import {
  EVENT_CATEGORIES,
  CATEGORY_STYLES,
  EVENT_SOURCES,
  MASTER_REC_EVENTS,
  getEventStatus,
  calculateEventMatch,
  syncEvents
} from "../services/eventService";
import toast from "react-hot-toast";

const MODES = ["All", "In-Person", "Online", "Hybrid"];
const TEAM_SIZES = ["All", "Individual", "Team: 2–4", "Team: 4+"];
const SORT_OPTIONS = [
  { label: "Recommended", value: "recommended" },
  { label: "Registration closing soon", value: "closing_soon" },
  { label: "Upcoming date", value: "upcoming" },
  { label: "Newest added", value: "newest" },
  { label: "A–Z", value: "alphabetical" }
];

const ITEMS_PER_PAGE = 9;

const Events = () => {
  const { currentUser, userProfile } = useAuth();

  const [events, setEvents] = useState(MASTER_REC_EVENTS);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedMode, setSelectedMode] = useState("All");
  const [selectedTeamSize, setSelectedTeamSize] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [sortBy, setSortBy] = useState("recommended");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Pagination state
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // Modals state
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [applyingEvent, setApplyingEvent] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Saved events bookmarks
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    try {
      const saved = localStorage.getItem("rec_saved_events");
      return saved ? JSON.parse(saved) : ["rec_event_hacknova"];
    } catch {
      return ["rec_event_hacknova"];
    }
  });

  // Admin form
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Hackathons",
    organizer: "REC Student Council",
    college: "Rajalakshmi Engineering College",
    location: "Chennai, Tamil Nadu",
    venue: "REC Tech Innovation Center, Thandalam",
    mode: "In-Person",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    startTime: "10:00 AM",
    endTime: "05:00 PM",
    registrationDeadline: new Date().toISOString().split("T")[0],
    teamSize: "Team: 2–4",
    skills: "Python, React, Machine Learning",
    eligibility: "Open to all engineering students",
    registrationUrl: "",
    sourceName: "REC Official Portal",
    sourceUrl: "",
    poster: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80",
    prize: "₹50,000 Cash Pool",
    certificate: true,
    rules: "Original work. Standard code of conduct applies.",
    isInternalRegistration: true
  });

  const isAdminOrFaculty =
    userProfile?.role === "admin" ||
    userProfile?.role === "faculty" ||
    userProfile?.role === "club_coordinator";

  // Firestore sync listener
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "events"), (snapshot) => {
      if (!snapshot.empty) {
        const firestoreList = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Merge with master dataset avoiding duplicates
        const existingIds = new Set(firestoreList.map(e => e.id));
        const combined = [...firestoreList, ...MASTER_REC_EVENTS.filter(m => !existingIds.has(m.id))];
        setEvents(combined);
      }
    });

    return () => unsub();
  }, []);

  // Bookmark toggle
  const handleToggleBookmark = (id) => {
    setBookmarkedIds((prev) => {
      const updated = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      try {
        localStorage.setItem("rec_saved_events", JSON.stringify(updated));
      } catch {
        // quota ignore
      }
      toast.success(prev.includes(id) ? "Event removed from saved list" : "Event saved to bookmarks! 📌");
      return updated;
    });
  };

  // Trigger Sync
  const handleTriggerSync = async () => {
    setSyncing(true);
    const toastId = toast.loading("Checking event sources (KnowAFest, REC Official Portal)...");
    try {
      const result = await syncEvents(events);
      setEvents(result.events);
      toast.success(`Sync completed! ${result.log.added} new, ${result.log.updated} updated.`, { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Sync completed with cached records.", { id: toastId });
    } finally {
      setSyncing(false);
    }
  };

  // Filter and Sort Pipeline (Requirement #5, #29)
  const filteredAndSortedEvents = useMemo(() => {
    const queryStr = search.toLowerCase().trim();

    const filtered = events.filter((e) => {
      // 1. Search Query
      if (queryStr) {
        const titleMatch = (e.title || "").toLowerCase().includes(queryStr);
        const orgMatch = (e.organizer || "").toLowerCase().includes(queryStr);
        const collegeMatch = (e.college || "").toLowerCase().includes(queryStr);
        const catMatch = (e.category || "").toLowerCase().includes(queryStr);
        const descMatch = (e.description || "").toLowerCase().includes(queryStr);
        const skillMatch = (e.skills || []).some((s) => s.toLowerCase().includes(queryStr));
        if (!titleMatch && !orgMatch && !collegeMatch && !catMatch && !descMatch && !skillMatch) {
          return false;
        }
      }

      // 2. Category Filter
      if (selectedCategory !== "All") {
        if ((e.category || "").toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }

      // 3. Mode Filter
      if (selectedMode !== "All") {
        if ((e.mode || "").toLowerCase() !== selectedMode.toLowerCase()) {
          return false;
        }
      }

      // 4. Team Size Filter
      if (selectedTeamSize !== "All") {
        const teamStr = typeof e.teamSize === "object" ? `${e.teamSize.min}–${e.teamSize.max}` : (e.teamSize || "");
        if (selectedTeamSize === "Individual" && !teamStr.includes("1")) return false;
        if (selectedTeamSize === "Team: 2–4" && !teamStr.includes("2") && !teamStr.includes("3") && !teamStr.includes("4")) return false;
        if (selectedTeamSize === "Team: 4+" && !teamStr.includes("4") && !teamStr.includes("5") && !teamStr.includes("12")) return false;
      }

      return true;
    });

    // Sorting
    return filtered.sort((a, b) => {
      if (sortBy === "recommended") {
        const scoreA = calculateEventMatch(userProfile, a);
        const scoreB = calculateEventMatch(userProfile, b);
        return scoreB - scoreA;
      }
      if (sortBy === "closing_soon") {
        const dA = a.registrationDeadline || "9999-99-99";
        const dB = b.registrationDeadline || "9999-99-99";
        return dA > dB ? 1 : -1;
      }
      if (sortBy === "upcoming") {
        const dateA = a.startDate || a.date || "9999-99-99";
        const dateB = b.startDate || b.date || "9999-99-99";
        return dateA > dateB ? 1 : -1;
      }
      if (sortBy === "newest") {
        const cA = a.createdAt || "";
        const cB = b.createdAt || "";
        return cA < cB ? 1 : -1;
      }
      if (sortBy === "alphabetical") {
        return (a.title || "").localeCompare(b.title || "");
      }
      return 0;
    });
  }, [events, search, selectedCategory, selectedMode, selectedTeamSize, sortBy, userProfile]);

  // Paginated subset (Requirement #7, #37)
  const paginatedEvents = useMemo(() => {
    return filteredAndSortedEvents.slice(0, visibleCount);
  }, [filteredAndSortedEvents, visibleCount]);

  // Featured and Live subsets
  const featuredEvents = useMemo(() => {
    return events.filter((e) => e.featured).slice(0, 3);
  }, [events]);

  const handleCreateEventSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.startDate || !form.venue) {
      return toast.error("Please fill title, start date, and venue");
    }

    try {
      const skillsArr = form.skills.split(",").map((s) => s.trim()).filter(Boolean);
      const newEv = {
        ...form,
        skills: skillsArr,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastSyncedAt: serverTimestamp()
      };

      await addDoc(collection(db, "events"), newEv);
      toast.success("Event successfully published to CampusConnect!");
      setShowCreateModal(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to publish event");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header (Requirement #5) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#681B97] block mb-1">
            Rajalakshmi Engineering College • CampusConnect
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Discover Events
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Find competitions, workshops, hackathons and opportunities happening around you.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            onClick={handleTriggerSync}
            disabled={syncing}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 text-slate-700 text-xs font-bold transition shadow-sm disabled:opacity-50"
            title="Synchronize public event feeds from KnowAFest & Official REC Portal"
          >
            <FiRefreshCw className={`w-3.5 h-3.5 text-[#681B97] ${syncing ? "animate-spin" : ""}`} />
            <span>Sync Feeds</span>
          </button>

          {isAdminOrFaculty && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#681B97] hover:bg-[#501476] text-white text-xs font-bold transition shadow-sm"
            >
              <FiPlus className="w-4 h-4" /> Add Event
            </button>
          )}
        </div>
      </div>

      {/* Featured Strip / Carousel (Requirement #6) */}
      {search === "" && selectedCategory === "All" && featuredEvents.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <FiZap className="text-[#681B97]" /> Featured Opportunities
            </span>
            <span className="text-[11px] font-semibold text-slate-500">Curated & Verified</span>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {featuredEvents.map((ev) => (
              <EventCard
                key={ev.id}
                event={ev}
                bookmarked={bookmarkedIds.includes(ev.id)}
                onBookmark={handleToggleBookmark}
                onSelect={setSelectedEvent}
                onApply={(e) => setApplyingEvent(e)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Search, Horizontal Category Pills, and Filters Bar (Requirement #5, #6, #29) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-sm space-y-4">
        {/* Main Search Input */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by event name, skill (Python, React, Figma), organizer, or college..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setVisibleCount(ITEMS_PER_PAGE);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#681B97] focus:bg-white transition"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <FiX className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#681B97]"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  Sort: {opt.label}
                </option>
              ))}
            </select>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowAdvancedFilters((p) => !p)}
              className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
                showAdvancedFilters
                  ? "bg-purple-50 border-[#681B97] text-[#681B97]"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <FiSliders className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Horizontal Category Navigation (Requirement #6: [All] [Hackathons] [Workshops] etc.) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {EVENT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setVisibleCount(ITEMS_PER_PAGE);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex-shrink-0 ${
                selectedCategory === cat
                  ? "bg-[#681B97] text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-purple-50 hover:text-[#681B97]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Collapsible Filter Bar: Mode, Team Size, Source */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Event Mode</label>
              <select
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none"
              >
                {MODES.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Team Size</label>
              <select
                value={selectedTeamSize}
                onChange={(e) => setSelectedTeamSize(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none"
              >
                {TEAM_SIZES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSelectedMode("All");
                  setSelectedTeamSize("All");
                  setSearch("");
                  setSortBy("recommended");
                }}
                className="w-full py-2 rounded-xl text-xs font-bold text-purple-700 hover:bg-purple-50 transition"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
          Showing {Math.min(visibleCount, filteredAndSortedEvents.length)} of {filteredAndSortedEvents.length} Events
          {selectedCategory !== "All" && ` • ${selectedCategory}`}
        </h2>

        {bookmarkedIds.length > 0 && (
          <span className="text-[11px] font-semibold text-purple-700">
            {bookmarkedIds.length} Saved in Bookmarks
          </span>
        )}
      </div>

      {/* Main Events Grid (Requirement #7, #12) */}
      {filteredAndSortedEvents.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <p className="text-sm font-bold text-slate-700">No events found matching your search or filters.</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting keywords or reset category filters to browse all Rajalakshmi Engineering College and partner events.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setSelectedCategory("All");
              setSelectedMode("All");
              setSelectedTeamSize("All");
            }}
            className="px-5 py-2 rounded-xl bg-[#681B97] text-white text-xs font-bold"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedEvents.map((ev) => (
            <EventCard
              key={ev.id}
              event={ev}
              bookmarked={bookmarkedIds.includes(ev.id)}
              onBookmark={handleToggleBookmark}
              onSelect={setSelectedEvent}
              onApply={(e) => setApplyingEvent(e)}
            />
          ))}
        </div>
      )}

      {/* Load More Button for Large Database Pagination (Requirement #7) */}
      {visibleCount < filteredAndSortedEvents.length && (
        <div className="text-center pt-4">
          <button
            onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
            className="px-8 py-3 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50 text-slate-800 text-xs font-bold transition shadow-sm"
          >
            Load More Opportunities ({filteredAndSortedEvents.length - visibleCount} remaining)
          </button>
        </div>
      )}

      {/* Detailed Event Modal (Requirement #14) */}
      <EventDetailModal
        isOpen={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        event={selectedEvent}
        bookmarked={selectedEvent ? bookmarkedIds.includes(selectedEvent.id) : false}
        onBookmark={handleToggleBookmark}
        onApply={(ev) => {
          setSelectedEvent(null);
          setApplyingEvent(ev);
        }}
      />

      {/* Direct Application Modal (Requirement #15) */}
      <EventApplicationModal
        isOpen={Boolean(applyingEvent)}
        onClose={() => setApplyingEvent(null)}
        event={applyingEvent}
        onSuccess={() => {
          setApplyingEvent(null);
        }}
      />

      {/* Admin Add Event Modal (Requirement #30) */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-8"
            >
              <div className="bg-[#681B97] p-6 text-white flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-bold text-purple-200">Admin Event Management</span>
                  <h3 className="text-xl font-black">Publish New Collegiate Event</h3>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateEventSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Event Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. REC AI Summit 2026 / HackNova"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#681B97]"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
                    >
                      {EVENT_CATEGORIES.filter((c) => c !== "All").map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Mode</label>
                    <select
                      value={form.mode}
                      onChange={(e) => setForm({ ...form, mode: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
                    >
                      <option value="In-Person">In-Person</option>
                      <option value="Online">Online</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Start Date *</label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">End Date</label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Deadline *</label>
                    <input
                      type="date"
                      value={form.registrationDeadline}
                      onChange={(e) => setForm({ ...form, registrationDeadline: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Venue *</label>
                    <input
                      type="text"
                      placeholder="e.g. Auditorium / Tech Innovation Center"
                      value={form.venue}
                      onChange={(e) => setForm({ ...form, venue: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Team Size</label>
                    <input
                      type="text"
                      placeholder="e.g. Team: 2–4 or Individual"
                      value={form.teamSize}
                      onChange={(e) => setForm({ ...form, teamSize: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Description *</label>
                  <textarea
                    rows={3}
                    placeholder="Comprehensive description of the competition, tracks, and prerequisites..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Required Skills (comma separated)</label>
                    <input
                      type="text"
                      value={form.skills}
                      onChange={(e) => setForm({ ...form, skills: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Prize Details</label>
                    <input
                      type="text"
                      value={form.prize}
                      onChange={(e) => setForm({ ...form, prize: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Source Name</label>
                    <input
                      type="text"
                      placeholder="e.g. KnowAFest / REC Official Portal"
                      value={form.sourceName}
                      onChange={(e) => setForm({ ...form, sourceName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Source URL</label>
                    <input
                      type="url"
                      placeholder="https://knowafest.com/..."
                      value={form.sourceUrl}
                      onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="internalReg"
                    checked={form.isInternalRegistration}
                    onChange={(e) => setForm({ ...form, isInternalRegistration: e.target.checked })}
                    className="w-4 h-4 rounded text-[#681B97]"
                  />
                  <label htmlFor="internalReg" className="font-semibold text-slate-700">
                    Enable CampusConnect Direct Internal Application ("Apply Now" pre-filled modal)
                  </label>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#681B97] text-white font-bold hover:bg-[#501476] shadow-sm"
                  >
                    Publish Event
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Events;