import { useEffect, useMemo, useState } from "react";
import { collection, addDoc, deleteDoc, doc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

// Month names for display and index mapping
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Safely parse createdAt — handles both Firestore Timestamps and legacy date strings
const parseDate = (createdAt) => {
  if (!createdAt) return null;
  // Firestore Timestamp object
  if (createdAt?.toDate) return createdAt.toDate();
  // Legacy string format (e.g. "June 27, 2026")
  const parsed = new Date(createdAt);
  return isNaN(parsed.getTime()) ? null : parsed;
};

// Format a date for display
const formatDate = (createdAt) => {
  const date = parseDate(createdAt);
  if (!date) return "";
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
};

const Announcements = () => {
  const { userProfile, currentUser } = useAuth();

  const [announcements, setAnnouncements] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All");

  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    title: "",
    message: "",
    priority: "High",
  });

  const isAdmin = userProfile?.role === "admin";

  // ─── FETCH ANNOUNCEMENTS ──────────────────────────────────────────────────
  useEffect(() => {
    const q = collection(db, "announcements");
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Sort newest first — works for both Timestamps and legacy strings
      data.sort((a, b) => {
        const da = parseDate(a.createdAt);
        const db_ = parseDate(b.createdAt);
        if (!da && !db_) return 0;
        if (!da) return 1;
        if (!db_) return -1;
        return db_ - da;
      });
      setAnnouncements(data);
    });
    return () => unsub();
  }, []);

  // ─── DERIVE AVAILABLE YEARS ───────────────────────────────────────────────
  // Build a sorted list of unique years present in the fetched announcements
  const availableYears = useMemo(() => {
    const years = new Set();
    announcements.forEach((a) => {
      const date = parseDate(a.createdAt);
      if (date) years.add(date.getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a); // newest first
  }, [announcements]);

  // ─── ADD ANNOUNCEMENT ─────────────────────────────────────────────────────
  const handleAddAnnouncement = async () => {
    if (!form.title || !form.message) {
      toast.error("Fill all fields");
      return;
    }
    try {
      await addDoc(collection(db, "announcements"), {
        ...form,
        createdAt: serverTimestamp(), // ✅ Proper Firestore timestamp going forward
        createdBy: currentUser.email,
      });
      toast.success("Announcement added");
      setForm({ title: "", message: "", priority: "High" });
      setShowModal(false);
    } catch (error) {
      toast.error("Failed to add announcement");
    }
  };

  // ─── DELETE ANNOUNCEMENT ──────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "announcements", id));
      toast.success("Announcement deleted");
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  // ─── FILTER ANNOUNCEMENTS ─────────────────────────────────────────────────
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((a) => {
      // Search filter
      const matchesSearch =
        a.title?.toLowerCase().includes(search.toLowerCase()) ||
        a.message?.toLowerCase().includes(search.toLowerCase());

      // Priority filter
      const matchesPriority =
        selectedPriority === "All" || a.priority === selectedPriority;

      // Date filters
      const date = parseDate(a.createdAt);
      const matchesYear =
        selectedYear === "All" ||
        (date && date.getFullYear() === Number(selectedYear));
      const matchesMonth =
        selectedMonth === "All" ||
        (date && date.getMonth() === Number(selectedMonth));

      return matchesSearch && matchesPriority && matchesYear && matchesMonth;
    });
  }, [announcements, search, selectedPriority, selectedYear, selectedMonth]);

  // ─── HELPERS ──────────────────────────────────────────────────────────────
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":   return "bg-red-500/20 text-red-400 border border-red-500/50";
      case "Medium": return "bg-amber-500/20 text-amber-400 border border-amber-500/50";
      case "Low":    return "bg-green-500/20 text-green-400 border border-green-500/50";
      default:       return "bg-blue-500/20 text-blue-400 border border-blue-500/50";
    }
  };

  // Shared select styling
  const selectCls =
    "px-4 py-3 rounded-2xl bg-[#0f172a] border border-slate-700 text-gray-300 " +
    "focus:border-blue-500 focus:outline-none transition appearance-none cursor-pointer " +
    "hover:border-slate-500";

  return (
    <div className="p-6 text-white min-h-screen bg-[#020817]">

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 mb-2">
            Announcements
          </h1>
          <p className="text-gray-400 text-lg">
            Stay updated with the latest notices &amp; circulars
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-500 font-bold text-lg hover:scale-105 transition shadow-lg shadow-blue-500/30"
          >
            + Post Announcement
          </button>
        )}
      </div>

      {/* ── FILTERS ROW ────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 mb-8">

        {/* Row 1: Search + Year + Month */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <input
            type="text"
            placeholder="Search announcements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 p-4 rounded-2xl bg-[#0f172a] border border-slate-700 outline-none focus:border-blue-500 transition placeholder-gray-600"
          />

          {/* Year dropdown */}
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setSelectedMonth("All"); // reset month when year changes
              }}
              className={selectCls + " pr-10 min-w-[130px]"}
            >
              <option value="All">All Years</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">▼</span>
          </div>

          {/* Month dropdown */}
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className={selectCls + " pr-10 min-w-[150px]"}
              disabled={selectedYear === "All"}
              title={selectedYear === "All" ? "Select a year first" : ""}
            >
              <option value="All">All Months</option>
              {MONTH_NAMES.map((name, idx) => (
                <option key={idx} value={idx}>{name}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">▼</span>
          </div>
        </div>

        {/* Row 2: Priority pills */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-gray-500 text-sm font-semibold mr-1">Priority:</span>
          <div className="flex gap-2 items-center bg-[#0f172a] p-2 rounded-2xl border border-slate-700">
            {["All", "High", "Medium", "Low"].map((prio) => (
              <button
                key={prio}
                onClick={() => setSelectedPriority(prio)}
                className={`px-4 py-2 rounded-xl font-semibold transition ${
                  selectedPriority === prio
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-400 hover:bg-slate-800"
                }`}
              >
                {prio}
              </button>
            ))}
          </div>

          {/* Active filter summary chips */}
          {(selectedYear !== "All" || selectedMonth !== "All") && (
            <div className="flex gap-2 ml-2">
              {selectedYear !== "All" && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-semibold">
                  📅 {selectedYear}
                  <button
                    onClick={() => { setSelectedYear("All"); setSelectedMonth("All"); }}
                    className="ml-1 hover:text-white transition"
                  >✕</button>
                </span>
              )}
              {selectedMonth !== "All" && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
                  🗓 {MONTH_NAMES[Number(selectedMonth)]}
                  <button
                    onClick={() => setSelectedMonth("All")}
                    className="ml-1 hover:text-white transition"
                  >✕</button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── RESULTS COUNT ──────────────────────────────────────────────────── */}
      {filteredAnnouncements.length > 0 && (
        <p className="text-gray-600 text-sm mb-5">
          Showing <span className="text-gray-400 font-semibold">{filteredAnnouncements.length}</span> announcement{filteredAnnouncements.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* ── ANNOUNCEMENTS GRID ─────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {filteredAnnouncements.map((announcement) => (
          <div
            key={announcement.id}
            className="bg-[#0f172a] border border-slate-700 rounded-3xl p-6 relative shadow-xl hover:shadow-2xl hover:border-slate-600 transition group flex flex-col"
          >
            {/* DELETE BUTTON */}
            {isAdmin && (
              <button
                onClick={() => handleDelete(announcement.id)}
                className="absolute top-4 right-4 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-xl text-sm font-bold transition opacity-0 group-hover:opacity-100"
              >
                Delete
              </button>
            )}

            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(announcement.priority)}`}>
                {announcement.priority} Priority
              </span>
              <span className="text-gray-500 text-sm">{formatDate(announcement.createdAt)}</span>
            </div>

            <h2 className="text-3xl font-black mb-4 text-white leading-tight">
              {announcement.title}
            </h2>

            <p className="text-gray-300 text-lg mb-6 leading-relaxed whitespace-pre-wrap flex-1">
              {announcement.message}
            </p>

            <div className="mt-auto pt-4 border-t border-slate-800/50 flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-blue-400 border border-slate-700">
                  {announcement.createdBy?.[0]?.toUpperCase() || "A"}
                </div>
                <span>{announcement.createdBy}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── EMPTY STATE ────────────────────────────────────────────────────── */}
      {filteredAnnouncements.length === 0 && (
        <div className="text-center text-gray-500 mt-20 p-10 bg-[#0f172a]/50 rounded-3xl border border-slate-800 border-dashed">
          <p className="text-6xl mb-4">📭</p>
          <p className="text-2xl font-bold mb-2 text-gray-400">No announcements found</p>
          <p className="text-gray-600">
            {selectedYear !== "All" || selectedMonth !== "All"
              ? "Try changing the year or month filter."
              : "Check back later for updates."}
          </p>
          {(selectedYear !== "All" || selectedMonth !== "All") && (
            <button
              onClick={() => { setSelectedYear("All"); setSelectedMonth("All"); }}
              className="mt-5 px-5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-gray-400 hover:text-white hover:bg-slate-700 transition text-sm font-semibold"
            >
              Clear Date Filters
            </button>
          )}
        </div>
      )}

      {/* ── ADD ANNOUNCEMENT MODAL ─────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f172a] p-8 rounded-3xl w-full max-w-lg border border-slate-700 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 text-gray-500 hover:text-white transition text-lg"
            >
              ✕
            </button>

            <h2 className="text-3xl font-black mb-6 text-white">
              Post Announcement
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Mid Exams Schedule"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full p-4 rounded-xl bg-[#020817] border border-slate-700 focus:border-blue-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Message</label>
                <textarea
                  placeholder="Details about the announcement..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full p-4 rounded-xl bg-[#020817] border border-slate-700 focus:border-blue-500 outline-none transition min-h-[120px]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="w-full p-4 rounded-xl bg-[#020817] border border-slate-700 focus:border-blue-500 outline-none transition appearance-none"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={handleAddAnnouncement}
                className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-500 font-bold text-white hover:scale-[1.02] transition"
              >
                Post Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;
