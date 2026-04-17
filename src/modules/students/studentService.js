import { STORAGE_KEYS } from '../../core/config/constants';
import { localDB } from '../../services/storage/localDB';
import { generateId } from '../../utils/idGenerator';

/**
 * Módulo de negocio central para los alumnos.
 * Responsabilidad: Manejar validaciones de negocio antes de tocar la DB.
 */

const KEY = STORAGE_KEYS.STUDENTS;

export const studentService = {
  getAll: () => {
    return localDB.get(KEY);
  },

  getById: (id) => {
    return localDB.getById(KEY, id);
  },

  create: (studentData) => {
    // Regla de negocio: Validar DNI
    if (!studentData.dni || studentData.dni.length < 7) {
      throw new Error('DNI inválido. Debe tener al menos 7 dígitos.');
    }

    const exists = localDB.get(KEY).some(s => s.dni === studentData.dni);
    if (exists) {
      throw new Error('Ya existe un alumno registrado con ese DNI.');
    }

    const newStudent = {
      id: generateId(),
      apellido: studentData.apellido.trim().toUpperCase(),
      nombre: studentData.nombre.trim(),
      dni: studentData.dni.trim(),
      curso: studentData.curso.trim(),
      division: studentData.division.trim(),
      activo: true, // Por defecto al crearlo
      createdAt: new Date().toISOString()
    };

    return localDB.insert(KEY, newStudent);
  },

  update: (id, updatedData) => {
    return localDB.update(KEY, id, updatedData);
  },

  delete: (id) => {
    return localDB.remove(KEY, id);
  },

  /**
   * Búsqueda en memoria de alumnos (usado para auto-complete/buscador)
   */
  search: (query) => {
    if (!query) return studentService.getAll();
    const list = studentService.getAll();
    const q = query.toLowerCase();
    
    return list.filter(s => {
      const apellido = (s.apellido || '').toLowerCase();
      const nombre = (s.nombre || '').toLowerCase();
      const dni = String(s.dni || '');
      const curso = (s.curso || '').toLowerCase();

      return apellido.includes(q) ||
             nombre.includes(q) ||
             dni.includes(q) ||
             curso.includes(q);
    });
  }
};
