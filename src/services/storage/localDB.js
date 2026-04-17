import { sanitizeObject } from '../../utils/sanitize';

/**
 * Servicio de Base de Datos Local sobre LocalStorage.
 * Provee métodos base CRUD robustos y control de errores.
 */

export const localDB = {
  /**
   * Lee y parsea los datos de una clave (colección)
   * @param {string} key - Clave del localstorage
   * @returns {Array} Array de datos encontrados, o vacío.
   */
  get: (key) => {
    try {
      const data = localStorage.getItem(key);
      if (!data) return [];
      
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error(`Error leyendo ${key} de LocalStorage:`, e);
      return [];
    }
  },

  /**
   * Obtiene un registro por su ID exacto.
   */
  getById: (key, id) => {
    const list = localDB.get(key);
    return list.find(item => item.id === id) || null;
  },

  /**
   * Sobrescribe completamente una colección
   */
  set: (key, dataArray) => {
    try {
      const cleanData = sanitizeObject(dataArray);
      localStorage.setItem(key, JSON.stringify(cleanData));
      return true;
    } catch (e) {
      console.error(`Error guardando ${key} en LocalStorage:`, e);
      throw new Error(`Error de escritura. Memoria llena? Detalles: ${e.message}`);
    }
  },

  /**
   * Añade un nuevo elemento a la colección
   */
  insert: (key, newItem) => {
    const list = localDB.get(key);
    list.push(newItem);
    localDB.set(key, list);
    return newItem;
  },

  /**
   * Actualiza un elemento existente que coincida en ID
   */
  update: (key, id, updatedFields) => {
    const list = localDB.get(key);
    const index = list.findIndex(item => item.id === id);
    
    if (index === -1) throw new Error('Registro no encontrado para actualizar.');

    list[index] = { ...list[index], ...updatedFields };
    localDB.set(key, list);
    return list[index];
  },

  /**
   * Borra un elemento de la colección por ID
   */
  remove: (key, id) => {
    const list = localDB.get(key);
    const filtered = list.filter(item => item.id !== id);
    
    if (list.length === filtered.length) throw new Error('Registro no encontrado para eliminar.');
    
  },

  /**
   * Lee un valor crudo (string) de LocalStorage.
   */
  getRaw: (key) => {
    return localStorage.getItem(key) || null;
  },

  /**
   * Guarda un valor crudo (string) en LocalStorage.
   */
  saveRaw: (key, value) => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      console.error(`Error guardando ${key} en LocalStorage:`, e);
      return false;
    }
  }
};
