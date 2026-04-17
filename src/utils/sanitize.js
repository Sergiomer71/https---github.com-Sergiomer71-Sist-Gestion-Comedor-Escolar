/**
 * Módulo de utilidades para sanitización de texto.
 * Responsabilidad: Limpiar cadenas de texto para evitar ataques XSS o inyección HTML.
 */

/**
 * Escapa etiquetas o caracteres peligrosos para HTML.
 * Convierte un <script> en un texto visualmente idéntico pero inofensivo.
 * @param {string} str - El texto crudo ingresado por el usuario
 * @returns {string} El texto sanitizado
 */
export const escapeHTML = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/**
 * Sanitiza todos los campos de cadena dentro de un objeto JSON anidado o simple.
 * Ideal para limpiar al guardar en DB o importar backups.
 * @param {Object} obj - Objeto o Array a limpiar
 * @returns {Object} Objeto o Array con textos limpios
 */
export const sanitizeObject = (obj) => {
  if (typeof obj === 'string') return escapeHTML(obj);
  if (Array.isArray(obj)) return obj.map(item => sanitizeObject(item));
  if (obj !== null && typeof obj === 'object') {
    const newObj = {};
    for (const [key, value] of Object.entries(obj)) {
      newObj[key] = sanitizeObject(value);
    }
    return newObj;
  }
  return obj;
};
