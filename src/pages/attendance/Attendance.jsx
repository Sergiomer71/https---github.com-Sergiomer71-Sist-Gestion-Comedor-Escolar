import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../core/contexts/AuthContext';
import { studentService } from '../../modules/students/studentService';
import { enrollmentService } from '../../modules/enrollments/enrollmentService';
import { attendanceService } from '../../modules/attendance/attendanceService';
import { getCurrentDate, formatDateDisplay } from '../../utils/dateUtils';
import { WEEK_DAYS } from '../../core/config/constants';
import { CheckCircle, XCircle } from 'lucide-react';

const Attendance = () => {
  const { currentUser } = useAuth();
  const currentDate = getCurrentDate();
  
  const [studentsForToday, setStudentsForToday] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = () => {
    // Determinar día de la semana actual
    const jsDate = new Date(); // Usa hora local
    let dayIndex = jsDate.getDay(); // 0 (Dom) - 6 (Sab)
    
    // Si es fin de semana, no hay comedor normalmente, pero para pruebas mostraremos algo o avisaremos
    let todayStr = '';
    if (dayIndex >= 1 && dayIndex <= 5) {
      todayStr = WEEK_DAYS[dayIndex - 1].id;
    }

    const currentMonth = jsDate.getMonth() + 1;
    const currentYear = jsDate.getFullYear();

    // Inscripciones vigentes
    const enrollments = enrollmentService.getByMonth(currentMonth, currentYear);
    
    // Filtrar los que les toca asistir hoy
    let enrolledToday = [];
    if (todayStr) {
      enrolledToday = enrollments.filter(e => e.type === 'COMPLETO' || e.days.includes(todayStr));
    }

    // Obtener los datos de los alumnos y ordenar
    const studentsMap = {};
    studentService.getAll().forEach(s => studentsMap[s.id] = s);

    const listToRender = enrolledToday.map(e => studentsMap[e.studentId]).filter(Boolean);
    // Ordenar alfabéticamente
    listToRender.sort((a,b) => a.apellido.localeCompare(b.apellido));

    setStudentsForToday(listToRender);
    setAttendanceRecords(attendanceService.getByDate(currentDate));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMark = (studentId, status) => {
    attendanceService.markAttendance({
      studentId,
      date: currentDate,
      status: status,
      celadoraName: currentUser.name
    });
    // Refrescar solo las fichadas en lugar de recalcular todo para mejor performance
    setAttendanceRecords(attendanceService.getByDate(currentDate));
  };

  // Convertimos las fichadas en un map para acceso rápido
  const attendanceMap = useMemo(() => {
    const map = {};
    attendanceRecords.forEach(a => map[a.studentId] = a.status);
    return map;
  }, [attendanceRecords]);

  // Filtrado
  const filteredStudents = useMemo(() => {
    if (!searchQuery) return studentsForToday;
    const q = searchQuery.toLowerCase();
    return studentsForToday.filter(s => 
      s.apellido.toLowerCase().includes(q) || 
      s.nombre.toLowerCase().includes(q) ||
      s.curso.toLowerCase().includes(q)
    );
  }, [studentsForToday, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Fichaje Diario</h1>
          <p className="text-slate-500">Celadora: <span className="font-semibold text-blue-600">{currentUser.name}</span></p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">Fecha Actual</p>
          <p className="text-xl font-bold text-slate-800">{formatDateDisplay(currentDate)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50">
          <input 
            type="text"
            placeholder="Buscar alumno en la lista de hoy..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-96 px-4 py-2 bg-white border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
          />
          <div className="text-sm font-medium text-slate-500">
            Total del día: {studentsForToday.length} | 
            Presentes: {attendanceRecords.filter(a => a.status === 'presente').length}
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 uppercase text-[11px] font-bold text-slate-500 tracking-wider">
                <th className="px-5 py-3">Alumno</th>
                <th className="px-5 py-3">Curso / Div.</th>
                <th className="px-5 py-3 text-center">Estado</th>
                <th className="px-5 py-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-5 py-12 text-center text-slate-500">
                    No hay alumnos para mostrar o es fin de semana.
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => {
                  const status = attendanceMap[student.id] || 'pendiente';
                  
                  return (
                    <tr key={student.id} className={`transition-colors ${status === 'presente' ? 'bg-green-50/30' : status === 'ausente' ? 'bg-red-50/30' : 'hover:bg-slate-50'}`}>
                      <td className="px-5 py-4 font-medium text-slate-800 text-sm">
                        {student.apellido}, {student.nombre}
                      </td>
                      <td className="px-5 py-4 text-slate-600 text-sm">
                        {student.curso} {student.division}
                      </td>
                      <td className="px-5 py-4 text-center">
                        {status === 'presente' ? (
                          <span className="inline-flex px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Presente</span>
                        ) : status === 'ausente' ? (
                          <span className="inline-flex px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Ausente</span>
                        ) : (
                          <span className="inline-flex px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold w-[73px] justify-center">-</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => handleMark(student.id, 'presente')}
                            className={`p-2 rounded-lg transition-all ${status === 'presente' ? 'bg-green-500 text-white shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-green-100 hover:text-green-600'}`}
                            title="Presente"
                          >
                            <CheckCircle size={20} />
                          </button>
                          <button 
                            onClick={() => handleMark(student.id, 'ausente')}
                            className={`p-2 rounded-lg transition-all ${status === 'ausente' ? 'bg-red-500 text-white shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-red-100 hover:text-red-600'}`}
                            title="Ausente"
                          >
                            <XCircle size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
