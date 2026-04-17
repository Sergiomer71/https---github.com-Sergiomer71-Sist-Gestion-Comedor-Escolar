/**
 * Módulo de utilidades para fechas.
 * Responsabilidad: Manejar y estandarizar el formato de fechas para mostrar en pantalla o guardar.
 * Dependencias: Ninguna.
 */

/**
 * Retorna la fecha actual en formato local estándar (ej. YYYY-MM-DD para ISO)
 * Útil para los value de los inputs type="date"
 * @returns {string} Fecha actual (YYYY-MM-DD)
 */
export const getCurrentDate = () => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

/**
 * Formatea una fecha ISO a un texto más amigable (DD/MM/YYYY)
 * @param {string} isoDate - Fecha en formato YYYY-MM-DD
 * @returns {string} Fecha en formato DD/MM/YYYY
 */
export const formatDateDisplay = (isoDate) => {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
};

/**
 * Obtiene el nombre del mes actual o el proporcionado en base 1.
 * @param {number} monthIndex - Número del mes (1 = Enero, 12 = Diciembre). Opcional.
 * @returns {string} Nombre del mes en español
 */
export const getMonthName = (monthIndex) => {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  if (!monthIndex) {
    const d = new Date();
    return months[d.getMonth()];
  }
  return months[monthIndex - 1]; // Ajuste por array index 0
};
