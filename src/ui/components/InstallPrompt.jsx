import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      console.log('✅ PWA: Evento beforeinstallprompt capturado con éxito');
      // Prevenir que el navegador muestre el prompt por defecto
      e.preventDefault();
      // Guardar el evento para dispararlo más tarde
      setDeferredPrompt(e);
      // Mostrar nuestro banner personalizado
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    console.log('🔍 PWA: Escuchando evento beforeinstallprompt...');

    // Comprobar estado de Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        if (registrations.length > 0) {
          console.log(`📡 PWA: ${registrations.length} Service Worker(s) detectado(s)`);
        } else {
          console.warn('⚠️ PWA: No hay Service Workers registrados');
        }
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Mostrar el prompt de instalación
    deferredPrompt.prompt();

    // Esperar a que el usuario responda
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    // Limpiar el evento guardado
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-in slide-in-from-bottom duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-blue-100 dark:border-gray-700 p-4 flex flex-col md:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-3 rounded-lg text-white shrink-0">
            <Download size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">
              Instalar Aplicación
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Accede rápidamente y usa el sistema sin conexión a internet.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleInstallClick}
            className="flex-1 md:flex-none py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            Instalar app
          </button>
          <button
            onClick={handleClose}
            className="p-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
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
