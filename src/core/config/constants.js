/**
 * Constantes y configuración global del sistema
 */

export const STORAGE_KEYS = {
  STUDENTS: 'sgce_students',
  ENROLLMENTS: 'sgce_enrollments',
  ATTENDANCE: 'sgce_attendance',
  USERS: 'sgce_users', // Principalmente celadoras. El admin puede o no ir aquí.
  SETTINGS: 'sgce_settings',
};

// Roles permitidos en la aplicación
export const ROLES = {
  ADMIN: 'ADMIN',
  CELADORA: 'CELADORA'
};

// Clave para guardar en SessionStorage el usuario activo
export const CURRENT_USER_KEY = 'sgce_current_session';

// Días de la semana para inscripciones
export const WEEK_DAYS = [
  { id: 'lunes', label: 'Lunes' },
  { id: 'martes', label: 'Martes' },
  { id: 'miercoles', label: 'Miércoles' },
  { id: 'jueves', label: 'Jueves' },
  { id: 'viernes', label: 'Viernes' },
];
