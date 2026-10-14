import { motion } from 'framer-motion';

const Loader = ({ size = 'full', message = 'Loading...' }) => {
    if (size === 'full') {
        return (
            <div className="fixed inset-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4">
                <div className="relative w-14 h-14">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-500"
                    />
                    <div className="absolute inset-2 gradient-brand rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">CC</span>
                    </div>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">{message}</p>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center py-8">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-400"
            />
        </div>
    );
};

export default Loader;
