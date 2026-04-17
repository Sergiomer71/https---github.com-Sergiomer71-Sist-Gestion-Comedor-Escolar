import React, { useState, useEffect, useCallback } from 'react';
import { studentService } from '../../modules/students/studentService';
import { Search, Plus, Edit2, Trash2, X } from 'lucide-react';

const StudentsList = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    apellido: '', nombre: '', dni: '', curso: '', division: ''
  });
  const [error, setError] = useState('');

  const loadData = useCallback((query = '') => {
    setStudents(studentService.search(query));
  }, []);

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => loadData(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm, loadData]);

  const handleOpenModal = (student = null) => {
    setError('');
    if (student) {
      setEditingId(student.id);
      setFormData({
        apellido: student.apellido,
        nombre: student.nombre,
        dni: student.dni,
        curso: student.curso,
        division: student.division
      });
    } else {
      setEditingId(null);
      setFormData({ apellido: '', nombre: '', dni: '', curso: '', division: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        studentService.update(editingId, formData);
      } else {
        studentService.create(formData);
      }
      setIsModalOpen(false);
      loadData(searchTerm);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Está seguro de eliminar este alumno?')) {
      try {
        studentService.delete(id);
        loadData(searchTerm);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestión de Alumnos</h1>
          <p className="text-slate-500">Administre el padrón de alumnos del comedor.</p>
        </div>
        
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Nuevo Alumno
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Barra de búsqueda integrada estilo tabla */}
        <div className="p-4 border-b border-slate-100 flex items-center bg-slate-50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Buscar por apellido, nombre, DNI o curso..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-100 uppercase text-xs font-semibold text-slate-500 tracking-wider">
                <th className="px-6 py-4">Apellido y Nombre</th>
                <th className="px-6 py-4">DNI</th>
                <th className="px-6 py-4">Curso y Div.</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                    No se encontraron alumnos registrados.
                  </td>
                </tr>
              ) : (
                students.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{s.apellido}, {s.nombre}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{s.dni}</td>
                    <td className="px-6 py-4 text-slate-600">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {s.curso} {s.division}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex justify-end gap-2 text-right">
                      <button 
                        onClick={() => handleOpenModal(s)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(s.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal / Dialog simplificado */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">{editingId ? 'Editar Alumno' : 'Nuevo Alumno'}</h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                  <input type="text" required value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 outline-none" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Apellido</label>
                  <input type="text" required value={formData.apellido} onChange={e => setFormData({...formData, apellido: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">DNI (Solo números)</label>
                  <input type="number" required value={formData.dni} onChange={e => setFormData({...formData, dni: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 outline-none" />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Curso (Ej: 1°)</label>
                  <input type="text" required value={formData.curso} onChange={e => setFormData({...formData, curso: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 outline-none" />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">División (Ej: 2°)</label>
                  <input type="text" required value={formData.division} onChange={e => setFormData({...formData, division: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-500 outline-none" />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsList;
