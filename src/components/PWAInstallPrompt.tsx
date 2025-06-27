import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, ChefHat, Sparkles, Star } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallPromptProps {
  onInstall?: () => void;
  onDismiss?: () => void;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({
  onInstall,
  onDismiss
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [hasBeenDismissed, setHasBeenDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) { // Don't show again for 7 days
        setHasBeenDismissed(true);
        return;
      }
    }

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if app is already installed (running in standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                     (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Don't show if already installed
    if (standalone) return;

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after a short delay to let user explore the app
      setTimeout(() => {
        if (!hasBeenDismissed) {
          setShowPrompt(true);
        }
      }, 10000); // Show after 10 seconds
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show iOS install instructions
    if (iOS && !standalone && !hasBeenDismissed) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 15000); // Show after 15 seconds for iOS
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [hasBeenDismissed]);

  const handleInstall = async () => {
    if (!deferredPrompt && !isIOS) return;

    setIsInstalling(true);

    try {
      if (deferredPrompt) {
        // Show the install prompt
        await deferredPrompt.prompt();
        
        // Wait for the user's response
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          console.log('User accepted the install prompt');
          onInstall?.();
        } else {
          console.log('User dismissed the install prompt');
        }
        
        setDeferredPrompt(null);
      }
    } catch (error) {
      console.error('Error during install:', error);
    } finally {
      setIsInstalling(false);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setHasBeenDismissed(true);
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
    onDismiss?.();
  };

  if (!showPrompt || isStandalone || hasBeenDismissed) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-t-3xl md:rounded-3xl shadow-2xl border border-gray-200 w-full max-w-md transform transition-all duration-300 animate-slide-up">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-100">
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors min-h-[40px] min-w-[40px]"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-warm-green-500 to-terracotta-500 p-3 rounded-2xl">
              <ChefHat className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Install ChefSpeak</h3>
              <p className="text-sm text-gray-600">Get the full app experience</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-warm-green-100 p-2 rounded-lg">
                <Smartphone className="w-5 h-5 text-warm-green-600" />
              </div>
              <span className="text-gray-700">Works offline for cooking</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-terracotta-100 p-2 rounded-lg">
                <Sparkles className="w-5 h-5 text-terracotta-600" />
              </div>
              <span className="text-gray-700">Voice commands & hands-free mode</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-muted-blue-100 p-2 rounded-lg">
                <Star className="w-5 h-5 text-muted-blue-600" />
              </div>
              <span className="text-gray-700">Faster access from home screen</span>
            </div>
          </div>

          {/* Install Instructions */}
          {isIOS ? (
            <div className="bg-blue-50 rounded-2xl p-4 mb-6">
              <h4 className="font-semibold text-blue-900 mb-2">Install on iOS:</h4>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Tap the Share button in Safari</li>
                <li>2. Scroll down and tap "Add to Home Screen"</li>
                <li>3. Tap "Add" to install ChefSpeak</li>
              </ol>
            </div>
          ) : (
            <div className="bg-green-50 rounded-2xl p-4 mb-6">
              <p className="text-sm text-green-800">
                Install ChefSpeak as an app for the best cooking experience with offline access and push notifications.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {!isIOS && (
              <button
                onClick={handleInstall}
                disabled={isInstalling || !deferredPrompt}
                className="w-full bg-gradient-to-r from-warm-green-500 to-terracotta-500 hover:from-warm-green-600 hover:to-terracotta-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[52px]"
              >
                {isInstalling ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
                {isInstalling ? 'Installing...' : 'Install App'}
              </button>
            )}
            
            <button
              onClick={handleDismiss}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-2xl transition-colors min-h-[48px]"
            >
              {isIOS ? 'Maybe Later' : 'Continue in Browser'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook to check PWA install status
export const usePWAInstall = () => {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is installed
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                     (window.navigator as any).standalone === true;
    setIsInstalled(standalone);

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = () => {
      setCanInstall(true);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  return { canInstall, isInstalled };
}; 