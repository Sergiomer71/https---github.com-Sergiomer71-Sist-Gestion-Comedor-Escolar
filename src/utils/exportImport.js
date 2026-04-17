import { STORAGE_KEYS } from '../core/config/constants';
import { localDB } from '../services/storage/localDB';
import { sanitizeObject } from './sanitize';

/**
 * Módulo para importar y exportar la base de datos completa.
 */

/**
 * Genera un archivo JSON de respaldo con todas las colecciones y lo descarga.
 */
export const exportDatabase = () => {
  const dbDump = {};
  
  // Recopilar cada colección
  Object.values(STORAGE_KEYS).forEach(key => {
    dbDump[key] = localDB.get(key);
  });

  const dataStr = JSON.stringify(dbDump, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  // Forzar descarga
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup_comedor_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
};

/**
 * Importa los datos reemplazando los actuales de manera limpia.
 * @param {string} jsonString - Contenido de texto del archivo importado
 * @returns {boolean} true si fue exitoso
 */
export const importDatabase = (jsonString) => {
  try {
    const backup = JSON.parse(jsonString);
    
    // Validación mínima de estructura esperada (al menos debe ser un objeto)
    if (typeof backup !== 'object' || backup === null) {
      throw new Error('Formato de JSON inválido');
    }

    // Sanitizar y guardar cada colección válida (las que correspondan a nuestras keys)
    const validKeys = Object.values(STORAGE_KEYS);
    
    for (const [key, value] of Object.entries(backup)) {
      if (validKeys.includes(key)) {
        if (Array.isArray(value)) {
          // Reemplaza los datos actuales
          const sanitized = sanitizeObject(value);
          localStorage.setItem(key, JSON.stringify(sanitized));
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error importando base de datos:', error);
    throw new Error('El archivo corrupto o formato incorrecto. ' + error.message);
  }
};

/**
 * Borra todas las colecciones de la base de datos local.
 */
export const clearDatabase = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};
