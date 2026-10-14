import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiMail,
    FiLock,
    FiEye,
    FiEyeOff,
    FiX,
    FiKey,
    FiCheckCircle
} from 'react-icons/fi';
import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../firebase';
import toast from 'react-hot-toast';

const Login = () => {
    const [form, setForm] = useState({
        email: '',
        password: ''
    });

    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);

    // Forgot password state
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!form.email || !form.password) {
            return toast.error('Please fill all fields');
        }

        setLoading(true);

        try {
            await signInWithEmailAndPassword(
                auth,
                form.email,
                form.password
            );

            toast.success('Welcome back to REC Campus Connect! 👋');
            navigate('/dashboard');
        } catch (err) {
            console.error(err);

            const messages = {
                'auth/user-not-found': 'No account found with this REC email',
                'auth/wrong-password': 'Incorrect password',
                'auth/invalid-credential': 'Invalid REC email or password',
                'auth/too-many-requests': 'Too many attempts. Try again in a moment.'
            };

            toast.error(messages[err.code] || 'Login failed. Check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (!forgotEmail) {
            return toast.error('Please enter your REC college email');
        }

        setForgotLoading(true);
        try {
            await sendPasswordResetEmail(auth, forgotEmail);
            toast.success('Password reset link sent to your email! 📧');
            setShowForgotModal(false);
            setForgotEmail('');
        } catch (err) {
            console.error(err);
            toast.error(err.message || 'Failed to send password reset email');
        } finally {
            setForgotLoading(false);
        }
    };

    return (
        <div className="min-h-screen gradient-brand flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#4A126D]/40 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

            <div className="w-full max-w-md relative z-10">

                {/* College Logo & Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-6"
                >
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xl shadow-purple-950/30">
                        <span className="text-[#681B97] font-black text-2xl tracking-wider">
                            REC
                        </span>
                    </div>

                    <h1 className="text-2xl font-black text-white">
                        REC Campus Connect
                    </h1>

                    <p className="text-purple-200 text-xs font-medium mt-1">
                        Rajalakshmi Engineering College, Thandalam, Chennai
                    </p>
                </motion.div>

                {/* Login Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card backdrop-blur-2xl p-8 shadow-2xl border border-white/20"
                >
                    <h2 className="text-xl font-bold text-white mb-2">
                        Student Sign In
                    </h2>
                    <p className="text-purple-200/80 text-xs mb-6">
                        Access REC TeamMatch AI, campus projects, and academic resources.
                    </p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="relative">
                            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 w-4 h-4" />
                            <input
                                type="email"
                                placeholder="name@rajalakshmi.edu.in"
                                value={form.email}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        email: e.target.value
                                    }))
                                }
                                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all text-sm"
                            />
                        </div>

                        <div className="relative">
                            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 w-4 h-4" />
                            <input
                                type={showPw ? 'text' : 'password'}
                                placeholder="Password"
                                value={form.password}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        password: e.target.value
                                    }))
                                }
                                className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all text-sm"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPw((p) => !p)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                            >
                                {showPw ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                            </button>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => setShowForgotModal(true)}
                                className="text-xs text-purple-200 hover:text-white transition-colors font-medium"
                            >
                                Forgot Password?
                            </button>
                        </div>

                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-3.5 rounded-xl bg-white text-[#681B97] font-black text-sm hover:bg-purple-50 transition-all shadow-lg shadow-purple-950/25 disabled:opacity-60"
                        >
                            {loading ? 'Authenticating...' : 'Sign In →'}
                        </motion.button>
                    </form>

                    <p className="text-center text-purple-200 text-sm mt-6">
                        New REC student?{' '}
                        <Link
                            to="/register"
                            className="text-white hover:underline font-bold transition-colors"
                        >
                            Create REC Account
                        </Link>
                    </p>
                </motion.div>

            </div>

            {/* Forgot Password Modal */}
            <AnimatePresence>
                {showForgotModal && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white dark:bg-[#18121F] border border-slate-200 dark:border-[#2D2239] p-6 rounded-3xl max-w-md w-full shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <FiKey className="w-5 h-5 text-[#681B97]" />
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                                        Reset Password
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setShowForgotModal(false)}
                                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                >
                                    <FiX className="w-5 h-5" />
                                </button>
                            </div>

                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                                Enter your Rajalakshmi Engineering College email address and we'll send you a password reset link.
                            </p>

                            <form onSubmit={handleForgotPassword} className="space-y-4">
                                <input
                                    type="email"
                                    placeholder="your.email@rajalakshmi.edu.in"
                                    value={forgotEmail}
                                    onChange={(e) => setForgotEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-[#21182A] border border-slate-200 dark:border-[#2D2239] text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-[#681B97]"
                                />

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowForgotModal(false)}
                                        className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-[#2D2239] text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#21182A]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={forgotLoading}
                                        className="flex-1 py-2.5 rounded-xl bg-[#681B97] text-white text-xs font-bold hover:bg-[#8A2BB8] transition shadow-md disabled:opacity-50"
                                    >
                                        {forgotLoading ? 'Sending...' : 'Send Reset Link'}
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

export default Login;