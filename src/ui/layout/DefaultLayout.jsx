import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../core/contexts/AuthContext';
import { ROLES } from '../../core/config/constants';
import { Menu, X, Home, Users, Calendar, CheckSquare, FileText, Settings, LogOut } from 'lucide-react';

const DefaultLayout = () => {
  const { currentUser, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isAdmin = currentUser?.role === ROLES.ADMIN;

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
        <div className="p-6 text-center border-b border-slate-100 flex-shrink-0">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Comedor Escolar
          </h1>
          <p className="text-sm text-slate-500 mt-1 capitalize">{currentUser?.name}</p>
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

        <div className="p-4 border-t border-slate-100 flex-shrink-0">
          <button 
            onClick={logout}
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
