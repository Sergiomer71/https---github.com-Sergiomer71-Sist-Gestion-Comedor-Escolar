import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../core/contexts/AuthContext';
import { ROLES } from '../../core/config/constants';
import { userService } from '../../modules/users/userService';
import { Lock, User, UserCircle } from 'lucide-react';

const Login = () => {
  const { loginAsAdmin, loginAsCeladora, currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [tab, setTab] = useState(ROLES.CELADORA);
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [celadoraName, setCeladoraName] = useState('');
  const [celadorasList, setCeladorasList] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === ROLES.ADMIN) {
        navigate('/dashboard');
      } else {
        navigate('/asistencia');
      }
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    // Cargar celadoras para la lista desplegable
    setCeladorasList(userService.getAllCeladoras());
  }, []);

  const handleAdminLogin = (e) => {
    e.preventDefault();
    setError('');
    const success = loginAsAdmin(adminUser, adminPass);
    if (!success) {
      setError('Credenciales de administrador inválidas');
    }
  };

  const handleCeladoraLogin = (e) => {
    e.preventDefault();
    setError('');
    if (!celadoraName) {
      setError('Por favor seleccione su nombre');
      return;
    }
    loginAsCeladora(celadoraName);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans text-slate-800">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center text-white">
          <h1 className="text-2xl font-bold mb-2">Comedor Escolar</h1>
          <p className="opacity-90">Ingreso al Sistema</p>
        </div>

        <div className="p-8">
          
          <div className="flex bg-slate-100 rounded-xl p-1 mb-8">
            <button 
              onClick={() => { setTab(ROLES.CELADORA); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${tab === ROLES.CELADORA ? 'bg-white shadow text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Celadora
            </button>
            <button 
              onClick={() => { setTab(ROLES.ADMIN); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${tab === ROLES.ADMIN ? 'bg-white shadow text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Administrador
            </button>
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">{error}</div>}

          {tab === ROLES.CELADORA && (
            <form onSubmit={handleCeladoraLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Seleccione su nombre</label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <select 
                    value={celadoraName}
                    onChange={(e) => setCeladoraName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all appearance-none"
                    required
                  >
                    <option value="" disabled>Elegir...</option>
                    {celadorasList.length === 0 ? (
                      <option disabled>No hay celadoras registradas</option>
                    ) : (
                      celadorasList.map(c => <option key={c.id} value={c.name}>{c.name}</option>)
                    )}
                  </select>
                </div>
                {celadorasList.length === 0 && <p className="text-xs text-orange-500 mt-2">El administrador debe registrar celadoras en la configuración.</p>}
              </div>
              <button 
                type="submit"
                disabled={celadorasList.length === 0}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
              >
                Ingresar al Fichaje
              </button>
            </form>
          )}

          {tab === ROLES.ADMIN && (
            <form onSubmit={handleAdminLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Usuario</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="text" 
                    value={adminUser}
                    onChange={(e) => setAdminUser(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all"
                    placeholder="admin"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="password" 
                    value={adminPass}
                    onChange={(e) => setAdminPass(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors mt-2"
              >
                Entrar como Administrador
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default Login;
