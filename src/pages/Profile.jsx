import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiEdit2,
    FiSave,
    FiCamera,
    FiBook,
    FiMail,
    FiPhone,
    FiHash,
    FiShield,
    FiGithub,
    FiLinkedin,
    FiGlobe,
    FiFileText,
    FiUpload,
    FiPlus,
    FiTrash2,
    FiCheck,
    FiX,
    FiCode,
    FiAward,
    FiLayers,
    FiBriefcase
} from 'react-icons/fi';
import { updateProfile } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../firebase';
import { useAuth } from '../context/AuthContext';
import useFirestore from '../hooks/useFirestore';
import NoteCard from '../components/NoteCard';
import ResumeAnalysisModal from '../components/ResumeAnalysisModal';
import { parseResumeFile } from '../services/resumeParser';
import toast from 'react-hot-toast';

const DEPARTMENTS = ['CSE', 'AI & DS', 'IT', 'CSBS', 'ECE', 'EEE', 'MECH', 'CIVIL', 'BIOTECH', 'AERO', 'MBA', 'MCA'];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const SECTIONS = ['A', 'B', 'C', 'D', 'E'];
const AVAILABILITY_OPTIONS = ['Available for Projects', 'Busy with Team', 'Open to collaborate'];
const PROFICIENCY_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const Profile = () => {
    const { currentUser, userProfile, setUserProfile } = useAuth();
    const { docs: myNotes } = useFirestore('notes', [{ field: 'uploadedBy', operator: '==', value: currentUser?.uid }]);

    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [analyzingResume, setAnalyzingResume] = useState(false);

    // Resume Modal state
    const [showResumeModal, setShowResumeModal] = useState(false);
    const [parsedResumeData, setParsedResumeData] = useState(null);

    // Form state
    const [form, setForm] = useState({
        name: userProfile?.name || currentUser?.displayName || '',
        registerNumber: userProfile?.registerNumber || '',
        phone: userProfile?.phone || '',
        department: userProfile?.department || 'CSE',
        year: userProfile?.year || '3rd Year',
        section: userProfile?.section || 'A',
        bio: userProfile?.bio || '',
        availability: userProfile?.availability || 'Available for Projects',
        github: userProfile?.github || '',
        linkedin: userProfile?.linkedin || '',
        portfolio: userProfile?.portfolio || '',
        preferredRole: userProfile?.preferredRole || 'Full Stack Developer',
        technicalSkills: userProfile?.technicalSkills || [
            { name: 'Python', level: 'Advanced' },
            { name: 'React', level: 'Intermediate' },
            { name: 'Machine Learning', level: 'Intermediate' }
        ],
        softSkills: userProfile?.softSkills || ['Leadership', 'Problem Solving', 'Teamwork'],
        areasOfInterest: userProfile?.areasOfInterest || ['Artificial Intelligence', 'Web Development'],
        projectsCompleted: userProfile?.projectsCompleted || [
            {
                title: 'REC Smart Campus Portal',
                description: 'Full stack academic collaboration dashboard built for college evaluation.',
                techStack: ['React', 'Firebase', 'Tailwind CSS'],
                role: 'Team Lead',
                link: 'https://github.com'
            }
        ],
        currentProjectInterests: userProfile?.currentProjectInterests || ['AI-Based Healthcare', 'Smart IoT']
    });

    const [newSkillName, setNewSkillName] = useState('');
    const [newSkillLevel, setNewSkillLevel] = useState('Intermediate');
    const [newProject, setNewProject] = useState({ title: '', description: '', techStack: '', role: '', link: '' });
    const [showAddProject, setShowAddProject] = useState(false);

    const fileRef = useRef();
    const resumeFileRef = useRef();

    const displayName = form.name || userProfile?.name || currentUser?.displayName || 'REC Student';
    const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const isAdmin = userProfile?.role === 'admin';

    // Handle profile update
    const handleSave = async () => {
        if (!form.name) return toast.error('Name is required');
        setSaving(true);
        try {
            await setDoc(doc(db, 'users', currentUser.uid), form, { merge: true });
            if (auth.currentUser) {
                await updateProfile(auth.currentUser, { displayName: form.name });
            }
            setUserProfile(prev => ({ ...prev, ...form }));
            setEditing(false);
            toast.success('REC Student Profile updated successfully!');
        } catch (err) {
            console.error(err);
            toast.error('Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    // Avatar upload
    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingAvatar(true);
        try {
            const storagePath = `profiles/${currentUser.uid}/${Date.now()}_${file.name}`;
            const storageRef = ref(storage, storagePath);
            const uploadTask = uploadBytesResumable(storageRef, file);

            const url = await new Promise((resolve, reject) => {
                uploadTask.on('state_changed', () => {}, reject, async () => {
                    resolve(await getDownloadURL(storageRef));
                });
            });

            await setDoc(doc(db, 'users', currentUser.uid), { profileImage: url }, { merge: true });
            if (auth.currentUser) {
                await updateProfile(auth.currentUser, { photoURL: url });
            }
            setUserProfile(prev => ({ ...prev, profileImage: url }));
            toast.success('Profile photo updated!');
        } catch (err) {
            console.error(err);
            toast.error('Avatar upload failed');
        } finally {
            setUploadingAvatar(false);
        }
    };

    // Resume Upload & Client-side Analysis
    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setAnalyzingResume(true);
        const toastId = toast.loading('Analyzing resume skills & credentials...');
        try {
            const extracted = await parseResumeFile(file);
            setParsedResumeData(extracted);
            setShowResumeModal(true);
            toast.success('Resume analyzed! Please review and verify.', { id: toastId });
        } catch (err) {
            console.error(err);
            toast.error(err.message || 'Failed to analyze resume', { id: toastId });
        } finally {
            setAnalyzingResume(false);
        }
    };

    // Callback when student confirms extracted resume data
    const handleSaveExtractedResume = async (verifiedData) => {
        // Merge extracted technical skills into existing skills without duplicates
        const existingSkillNames = new Set(form.technicalSkills.map(s => s.name.toLowerCase()));
        const newExtractedSkills = (verifiedData.technicalSkills || [])
            .filter(name => !existingSkillNames.has(name.toLowerCase()))
            .map(name => ({ name, level: 'Intermediate' }));

        const updatedSkills = [...form.technicalSkills, ...newExtractedSkills];
        const updatedResumeData = {
            hasResume: true,
            fileName: verifiedData.fileName,
            analyzedDate: verifiedData.analyzedDate,
            skills: verifiedData.technicalSkills || [],
            certifications: verifiedData.certifications || [],
            education: verifiedData.education || '',
            workExperience: verifiedData.workExperience || ''
        };

        const updatedForm = {
            ...form,
            technicalSkills: updatedSkills,
            resumeExtractedData: updatedResumeData
        };

        setForm(updatedForm);
        await setDoc(doc(db, 'users', currentUser.uid), updatedForm, { merge: true });
        setUserProfile(prev => ({ ...prev, ...updatedForm }));
    };

    // Skill add / delete helper
    const handleAddSkill = () => {
        if (!newSkillName.trim()) return;
        const exists = form.technicalSkills.some(s => s.name.toLowerCase() === newSkillName.trim().toLowerCase());
        if (exists) return toast.error('Skill already exists');
        setForm(prev => ({
            ...prev,
            technicalSkills: [...prev.technicalSkills, { name: newSkillName.trim(), level: newSkillLevel }]
        }));
        setNewSkillName('');
    };

    const handleRemoveSkill = (index) => {
        setForm(prev => ({
            ...prev,
            technicalSkills: prev.technicalSkills.filter((_, i) => i !== index)
        }));
    };

    // Project add helper
    const handleAddProject = () => {
        if (!newProject.title.trim()) return toast.error('Project title is required');
        const techArray = newProject.techStack.split(',').map(s => s.trim()).filter(Boolean);
        const item = {
            title: newProject.title.trim(),
            description: newProject.description.trim(),
            techStack: techArray.length > 0 ? techArray : ['Python', 'React'],
            role: newProject.role.trim() || 'Contributor',
            link: newProject.link.trim()
        };
        setForm(prev => ({
            ...prev,
            projectsCompleted: [...prev.projectsCompleted, item]
        }));
        setNewProject({ title: '', description: '', techStack: '', role: '', link: '' });
        setShowAddProject(false);
    };

    const handleRemoveProject = (index) => {
        setForm(prev => ({
            ...prev,
            projectsCompleted: prev.projectsCompleted.filter((_, i) => i !== index)
        }));
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            {/* Header Hero Card */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#18121F] rounded-3xl border border-slate-200 dark:border-[#2D2239] overflow-hidden shadow-xl"
            >
                {/* Banner */}
                <div className="h-40 gradient-brand relative">
                    <div className="absolute top-3 left-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold uppercase tracking-wider">
                        Rajalakshmi Engineering College
                    </div>
                    <div className="absolute top-3 right-4 flex items-center gap-2">
                        <span className="bg-black/30 backdrop-blur-md px-3 py-1 rounded-full text-purple-200 text-xs font-bold">
                            REC Thandalam, Chennai
                        </span>
                    </div>
                </div>

                <div className="px-6 sm:px-8 pb-8">
                    {/* Avatar and Top Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 mb-6 gap-4">
                        <div className="flex items-end gap-4">
                            <div className="relative">
                                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl border-4 border-white dark:border-[#18121F] shadow-2xl overflow-hidden gradient-brand flex items-center justify-center">
                                    {userProfile?.profileImage ? (
                                        <img src={userProfile.profileImage} alt="avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-white font-black text-3xl sm:text-4xl">{initials}</span>
                                    )}
                                </div>
                                <button
                                    onClick={() => fileRef.current?.click()}
                                    disabled={uploadingAvatar}
                                    className="absolute -bottom-2 -right-2 w-9 h-9 bg-[#681B97] text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition"
                                    title="Upload photo"
                                >
                                    <FiCamera className="w-4 h-4" />
                                </button>
                                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                            </div>

                            <div className="mb-2">
                                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-[#F3EEF8]">
                                    {displayName}
                                </h1>
                                <p className="text-xs sm:text-sm font-semibold text-[#681B97] dark:text-purple-400 mt-0.5">
                                    {form.department} • {form.year} — Section {form.section}
                                </p>
                            </div>
                        </div>

                        {/* Edit Button */}
                        <div className="flex gap-2.5">
                            {editing ? (
                                <>
                                    <button
                                        onClick={() => setEditing(false)}
                                        className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#21182A]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#681B97] hover:bg-[#8A2BB8] text-white text-xs font-bold shadow-lg shadow-purple-950/20"
                                    >
                                        <FiSave className="w-3.5 h-3.5" />
                                        {saving ? 'Saving...' : 'Save Profile'}
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setEditing(true)}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-[#2D2239] hover:bg-purple-50 dark:hover:bg-[#21182A] text-slate-800 dark:text-slate-200 text-xs font-bold transition"
                                >
                                    <FiEdit2 className="w-3.5 h-3.5 text-[#681B97]" /> Edit Profile
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Bio / About */}
                    <div className="mb-6">
                        {editing ? (
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase">About / Bio</label>
                                <textarea
                                    rows={3}
                                    value={form.bio}
                                    placeholder="Write a brief professional summary about your interests, technical focus, and aspirations at REC..."
                                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-[#21182A] border border-slate-200 dark:border-[#2D2239] text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#681B97]"
                                />
                            </div>
                        ) : (
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
                                {form.bio || 'Computer Science student at Rajalakshmi Engineering College passionate about developing scalable applications and participating in academic research.'}
                            </p>
                        )}
                    </div>

                    {/* Availability, Role, and Social Badges */}
                    <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-[#2D2239]">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            {form.availability}
                        </span>

                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-[#681B97] dark:bg-[#681B97]/20 dark:text-purple-300">
                            <FiBriefcase className="w-3.5 h-3.5" />
                            {form.preferredRole}
                        </span>

                        {form.github && (
                            <a href={form.github} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-slate-100 dark:bg-[#21182A] text-slate-700 dark:text-slate-300 hover:text-[#681B97] transition">
                                <FiGithub className="w-4 h-4" />
                            </a>
                        )}
                        {form.linkedin && (
                            <a href={form.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-slate-100 dark:bg-[#21182A] text-slate-700 dark:text-slate-300 hover:text-[#681B97] transition">
                                <FiLinkedin className="w-4 h-4" />
                            </a>
                        )}
                        {form.portfolio && (
                            <a href={form.portfolio} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-slate-100 dark:bg-[#21182A] text-slate-700 dark:text-slate-300 hover:text-[#681B97] transition">
                                <FiGlobe className="w-4 h-4" />
                            </a>
                        )}
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                        <div className="p-3.5 rounded-2xl bg-[#F7F5FA] dark:bg-[#21182A] border border-slate-200/60 dark:border-[#2D2239]">
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">Register Number</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase">{form.registerNumber || userProfile?.registerNumber || '211621104...'}</p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-[#F7F5FA] dark:bg-[#21182A] border border-slate-200/60 dark:border-[#2D2239]">
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">College Email</p>
                            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{currentUser?.email}</p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-[#F7F5FA] dark:bg-[#21182A] border border-slate-200/60 dark:border-[#2D2239]">
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">Department</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{form.department}</p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-[#F7F5FA] dark:bg-[#21182A] border border-slate-200/60 dark:border-[#2D2239]">
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">Verified Skills</p>
                            <p className="text-sm font-bold text-[#681B97] dark:text-purple-400">{form.technicalSkills.length} Technologies</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Resume Upload & AI Analysis Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-[#4A126D] via-[#681B97] to-[#8A2BB8] text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0 shadow-lg">
                        <FiFileText className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <span className="text-[11px] uppercase font-bold tracking-widest text-purple-200">
                            Automated Credential Engine
                        </span>
                        <h2 className="text-xl font-black text-white">Upload Resume for REC TeamMatch AI</h2>
                        <p className="text-xs text-purple-100/90 mt-1 max-w-xl">
                            Upload your resume in <strong>PDF, DOC, or DOCX</strong>. Our parser automatically extracts your technical skills, certifications, and projects for intelligent team compatibility matching.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-shrink-0">
                    <input
                        ref={resumeFileRef}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={handleResumeUpload}
                    />
                    <button
                        onClick={() => resumeFileRef.current?.click()}
                        disabled={analyzingResume}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-[#681B97] font-black text-xs hover:bg-purple-50 transition shadow-lg disabled:opacity-50"
                    >
                        <FiUpload className="w-4 h-4" />
                        {analyzingResume ? 'Analyzing Document...' : 'Upload Resume (.pdf, .docx)'}
                    </button>
                </div>
            </div>

            {/* Detailed Skills Section with Visual Proficiency Levels */}
            <div className="bg-white dark:bg-[#18121F] rounded-3xl border border-slate-200 dark:border-[#2D2239] p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-black text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <FiCode className="text-[#681B97]" /> Technical Skills & Proficiency Levels
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Proficiency determines your compatibility score in REC TeamMatch AI.
                        </p>
                    </div>
                </div>

                {/* Visual Skill Bars Grid */}
                <div className="grid sm:grid-cols-2 gap-4">
                    {form.technicalSkills.map((skill, idx) => {
                        const levelPercent = skill.level === 'Advanced' ? 95 : skill.level === 'Intermediate' ? 65 : 35;
                        const barColor = skill.level === 'Advanced' 
                            ? 'bg-gradient-to-r from-[#681B97] to-purple-500' 
                            : skill.level === 'Intermediate' 
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-500' 
                            : 'bg-gradient-to-r from-amber-500 to-orange-400';

                        return (
                            <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-[#21182A] border border-slate-200/80 dark:border-[#2D2239] relative group">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{skill.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                            skill.level === 'Advanced' ? 'bg-purple-100 text-[#681B97] dark:bg-purple-950/40 dark:text-purple-300' :
                                            skill.level === 'Intermediate' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' :
                                            'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                                        }`}>
                                            {skill.level}
                                        </span>
                                        {editing && (
                                            <button onClick={() => handleRemoveSkill(idx)} className="text-slate-400 hover:text-red-500">
                                                <FiTrash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className={`h-full ${barColor} rounded-full transition-all duration-500`} style={{ width: `${levelPercent}%` }} />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Add Skill Controls */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        placeholder="Add skill (e.g. TensorFlow, Docker, Figma)..."
                        value={newSkillName}
                        onChange={(e) => setNewSkillName(e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#21182A] border border-slate-200 dark:border-[#2D2239] text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#681B97]"
                    />
                    <select
                        value={newSkillLevel}
                        onChange={(e) => setNewSkillLevel(e.target.value)}
                        className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-[#21182A] border border-slate-200 dark:border-[#2D2239] text-xs text-slate-900 dark:text-slate-100"
                    >
                        {PROFICIENCY_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <button
                        onClick={handleAddSkill}
                        className="px-5 py-2.5 rounded-xl bg-[#681B97] text-white text-xs font-bold hover:bg-[#8A2BB8] transition shadow-md"
                    >
                        + Add Skill
                    </button>
                </div>
            </div>

            {/* Completed Projects Showcase */}
            <div className="bg-white dark:bg-[#18121F] rounded-3xl border border-slate-200 dark:border-[#2D2239] p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-black text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <FiLayers className="text-[#681B97]" /> Projects Completed
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Past projects provide domain experience multipliers in team matching.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddProject(p => !p)}
                        className="px-4 py-2 rounded-xl bg-purple-50 dark:bg-[#681B97]/20 text-[#681B97] dark:text-purple-300 text-xs font-bold hover:bg-purple-100 dark:hover:bg-[#681B97]/30 transition"
                    >
                        {showAddProject ? 'Cancel' : '+ Add Project'}
                    </button>
                </div>

                {/* Add Project Form Drawer */}
                {showAddProject && (
                    <div className="p-5 rounded-2xl bg-[#F7F5FA] dark:bg-[#21182A] border border-purple-200 dark:border-purple-900/40 space-y-3">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">Add Completed Academic Project</h4>
                        <div className="grid sm:grid-cols-2 gap-3">
                            <input
                                type="text"
                                placeholder="Project Title *"
                                value={newProject.title}
                                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                                className="px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-[#18121F] border border-slate-200 dark:border-[#2D2239] focus:outline-none focus:border-[#681B97]"
                            />
                            <input
                                type="text"
                                placeholder="Your Role (e.g. ML Lead, Frontend Lead)"
                                value={newProject.role}
                                onChange={(e) => setNewProject({ ...newProject, role: e.target.value })}
                                className="px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-[#18121F] border border-slate-200 dark:border-[#2D2239] focus:outline-none focus:border-[#681B97]"
                            />
                        </div>
                        <textarea
                            rows={2}
                            placeholder="Brief project description & outcomes..."
                            value={newProject.description}
                            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                            className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-[#18121F] border border-slate-200 dark:border-[#2D2239] focus:outline-none focus:border-[#681B97]"
                        />
                        <div className="grid sm:grid-cols-2 gap-3">
                            <input
                                type="text"
                                placeholder="Technologies used (comma separated: Python, React, SQL)"
                                value={newProject.techStack}
                                onChange={(e) => setNewProject({ ...newProject, techStack: e.target.value })}
                                className="px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-[#18121F] border border-slate-200 dark:border-[#2D2239] focus:outline-none focus:border-[#681B97]"
                            />
                            <input
                                type="text"
                                placeholder="Project Link / GitHub URL (optional)"
                                value={newProject.link}
                                onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
                                className="px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-[#18121F] border border-slate-200 dark:border-[#2D2239] focus:outline-none focus:border-[#681B97]"
                            />
                        </div>
                        <button
                            onClick={handleAddProject}
                            className="px-5 py-2 rounded-xl bg-[#681B97] text-white text-xs font-bold hover:bg-[#8A2BB8] transition"
                        >
                            Save Project
                        </button>
                    </div>
                )}

                {/* Projects List */}
                <div className="grid sm:grid-cols-2 gap-4">
                    {form.projectsCompleted.map((proj, idx) => (
                        <div key={idx} className="p-5 rounded-2xl bg-slate-50 dark:bg-[#21182A] border border-slate-200/80 dark:border-[#2D2239] relative group flex flex-col justify-between">
                            <div>
                                <div className="flex items-start justify-between gap-2 mb-1.5">
                                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{proj.title}</h4>
                                    {editing && (
                                        <button onClick={() => handleRemoveProject(idx)} className="text-slate-400 hover:text-red-500">
                                            <FiTrash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                                <span className="text-[11px] font-bold text-[#681B97] dark:text-purple-400 block mb-2">
                                    Role: {proj.role || 'Contributor'}
                                </span>
                                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed mb-3">
                                    {proj.description}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-200/50 dark:border-[#2D2239]">
                                {(proj.techStack || []).map((t, i) => (
                                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-[#18121F] text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-[#2D2239]">
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Resume Review Modal */}
            <ResumeAnalysisModal
                isOpen={showResumeModal}
                onClose={() => setShowResumeModal(false)}
                extractedData={parsedResumeData}
                onSave={handleSaveExtractedResume}
            />
        </div>
    );
};

export default Profile;