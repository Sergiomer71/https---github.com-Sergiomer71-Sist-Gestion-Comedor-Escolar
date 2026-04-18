import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './core/contexts/AuthContext';
import { ROLES } from './core/config/constants';

// Vistas (se crearán en breve)
import Login from './pages/login/Login';
import DefaultLayout from './ui/layout/DefaultLayout';

import Dashboard from './pages/dashboard/Dashboard';
import StudentsList from './pages/students/StudentsList';
import Enrollments from './pages/enrollments/Enrollments';
import Attendance from './pages/attendance/Attendance';
import ReportsPanel from './pages/reports/ReportsPanel';
import Settings from './pages/settings/Settings';
import InstallPrompt from './ui/components/InstallPrompt';

/**
 * Componentes de protección de rutas
 */
const AdminRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role !== ROLES.ADMIN) return <Navigate to="/asistencia" replace />;
  return children;
};

const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<PrivateRoute><DefaultLayout /></PrivateRoute>}>
            {/* Rutas compartidas o dashboard por defecto */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            {/* Rutas de Administrador */}
            <Route path="dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
            <Route path="alumnos" element={<AdminRoute><StudentsList /></AdminRoute>} />
            <Route path="inscripciones" element={<AdminRoute><Enrollments /></AdminRoute>} />
            <Route path="reportes" element={<AdminRoute><ReportsPanel /></AdminRoute>} />
            <Route path="configuracion" element={<AdminRoute><Settings /></AdminRoute>} />
            
            {/* Rutas para todos (Admin y Celadora) */}
            <Route path="asistencia" element={<Attendance />} />
          </Route>
        </Routes>
      </Router>
      <InstallPrompt />
    </AuthProvider>
  );
}

export default App;
