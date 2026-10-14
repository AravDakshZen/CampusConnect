import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FiUser,
    FiMail,
    FiLock,
    FiEye,
    FiEyeOff,
    FiHash,
    FiBookOpen,
    FiCalendar
} from 'react-icons/fi';
import {
    createUserWithEmailAndPassword,
    updateProfile
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

const DEPARTMENTS = [
    'CSE',
    'AI & DS',
    'IT',
    'CSBS',
    'ECE',
    'EEE',
    'MECH',
    'CIVIL',
    'BIOTECH',
    'AERO',
    'MBA',
    'MCA'
];

const YEARS = [
    '1st Year',
    '2nd Year',
    '3rd Year',
    '4th Year'
];

const SECTIONS = ['A', 'B', 'C', 'D', 'E'];

const Register = () => {
    const navigate = useNavigate();

    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: '',
        registerNumber: '',
        email: '',
        department: 'CSE',
        year: '3rd Year',
        section: 'A',
        password: ''
    });

    const handleRegister = async (e) => {
        e.preventDefault();

        if (
            !form.name ||
            !form.registerNumber ||
            !form.email ||
            !form.password
        ) {
            return toast.error('Please fill all required fields');
        }

        if (form.password.length < 6) {
            return toast.error('Password must be at least 6 characters');
        }

        setLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                form.email,
                form.password
            );

            await updateProfile(userCredential.user, {
                displayName: form.name
            });

            // Save user profile with full REC student schema to Firestore
            await setDoc(
                doc(db, 'users', userCredential.user.uid),
                {
                    name: form.name,
                    registerNumber: form.registerNumber.toUpperCase(),
                    email: form.email,
                    department: form.department,
                    year: form.year,
                    section: form.section,
                    role: 'student',
                    availability: 'Available for Projects',
                    activeProjectsCount: 0,
                    technicalSkills: [
                        { name: 'Python', level: 'Intermediate' },
                        { name: 'React', level: 'Beginner' }
                    ],
                    softSkills: ['Teamwork', 'Communication'],
                    areasOfInterest: ['Web Development', 'Machine Learning'],
                    projectsCompleted: [],
                    currentProjectInterests: ['AI', 'Smart Campus'],
                    createdAt: new Date()
                }
            );

            toast.success('Account created successfully! Welcome to REC! 🎉');
            navigate('/dashboard');
        } catch (error) {
            console.error(error);
            const messages = {
                'auth/email-already-in-use': 'An account already exists with this email.',
                'auth/weak-password': 'Password should be at least 6 characters.',
                'auth/invalid-email': 'Please enter a valid email address.'
            };
            toast.error(messages[error.code] || error.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen gradient-brand flex items-center justify-center p-4 relative overflow-hidden py-10">
            {/* Background Orbs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#4A126D]/50 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-xl bg-white/10 backdrop-blur-2xl rounded-3xl p-8 sm:p-10 border border-white/20 shadow-2xl relative z-10"
            >
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-purple-950/30">
                        <span className="text-[#681B97] font-black text-xl tracking-wider">
                            REC
                        </span>
                    </div>

                    <h1 className="text-3xl font-black text-white">
                        Create REC Student Account
                    </h1>

                    <p className="text-purple-200 text-xs mt-1">
                        Rajalakshmi Engineering College, Thandalam, Chennai
                    </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    {/* Full Name & Register Number */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="relative">
                            <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                            />
                        </div>

                        <div className="relative">
                            <FiHash className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                            <input
                                type="text"
                                placeholder="Register Number (e.g. 211621104...)"
                                value={form.registerNumber}
                                onChange={(e) => setForm({ ...form, registerNumber: e.target.value })}
                                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 uppercase"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="relative">
                        <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                        <input
                            type="email"
                            placeholder="College Email (e.g. name@rajalakshmi.edu.in)"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                        />
                    </div>

                    {/* Department, Year & Section */}
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="text-[11px] text-purple-200 font-semibold mb-1 block">Department</label>
                            <select
                                value={form.department}
                                onChange={(e) => setForm({ ...form, department: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none"
                            >
                                {DEPARTMENTS.map((d) => (
                                    <option key={d} value={d} className="text-slate-900 bg-white">{d}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-[11px] text-purple-200 font-semibold mb-1 block">Year</label>
                            <select
                                value={form.year}
                                onChange={(e) => setForm({ ...form, year: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none"
                            >
                                {YEARS.map((y) => (
                                    <option key={y} value={y} className="text-slate-900 bg-white">{y}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-[11px] text-purple-200 font-semibold mb-1 block">Section</label>
                            <select
                                value={form.section}
                                onChange={(e) => setForm({ ...form, section: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none"
                            >
                                {SECTIONS.map((s) => (
                                    <option key={s} value={s} className="text-slate-900 bg-white">{s}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Password */}
                    <div className="relative">
                        <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                        <input
                            type={showPw ? 'text' : 'password'}
                            placeholder="Password (minimum 6 characters)"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            className="w-full pl-11 pr-12 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPw(!showPw)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                        >
                            {showPw ? <FiEyeOff /> : <FiEye />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 mt-2 rounded-xl bg-white text-[#681B97] font-black text-sm hover:bg-purple-50 transition-all shadow-lg shadow-purple-950/25 disabled:opacity-60"
                    >
                        {loading ? 'Creating Student Profile...' : 'Complete REC Registration →'}
                    </button>
                </form>

                <p className="text-center text-purple-200 text-xs mt-6">
                    Already registered at REC?{' '}
                    <Link to="/login" className="font-bold text-white hover:underline">
                        Sign In
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Register;