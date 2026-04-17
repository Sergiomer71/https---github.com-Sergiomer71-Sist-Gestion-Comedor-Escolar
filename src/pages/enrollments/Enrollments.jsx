import React, { useState, useEffect, useMemo } from 'react';
import { enrollmentService } from '../../modules/enrollments/enrollmentService';
import { studentService } from '../../modules/students/studentService';
import { getMonthName } from '../../utils/dateUtils';
import { WEEK_DAYS } from '../../core/config/constants';
import { CalendarPlus, Trash2, Search, Check } from 'lucide-react';

const Enrollments = () => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [enrollments, setEnrollments] = useState([]);
  
  // Para form inscripción
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  const [enrollType, setEnrollType] = useState('COMPLETO'); // 'COMPLETO' o 'ESPECIFICO'
  const [selectedDays, setSelectedDays] = useState([]);

  const loadEnrollments = () => {
    setEnrollments(enrollmentService.getByMonth(selectedMonth, selectedYear));
  };

  useEffect(() => {
    loadEnrollments();
  }, [selectedMonth, selectedYear]);

  // Debounce buscador alumnos
  useEffect(() => {
    if (searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      setSearchResults(studentService.search(searchTerm).slice(0, 5)); // max 5
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setSearchTerm(`${student.apellido}, ${student.nombre}`);
    setSearchResults([]);
  };

  const handleToggleDay = (dayId) => {
    if (selectedDays.includes(dayId)) {
      setSelectedDays(selectedDays.filter(d => d !== dayId));
    } else {
      setSelectedDays([...selectedDays, dayId]);
    }
  };

  const handleEnroll = (e) => {
    e.preventDefault();
    if (!selectedStudent) return alert('Seleccione un alumno válido');
    if (enrollType === 'ESPECIFICO' && selectedDays.length === 0) {
      return alert('Debe seleccionar al menos un día');
    }

    try {
      enrollmentService.enroll({
        studentId: selectedStudent.id,
        month: selectedMonth,
        year: selectedYear,
        type: enrollType,
        days: selectedDays
      });
      alert('Inscripción exitosa');
      setSelectedStudent(null);
      setSearchTerm('');
      setSelectedDays([]);
      loadEnrollments();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = (id) => {
    if(window.confirm('¿Eliminar esta inscripción?')) {
      enrollmentService.remove(id);
      loadEnrollments();
    }
  };

  // Mapeo ID -> Nombre alumno para la tabla
  const studentsMap = useMemo(() => {
    const all = studentService.getAll();
    const map = {};
    all.forEach(s => {
      map[s.id] = s;
    });
    return map;
  }, [enrollments]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inscripciones</h1>
          <p className="text-slate-500">Gestione a quién se le entrega vianda cada mes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Formulario de nueva inscripción */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <CalendarPlus size={20} className="text-blue-600" /> Nueva Inscripción
          </h2>
          
          <form onSubmit={handleEnroll} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mes</label>
                <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none">
                  {[...Array(12).keys()].map(i => (
                    <option key={i+1} value={i+1}>{getMonthName(i+1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Año</label>
                <input type="number" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none" />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 mb-1">Alumno</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar alumno..."
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
                />
              </div>
              
              {/* Autocomplete dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {searchResults.map(s => (
                    <div 
                      key={s.id} 
                      onClick={() => handleSelectStudent(s)}
                      className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm flex justify-between"
                    >
                      <span className="font-medium text-slate-800">{s.apellido}, {s.nombre}</span>
                      <span className="text-slate-500 text-xs">{s.curso} {s.division}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Modalidad de Asistencia</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" value="COMPLETO" checked={enrollType === 'COMPLETO'} onChange={(e) => setEnrollType(e.target.value)} className="text-blue-600" />
                  Mes Completo
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" value="ESPECIFICO" checked={enrollType === 'ESPECIFICO'} onChange={(e) => setEnrollType(e.target.value)} className="text-blue-600" />
                  Días Específicos
                </label>
              </div>
            </div>

            {enrollType === 'ESPECIFICO' && (
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p className="text-xs font-semibold text-slate-500 mb-2 uppercase">Seleccionar Días:</p>
                <div className="flex flex-wrap gap-2">
                  {WEEK_DAYS.map(day => (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => handleToggleDay(day.id)}
                      className={`px-3 py-1.5 text-sm rounded-md transition-colors border ${
                        selectedDays.includes(day.id) 
                          ? 'bg-indigo-100 border-indigo-200 text-indigo-700 font-medium' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors mt-2">
              Inscribir Alumno
            </button>
          </form>
        </div>

        {/* Lista de Inscriptos este mes */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-semibold text-slate-800">
              Alumnos Inscriptos - {getMonthName(selectedMonth)} {selectedYear}
            </h3>
          </div>
          
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 uppercase text-[11px] font-bold text-slate-500 tracking-wider">
                  <th className="px-5 py-3">Alumno</th>
                  <th className="px-5 py-3">Curso</th>
                  <th className="px-5 py-3">Modalidad</th>
                  <th className="px-5 py-3">Días Asignados</th>
                  <th className="px-5 py-3 pr-4 text-right">#</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {enrollments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-5 py-12 text-center text-slate-500">
                      No hay inscripciones para este período.
                    </td>
                  </tr>
                ) : (
                  enrollments.map(enr => {
                    const student = studentsMap[enr.studentId] || { apellido: '(Eliminado)', nombre: '', curso: '-', division: '-' };
                    return (
                      <tr key={enr.id} className="hover:bg-slate-50/50">
                        <td className="px-5 py-3 font-medium text-slate-800 text-sm">
                          {student.apellido}, {student.nombre}
                        </td>
                        <td className="px-5 py-3 text-slate-600 text-sm">
                          {student.curso} {student.division}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${enr.type === 'COMPLETO' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                            {enr.type === 'COMPLETO' ? 'Completo' : 'Parcial'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-500 text-xs">
                          {enr.type === 'COMPLETO' ? 'Lunes a Viernes' : enr.days.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}
                        </td>
                        <td className="px-5 py-3 pr-4 text-right">
                          <button onClick={() => handleDelete(enr.id)} className="text-slate-400 hover:text-red-600 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Enrollments;
