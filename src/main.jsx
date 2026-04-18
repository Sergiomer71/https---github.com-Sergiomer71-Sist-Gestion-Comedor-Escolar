import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import '@shoelace-style/shoelace/dist/themes/light.css';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path';
import App from './App.jsx';
import { registerSW } from 'virtual:pwa-register';

// Registrar Service Worker con auto-recarga
registerSW({ immediate: true });

// Lógica Nuclear de Limpieza (si se añade ?reset=true a la URL)
if (window.location.search.includes('reset=true')) {
  console.log('☢️ INICIANDO LIMPIEZA NUCLEAR DE PWA...');
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (let registration of registrations) {
        registration.unregister();
      }
    });
  }
  caches.keys().then(names => {
    for (let name of names) caches.delete(name);
  });
  localStorage.clear();
  sessionStorage.clear();
  console.log('✅ LIMPIEZA COMPLETADA. Redirigiendo...');
  window.location.href = window.location.origin + window.location.pathname;
}

// Para Shoelace iconos
setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.15.0/cdn/');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
