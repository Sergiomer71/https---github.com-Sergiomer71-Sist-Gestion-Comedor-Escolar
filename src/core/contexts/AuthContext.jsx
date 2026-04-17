import React, { createContext, useContext, useState, useEffect } from 'react';
import { CURRENT_USER_KEY, ROLES } from '../config/constants';
import { userService } from '../../modules/users/userService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Inicializa si no hay admin
    userService.initMainAdmin();
    
    // Restaurar sesión de sessionStorage (para no perderla al refrescar)
    const stored = sessionStorage.getItem(CURRENT_USER_KEY);
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored));
      } catch (e) {
        console.error('Error parse auth', e);
      }
    }
    setLoading(false);
  }, []);

  const loginAsAdmin = (username, password) => {
    const isValid = userService.loginAdmin(username, password);
    if (isValid) {
      const user = { role: ROLES.ADMIN, name: 'Administrador' };
      sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const loginAsCeladora = (celadoraName) => {
    const user = { role: ROLES.CELADORA, name: celadoraName };
    sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    setCurrentUser(user);
    return true;
  };

  const logout = () => {
    sessionStorage.removeItem(CURRENT_USER_KEY);
    setCurrentUser(null);
  };

  if (loading) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <AuthContext.Provider value={{ currentUser, loginAsAdmin, loginAsCeladora, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
