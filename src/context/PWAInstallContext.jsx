import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const PWAInstallContext = createContext();

export const PWAInstallProvider = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    // Check if app is already running in standalone PWA window
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
      if (isStandaloneMode) {
        setIsInstalled(true);
      }
    };

    checkStandalone();

    // Check if previously dismissed
    const dismissed = localStorage.getItem('rec_pwa_banner_dismissed');
    if (dismissed) {
      setBannerDismissed(true);
    }

    // Capture beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      setCanInstall(true);
      console.log('REC Campus Connect: PWA installation prompt is ready');
    };

    // Capture appinstalled
    const handleAppInstalled = () => {
      console.log('REC Campus Connect: PWA was successfully installed');
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
      toast.success('REC Campus Connect installed successfully! Launch it anytime from your home screen or apps list.', {
        duration: 5000,
        icon: '🎉'
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) {
      toast('To install, open browser settings (⋮) and tap "Add to Home screen" or "Install App".', {
        icon: 'ℹ️',
        duration: 4000
      });
      return false;
    }

    try {
      // Show prompt
      deferredPrompt.prompt();
      // Wait for user response
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the PWA install prompt');
        setCanInstall(false);
        setDeferredPrompt(null);
        return true;
      } else {
        console.log('User dismissed the PWA install prompt');
        return false;
      }
    } catch (error) {
      console.error('Error invoking PWA install prompt:', error);
      return false;
    }
  };

  const dismissBanner = () => {
    setBannerDismissed(true);
    localStorage.setItem('rec_pwa_banner_dismissed', 'true');
  };

  const resetDismiss = () => {
    setBannerDismissed(false);
    localStorage.removeItem('rec_pwa_banner_dismissed');
  };

  return (
    <PWAInstallContext.Provider
      value={{
        canInstall,
        isInstalled,
        isStandalone,
        bannerDismissed,
        promptInstall,
        dismissBanner,
        resetDismiss
      }}
    >
      {children}
    </PWAInstallContext.Provider>
  );
};

export const usePWAInstall = () => {
  const context = useContext(PWAInstallContext);
  if (!context) {
    throw new Error('usePWAInstall must be used within a PWAInstallProvider');
  }
  return context;
};
