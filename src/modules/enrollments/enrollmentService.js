import { STORAGE_KEYS } from '../../core/config/constants';
import { localDB } from '../../services/storage/localDB';
import { generateId } from '../../utils/idGenerator';

/**
 * Módulo de negocio para Inscripciones al Comedor.
 * Responsabilidad: Reglas para inscripción "Mes Completo" o "Días específicos".
 */

const KEY = STORAGE_KEYS.ENROLLMENTS;

export const enrollmentService = {
  getAll: () => localDB.get(KEY),

  /**
   * Obtiene la inscripción de un mes específico
   */
  getByMonth: (month, year) => {
    return localDB.get(KEY).filter(e => e.month === month && e.year === year);
  },

  /**
   * Inscribe un alumno al comedor en un mes/año.
   * Regla de negocio: Un alumno se inscribe 1 vez por mes. No puede haber duplicados del mismo mes/año para el mismo alumno.
   * @param {Object} data { studentId, month, year, type: 'COMPLETO' | 'ESPECIFICO', days: ['Lunes', 'Miércoles'] }
   */
  enroll: (data) => {
    const list = localDB.get(KEY);
    
    // Validar si ya está inscripto ese mes
    const isAlreadyEnrolled = list.some(
      e => e.studentId === data.studentId && e.month === data.month && e.year === data.year
    );

    if (isAlreadyEnrolled) {
      throw new Error('El alumno ya se encuentra inscripto en el mes seleccionado.');
    }

    const newEnrollment = {
      id: generateId(),
      studentId: data.studentId,
      month: data.month,
      year: data.year,
      type: data.type, // 'COMPLETO' o 'ESPECIFICO'
      days: data.type === 'COMPLETO' ? ['lunes','martes','miercoles','jueves','viernes'] : data.days,
      createdAt: new Date().toISOString()
    };

    return localDB.insert(KEY, newEnrollment);
  },

  /**
   * Borra una inscripción (por si se equivocaron)
   */
  remove: (id) => {
    return localDB.remove(KEY, id);
  }
};
