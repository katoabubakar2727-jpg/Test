/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WifiOff, Download, X, HelpCircle, Wifi, Monitor } from 'lucide-react';
import { subscribeToInstallPrompt, triggerInstall } from '../pwaSupport';

export function PWAManager() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showStatusAlert, setShowStatusAlert] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [showInstallBanner, setShowInstallBanner] = useState<boolean>(true);

  // Monitor network connectivity
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOnline(true);
      setStatusMessage('Network connection restored! App online.');
      setShowStatusAlert(true);
      
      // Auto dismiss alert after 4 seconds
      const timer = setTimeout(() => {
        setShowStatusAlert(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setStatusMessage('Working offline. All calculations will persist locally.');
      setShowStatusAlert(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Subscribe to OS installation prompt capability
  useEffect(() => {
    const unsubscribe = subscribeToInstallPrompt((prompt) => {
      setInstallPrompt(prompt);
      // Automatically show install banner if Chrome indicates we are installable
      if (prompt) {
        setShowInstallBanner(true);
      }
    });
    return unsubscribe;
  }, []);

  const handleInstallClick = async () => {
    const success = await triggerInstall();
    if (success) {
      console.log('App installation accepted by user.');
      setInstallPrompt(null);
    }
  };

  return (
    <div id="pwa-manager-root" className="w-full max-w-3xl mx-auto px-1 z-10 space-y-3 mb-4">
      
      {/* Network Connectivity Status Alert */}
      <AnimatePresence>
        {showStatusAlert && (
          <motion.div
            id="network-status-alert"
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className={`flex items-center justify-between p-3.5 rounded-xl border text-sm font-sans ${
              isOnline 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800' 
                : 'bg-amber-500/10 border-amber-500/20 text-amber-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {isOnline ? (
                <Wifi className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <span className="font-medium tracking-tight font-sans text-xs sm:text-sm">
                {statusMessage}
              </span>
            </div>
            <button
              onClick={() => setShowStatusAlert(false)}
              className="p-1 hover:bg-black/5 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OS Standalone PWA Installation Banner */}
      <AnimatePresence>
        {installPrompt && showInstallBanner && (
          <motion.div
            id="pwa-install-banner"
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            className="bg-[#2D2B26] border border-[#3E3C36] rounded-2xl p-4 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg relative overflow-hidden"
          >
            {/* Visual gradient accent */}
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-orange-500" />
            
            <div className="flex items-start gap-3.5 pl-2">
              <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center border border-orange-500/30 text-orange-400 shrink-0 mt-0.5">
                <Monitor className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-sans font-medium tracking-tight text-white flex items-center gap-1.5">
                  Install Tactile Calculator
                  <span className="text-[10px] font-mono bg-orange-500/10 text-orange-400 px-1.5 py-0.5 rounded border border-orange-500/20">Chrome PWA</span>
                </h3>
                <p className="text-xs text-[#A0A09A] max-w-md">
                  Pin to application drawer or home screen for premium standalone frame, offline execution, and mechanical sound response.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pl-2 sm:pl-0 w-full sm:w-auto self-end sm:self-center">
              <button
                id="pwa-install-action"
                onClick={handleInstallClick}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-sans font-medium text-xs rounded-xl shadow-md cursor-pointer transition-all active:scale-[0.98]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install App</span>
              </button>
              <button
                onClick={() => setShowInstallBanner(false)}
                className="p-2 text-[#A0A09A] hover:text-white hover:bg-white/5 rounded-xl transition-colors cursor-pointer shrink-0"
                title="Dismiss installer banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline Silent Indicator (renders if not showing full status badge) */}
      {!isOnline && !showStatusAlert && (
        <div id="silent-offline-indicator" className="flex items-center justify-center gap-1.5 py-1 text-amber-600 font-mono text-[10px] uppercase tracking-wider bg-amber-500/5 border border-amber-500/10 rounded-lg">
          <WifiOff className="w-3 h-3 shrink-0 text-amber-500 animate-pulse" />
          <span>Calculator is executing offline</span>
        </div>
      )}
    </div>
  );
}
