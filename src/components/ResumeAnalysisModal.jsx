import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCheck, FiPlus, FiTrash2, FiFileText, FiAward, FiCode, FiLayers, FiBriefcase } from "react-icons/fi";
import toast from "react-hot-toast";

const ResumeAnalysisModal = ({ isOpen, onClose, extractedData, onSave }) => {
  const [data, setData] = useState(() => extractedData || {});
  const [newSkill, setNewSkill] = useState("");
  const [newFw, setNewFw] = useState("");
  const [newTool, setNewTool] = useState("");
  const [newCert, setNewCert] = useState("");
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  // Add tag helper
  const addTag = (field, value, setter) => {
    if (!value.trim()) return;
    const current = data[field] || [];
    if (!current.includes(value.trim())) {
      setData({ ...data, [field]: [...current, value.trim()] });
    }
    setter("");
  };

  // Remove tag helper
  const removeTag = (field, index) => {
    const current = data[field] || [];
    setData({ ...data, [field]: current.filter((_, i) => i !== index) });
  };

  const handleConfirmSave = async () => {
    setSaving(true);
    try {
      await onSave(data);
      toast.success("Resume data saved to REC profile & TeamMatch AI!");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save resume analysis");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-[#18121F] border border-slate-200 dark:border-[#2D2239] rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden my-8"
        >
          {/* Header */}
          <div className="gradient-brand p-6 text-white flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center">
                <FiFileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xs uppercase font-bold tracking-widest text-purple-200">
                  REC AI Resume Intelligence
                </span>
                <h2 className="text-2xl font-black text-white">Extracted Resume Profile</h2>
                <p className="text-xs text-purple-200 mt-0.5">
                  Review & edit extracted credentials before saving to your profile.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* File Info */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F7F5FA] dark:bg-[#21182A] border border-slate-200/80 dark:border-[#2D2239]">
              <div className="flex items-center gap-3">
                <FiFileText className="w-5 h-5 text-[#681B97]" />
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{data.fileName || "Uploaded Resume"}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{data.fileSize || "Verified"} • Extracted on {data.analyzedDate || "Today"}</p>
                </div>
              </div>
              <span className="text-xs px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-full font-bold">
                ✓ Ready for Verification
              </span>
            </div>

            {/* Technical Skills & Languages */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <FiCode className="text-[#681B97]" /> Technical Skills & Programming Languages
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(data.technicalSkills || []).map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-[#681B97] border border-purple-200 dark:bg-[#681B97]/20 dark:text-purple-200 dark:border-purple-700/40"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeTag("technicalSkills", idx)}
                      className="hover:text-red-500 transition-colors"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add skill (e.g. Python, TypeScript)..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag("technicalSkills", newSkill, setNewSkill))}
                  className="flex-1 px-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-[#21182A] border border-transparent focus:border-[#681B97] focus:outline-none dark:text-slate-200"
                />
                <button
                  type="button"
                  onClick={() => addTag("technicalSkills", newSkill, setNewSkill)}
                  className="px-4 py-2 rounded-xl bg-[#681B97] text-white text-xs font-bold hover:bg-[#8A2BB8] transition"
                >
                  <FiPlus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Frameworks & Libraries */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <FiLayers className="text-[#681B97]" /> Frameworks & Libraries
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(data.frameworks || []).map((fw, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700/40"
                  >
                    {fw}
                    <button
                      type="button"
                      onClick={() => removeTag("frameworks", idx)}
                      className="hover:text-red-500 transition-colors"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add framework (e.g. React, FastAPI, Node.js)..."
                  value={newFw}
                  onChange={(e) => setNewFw(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag("frameworks", newFw, setNewFw))}
                  className="flex-1 px-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-[#21182A] border border-transparent focus:border-[#681B97] focus:outline-none dark:text-slate-200"
                />
                <button
                  type="button"
                  onClick={() => addTag("frameworks", newFw, setNewFw)}
                  className="px-4 py-2 rounded-xl bg-[#681B97] text-white text-xs font-bold hover:bg-[#8A2BB8] transition"
                >
                  <FiPlus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Developer Tools */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <FiCode className="text-[#681B97]" /> Developer Tools & Databases
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(data.tools || []).map((tool, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/40"
                  >
                    {tool}
                    <button
                      type="button"
                      onClick={() => removeTag("tools", idx)}
                      className="hover:text-red-500 transition-colors"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add tool (e.g. Docker, Figma, PostgreSQL)..."
                  value={newTool}
                  onChange={(e) => setNewTool(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag("tools", newTool, setNewTool))}
                  className="flex-1 px-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-[#21182A] border border-transparent focus:border-[#681B97] focus:outline-none dark:text-slate-200"
                />
                <button
                  type="button"
                  onClick={() => addTag("tools", newTool, setNewTool)}
                  className="px-4 py-2 rounded-xl bg-[#681B97] text-white text-xs font-bold hover:bg-[#8A2BB8] transition"
                >
                  <FiPlus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Certifications */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <FiAward className="text-[#681B97]" /> Certifications
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(data.certifications || []).map((cert, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700/40"
                  >
                    {cert}
                    <button
                      type="button"
                      onClick={() => removeTag("certifications", idx)}
                      className="hover:text-red-500 transition-colors"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add certification (e.g. AWS Certified, Google UX)..."
                  value={newCert}
                  onChange={(e) => setNewCert(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag("certifications", newCert, setNewCert))}
                  className="flex-1 px-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-[#21182A] border border-transparent focus:border-[#681B97] focus:outline-none dark:text-slate-200"
                />
                <button
                  type="button"
                  onClick={() => addTag("certifications", newCert, setNewCert)}
                  className="px-4 py-2 rounded-xl bg-[#681B97] text-white text-xs font-bold hover:bg-[#8A2BB8] transition"
                >
                  <FiPlus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Extracted Projects */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <FiBriefcase className="text-[#681B97]" /> Extracted Projects
              </label>
              <div className="space-y-2.5">
                {(data.projects || []).map((proj, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#21182A] border border-slate-200/80 dark:border-[#2D2239] relative group"
                  >
                    <button
                      type="button"
                      onClick={() => removeTag("projects", idx)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                    <input
                      type="text"
                      value={proj.title}
                      onChange={(e) => {
                        const updated = [...(data.projects || [])];
                        updated[idx] = { ...updated[idx], title: e.target.value };
                        setData({ ...data, projects: updated });
                      }}
                      className="font-bold text-sm text-slate-900 dark:text-slate-100 bg-transparent border-b border-transparent focus:border-[#681B97] focus:outline-none w-full mb-1"
                    />
                    <textarea
                      rows={2}
                      value={proj.description}
                      onChange={(e) => {
                        const updated = [...(data.projects || [])];
                        updated[idx] = { ...updated[idx], description: e.target.value };
                        setData({ ...data, projects: updated });
                      }}
                      className="text-xs text-slate-600 dark:text-slate-400 bg-transparent border-b border-transparent focus:border-[#681B97] focus:outline-none w-full resize-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Education Summary */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                Education
              </label>
              <input
                type="text"
                value={data.education || ""}
                onChange={(e) => setData({ ...data, education: e.target.value })}
                className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-100 dark:bg-[#21182A] border border-transparent focus:border-[#681B97] focus:outline-none dark:text-slate-200"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-200 dark:border-[#2D2239] flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-[#18121F]">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-[#21182A] transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl gradient-brand text-white text-sm font-bold shadow-lg hover:shadow-purple-500/25 transition disabled:opacity-50"
            >
              <FiCheck className="w-4 h-4" />
              {saving ? "Saving to REC Profile..." : "Save to Profile & TeamMatch AI"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ResumeAnalysisModal;
