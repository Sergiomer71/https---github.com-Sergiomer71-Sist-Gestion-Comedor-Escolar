import { STORAGE_KEYS } from '../../core/config/constants';
import { localDB } from '../../services/storage/localDB';
import { generateId } from '../../utils/idGenerator';
import { getCurrentDate } from '../../utils/dateUtils';

/**
 * Módulo de negocio para Fichadas de Asistencia diarias
 */

const KEY = STORAGE_KEYS.ATTENDANCE;

export const attendanceService = {
  getAll: () => localDB.get(KEY),

  /**
   * Obtiene la asistencia de un día particular (ej. hoy)
   * @param {string} dateString Iso date YYYY-MM-DD
   */
  getByDate: (dateString = getCurrentDate()) => {
    return localDB.get(KEY).filter(a => a.date === dateString);
  },

  /**
   * Marca asistencia para un alumno en una fecha específica.
   * Si ya existe un registro ese día, lo actualiza.
   * @param {Object} data { studentId, date, status: 'presente' | 'ausente', celadoraName }
   */
  markAttendance: (data) => {
    const list = localDB.get(KEY);
    
    // Buscar si ya ficharon a este alumno en esta fecha
    const existingIndex = list.findIndex(
      a => a.studentId === data.studentId && a.date === data.date
    );

    if (existingIndex !== -1) {
      // Actualiza el registro existente
      const existingRecord = list[existingIndex];
      return localDB.update(KEY, existingRecord.id, { 
        status: data.status, 
        celadoraName: data.celadoraName 
      });
    } else {
      // Nuevo registro
      const newAttendance = {
        id: generateId(),
        studentId: data.studentId,
        date: data.date,
        status: data.status,
        celadoraName: data.celadoraName,
        createdAt: new Date().toISOString()
      };
      
      return localDB.insert(KEY, newAttendance);
    }
  }
};
