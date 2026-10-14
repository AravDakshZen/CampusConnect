import { motion, AnimatePresence } from 'framer-motion';
import { FiDownload, FiX, FiCheckCircle } from 'react-icons/fi';
import { usePWAInstall } from '../context/PWAInstallContext';

const InstallAppBanner = () => {
  const { canInstall, isStandalone, bannerDismissed, promptInstall, dismissBanner } = usePWAInstall();

  if (!canInstall || isStandalone || bannerDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.aside
        aria-label="Install REC Campus Connect app banner"
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="fixed bottom-20 lg:bottom-6 right-4 left-4 sm:left-auto sm:right-6 sm:max-w-md z-50 pointer-events-auto"
      >
        <div className="bg-white dark:bg-[#18121F] border border-purple-200 dark:border-purple-900/50 rounded-2xl shadow-2xl shadow-purple-950/25 p-4 relative backdrop-blur-md">
          {/* Close button */}
          <button
            onClick={dismissBanner}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors"
            title="Dismiss"
          >
            <FiX className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3.5 pr-6">
            {/* App Icon */}
            <div className="w-12 h-12 rounded-xl gradient-brand flex items-center justify-center flex-shrink-0 shadow-md shadow-purple-900/30 overflow-hidden">
              <img
                src="/pwa-64x64.png"
                alt="REC Logo"
                className="w-10 h-10 object-contain rounded-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                  Install REC Campus Connect
                </h4>
                <span className="text-[10px] bg-purple-100 dark:bg-purple-950/70 text-[#681B97] dark:text-purple-300 font-bold px-1.5 py-0.5 rounded-full">
                  PWA
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                Add to your home screen for instant access, offline notes, and full-screen experience.
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={promptInstall}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#681B97] hover:bg-[#581580] text-white font-semibold text-xs shadow-md shadow-purple-950/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <FiDownload className="w-3.5 h-3.5" />
                  <span>Install App</span>
                </button>
                <button
                  onClick={dismissBanner}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  Not Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
};

export default InstallAppBanner;
