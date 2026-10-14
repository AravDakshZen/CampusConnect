import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheckCircle, FiUser, FiMail, FiHash, FiPhone, FiBookOpen, FiFileText, FiSend, FiUsers, FiGlobe } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { submitApplication } from '../services/applicationService';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const EventApplicationModal = ({ isOpen, onClose, event, onSuccess }) => {
  const { currentUser, userProfile } = useAuth();

  const [applicationType, setApplicationType] = useState('Individual');
  const [teamName, setTeamName] = useState('');
  const [teamMembersInput, setTeamMembersInput] = useState('');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [statement, setStatement] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState(userProfile?.portfolio || userProfile?.github || '');
  const [submitting, setSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState(null);

  // Pre-filled data
  const studentName = userProfile?.name || currentUser?.displayName || 'Shallini';
  const studentEmail = currentUser?.email || userProfile?.email || 'shallini.2023.aids@rajalakshmi.edu.in';
  const registerNumber = userProfile?.registerNumber || '211623106042';
  const department = userProfile?.department || 'AI & DS';
  const year = userProfile?.year || '3rd Year';

  // Resume verified skills
  const verifiedSkills = (userProfile?.resumeExtractedData?.skills || userProfile?.technicalSkills || [])
    .map(s => typeof s === 'string' ? s : s.name);

  useEffect(() => {
    if (isOpen) {
      setSubmittedApp(null);
      setSubmitting(false);
      setPhone(userProfile?.phone || '');
      setPortfolioUrl(userProfile?.portfolio || userProfile?.github || '');
    }
  }, [isOpen, userProfile]);

  if (!isOpen || !event) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone.trim()) {
      return toast.error('Please provide a contact phone number');
    }
    if (applicationType === 'Team' && !teamName.trim()) {
      return toast.error('Please enter your team name');
    }

    setSubmitting(true);
    try {
      const teamList = teamMembersInput
        ? teamMembersInput.split(',').map(m => m.trim()).filter(Boolean)
        : [studentName];

      const appData = {
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.startDate || event.date,
        eventVenue: event.venue || event.location,
        category: event.category,
        applicantId: currentUser?.uid || 'current_user',
        applicantName: studentName,
        applicantEmail: studentEmail,
        registerNumber,
        department,
        year,
        phone,
        type: applicationType,
        teamName: applicationType === 'Team' ? teamName : null,
        teamMembers: applicationType === 'Team' ? [studentName, ...teamList.filter(m => m !== studentName)] : [studentName],
        verifiedSkills: verifiedSkills.slice(0, 6),
        statement: statement.trim() || 'Excited to represent Rajalakshmi Engineering College in this event.',
        portfolioUrl: portfolioUrl.trim()
      };

      const result = await submitApplication(appData);
      setSubmittedApp(result);
      toast.success('Application Submitted Successfully! 🎉');
      onSuccess?.(result);
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden my-8"
      >
        {/* Header */}
        <div className="bg-[#681B97] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
          >
            <FiX className="w-4 h-4" />
          </button>

          <span className="text-[10px] uppercase font-bold tracking-wider text-purple-200 block mb-1">
            CampusConnect Direct Application
          </span>
          <h2 className="text-xl font-black leading-tight text-white pr-8">
            {event.title}
          </h2>
          <p className="text-xs text-purple-200 mt-1">
            Rajalakshmi Engineering College • Internal Registration
          </p>
        </div>

        {/* Content */}
        {submittedApp ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <FiCheckCircle className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-black text-slate-900">
              Application Submitted Successfully!
            </h3>

            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Your application has been registered with Rajalakshmi Engineering College. The organizing committee has received your details.
            </p>

            {/* Registration ID Badge */}
            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 max-w-sm mx-auto">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#681B97]">Registration ID</p>
              <p className="text-lg font-black text-[#681B97] tracking-wider mt-0.5">{submittedApp.id}</p>
              <p className="text-[11px] text-slate-500 mt-1">Status: <strong>Under Review</strong></p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <Link
                to="/applications"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-[#681B97] text-white text-xs font-bold hover:bg-[#501476] shadow-sm text-center"
              >
                View My Applications →
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
            {/* Pre-filled Student Details Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold uppercase text-[10px] tracking-wider text-slate-500">
                  Pre-filled Profile Details
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Verified Student Profile
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <div>
                  <span className="text-slate-400 block text-[10px]">Name:</span>
                  <span className="font-bold text-slate-900">{studentName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Register No:</span>
                  <span className="font-bold text-slate-900">{registerNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Email:</span>
                  <span className="font-bold text-slate-900 truncate block">{studentEmail}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Dept & Year:</span>
                  <span className="font-bold text-slate-900">{department} • {year}</span>
                </div>
              </div>

              {verifiedSkills.length > 0 && (
                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-slate-400 block text-[10px] mb-1">Resume-Verified Skills Attached:</span>
                  <div className="flex flex-wrap gap-1">
                    {verifiedSkills.slice(0, 5).map((sk, idx) => (
                      <span key={idx} className="bg-purple-50 text-[#681B97] border border-purple-200 px-2 py-0.5 rounded-md text-[10px] font-bold">
                        {sk} ✓
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Application Type: Individual vs Team */}
            <div>
              <label className="font-bold text-slate-700 uppercase block mb-1.5">Application Format *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setApplicationType('Individual')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    applicationType === 'Individual'
                      ? 'border-[#681B97] bg-purple-50/60 text-[#681B97]'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <FiUser className="w-3.5 h-3.5" /> Individual Application
                </button>
                <button
                  type="button"
                  onClick={() => setApplicationType('Team')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    applicationType === 'Team'
                      ? 'border-[#681B97] bg-purple-50/60 text-[#681B97]'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <FiUsers className="w-3.5 h-3.5" /> Team Application
                </button>
              </div>
            </div>

            {/* Team details if Team selected */}
            {applicationType === 'Team' && (
              <div className="p-3.5 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Team Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. AI Innovators REC / Cyber Knights"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-[#681B97]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Additional Teammates (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Karthik Subramanian, Pooja Ramanathan"
                    value={teamMembersInput}
                    onChange={(e) => setTeamMembersInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-[#681B97]"
                  />
                </div>
              </div>
            )}

            {/* Phone */}
            <div>
              <label className="font-bold text-slate-700 uppercase block mb-1">Contact Phone Number *</label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                <input
                  type="tel"
                  placeholder="+91 98401 23456"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-[#681B97]"
                />
              </div>
            </div>

            {/* Portfolio / GitHub URL */}
            <div>
              <label className="font-bold text-slate-700 uppercase block mb-1">Portfolio or GitHub URL (Optional)</label>
              <div className="relative">
                <FiGlobe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                <input
                  type="url"
                  placeholder="https://github.com/your-username"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-[#681B97]"
                />
              </div>
            </div>

            {/* Motivation statement */}
            <div>
              <label className="font-bold text-slate-700 uppercase block mb-1">Brief Statement of Interest / Track Focus</label>
              <textarea
                rows={2}
                placeholder="Why do you want to participate in this event? Any specific domain problem you aim to tackle?"
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-[#681B97]"
              />
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 rounded-xl bg-[#681B97] hover:bg-[#501476] text-white text-xs font-bold shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
              >
                <FiSend className="w-3.5 h-3.5" />
                {submitting ? 'Submitting Application...' : 'Submit Application'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default EventApplicationModal;
