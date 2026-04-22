import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../core/contexts/AuthContext';
import { ROLES } from '../../core/config/constants';
import { localDB } from '../../services/storage/localDB';
import { usePWAInstall } from '../components/InstallPrompt';
import { Menu, X, Home, Users, Calendar, CheckSquare, FileText, Settings, LogOut, Download } from 'lucide-react';

const DefaultLayout = () => {
  const { currentUser, logout } = useAuth();
  const pwa = usePWAInstall();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logo, setLogo] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const isAdmin = currentUser?.role === ROLES.ADMIN;

  React.useEffect(() => {
    const savedLogo = localDB.getRaw('logoInstitucion');
    if (savedLogo && savedLogo.startsWith('data:image')) {
      setLogo(savedLogo);
    } else {
      setLogo(null);
    }
    
    // Escuchar cambios en storage para actualizar el logo si se cambia en Settings
    const handleStorageChange = (e) => {
      if (e.key === 'logoInstitucion') {
        setLogo(e.newValue || null);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Polling opcional o dispatchEvent personalizado para actualización instantánea en la misma pestaña
    const checkLogo = setInterval(() => {
      const currentLogo = localDB.getRaw('logoInstitucion');
      const isValid = currentLogo && currentLogo.startsWith('data:image');
      if (isValid && currentLogo !== logo) {
        setLogo(currentLogo);
      } else if (!isValid && logo !== null) {
        setLogo(null);
      }
    }, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(checkLogo);
    };
  }, [logo]);

  const getLinks = () => {
    if (isAdmin) {
      return [
        { path: '/dashboard', label: 'Dashboard', icon: Home },
        { path: '/alumnos', label: 'Alumnos', icon: Users },
        { path: '/inscripciones', label: 'Inscripciones', icon: Calendar },
        { path: '/asistencia', label: 'Asistencia', icon: CheckSquare },
        { path: '/reportes', label: 'Reportes', icon: FileText },
        { path: '/configuracion', label: 'Configuración', icon: Settings }
      ];
    }
    // Celadoras solo ven asistencia (y tal vez alumnos fijos, pero por ahora su vista principal es asistencia)
    return [
      { path: '/asistencia', label: 'Pasar Asistencia', icon: CheckSquare }
    ];
  };

  const navLinks = getLinks();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      
      {/* Botón menú móvil */}
      <div className="lg:hidden absolute top-4 left-4 z-50">
        <button onClick={toggleSidebar} className="p-2 bg-white rounded-md shadow-md text-slate-700">
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Overlay Móvil */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 bg-white shadow-xl w-64 z-40
        transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center justify-center gap-3">
            {logo && logo.startsWith('data:image') && (
              <img 
                src={logo} 
                alt="" 
                className="h-10 w-10 object-contain rounded-md"
                onError={() => setLogo(null)}
              />
            )}
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Comedor Escolar
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1 capitalize text-center">{currentUser?.name}</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname.startsWith(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                `}
              >
                <Icon size={20} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                <span>{link.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 flex-shrink-0 space-y-2">
          {/* Botón instalar PWA — visible solo si la app no está instalada y el browser lo soporta */}
          {pwa && !pwa.isInstalled && pwa.deferredPrompt && (
            <button
              onClick={pwa.triggerInstall}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-blue-600 hover:bg-blue-50 font-medium transition-colors border border-blue-200"
            >
              <Download size={20} />
              Instalar App
            </button>
          )}
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-red-600 hover:bg-red-50 font-medium transition-colors"
          >
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto px-4 py-16 lg:px-8 lg:py-6 relative">
        <div className="max-w-6xl mx-auto h-full space-y-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DefaultLayout;
