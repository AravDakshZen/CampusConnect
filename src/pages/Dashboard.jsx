import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FiBook,
    FiCalendar,
    FiSearch,
    FiMessageSquare,
    FiTrendingUp,
    FiUsers,
    FiZap,
    FiClock,
    FiMapPin,
    FiCheckCircle,
    FiArrowRight,
    FiAlertCircle,
    FiLayers,
    FiBell,
    FiAward
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import useFirestore from '../hooks/useFirestore';
import { MOCK_REC_STUDENTS } from '../services/mockStudents';
import { INITIAL_REC_PROJECTS } from '../services/projectService';
import { calculateStudentCompatibility } from '../services/teamMatchAI';
import { getEventStatus, getInitialRECSeedEvents, CATEGORY_STYLES } from '../services/eventService';
import AttendanceCard from '../components/AttendanceCard';
import NoteCard from '../components/NoteCard';
import SkeletonLoader from '../components/SkeletonLoader';

const Dashboard = () => {
    const { userProfile, currentUser } = useAuth();
    const navigate = useNavigate();

    const { docs: firestoreEvents, loading: eventsLoading } = useFirestore('events', [], { field: 'date', direction: 'asc' });
    const { docs: announcements } = useFirestore('announcements');
    const { docs: notes, loading: notesLoading } = useFirestore('notes', [], { field: 'createdAt', direction: 'desc' });

    const displayName = userProfile?.name || currentUser?.displayName || 'Student';
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    // Combine firestore events or fallback to seed events
    const allEvents = firestoreEvents.length > 0 ? firestoreEvents : getInitialRECSeedEvents();

    // Partition events into Happening Now, Today's Events, and Upcoming
    const { happeningNow, todayEvents } = useMemo(() => {
        const live = [];
        const today = [];

        allEvents.forEach(ev => {
            const st = getEventStatus(ev);
            if (st.isHappeningNow) {
                live.push({ ...ev, statusInfo: st });
            } else if (st.isToday) {
                today.push({ ...ev, statusInfo: st });
            }
        });

        return { happeningNow: live, todayEvents: today };
    }, [allEvents]);

    // Student profile representation for matching
    const currentStudentObj = userProfile || {
        name: displayName,
        department: userProfile?.department || 'CSE',
        technicalSkills: [
            { name: 'Python', level: 'Advanced' },
            { name: 'Machine Learning', level: 'Intermediate' },
            { name: 'React', level: 'Intermediate' }
        ],
        projectsCompleted: [],
        availability: 'Available for Projects'
    };

    // Recommended Projects matching student's skills
    const recommendedProjects = useMemo(() => {
        return INITIAL_REC_PROJECTS.map(p => ({
            ...p,
            match: calculateStudentCompatibility(currentStudentObj, p)
        })).sort((a, b) => b.match.compatibilityScore - a.match.compatibilityScore).slice(0, 2);
    }, [currentStudentObj]);

    // Recommended Teammates
    const recommendedTeammates = useMemo(() => {
        const sampleProj = INITIAL_REC_PROJECTS[0];
        return MOCK_REC_STUDENTS
            .map(s => calculateStudentCompatibility(s, sampleProj))
            .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
            .slice(0, 3);
    }, []);

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">

            {/* Top Welcome Banner */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="gradient-brand rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl"
            >
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-xl" />
                <div className="absolute bottom-0 left-0 w-60 h-60 bg-purple-950/40 rounded-full translate-y-1/3 -translate-x-1/4 blur-xl" />

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider text-purple-200">
                            Rajalakshmi Engineering College (REC)
                        </span>
                    </div>

                    <p className="text-purple-200 text-xs sm:text-sm font-semibold">{greeting},</p>
                    <h1 className="text-2xl sm:text-3xl font-black text-white mt-0.5">
                        {displayName} 👋
                    </h1>

                    <p className="text-purple-200/90 text-xs sm:text-sm mt-1">
                        {userProfile?.department ? `${userProfile.department} • ` : 'Computer Science • '}
                        {userProfile?.year ? `${userProfile.year} • ` : '3rd Year • '}
                        {userProfile?.registerNumber ? `Reg: ${userProfile.registerNumber} • ` : ''}
                        Thandalam, Chennai
                    </p>

                    <div className="flex flex-wrap gap-2.5 mt-5">
                        <Link
                            to="/projects"
                            className="px-4 py-2 bg-white text-[#681B97] hover:bg-purple-50 rounded-xl text-xs font-black transition-all shadow-md shadow-purple-950/20 flex items-center gap-1.5"
                        >
                            <FiZap className="w-3.5 h-3.5" /> Launch TeamMatch AI
                        </Link>
                        <Link
                            to="/teammates"
                            className="px-4 py-2 bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl text-white text-xs font-bold transition-all backdrop-blur-md flex items-center gap-1.5"
                        >
                            <FiUsers className="w-3.5 h-3.5" /> Find Teammates
                        </Link>
                        <Link
                            to="/events"
                            className="px-4 py-2 bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl text-white text-xs font-bold transition-all backdrop-blur-md flex items-center gap-1.5"
                        >
                            <FiCalendar className="w-3.5 h-3.5" /> Campus Events
                        </Link>
                    </div>
                </div>
            </motion.div>

            {/* Top Split Section: 🔴 HAPPENING NOW + 📅 TODAY'S EVENTS */}
            <div className="grid lg:grid-cols-2 gap-6">

                {/* Left: Happening Now Card */}
                <div className="bg-white dark:bg-[#18121F] rounded-3xl border border-slate-200 dark:border-[#2D2239] p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                                </span>
                                <h2 className="text-sm font-black text-slate-900 dark:text-[#F3EEF8] uppercase tracking-wider">
                                    🔴 Happening Now
                                </h2>
                            </div>
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300">
                                Live Session
                            </span>
                        </div>

                        {happeningNow.length > 0 ? (
                            <div className="p-4 rounded-2xl bg-red-50/40 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 space-y-2">
                                <span className="text-[10px] font-black uppercase text-red-600 dark:text-red-400">
                                    {happeningNow[0].statusInfo.remainingText}
                                </span>
                                <h3 className="font-black text-base text-slate-900 dark:text-[#F3EEF8]">
                                    {happeningNow[0].title}
                                </h3>
                                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                                    {happeningNow[0].description}
                                </p>
                                <div className="flex items-center gap-3 pt-1 text-xs text-slate-500 dark:text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <FiMapPin className="w-3.5 h-3.5 text-red-500" /> {happeningNow[0].venue}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <FiClock className="w-3.5 h-3.5 text-purple-500" /> {happeningNow[0].startTime} – {happeningNow[0].endTime}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 text-center rounded-2xl bg-[#F7F5FA] dark:bg-[#21182A] text-slate-500 text-xs">
                                <p className="font-bold text-slate-700 dark:text-slate-300">No active sessions at this exact moment.</p>
                                <p className="text-[11px] mt-1 text-slate-400">Check today's scheduled workshops on the right!</p>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-[#2D2239] flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium">Automatic real-time campus clock</span>
                        <Link to="/events" className="font-bold text-[#681B97] dark:text-purple-400 hover:underline flex items-center gap-1">
                            Full Calendar &rarr;
                        </Link>
                    </div>
                </div>

                {/* Right: Today's Events Feed */}
                <div className="bg-white dark:bg-[#18121F] rounded-3xl border border-slate-200 dark:border-[#2D2239] p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <FiCalendar className="w-4 h-4 text-[#681B97]" />
                                <h2 className="text-sm font-black text-slate-900 dark:text-[#F3EEF8] uppercase tracking-wider">
                                    📅 Today's Events ({todayEvents.length})
                                </h2>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400">
                                {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                        </div>

                        {todayEvents.length > 0 ? (
                            <div className="space-y-3">
                                {todayEvents.slice(0, 2).map((ev) => (
                                    <div
                                        key={ev.id}
                                        className="p-3.5 rounded-2xl bg-[#F7F5FA] dark:bg-[#21182A] border border-slate-200/70 dark:border-[#2D2239] flex items-center justify-between gap-3"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-purple-100 text-[#681B97] dark:bg-[#681B97]/30 dark:text-purple-300">
                                                    {ev.startTime}
                                                </span>
                                                <span className="text-[10px] font-semibold text-slate-400 truncate">
                                                    {ev.category}
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-xs text-slate-900 dark:text-[#F3EEF8] truncate">
                                                {ev.title}
                                            </h4>
                                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                                📍 {ev.venue}
                                            </p>
                                        </div>

                                        <Link
                                            to="/events"
                                            className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#18121F] border border-slate-200 dark:border-[#2D2239] text-[11px] font-bold text-[#681B97] dark:text-purple-300 hover:bg-purple-50 flex-shrink-0"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-6 text-center rounded-2xl bg-[#F7F5FA] dark:bg-[#21182A] text-slate-500 text-xs">
                                No events scheduled for today. Check upcoming symposiums!
                            </div>
                        )}
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-[#2D2239] flex items-center justify-between text-xs">
                        <span className="text-slate-400">Synced with REC event registry</span>
                        <Link to="/events" className="font-bold text-[#681B97] dark:text-purple-400 hover:underline flex items-center gap-1">
                            Browse All Events &rarr;
                        </Link>
                    </div>
                </div>

            </div>

            {/* 🎯 RECOMMENDED PROJECTS (Matching Student Skills) */}
            <div className="bg-white dark:bg-[#18121F] rounded-3xl border border-slate-200 dark:border-[#2D2239] p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <FiZap className="w-4 h-4 text-[#681B97]" />
                            <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-[#F3EEF8] uppercase tracking-wider">
                                🎯 Recommended Projects for You
                            </h2>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Curated by REC TeamMatch AI based on your profile & verified resume skills.
                        </p>
                    </div>

                    <Link to="/projects" className="text-xs font-bold text-[#681B97] dark:text-purple-400 hover:underline flex items-center gap-1">
                        View All Projects <FiArrowRight className="w-3 h-3" />
                    </Link>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    {recommendedProjects.map((p) => (
                        <div
                            key={p.id}
                            className="p-5 rounded-2xl bg-[#F7F5FA] dark:bg-[#21182A] border border-slate-200/80 dark:border-[#2D2239] flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center justify-between gap-2 mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-100 text-[#681B97] dark:bg-[#681B97]/20 dark:text-purple-300">
                                        {p.domain}
                                    </span>
                                    <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full">
                                        {p.match.compatibilityScore}% Match
                                    </span>
                                </div>

                                <h3 className="font-bold text-sm text-slate-900 dark:text-[#F3EEF8] mb-1">
                                    {p.title}
                                </h3>
                                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
                                    {p.description}
                                </p>

                                <div className="p-3 rounded-xl bg-white dark:bg-[#18121F] text-[11px] text-slate-600 dark:text-slate-400 leading-snug mb-3">
                                    <strong className="text-[#681B97] dark:text-purple-300 block mb-0.5">
                                        Role Match: {p.match.recommendedRole}
                                    </strong>
                                    {p.match.reason}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <span className="text-[11px] text-slate-400">
                                    Skills: {(p.requiredSkills || []).slice(0, 3).join(", ")}
                                </span>
                                <Link
                                    to="/projects"
                                    className="px-4 py-1.5 rounded-xl bg-[#681B97] text-white text-xs font-bold hover:bg-[#8A2BB8] transition"
                                >
                                    Join Team
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 🤝 RECOMMENDED TEAMMATES */}
            <div className="bg-white dark:bg-[#18121F] rounded-3xl border border-slate-200 dark:border-[#2D2239] p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <FiUsers className="w-4 h-4 text-[#681B97]" />
                            <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-[#F3EEF8] uppercase tracking-wider">
                                🤝 Recommended Teammates
                            </h2>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            High-compatibility REC students ready for cross-functional project collaboration.
                        </p>
                    </div>

                    <Link to="/teammates" className="text-xs font-bold text-[#681B97] dark:text-purple-400 hover:underline flex items-center gap-1">
                        Find More Teammates <FiArrowRight className="w-3 h-3" />
                    </Link>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                    {recommendedTeammates.map((rec, idx) => (
                        <div
                            key={idx}
                            className="p-4 rounded-2xl bg-[#F7F5FA] dark:bg-[#21182A] border border-slate-200/80 dark:border-[#2D2239] flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center gap-3 mb-2.5">
                                    <div className="w-10 h-10 rounded-xl overflow-hidden gradient-brand flex items-center justify-center text-white font-black text-xs">
                                        {rec.student.name?.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold text-xs text-slate-900 dark:text-[#F3EEF8] truncate">{rec.student.name}</p>
                                        <p className="text-[11px] text-[#681B97] dark:text-purple-300 font-semibold">{rec.student.department} • {rec.student.year}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-[11px] mb-2">
                                    <span className="font-bold text-slate-700 dark:text-slate-300">{rec.recommendedRole}</span>
                                    <span className="font-black text-emerald-600 dark:text-emerald-400">{rec.compatibilityScore}%</span>
                                </div>

                                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-3">
                                    {rec.reason}
                                </p>
                            </div>

                            <Link
                                to="/teammates"
                                className="w-full py-1.5 rounded-xl border border-[#681B97] text-[#681B97] dark:text-purple-300 text-center text-xs font-bold hover:bg-[#681B97] hover:text-white transition block"
                            >
                                Connect & Invite
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Grid: Skill Insights & Attendance & Announcements */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* 💡 Skill Insights */}
                <div className="bg-white dark:bg-[#18121F] rounded-3xl border border-slate-200 dark:border-[#2D2239] p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2">
                        <FiAward className="w-4 h-4 text-[#681B97]" />
                        <h3 className="font-black text-sm uppercase tracking-wider text-slate-900 dark:text-slate-100">
                            💡 REC Skill Insights
                        </h3>
                    </div>

                    <div className="space-y-3">
                        <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30">
                            <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-300">Strong Verified Skills</span>
                            <p className="font-bold text-xs text-slate-800 dark:text-slate-200 mt-0.5">Python, TensorFlow, React</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">Ranked in top 10% of REC 3rd year students.</p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-[#681B97]/15 border border-purple-200 dark:border-purple-900/30">
                            <span className="text-[10px] font-black uppercase text-[#681B97] dark:text-purple-300">High Campus Demand</span>
                            <p className="font-bold text-xs text-slate-800 dark:text-slate-200 mt-0.5">FastAPI, Docker, Microservices</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">Wanted in 8+ ongoing capstone projects.</p>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30">
                            <span className="text-[10px] font-black uppercase text-amber-800 dark:text-amber-300">Recommended Next Step</span>
                            <p className="font-bold text-xs text-slate-800 dark:text-slate-200 mt-0.5">Cloud Deployment (AWS/GCP)</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">Boosts team compatibility by +14%.</p>
                        </div>
                    </div>
                </div>

                {/* 📊 Attendance */}
                <div className="bg-white dark:bg-[#18121F] rounded-3xl border border-slate-200 dark:border-[#2D2239] shadow-sm overflow-hidden">
                    <AttendanceCard />
                </div>

                {/* 📢 Campus Announcements */}
                <div className="bg-white dark:bg-[#18121F] rounded-3xl border border-slate-200 dark:border-[#2D2239] p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <FiBell className="w-4 h-4 text-[#681B97]" />
                                <h3 className="font-black text-sm uppercase tracking-wider text-slate-900 dark:text-slate-100">
                                    📢 Announcements
                                </h3>
                            </div>
                            <Link to="/announcements" className="text-xs font-bold text-[#681B97] dark:text-purple-400 hover:underline">
                                View All
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {(announcements || []).slice(0, 3).map((a, i) => (
                                <div key={i} className="p-3 rounded-2xl bg-[#F7F5FA] dark:bg-[#21182A] border border-slate-200/70 dark:border-[#2D2239]">
                                    <h4 className="font-bold text-xs text-slate-900 dark:text-[#F3EEF8] truncate">{a.title}</h4>
                                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{a.message}</p>
                                </div>
                            ))}
                            {(announcements || []).length === 0 && (
                                <p className="text-xs text-slate-400 text-center py-6">No announcements published yet.</p>
                            )}
                        </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-[#2D2239] text-center">
                        <Link to="/announcements" className="text-xs font-bold text-[#681B97] dark:text-purple-400 hover:underline">
                            Open Official REC Notice Board &rarr;
                        </Link>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
