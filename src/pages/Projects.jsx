import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlus,
  FiSearch,
  FiFilter,
  FiUsers,
  FiCalendar,
  FiLayers,
  FiCheckCircle,
  FiZap,
  FiX,
  FiBriefcase,
  FiCode,
  FiTag,
  FiAlertCircle
} from "react-icons/fi";
import { collection, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { calculateStudentCompatibility } from "../services/teamMatchAI";
import { INITIAL_REC_PROJECTS, ensureSeedProjectsInFirestore } from "../services/projectService";
import toast from "react-hot-toast";

const DOMAINS = [
  "All",
  "Healthcare AI",
  "Artificial Intelligence",
  "Internet of Things (IoT)",
  "Web Development",
  "Cybersecurity",
  "Data Science",
  "Mobile Apps"
];

const DIFFICULTIES = ["All", "Beginner", "Intermediate", "Advanced"];

const Projects = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState(INITIAL_REC_PROJECTS);
  const [search, setSearch] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [requestModalProject, setRequestModalProject] = useState(null);
  const [requestedRole, setRequestedRole] = useState("");
  const [requestMessage, setRequestMessage] = useState("");

  // Create Project Form
  const [form, setForm] = useState({
    title: "",
    description: "",
    problemStatement: "",
    domain: "Artificial Intelligence",
    requiredSkills: ["Python", "Machine Learning"],
    preferredTeamSize: 4,
    requiredRoles: ["ML Developer", "Frontend Developer", "Backend Developer", "UI/UX Designer"],
    deadline: "2026-11-30",
    difficulty: "Advanced",
    technologies: "Python, TensorFlow, React, FastAPI"
  });

  const [newSkillInput, setNewSkillInput] = useState("");
  const [newRoleInput, setNewRoleInput] = useState("");

  useEffect(() => {
    ensureSeedProjectsInFirestore();
    const unsub = onSnapshot(collection(db, "projects"), (snapshot) => {
      if (!snapshot.empty) {
        const fetched = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setProjects(fetched);
      }
    });
    return () => unsub();
  }, []);

  // Filtered projects
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      (p.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.requiredSkills || []).some((s) => s.toLowerCase().includes(search.toLowerCase()));

    const matchesDomain = selectedDomain === "All" || p.domain === selectedDomain;
    const matchesDiff = selectedDifficulty === "All" || p.difficulty === selectedDifficulty;

    return matchesSearch && matchesDomain && matchesDiff;
  });

  // Handle skill adding
  const handleAddSkill = () => {
    if (!newSkillInput.trim()) return;
    if (!form.requiredSkills.includes(newSkillInput.trim())) {
      setForm({ ...form, requiredSkills: [...form.requiredSkills, newSkillInput.trim()] });
    }
    setNewSkillInput("");
  };

  const handleRemoveSkill = (idx) => {
    setForm({ ...form, requiredSkills: form.requiredSkills.filter((_, i) => i !== idx) });
  };

  // Handle role adding
  const handleAddRole = () => {
    if (!newRoleInput.trim()) return;
    if (!form.requiredRoles.includes(newRoleInput.trim())) {
      setForm({ ...form, requiredRoles: [...form.requiredRoles, newRoleInput.trim()] });
    }
    setNewRoleInput("");
  };

  const handleRemoveRole = (idx) => {
    setForm({ ...form, requiredRoles: form.requiredRoles.filter((_, i) => i !== idx) });
  };

  // Create Project submit
  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.problemStatement) {
      return toast.error("Please fill all required project fields");
    }

    try {
      const techArray = form.technologies.split(",").map((t) => t.trim()).filter(Boolean);
      const creatorMember = {
        uid: currentUser?.uid || "current_user",
        name: userProfile?.name || currentUser?.displayName || "Project Creator",
        email: currentUser?.email || "student@rajalakshmi.edu.in",
        role: form.requiredRoles[0] || "Project Lead",
        department: userProfile?.department || "CSE"
      };

      await addDoc(collection(db, "projects"), {
        ...form,
        technologies: techArray,
        creatorId: currentUser?.uid || "current_user",
        creatorName: userProfile?.name || "Student",
        creatorEmail: currentUser?.email || "",
        status: "recruiting",
        members: [creatorMember],
        tasks: [
          { id: "t1", title: "Project initiation & team alignment", status: "in-progress", assignedTo: creatorMember.name }
        ],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      toast.success("Project created! REC TeamMatch AI is ready to suggest teammates.");
      setShowCreateModal(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create project");
    }
  };

  // Send Join Request
  const handleSendJoinRequest = async () => {
    if (!requestModalProject) return;
    try {
      await addDoc(collection(db, "project_requests"), {
        projectId: requestModalProject.id,
        projectTitle: requestModalProject.title,
        type: "join_request",
        senderId: currentUser?.uid || "guest_uid",
        senderName: userProfile?.name || currentUser?.displayName || "Student Applicant",
        senderEmail: currentUser?.email || "",
        senderDepartment: userProfile?.department || "CSE",
        requestedRole: requestedRole || "Team Member",
        message: requestMessage || "I would love to contribute to this project!",
        receiverId: requestModalProject.creatorId,
        status: "pending",
        createdAt: serverTimestamp()
      });

      toast.success(`Request to join "${requestModalProject.title}" sent to creator!`);
      setRequestModalProject(null);
      setRequestedRole("");
      setRequestMessage("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send join request");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="gradient-brand rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-purple-200 mb-2">
              <FiZap className="w-3.5 h-3.5" /> REC TeamMatch AI Platform
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Project Group Formation
            </h1>
            <p className="text-xs sm:text-sm text-purple-100/90 mt-1 max-w-xl leading-relaxed">
              Create academic and research projects, specify required roles & skills, and let our intelligent engine assemble balanced student teams.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-[#681B97] font-black text-xs hover:bg-purple-50 transition shadow-lg"
            >
              <FiPlus className="w-4 h-4" /> Create Project
            </button>
            <Link
              to="/teammates"
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-bold text-xs transition backdrop-blur-md"
            >
              <FiUsers className="w-4 h-4" /> Discover Teammates
            </Link>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white dark:bg-[#18121F] rounded-2xl border border-slate-200 dark:border-[#2D2239] p-4 shadow-sm flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="relative flex-1 w-full">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search projects by title, domain, or technology (e.g. Python, React)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#21182A] border border-slate-200 dark:border-[#2D2239] text-xs text-slate-900 dark:text-[#F3EEF8] focus:outline-none focus:border-[#681B97]"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-slate-500 font-bold">Domain:</span>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#21182A] border border-slate-200 dark:border-[#2D2239] text-xs text-slate-900 dark:text-[#F3EEF8]"
            >
              {DOMAINS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-slate-500 font-bold">Difficulty:</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#21182A] border border-slate-200 dark:border-[#2D2239] text-xs text-slate-900 dark:text-[#F3EEF8]"
            >
              {DIFFICULTIES.map((df) => (
                <option key={df} value={df}>{df}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((proj) => {
          // Calculate student compatibility for currently logged in student
          const studentProfile = userProfile || {
            name: "Current Student",
            technicalSkills: [{ name: "Python", level: "Advanced" }, { name: "React", level: "Intermediate" }],
            projectsCompleted: [],
            availability: "Available for Projects"
          };

          const matchResult = calculateStudentCompatibility(studentProfile, proj);
          const currentMembersCount = (proj.members || []).length;
          const targetSize = proj.preferredTeamSize || 4;

          return (
            <motion.div
              key={proj.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              className="bg-white dark:bg-[#18121F] rounded-3xl border border-slate-200 dark:border-[#2D2239] p-6 shadow-sm hover:shadow-xl hover:shadow-purple-950/20 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header tags */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] uppercase font-black tracking-wider px-2.5 py-1 rounded-full bg-purple-100 text-[#681B97] dark:bg-[#681B97]/20 dark:text-purple-300">
                    {proj.domain || "Academic"}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full">
                    <FiZap className="w-3 h-3 text-emerald-500" />
                    <span>{matchResult.compatibilityScore}% Match</span>
                  </div>
                </div>

                <h3 className="font-black text-base text-slate-900 dark:text-[#F3EEF8] leading-snug mb-2">
                  {proj.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed mb-4">
                  {proj.description}
                </p>

                {/* Problem statement callout */}
                {proj.problemStatement && (
                  <div className="p-3 rounded-2xl bg-[#F7F5FA] dark:bg-[#21182A] border border-slate-200/80 dark:border-[#2D2239] mb-4">
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">Problem Statement</p>
                    <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 italic">
                      "{proj.problemStatement}"
                    </p>
                  </div>
                )}

                {/* Required Roles */}
                <div className="space-y-1.5 mb-3">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Required Roles:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(proj.requiredRoles || []).map((r, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-[#21182A] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#2D2239]"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Required Skills */}
                <div className="space-y-1.5 mb-4">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Required Skills:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(proj.requiredSkills || []).map((s, i) => {
                      const hasSkill = matchResult.matchedSkills.some((ms) => ms.toLowerCase().includes(s.toLowerCase()));
                      return (
                        <span
                          key={i}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            hasSkill
                              ? "bg-purple-100 text-[#681B97] dark:bg-[#681B97]/30 dark:text-purple-300"
                              : "bg-slate-100 text-slate-600 dark:bg-[#21182A] dark:text-slate-400"
                          }`}
                        >
                          {s} {hasSkill ? "✓" : ""}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-[#2D2239]">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3">
                  <span className="flex items-center gap-1.5">
                    <FiUsers className="w-3.5 h-3.5 text-[#681B97]" />
                    {currentMembersCount} / {targetSize} Members
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FiCalendar className="w-3.5 h-3.5 text-purple-400" />
                    Due: {proj.deadline || "TBD"}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setRequestModalProject(proj);
                      setRequestedRole(matchResult.recommendedRole || (proj.requiredRoles || [])[0]);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#681B97] hover:bg-[#8A2BB8] text-white text-xs font-bold transition shadow-md shadow-purple-950/20"
                  >
                    Request to Join
                  </button>
                  <button
                    onClick={() => navigate(`/my-groups`)}
                    className="py-2 px-3 rounded-xl border border-slate-200 dark:border-[#2D2239] hover:bg-purple-50 dark:hover:bg-[#21182A] text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
                  >
                    Team Dashboard
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Create Project Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#18121F] border border-slate-200 dark:border-[#2D2239] rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-8"
            >
              <div className="gradient-brand p-6 text-white flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-bold text-purple-200 tracking-wider">REC Academic Project</span>
                  <h2 className="text-2xl font-black text-white">Create New Project</h2>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase block mb-1">Project Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. AI-Based Hospital Queue Management"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#21182A] border border-slate-200 dark:border-[#2D2239] text-xs text-slate-900 dark:text-[#F3EEF8] focus:outline-none focus:border-[#681B97]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase block mb-1">Project Description *</label>
                  <textarea
                    rows={3}
                    placeholder="Describe the scope, objectives, and deliverables..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#21182A] border border-slate-200 dark:border-[#2D2239] text-xs text-slate-900 dark:text-[#F3EEF8] focus:outline-none focus:border-[#681B97]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase block mb-1">Problem Statement *</label>
                  <textarea
                    rows={2}
                    placeholder="What specific campus or industry challenge does this solve?"
                    value={form.problemStatement}
                    onChange={(e) => setForm({ ...form, problemStatement: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#21182A] border border-slate-200 dark:border-[#2D2239] text-xs text-slate-900 dark:text-[#F3EEF8] focus:outline-none focus:border-[#681B97]"
                  />
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase block mb-1">Domain</label>
                    <select
                      value={form.domain}
                      onChange={(e) => setForm({ ...form, domain: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#21182A] border border-slate-200 dark:border-[#2D2239] text-xs text-slate-900 dark:text-[#F3EEF8]"
                    >
                      {DOMAINS.filter(d => d !== "All").map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase block mb-1">Team Size</label>
                    <input
                      type="number"
                      min={2}
                      max={6}
                      value={form.preferredTeamSize}
                      onChange={(e) => setForm({ ...form, preferredTeamSize: parseInt(e.target.value, 10) || 4 })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#21182A] border border-slate-200 dark:border-[#2D2239] text-xs text-slate-900 dark:text-[#F3EEF8]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase block mb-1">Difficulty</label>
                    <select
                      value={form.difficulty}
                      onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#21182A] border border-slate-200 dark:border-[#2D2239] text-xs text-slate-900 dark:text-[#F3EEF8]"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                {/* Required Roles Builder */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase block mb-1.5">Required Roles</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {form.requiredRoles.map((role, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-[#681B97] dark:bg-[#681B97]/20 dark:text-purple-300">
                        {role}
                        <button type="button" onClick={() => handleRemoveRole(idx)} className="hover:text-red-500">
                          <FiX className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add role (e.g. ML Developer, UI/UX Designer)..."
                      value={newRoleInput}
                      onChange={(e) => setNewRoleInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddRole())}
                      className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#21182A] border border-slate-200 dark:border-[#2D2239]"
                    />
                    <button type="button" onClick={handleAddRole} className="px-4 py-2 bg-[#681B97] text-white text-xs font-bold rounded-xl">
                      Add Role
                    </button>
                  </div>
                </div>

                {/* Required Skills Builder */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase block mb-1.5">Required Skills</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {form.requiredSkills.map((skill, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
                        {skill}
                        <button type="button" onClick={() => handleRemoveSkill(idx)} className="hover:text-red-500">
                          <FiX className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add skill (e.g. Python, Machine Learning, React)..."
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                      className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#21182A] border border-slate-200 dark:border-[#2D2239]"
                    />
                    <button type="button" onClick={handleAddSkill} className="px-4 py-2 bg-[#681B97] text-white text-xs font-bold rounded-xl">
                      Add Skill
                    </button>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase block mb-1">Project Deadline</label>
                    <input
                      type="date"
                      value={form.deadline}
                      onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#21182A] border border-slate-200 dark:border-[#2D2239] text-xs text-slate-900 dark:text-[#F3EEF8]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase block mb-1">Technologies / Tools</label>
                    <input
                      type="text"
                      value={form.technologies}
                      onChange={(e) => setForm({ ...form, technologies: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#21182A] border border-slate-200 dark:border-[#2D2239] text-xs text-slate-900 dark:text-[#F3EEF8]"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-[#2D2239]">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-[#2D2239] text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl gradient-brand text-white text-xs font-bold shadow-lg"
                  >
                    Publish Project & Launch TeamMatch
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Request to Join Modal */}
      <AnimatePresence>
        {requestModalProject && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#18121F] border border-slate-200 dark:border-[#2D2239] p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#681B97] uppercase">Join Team Application</span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                    Request to Join
                  </h3>
                </div>
                <button onClick={() => setRequestModalProject(null)} className="text-slate-400 hover:text-slate-600">
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#21182A] border border-slate-200 dark:border-[#2D2239]">
                <p className="font-bold text-xs text-slate-900 dark:text-slate-100 mb-0.5">{requestModalProject.title}</p>
                <p className="text-[11px] text-slate-500">Creator: {requestModalProject.creatorName}</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase block mb-1">Preferred Project Role *</label>
                <select
                  value={requestedRole}
                  onChange={(e) => setRequestedRole(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-[#21182A] border border-slate-200 dark:border-[#2D2239] text-xs font-semibold"
                >
                  {(requestModalProject.requiredRoles || ["Frontend Developer"]).map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase block mb-1">Message to Creator</label>
                <textarea
                  rows={3}
                  value={requestMessage}
                  placeholder="Explain why your skills and interests make you a great fit for this team..."
                  onChange={(e) => setRequestMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-[#21182A] border border-slate-200 dark:border-[#2D2239] focus:outline-none focus:border-[#681B97]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRequestModalProject(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-[#2D2239] text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendJoinRequest}
                  className="flex-1 py-2.5 rounded-xl bg-[#681B97] text-white text-xs font-bold hover:bg-[#8A2BB8] transition shadow-md"
                >
                  Send Join Request
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Projects;
