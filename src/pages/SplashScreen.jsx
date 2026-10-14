import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const SplashScreen = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => navigate('/login'), 3000);
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="min-h-screen gradient-brand flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background orbs */}
            <div className="absolute top-1/4 -left-20 w-72 h-72 bg-cyan-400/20 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl" />

            {/* Logo */}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
                className="relative"
            >
                <div className="w-28 h-28 bg-white/15 backdrop-blur-xl rounded-3xl flex items-center justify-center border border-white/20 shadow-2xl">
                    <div className="text-center">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-1 shadow-md">
                            <span className="text-[#681B97] font-black text-xl">REC</span>
                        </div>
                    </div>
                </div>
                {/* Pulse ring */}
                <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-3xl border-2 border-white/30"
                />
            </motion.div>

            {/* App name */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="mt-8 text-center px-4"
            >
                <h1 className="text-4xl font-black text-white tracking-tight">REC Campus Connect</h1>
                <div className="flex items-center justify-center gap-2 mt-2">
                    <div className="h-px bg-white/30 flex-1 max-w-[60px]" />
                    <p className="text-purple-200 text-sm font-semibold tracking-widest uppercase">REC</p>
                    <div className="h-px bg-white/30 flex-1 max-w-[60px]" />
                </div>
                <p className="text-purple-100/90 text-sm mt-2 font-medium">Rajalakshmi Engineering College, Thandalam, Chennai</p>
            </motion.div>

            {/* Features */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="flex gap-4 sm:gap-6 mt-10"
            >
                {['TeamMatch AI', 'Projects', 'Events', 'Notes'].map((f, i) => (
                    <motion.div
                        key={f}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 + i * 0.1 }}
                        className="text-center"
                    >
                        <div className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-xl border border-white/20 flex items-center justify-center mx-auto">
                            <span className="text-xs text-white font-bold">{f[0]}</span>
                        </div>
                        <p className="text-white/80 text-[10px] mt-1 font-medium">{f}</p>
                    </motion.div>
                ))}
            </motion.div>

            {/* Loading dots */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="absolute bottom-12 flex gap-2"
            >
                {[0, 1, 2].map(i => (
                    <motion.div
                        key={i}
                        animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        className="w-2 h-2 bg-white rounded-full"
                    />
                ))}
            </motion.div>
        </div>
    );
};

export default SplashScreen;
