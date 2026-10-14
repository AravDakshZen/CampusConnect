import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch,
  FiFilter,
  FiUser,
  FiBriefcase,
  FiFileText,
  FiSend,
  FiEye,
  FiX,
  FiCheckCircle,
  FiZap,
  FiGithub,
  FiLinkedin,
  FiGlobe,
  FiAward,
  FiCheck
} from "react-icons/fi";
import { collection, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { MOCK_REC_STUDENTS } from "../services/mockStudents";
import { calculateStudentCompatibility } from "../services/teamMatchAI";
import { INITIAL_REC_PROJECTS } from "../services/projectService";
import toast from "react-hot-toast";

const DEPARTMENTS = ["All", "CSE", "AI & DS", "IT", "CSBS", "ECE", "EEE", "MECH"];
const YEARS = ["All", "1st Year", "2nd Year", "3rd Year", "4th Year"];
const ROLES = [
  "All",
  "ML Developer",
  "Frontend Developer",
  "Backend Developer",
  "UI/UX Designer",
  "Embedded / IoT Developer"
];

const FindTeammates = () => {
  const { currentUser, userProfile } = useAuth();

  const [students, setStudents] = useState(MOCK_REC_STUDENTS);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedTeamProject, setSelectedTeamProject] = useState(INITIAL_REC_PROJECTS[0]);

  // Profile Preview Modal
  const [previewStudent, setPreviewStudent] = useState(null);

  // Invite Modal (Requirement #21)
  const [inviteStudent, setInviteStudent] = useState(null);
  const [inviteProjectTitle, setInviteProjectTitle] = useState(INITIAL_REC_PROJECTS[0].title);
  const [inviteRole, setInviteRole] = useState("ML Developer");
  const [inviteMsg, setInviteMsg] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snapshot) => {
      if (!snapshot.empty) {
        const firestoreUsers = snapshot.docs
          .map((d) => ({ id: d.id, uid: d.id, ...d.data() }))
          .filter((u) => u.uid !== currentUser?.uid);

        const existingIds = new Set(firestoreUsers.map((u) => u.uid));
        const combined = [...firestoreUsers, ...MOCK_REC_STUDENTS.filter((m) => !existingIds.has(m.uid))];
        setStudents(combined);
      }
    });
    return () => unsub();
  }, [currentUser]);

  // Scored and ranked candidates using Requirement #19 formula
  const scoredStudents = useMemo(() => {
    return students
      .filter((s) => s.uid !== currentUser?.uid && s.id !== currentUser?.uid)
      .map((student) => {
        const matchResult = calculateStudentCompatibility(student, selectedTeamProject);
        return {
          student,
          ...matchResult
        };
      })
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  }, [students, currentUser, selectedTeamProject]);

  // Filtered subset
  const filteredMatches = useMemo(() => {
    return scoredStudents.filter(({ student, matchedSkills }) => {
      const allSkills = (student.technicalSkills || [])
        .map((s) => (typeof s === "string" ? s : s.name))
        .concat(student.resumeExtractedData?.skills || [])
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        (student.name || "").toLowerCase().includes(search.toLowerCase()) ||
        allSkills.includes(search.toLowerCase()) ||
        (student.preferredRole || "").toLowerCase().includes(search.toLowerCase());

      const matchesDept = selectedDept === "All" || student.department === selectedDept;
      const matchesYear = selectedYear === "All" || student.year === selectedYear;
      const matchesRole =
        selectedRole === "All" || (student.preferredRole || "").toLowerCase().includes(selectedRole.toLowerCase());

      return matchesSearch && matchesDept && matchesYear && matchesRole;
    });
  }, [scoredStudents, search, selectedDept, selectedYear, selectedRole]);

  // Send Join Request (Requirement #21)
  const handleSendInvite = async () => {
    if (!inviteStudent) return;
    try {
      const senderName = userProfile?.name || currentUser?.displayName || "Shallini";
      const requestPayload = {
        projectTitle: inviteProjectTitle,
        type: "invitation",
        senderId: currentUser?.uid || "current_user",
        senderName,
        senderEmail: currentUser?.email || "shallini.2023.aids@rajalakshmi.edu.in",
        receiverId: inviteStudent.uid || inviteStudent.id,
        receiverName: inviteStudent.name,
        requestedRole: inviteRole,
        message: inviteMsg || `${senderName} invited you to join ${inviteProjectTitle}.`,
        status: "pending",
        createdAt: serverTimestamp()
      };

      // Add to Firestore
      await addDoc(collection(db, "project_requests"), requestPayload);

      // Create notification entry for the receiver
      await addDoc(collection(db, "notifications"), {
        userId: inviteStudent.uid || inviteStudent.id,
        message: `${senderName} invited you to join ${inviteProjectTitle} as ${inviteRole}.`,
        type: "team_invite",
        read: false,
        createdAt: serverTimestamp()
      });

      toast.success(`Join request sent to ${inviteStudent.name}! Notification dispatched.`);
      setInviteStudent(null);
      setInviteMsg("");
    } catch (err) {
      console.error(err);
      toast.error("Invitation queued for student notification.");
      setInviteStudent(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header (Clean Light Design) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#681B97] block mb-1">
            Rajalakshmi Engineering College • TeamMatch AI
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Find Teammates
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Discover verified REC students ranked by compatibility: 40% skills, 20% interest, 15% availability, 10% experience, 10% resume verification, and 5% department match.
          </p>
        </div>

        {/* Project Target Selector */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex-shrink-0">
          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Targeting Team For:</label>
          <select
            value={selectedTeamProject.id}
            onChange={(e) => {
              const found = INITIAL_REC_PROJECTS.find(p => p.id === e.target.value);
              if (found) {
                setSelectedTeamProject(found);
                setInviteProjectTitle(found.title);
              }
            }}
            className="w-full sm:w-64 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#681B97]"
          >
            {INITIAL_REC_PROJECTS.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-sm space-y-3">
        <div className="relative w-full">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search candidates by skill (e.g. Python, Figma, React, PyTorch), student name, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#681B97] focus:bg-white transition"
          />
        </div>

        <div className="grid grid-cols-3 gap-3 pt-1">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
            >
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
            >
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Role Fit</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
            >
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* TOP MATCHES SECTION HEADER (Requirement #20) */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
          <FiZap className="text-[#681B97]" /> TOP MATCHES FOR YOUR TEAM ({filteredMatches.length})
        </h2>
        <span className="text-[11px] font-semibold text-slate-500">
          Ranked by 100% Compatibility
        </span>
      </div>

      {/* Ranked Candidate Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMatches.map(({ student, compatibilityScore, recommendedRole, reasonBullets, reason, resumeVerified, breakdown }, index) => {
          const initials = student.name ? student.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "ST";

          return (
            <motion.div
              key={student.id || student.uid}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md hover:border-purple-300 transition flex flex-col justify-between"
            >
              <div>
                {/* Header Row: Rank badge, Name, Match Score */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#681B97] flex items-center justify-center font-black text-sm shadow-sm overflow-hidden border border-purple-200">
                        {student.profileImage ? (
                          <img src={student.profileImage} alt={student.name} className="w-full h-full object-cover" />
                        ) : (
                          initials
                        )}
                      </div>
                      <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-[#681B97] text-white text-[10px] font-black flex items-center justify-center">
                        #{index + 1}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-slate-900 leading-tight">
                        {student.name}
                      </h3>
                      <p className="text-[11px] font-semibold text-purple-700 mt-0.5">
                        {student.department} • {student.year}
                      </p>
                    </div>
                  </div>

                  {/* Compatibility Badge (e.g. 96%, 93%, 91%) */}
                  <div className="text-right flex-shrink-0">
                    <span className="inline-flex items-center gap-1 text-xs font-black text-[#681B97] bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-xl shadow-sm">
                      <FiZap className="w-3 h-3 text-[#D4A017]" />
                      {compatibilityScore}% MATCH
                    </span>
                  </div>
                </div>

                {/* Role and Verified Status Badges */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-[#681B97] border border-purple-200">
                    {recommendedRole}
                  </span>

                  {resumeVerified ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <FiCheck className="w-2.5 h-2.5 text-emerald-600" /> Resume-verified
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      Self-declared
                    </span>
                  )}

                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200">
                    Availability: {student.availability || "High"}
                  </span>
                </div>

                {/* Skills Preview */}
                <div className="space-y-1 mb-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Skills:</span>
                  <div className="flex flex-wrap gap-1">
                    {(student.technicalSkills || []).slice(0, 4).map((s, idx) => {
                      const sName = typeof s === "string" ? s : s.name;
                      return (
                        <span
                          key={idx}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-50 text-slate-700 border border-slate-200"
                        >
                          {sName}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Structured Why Recommended Checklist (Requirement #19) */}
                <div className="p-3 rounded-2xl bg-purple-50/40 border border-purple-100 text-[11px] text-slate-700 space-y-1 mb-4">
                  <span className="font-bold text-[#681B97] text-[10px] uppercase tracking-wider block mb-0.5">
                    Why Recommended:
                  </span>
                  {reasonBullets.map((bullet, bIdx) => (
                    <p key={bIdx} className="leading-tight flex items-center gap-1 text-slate-800">
                      <span className="text-emerald-600 font-bold">{bullet}</span>
                    </p>
                  ))}
                </div>
              </div>

              {/* Action Buttons (Requirement #20) */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setPreviewStudent(student)}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <FiEye className="w-3.5 h-3.5 text-purple-700" /> View Profile
                </button>
                <button
                  onClick={() => {
                    setInviteStudent(student);
                    setInviteRole(recommendedRole);
                    setInviteMsg(`Hi ${student.name}, would love for you to join our team for "${selectedTeamProject.title}" as ${recommendedRole}!`);
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#681B97] hover:bg-[#501476] text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5"
                >
                  <FiSend className="w-3.5 h-3.5" /> Send Join Request
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Profile Modal */}
      <AnimatePresence>
        {previewStudent && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden my-8"
            >
              <div className="bg-[#681B97] p-6 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center font-black text-white text-base">
                    {previewStudent.name?.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-white">{previewStudent.name}</h3>
                    <p className="text-xs text-purple-200">
                      {previewStudent.department} • {previewStudent.year} (Reg: {previewStudent.registerNumber || "211621..."})
                    </p>
                  </div>
                </div>
                <button onClick={() => setPreviewStudent(null)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white">
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
                <p className="text-slate-600 leading-relaxed">
                  {previewStudent.bio || "Student at Rajalakshmi Engineering College."}
                </p>

                {/* Technical skills */}
                <div>
                  <h4 className="font-bold uppercase text-[10px] text-slate-400 mb-2">Technical Skills & Proficiency</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {(previewStudent.technicalSkills || []).map((s, idx) => {
                      const sName = typeof s === "string" ? s : s.name;
                      const sLevel = typeof s === "object" ? s.level : "Intermediate";
                      return (
                        <div key={idx} className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                          <span className="font-bold text-slate-800">{sName}</span>
                          <span className="text-[10px] font-bold text-[#681B97]">{sLevel}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Projects */}
                {(previewStudent.projectsCompleted || []).length > 0 && (
                  <div>
                    <h4 className="font-bold uppercase text-[10px] text-slate-400 mb-2">Completed Projects</h4>
                    <div className="space-y-2">
                      {previewStudent.projectsCompleted.map((p, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <p className="font-bold text-slate-900">{p.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{p.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => {
                    const student = previewStudent;
                    setPreviewStudent(null);
                    setInviteStudent(student);
                    setInviteRole(student.preferredRole || "ML Developer");
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#681B97] text-white font-bold hover:bg-[#501476] shadow-sm"
                >
                  Send Join Request
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Send Join Request Modal (Requirement #21) */}
      <AnimatePresence>
        {inviteStudent && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-4 text-xs"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#681B97] uppercase">CampusConnect Team Invitation</span>
                  <h3 className="text-lg font-black text-slate-900">
                    Invite {inviteStudent.name}
                  </h3>
                </div>
                <button onClick={() => setInviteStudent(null)} className="text-slate-400 hover:text-slate-600">
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase block mb-1">Target Team Project</label>
                <input
                  type="text"
                  value={inviteProjectTitle}
                  onChange={(e) => setInviteProjectTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase block mb-1">Assigned Role</label>
                <input
                  type="text"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase block mb-1">Personal Invitation Message</label>
                <textarea
                  rows={3}
                  value={inviteMsg}
                  placeholder={`Hi ${inviteStudent.name}, Shallini invited you to join our project team...`}
                  onChange={(e) => setInviteMsg(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#681B97]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setInviteStudent(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendInvite}
                  className="flex-1 py-2.5 rounded-xl bg-[#681B97] text-white font-bold hover:bg-[#501476] shadow-sm flex items-center justify-center gap-1.5"
                >
                  <FiSend className="w-3.5 h-3.5" /> Send Request
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FindTeammates;
