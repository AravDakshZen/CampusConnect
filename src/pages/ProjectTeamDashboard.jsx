import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUsers,
  FiAlertTriangle,
  FiCheckCircle,
  FiCalendar,
  FiLayers,
  FiZap,
  FiPlus,
  FiCheck,
  FiX,
  FiUserPlus,
  FiBriefcase,
  FiTrash2,
  FiTrendingUp,
  FiFileText,
  FiEye
} from "react-icons/fi";
import { collection, onSnapshot, doc, updateDoc, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { MOCK_REC_STUDENTS } from "../services/mockStudents";
import { INITIAL_REC_PROJECTS } from "../services/projectService";
import {
  recommendBalancedTeam,
  analyzeTeamGaps,
  calculateStudentCompatibility
} from "../services/teamMatchAI";
import toast from "react-hot-toast";

const ProjectTeamDashboard = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState(INITIAL_REC_PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState(INITIAL_REC_PROJECTS[0].id);
  const [activeTab, setActiveTab] = useState("overview"); // overview, recommendations, balanced_team, requests, tasks
  const [pendingRequests, setPendingRequests] = useState([
    {
      id: "req_1",
      senderName: "Shallini",
      senderDepartment: "AI & DS",
      senderYear: "3rd Year",
      requestedRole: "ML Developer",
      message: "I have experience with Python, TensorFlow and completed a disease diagnosis project. Would love to join!",
      skills: ["Python", "TensorFlow", "FastAPI"],
      compatibilityScore: 92,
      resumeAvailable: true
    }
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");

  // Targeted gap filter state (triggered when clicking "Find ML Member")
  const [targetedGapRole, setTargetedGapRole] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "projects"), (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setProjects(list);
        if (!selectedProjectId && list.length > 0) {
          setSelectedProjectId(list[0].id);
        }
      }
    });
    return () => unsub();
  }, [selectedProjectId]);

  // Selected project object
  const currentProject = projects.find((p) => p.id === selectedProjectId) || projects[0] || INITIAL_REC_PROJECTS[0];

  // Candidates pool
  const candidateStudents = MOCK_REC_STUDENTS;

  // Run Gap Analysis on current team
  const gapAnalysis = analyzeTeamGaps(currentProject, currentProject.members || [], candidateStudents);

  // Run Balanced Team Formation Algorithm
  const balancedTeamResult = recommendBalancedTeam(currentProject, candidateStudents);

  // Calculate task completion percentage
  const tasks = currentProject.tasks || [];
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const progressPercent = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 40;

  // Add Task
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const taskObj = {
      id: `task_${Date.now()}`,
      title: newTaskTitle.trim(),
      status: "todo",
      assignedTo: newTaskAssignee || "Unassigned"
    };
    const updatedTasks = [...tasks, taskObj];
    setProjects(projects.map((p) => (p.id === currentProject.id ? { ...p, tasks: updatedTasks } : p)));
    setNewTaskTitle("");
    toast.success("Task added to project board");
  };

  const handleToggleTask = (taskId) => {
    const updatedTasks = tasks.map((t) => {
      if (t.id === taskId) {
        return { ...t, status: t.status === "completed" ? "todo" : "completed" };
      }
      return t;
    });
    setProjects(projects.map((p) => (p.id === currentProject.id ? { ...p, tasks: updatedTasks } : p)));
  };

  // Accept Join Request
  const handleAcceptRequest = (req) => {
    const newMember = {
      uid: `user_${Date.now()}`,
      name: req.senderName,
      email: `${req.senderName.toLowerCase()}@rajalakshmi.edu.in`,
      role: req.requestedRole,
      department: req.senderDepartment
    };

    const updatedMembers = [...(currentProject.members || []), newMember];
    setProjects(projects.map((p) => (p.id === currentProject.id ? { ...p, members: updatedMembers } : p)));
    setPendingRequests(pendingRequests.filter((r) => r.id !== req.id));
    toast.success(`${req.senderName} has been added to the project as ${req.requestedRole}!`);
  };

  const handleRejectRequest = (reqId) => {
    setPendingRequests(pendingRequests.filter((r) => r.id !== reqId));
    toast.error("Request declined");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="gradient-brand rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-purple-200 mb-2">
              <FiLayers className="w-3.5 h-3.5" /> REC TeamMatch AI Dashboard
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Project Team Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-purple-100/90 mt-1 max-w-xl leading-relaxed">
              Analyze skill distributions, discover gap-filling specialists, and coordinate project deliverables.
            </p>
          </div>

          {/* Project Switcher */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-purple-200 font-bold flex-shrink-0">Active Project:</span>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 text-white font-bold text-xs focus:outline-none"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="text-slate-900 bg-white">
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Project Meta Card */}
      <div className="bg-white dark:bg-[#18121F] rounded-3xl border border-slate-200 dark:border-[#2D2239] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-100 text-[#681B97] dark:bg-[#681B97]/20 dark:text-purple-300">
                {currentProject.domain}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#21182A] text-slate-600 dark:text-slate-400">
                Difficulty: {currentProject.difficulty || "Intermediate"}
              </span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                Status: {currentProject.status || "Recruiting"}
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-[#F3EEF8]">
              {currentProject.title}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
              {currentProject.description}
            </p>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#F7F5FA] dark:bg-[#21182A] border border-slate-200/80 dark:border-[#2D2239] flex-shrink-0">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Team Compatibility</p>
              <p className="text-2xl font-black text-[#681B97] dark:text-purple-400">
                {balancedTeamResult.teamCompatibility}%
              </p>
            </div>
            <div className="h-10 w-px bg-slate-200 dark:bg-[#2D2239]" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Team Size</p>
              <p className="text-xl font-black text-slate-900 dark:text-slate-100">
                {(currentProject.members || []).length} / {currentProject.preferredTeamSize || 4}
              </p>
            </div>
          </div>
        </div>

        {/* Missing Skills & Gap Analysis Warning Banner */}
        {!gapAnalysis.isComplete && gapAnalysis.gapAlert && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <FiAlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-amber-900 dark:text-amber-200">
                  Team Skill Gap Detected: {gapAnalysis.gapAlert}
                </h4>
                <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5 leading-relaxed">
                  Your project requires {currentProject.requiredRoles.join(", ")}. Recalibrating team balance is recommended.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveTab("recommendations");
                setTargetedGapRole(gapAnalysis.targetGapRole);
              }}
              className="px-5 py-2 rounded-xl bg-[#681B97] text-white text-xs font-bold hover:bg-[#8A2BB8] transition shadow-md flex-shrink-0 flex items-center gap-1.5"
            >
              <FiUserPlus className="w-3.5 h-3.5" /> Find {gapAnalysis.targetGapRole || "Missing"} Member
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-[#2D2239] gap-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === "overview"
                ? "border-[#681B97] text-[#681B97] dark:text-purple-300"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            Team Roster & Skill Distribution
          </button>
          <button
            onClick={() => setActiveTab("recommendations")}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "recommendations"
                ? "border-[#681B97] text-[#681B97] dark:text-purple-300"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <FiZap className="w-3.5 h-3.5 text-[#681B97]" /> REC TeamMatch Recommendations
          </button>
          <button
            onClick={() => setActiveTab("balanced_team")}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === "balanced_team"
                ? "border-[#681B97] text-[#681B97] dark:text-purple-300"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            Balanced Team Generator
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "requests"
                ? "border-[#681B97] text-[#681B97] dark:text-purple-300"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            Pending Requests ({pendingRequests.length})
          </button>
          <button
            onClick={() => setActiveTab("tasks")}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === "tasks"
                ? "border-[#681B97] text-[#681B97] dark:text-purple-300"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            Project Board ({progressPercent}% Complete)
          </button>
        </div>

        {/* TAB 1: OVERVIEW & ROSTER */}
        {activeTab === "overview" && (
          <div className="space-y-6 pt-2">
            {/* Current Team Members */}
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">
                Current Team Members ({(currentProject.members || []).length})
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(currentProject.members || []).map((m, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-[#21182A] border border-slate-200/80 dark:border-[#2D2239] flex items-center gap-3.5"
                  >
                    <div className="w-11 h-11 rounded-xl gradient-brand flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                      {m.name?.slice(0, 2).toUpperCase() || "TM"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-xs text-slate-900 dark:text-[#F3EEF8] truncate">{m.name}</p>
                      <p className="text-[11px] text-[#681B97] dark:text-purple-300 font-semibold truncate">{m.role}</p>
                      <p className="text-[10px] text-slate-400 truncate">{m.department || "REC Department"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Skill Distribution Breakdown */}
            <div className="p-5 rounded-2xl bg-[#F7F5FA] dark:bg-[#21182A] border border-slate-200/80 dark:border-[#2D2239] space-y-4">
              <h3 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Team Role & Skill Distribution
              </h3>

              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
                {(currentProject.requiredRoles || []).map((role, idx) => {
                  const filledMember = (currentProject.members || []).find((m) =>
                    (m.role || "").toLowerCase().includes(role.toLowerCase())
                  );

                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-2xl border ${
                        filledMember
                          ? "bg-white dark:bg-[#18121F] border-purple-200 dark:border-purple-900/40"
                          : "bg-amber-50/50 dark:bg-amber-950/20 border-dashed border-amber-300 dark:border-amber-800/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{role}</span>
                        {filledMember ? (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">✓ Filled</span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">⚠ Missing</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {filledMember ? filledMember.name : "Vacant — Recruit Specialist"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: REC TEAMMATCH AI RECOMMENDATIONS */}
        {activeTab === "recommendations" && (
          <div className="space-y-6 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-[#F3EEF8]">
                  Intelligent Student Recommendations
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Scored across verified technical skills, role preference, past project histories, and resume credentials.
                </p>
              </div>
              {targetedGapRole && (
                <button
                  onClick={() => setTargetedGapRole(null)}
                  className="text-xs text-[#681B97] dark:text-purple-300 font-bold hover:underline"
                >
                  Clear "{targetedGapRole}" Filter
                </button>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {candidateStudents
                .map((student) => calculateStudentCompatibility(student, currentProject))
                .filter((rec) => {
                  if (!targetedGapRole) return true;
                  return rec.recommendedRole.toLowerCase().includes(targetedGapRole.toLowerCase());
                })
                .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
                .map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-3xl bg-slate-50 dark:bg-[#21182A] border border-slate-200/80 dark:border-[#2D2239] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl overflow-hidden gradient-brand flex items-center justify-center text-white font-black text-xs">
                            {rec.student.name?.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                              {rec.student.name}
                            </h4>
                            <p className="text-[11px] text-[#681B97] dark:text-purple-300 font-semibold">
                              {rec.student.department} • {rec.student.year}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-black px-2.5 py-1 rounded-full bg-purple-100 text-[#681B97] dark:bg-[#681B97]/30 dark:text-purple-300">
                            {rec.compatibilityScore}% Compatibility
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-1">
                            {rec.categoryIcon} {rec.category}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-white dark:bg-[#18121F] border border-slate-200/60 dark:border-[#2D2239] text-xs leading-relaxed text-slate-700 dark:text-slate-300 mb-3">
                        <strong className="text-[#681B97] dark:text-purple-300 block mb-0.5 text-[11px]">
                          Why Recommended for {rec.recommendedRole}:
                        </strong>
                        {rec.reason}
                      </div>

                      {/* Matched & Additional Skills */}
                      <div className="space-y-1.5 text-[11px] mb-3">
                        <div>
                          <span className="text-slate-400 font-bold mr-1">Matched Skills:</span>
                          {rec.matchedSkills.map((s, i) => (
                            <span key={i} className="font-bold text-emerald-600 dark:text-emerald-400 mr-1.5">
                              {s} ✓
                            </span>
                          ))}
                        </div>
                        {rec.additionalSkills.length > 0 && (
                          <div>
                            <span className="text-slate-400 font-bold mr-1">Additional Skills:</span>
                            <span className="text-slate-600 dark:text-slate-400">{rec.additionalSkills.join(", ")}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        toast.success(`Invitation sent to ${rec.student.name} for the ${rec.recommendedRole} role!`);
                      }}
                      className="w-full py-2.5 rounded-xl bg-[#681B97] hover:bg-[#8A2BB8] text-white text-xs font-bold transition shadow-md shadow-purple-950/20"
                    >
                      Invite as {rec.recommendedRole}
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB 3: BALANCED TEAM GENERATOR */}
        {activeTab === "balanced_team" && (
          <div className="space-y-6 pt-2">
            <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900/40 via-[#681B97]/20 to-purple-900/40 border border-purple-200 dark:border-purple-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-wider text-purple-300">
                    Cross-Functional Team Optimization
                  </span>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    Balanced Team Recommendation
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-[#681B97] dark:text-purple-300 bg-white dark:bg-[#18121F] px-3 py-1.5 rounded-2xl shadow-sm">
                    Team Compatibility: {balancedTeamResult.teamCompatibility}%
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {balancedTeamResult.balanceExplanation}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {balancedTeamResult.team.map((m, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-3xl bg-slate-50 dark:bg-[#21182A] border border-slate-200/80 dark:border-[#2D2239] flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-2xl gradient-brand flex items-center justify-center text-white font-black text-xs mb-3 shadow-md">
                      {idx + 1}
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{m.student.name}</h4>
                    <span className="text-xs font-bold text-[#681B97] dark:text-purple-300 block mb-1">
                      {m.assignedRole}
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 inline-block mb-3">
                      {m.compatibilityScore}% Role Match
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed mb-3">
                      {m.reason}
                    </p>
                  </div>
                  <button
                    onClick={() => toast.success(`Invited ${m.student.name} to complete the balanced team!`)}
                    className="w-full py-2 rounded-xl bg-[#681B97] text-white text-xs font-bold hover:bg-[#8A2BB8]"
                  >
                    Select for Team
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PENDING JOIN REQUESTS */}
        {activeTab === "requests" && (
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Pending Applications & Join Requests ({pendingRequests.length})
            </h3>

            {pendingRequests.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No pending join requests.</p>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-5 rounded-3xl bg-slate-50 dark:bg-[#21182A] border border-slate-200/80 dark:border-[#2D2239] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-slate-900 dark:text-slate-100">{req.senderName}</span>
                        <span className="text-xs font-semibold text-[#681B97] dark:text-purple-300">
                          wants to join as <strong>{req.requestedRole}</strong>
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {req.compatibilityScore}% Match
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 italic">"{req.message}"</p>
                      <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                        <span>{req.senderDepartment} • {req.senderYear}</span>
                        <span>• Skills: {req.skills.join(", ")}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0">
                      <button
                        onClick={() => handleAcceptRequest(req)}
                        className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-[#681B97] hover:bg-[#8A2BB8] text-white text-xs font-bold transition shadow-md"
                      >
                        Accept Member
                      </button>
                      <button
                        onClick={() => handleRejectRequest(req.id)}
                        className="px-4 py-2 rounded-xl border border-slate-200 dark:border-[#2D2239] text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: PROJECT BOARD / TASKS */}
        {activeTab === "tasks" && (
          <div className="space-y-6 pt-2">
            {/* Progress bar */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-700 dark:text-slate-300">Project Milestone Progress</span>
                <span className="text-[#681B97] dark:text-purple-300">{progressPercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-[#21182A] rounded-full overflow-hidden">
                <div className="h-full gradient-brand transition-all duration-500" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            {/* Add task */}
            <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="New project task or milestone..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#21182A] border border-slate-200 dark:border-[#2D2239] text-xs focus:outline-none focus:border-[#681B97]"
              />
              <input
                type="text"
                placeholder="Assignee (e.g. ML Lead)"
                value={newTaskAssignee}
                onChange={(e) => setNewTaskAssignee(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#21182A] border border-slate-200 dark:border-[#2D2239] text-xs focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#681B97] text-white text-xs font-bold hover:bg-[#8A2BB8]"
              >
                + Add Task
              </button>
            </form>

            {/* Task list */}
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleToggleTask(task.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                    task.status === "completed"
                      ? "bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/30 line-through text-slate-400"
                      : "bg-white dark:bg-[#18121F] border-slate-200 dark:border-[#2D2239]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs ${
                      task.status === "completed" ? "bg-emerald-500 text-white" : "border border-slate-300 dark:border-slate-700"
                    }`}>
                      {task.status === "completed" && <FiCheck className="w-3 h-3" />}
                    </span>
                    <span className="text-xs font-bold">{task.title}</span>
                  </div>
                  <span className="text-[11px] text-purple-600 dark:text-purple-300 font-medium">
                    {task.assignedTo}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectTeamDashboard;
