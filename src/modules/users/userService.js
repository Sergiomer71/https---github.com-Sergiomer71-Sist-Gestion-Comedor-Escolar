import { STORAGE_KEYS, ROLES } from '../../core/config/constants';
import { localDB } from '../../services/storage/localDB';
import { generateId } from '../../utils/idGenerator';

const KEY = STORAGE_KEYS.USERS;

export const userService = {
  /**
   * Obtiene la lista de usuarios. Idealmente las Celadoras son cargadas por el admin.
   */
  getAllCeladoras: () => {
    return localDB.get(KEY).filter(u => u.role === ROLES.CELADORA);
  },

  /**
   * Crea una nueva celadora
   */
  createCeladora: (nombre) => {
    if (!nombre || nombre.trim() === '') throw new Error('El nombre no puede estar vacío');
    const existing = localDB.get(KEY).find(u => u.name.toLowerCase() === nombre.toLowerCase());
    
    if (existing) throw new Error('Ya existe una celadora con ese nombre');

    const newUser = {
      id: generateId(),
      name: nombre.trim(),
      role: ROLES.CELADORA,
    };
    return localDB.insert(KEY, newUser);
  },

  deleteCeladora: (id) => {
    return localDB.remove(KEY, id);
  },

  /**
   * Inicializa la base de usuarios si está vacía. 
   * Asegura que exista el objeto de config del Admin.
   */
  initMainAdmin: () => {
    const list = localDB.get(STORAGE_KEYS.SETTINGS);
    const adminConfig = list.find(s => s.type === 'admin_auth');
    
    // Si no existe, o existe pero tiene campos vacíos (error de importación común), lo creamos/reemplazamos
    if (!adminConfig || !adminConfig.username || !adminConfig.password) {
      const newList = list.filter(s => s.type !== 'admin_auth');
      newList.push({
        id: generateId(),
        type: 'admin_auth',
        username: 'admin',
        password: '123'
      });
      localDB.set(STORAGE_KEYS.SETTINGS, newList);
    }
  },

  /**
   * Valida inicio de sesión como Admin
   */
  loginAdmin: (username, password) => {
    // Caso especial: Recuperación automática si se usa admin/123
    if (username === 'admin' && password === '123') {
      const list = localDB.get(STORAGE_KEYS.SETTINGS);
      const adminExists = list.some(s => s.type === 'admin_auth' && s.username === 'admin' && s.password === '123');
      
      if (!adminExists) {
        // Reparar la base de datos si las credenciales por defecto no están
        const newList = list.filter(s => s.type !== 'admin_auth');
        newList.push({
          id: generateId(),
          type: 'admin_auth',
          username: 'admin',
          password: '123'
        });
        localDB.set(STORAGE_KEYS.SETTINGS, newList);
      }
      return true;
    }

    const list = localDB.get(STORAGE_KEYS.SETTINGS);
    const adminConfig = list.find(s => s.type === 'admin_auth');
    
    if (!adminConfig) return false;

    // Validación normal con limpieza de espacios por seguridad
    const storedUser = adminConfig.username?.trim();
    const storedPass = adminConfig.password?.trim();
    
    return (storedUser === username.trim() && storedPass === password.trim());
  }
};
