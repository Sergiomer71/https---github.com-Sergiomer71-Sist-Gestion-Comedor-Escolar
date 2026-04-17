/**
 * Módulo de generación de IDs únicos.
 * Responsabilidad: Proveer identificadores seguros y únicos para registros locales.
 * Dependencias: Ninguna externa.
 */

/**
 * Genera un ID único pseudoaleatorio (UUID v4 like).
 * Ideal para ser la clave primaria de los registros (alumnos, inscripciones, etc).
 * @returns {string} El identificador único
 */
export const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};
