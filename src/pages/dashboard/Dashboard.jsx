import React, { useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { Users, UserCheck, Calendar } from 'lucide-react';
import { studentService } from '../../modules/students/studentService';
import { attendanceService } from '../../modules/attendance/attendanceService';
import { getCurrentDate, getMonthName } from '../../utils/dateUtils';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
  const currentDate = getCurrentDate();
  const currentMonth = new Date().getMonth() + 1; // 1-12
  const currentYear = new Date().getFullYear();

  const metrics = useMemo(() => {
    const students = studentService.getAll();
    const attendanceToday = attendanceService.getByDate(currentDate);
    
    // Estadísticas
    const totalStudents = students.length;
    const presentToday = attendanceToday.filter(a => a.status === 'presente').length;
    
    // Distribución por cursos
    const cursoCount = {};
    students.forEach(s => {
      cursoCount[s.curso] = (cursoCount[s.curso] || 0) + 1;
    });

    return { totalStudents, presentToday, cursoCount };
  }, [currentDate]);

  const barChartData = {
    labels: Object.keys(metrics.cursoCount),
    datasets: [
      {
        label: 'Alumnos por Curso',
        data: Object.values(metrics.cursoCount),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      }
    ]
  };

  const pieChartData = {
    labels: ['Presentes', 'Ausentes/No registrados'],
    datasets: [
      {
        data: [metrics.presentToday, Math.max(0, metrics.totalStudents - metrics.presentToday)],
        backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(239, 68, 68, 0.8)'],
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Panel Principal</h1>
          <p className="text-slate-500">Resumen del estado del comedor</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 flex items-center shadow-blue-500/5">
          <div className="bg-blue-100 p-4 rounded-xl mr-4">
            <Users className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Total Alumnos</p>
            <p className="text-2xl font-bold text-slate-800">{metrics.totalStudents}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 flex items-center">
          <div className="bg-green-100 p-4 rounded-xl mr-4">
            <UserCheck className="text-green-600" size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Asistencia Hoy</p>
            <p className="text-2xl font-bold text-slate-800">{metrics.presentToday}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 flex items-center">
          <div className="bg-purple-100 p-4 rounded-xl mr-4">
            <Calendar className="text-purple-600" size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Mes Actual</p>
            <p className="text-xl font-bold text-slate-800 capitalize">{getMonthName(currentMonth)} {currentYear}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 h-80">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Distribución por Curso</h3>
          {Object.keys(metrics.cursoCount).length > 0 ? (
            <div className="h-[230px]">
              <Bar data={barChartData} options={chartOptions} />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">No hay datos suficientes</div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 h-80">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Asistencia Hoy</h3>
          {metrics.totalStudents > 0 ? (
            <div className="h-[230px]">
              <Pie data={pieChartData} options={chartOptions} />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">No hay alumnos registrados</div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
