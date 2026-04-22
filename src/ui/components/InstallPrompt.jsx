import React, { useState, useEffect, createContext, useContext } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

// ─── Contexto compartido para que otros componentes puedan acceder al prompt ───
const PWAInstallContext = createContext(null);

export const usePWAInstall = () => useContext(PWAInstallContext);

export const PWAInstallProvider = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);

  useEffect(() => {
    // Detectar si ya está instalada como PWA (modo standalone)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return; // No hace falta escuchar si ya está instalada
    }

    const handler = (e) => {
      e.preventDefault();
      console.log('✅ PWA: beforeinstallprompt capturado');
      setDeferredPrompt(e);
      setBannerVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Si la app se instala, ocultar el banner
    window.addEventListener('appinstalled', () => {
      console.log('✅ PWA: App instalada');
      setIsInstalled(true);
      setDeferredPrompt(null);
      setBannerVisible(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const triggerInstall = async () => {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA install outcome: ${outcome}`);
    setDeferredPrompt(null);
    setBannerVisible(false);
    return outcome === 'accepted';
  };

  const dismissBanner = () => setBannerVisible(false);

  return (
    <PWAInstallContext.Provider value={{ deferredPrompt, isInstalled, triggerInstall, bannerVisible, dismissBanner }}>
      {children}
    </PWAInstallContext.Provider>
  );
};

// ─── Banner flotante que aparece automáticamente ───────────────────────────
const InstallPrompt = () => {
  const ctx = usePWAInstall();
  if (!ctx) return null;

  const { bannerVisible, triggerInstall, dismissBanner, isInstalled } = ctx;

  if (!bannerVisible || isInstalled) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-in slide-in-from-bottom duration-300">
      <div className="bg-white rounded-xl shadow-2xl border border-blue-100 p-4 flex flex-col md:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-3 rounded-lg text-white shrink-0">
            <Smartphone size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg leading-tight">
              Instalar Aplicación
            </h3>
            <p className="text-gray-500 text-sm">
              Accedé rápidamente y usá el sistema sin conexión a internet.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={triggerInstall}
            className="flex-1 md:flex-none py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Download size={18} />
            Instalar app
          </button>
          <button
            onClick={dismissBanner}
            className="p-2.5 text-gray-400 hover:text-gray-600 transition-colors"
            title="Cerrar"
          >
            <X size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
