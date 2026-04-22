import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { studentService } from '../../modules/students/studentService';
import { attendanceService } from '../../modules/attendance/attendanceService';
import { getCurrentDate, formatDateDisplay, getMonthName } from '../../utils/dateUtils';
import { FileDown, Calendar, Users, BarChart } from 'lucide-react';

const ReportsPanel = () => {
  const [selectedReport, setSelectedReport] = useState('daily');
  const [reportDate, setReportDate] = useState(getCurrentDate());
  
  const currentMonth = new Date().getMonth() + 1;
  const [reportMonth, setReportMonth] = useState(currentMonth);

  const generatePDF = (title, columns, body, filename) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Comedor Escolar - ${title}`, 14, 22);
    doc.setFontSize(10);
    doc.text(`Fecha de Impresión: ${formatDateDisplay(getCurrentDate())}`, 14, 30);
    
    autoTable(doc, {
      startY: 36,
      head: [columns],
      body: body,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }
    });

    doc.save(filename);
  };

  const generateDailyReport = () => {
    const attendances = attendanceService.getByDate(reportDate);
    const studentsMap = {};
    studentService.getAll().forEach(s => studentsMap[s.id] = s);

    const body = attendances.map(a => {
      const s = studentsMap[a.studentId];
      if (!s) return null;
      return [
        formatDateDisplay(a.date),
        `${s.apellido}, ${s.nombre}`,
        `${s.curso} ${s.division}`,
        a.status.toUpperCase(),
        a.celadoraName || 'Admin'
      ];
    }).filter(Boolean);

    generatePDF(
      'Reporte Diario de Asistencia',
      ['Fecha', 'Alumno', 'Curso', 'Estado', 'Celadora'],
      body,
      `reporte_diario_${reportDate}.pdf`
    );
  };

  const generateMonthlyReport = () => {
    const allAttendance = attendanceService.getAll();
    const students = studentService.getAll();
    
    // Filtrar fichadas del mes solicitado
    const targetMonthStr = reportMonth < 10 ? `0${reportMonth}` : `${reportMonth}`;
    // Buscamos "-MM-" en la fecha ISO
    const monthlyAtt = allAttendance.filter(a => a.date.includes(`-${targetMonthStr}-`));

    // Agrupar
    const countMap = {};
    monthlyAtt.forEach(a => {
      if (a.status === 'presente') {
        countMap[a.studentId] = (countMap[a.studentId] || 0) + 1;
      }
    });

    const body = students.map(s => {
      const asistencias = countMap[s.id] || 0;
      if (asistencias === 0) return null; // Solo mostrar si asistió alguna vez? (Opcional, pero para limpiar pdf)
      return [
        `${s.apellido}, ${s.nombre}`,
        `${s.curso} ${s.division}`,
        asistencias.toString()
      ];
    }).filter(Boolean);

    generatePDF(
      `Reporte Por Mes - ${getMonthName(reportMonth)}`,
      ['Alumno', 'Curso', 'Total Asistencias'],
      body,
      `reporte_mes_${reportMonth}.pdf`
    );
  };

  const generateCourseReport = () => {
    const students = studentService.getAll();
    
    // Agrupar alumnos por curso
    const courseMap = {};
    students.forEach(s => {
      courseMap[s.curso] = (courseMap[s.curso] || 0) + 1;
    });

    const body = Object.entries(courseMap).map(([curso, total]) => [
      curso,
      total.toString()
    ]);

    generatePDF(
      'Reporte General por Cursos',
      ['Curso', 'Cantidad de Alumnos (Padrón)'],
      body,
      'reporte_cursos.pdf'
    );
  };

  const handleDownload = () => {
    try {
      if (selectedReport === 'daily') generateDailyReport();
      else if (selectedReport === 'monthly') generateMonthlyReport();
      else if (selectedReport === 'course') generateCourseReport();
    } catch (e) {
      alert('Hubo un error al generar el PDF: ' + e.message);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Generación de Reportes</h1>
          <p className="text-slate-500">Descargue informes de asistencia y alumnos en PDF.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          <div 
            onClick={() => setSelectedReport('daily')}
            className={`border-2 rounded-2xl p-6 cursor-pointer transition-all ${selectedReport === 'daily' ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 hover:border-slate-300 bg-white'}`}
          >
            <Calendar className={`mb-4 ${selectedReport === 'daily' ? 'text-blue-600' : 'text-slate-400'}`} size={32} />
            <h3 className={`font-semibold ${selectedReport === 'daily' ? 'text-blue-900' : 'text-slate-700'}`}>Diario</h3>
            <p className="text-sm text-slate-500 mt-1">Listado de fichadas por un día particular.</p>
          </div>

          <div 
            onClick={() => setSelectedReport('monthly')}
            className={`border-2 rounded-2xl p-6 cursor-pointer transition-all ${selectedReport === 'monthly' ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-100 hover:border-slate-300 bg-white'}`}
          >
            <BarChart className={`mb-4 ${selectedReport === 'monthly' ? 'text-indigo-600' : 'text-slate-400'}`} size={32} />
            <h3 className={`font-semibold ${selectedReport === 'monthly' ? 'text-indigo-900' : 'text-slate-700'}`}>Por Mes</h3>
            <p className="text-sm text-slate-500 mt-1">Total acumulado de asistencia de cada alumno en el mes.</p>
          </div>

          <div 
            onClick={() => setSelectedReport('course')}
            className={`border-2 rounded-2xl p-6 cursor-pointer transition-all ${selectedReport === 'course' ? 'border-purple-500 bg-purple-50/50' : 'border-slate-100 hover:border-slate-300 bg-white'}`}
          >
            <Users className={`mb-4 ${selectedReport === 'course' ? 'text-purple-600' : 'text-slate-400'}`} size={32} />
            <h3 className={`font-semibold ${selectedReport === 'course' ? 'text-purple-900' : 'text-slate-700'}`}>Por Cursos</h3>
            <p className="text-sm text-slate-500 mt-1">Total de alumnos empadronados por curso.</p>
          </div>

        </div>

        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <h4 className="font-medium text-slate-700 mb-4">Parámetros del Reporte</h4>
          
          <div className="flex gap-4">
            {selectedReport === 'daily' && (
              <div className="w-full max-w-xs">
                <label className="block text-sm text-slate-600 mb-1">Seleccionar Fecha</label>
                <input 
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                />
              </div>
            )}

            {selectedReport === 'monthly' && (
              <div className="w-full max-w-xs">
                <label className="block text-sm text-slate-600 mb-1">Seleccionar Mes</label>
                <select 
                  value={reportMonth}
                  onChange={(e) => setReportMonth(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                >
                  {[...Array(12).keys()].map(i => (
                    <option key={i+1} value={i+1}>{getMonthName(i+1)}</option>
                  ))}
                </select>
              </div>
            )}

            {selectedReport === 'course' && (
              <div className="w-full max-w-xs">
                <p className="text-sm text-slate-500 py-2">Este reporte no requiere parámetros extra.</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button 
            onClick={handleDownload}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <FileDown size={20} />
            Descargar PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportsPanel;
