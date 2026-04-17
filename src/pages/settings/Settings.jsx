import React, { useState, useEffect, useRef } from 'react';
import { exportDatabase, importDatabase, clearDatabase } from '../../utils/exportImport';
import { userService } from '../../modules/users/userService';
import { localDB } from '../../services/storage/localDB';
import { Database, Download, Upload, Users, Plus, Trash2, ShieldAlert, AlertTriangle, Image as ImageIcon, Save, X as CloseIcon } from 'lucide-react';

const Settings = () => {
  const fileInputRef = useRef(null);
  
  const [celadoras, setCeladoras] = useState([]);
  const [newCeladoraName, setNewCeladoraName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Estados para el Logo
  const [logoPreview, setLogoPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [logoStatus, setLogoStatus] = useState({ type: '', msg: '' });
  const logoInputRef = useRef(null);

  const loadCeladoras = () => {
    setCeladoras(userService.getAllCeladoras());
  };

  useEffect(() => {
    loadCeladoras();
    // Cargar logo existente
    const savedLogo = localDB.getRaw('logoInstitucion');
    if (savedLogo && savedLogo.startsWith('data:image')) {
      setLogoPreview(savedLogo);
    }
  }, []);

  const handleLogoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      setLogoStatus({ type: 'error', msg: 'Formato no válido. Use PNG o JPG.' });
      return;
    }

    // Validar tamaño (500KB)
    if (file.size > 500 * 1024) {
      setLogoStatus({ type: 'error', msg: 'La imagen supera los 500KB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoPreview(event.target.result);
      setSelectedFile(event.target.result);
      setLogoStatus({ type: '', msg: '' });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveLogo = () => {
    if (!selectedFile) return;
    
    const success = localDB.saveRaw('logoInstitucion', selectedFile);
    if (success) {
      setLogoStatus({ type: 'success', msg: 'Logo guardado correctamente.' });
      setSelectedFile(null);
    } else {
      setLogoStatus({ type: 'error', msg: 'Error al guardar el logo.' });
    }
  };

  const handleRemoveLogo = () => {
    if (window.confirm('¿Desea eliminar el logo actual?')) {
      localDB.saveRaw('logoInstitucion', '');
      setLogoPreview(null);
      setSelectedFile(null);
      setLogoStatus({ type: 'success', msg: 'Logo eliminado.' });
    }
  };

  const handleExport = () => {
    exportDatabase();
  };

  const handleImportClick = () => {
    if(window.confirm('IMPORTANTE: Importar una base de datos reemplazará todos los datos actuales del sistema. ¿Desea continuar?')) {
      fileInputRef.current.click();
    }
  };

  const handleClearData = () => {
    const firstConfirm = window.confirm('¿ESTÁ SEGURO? Esta acción ELIMINARÁ TODOS los datos del sistema (alumnos, inscripciones, asistencias y celadoras).');
    if (firstConfirm) {
      const secondConfirm = window.confirm('Esta acción no se puede deshacer. ¿Realmente desea borrar TODO y volver al estado inicial?');
      if (secondConfirm) {
        clearDatabase();
        userService.initMainAdmin();
        alert('Se han eliminado todos los datos. El sistema se reiniciará.');
        window.location.reload();
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const success = importDatabase(event.target.result);
        if (success) {
          alert('Base de datos importada correctamente. Se recargará el sistema.');
          window.location.reload();
        }
      } catch (err) {
        alert(err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const handleAddCeladora = (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      userService.createCeladora(newCeladoraName);
      setNewCeladoraName('');
      loadCeladoras();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleDeleteCeladora = (id) => {
    if(window.confirm('¿Eliminar esta celadora? Ya no podrá loguearse.')) {
      userService.deleteCeladora(id);
      loadCeladoras();
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Configuración del Sistema</h1>
          <p className="text-slate-500">Gestione usuarios del comedor y la base de datos local.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Panel Logotipo */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <ImageIcon className="text-blue-600" size={24} />
            <h2 className="text-lg font-bold text-slate-800">Logotipo de la Institución</h2>
          </div>
          
          <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
            <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 min-h-[180px] relative">
              {logoPreview && logoPreview.startsWith('data:image') ? (
                <div className="relative group flex flex-col items-center">
                  <img 
                    src={logoPreview} 
                    alt="Vista previa" 
                    className="max-h-32 max-w-full object-contain rounded-lg shadow-sm bg-white p-2"
                    onError={() => setLogoPreview(null)}
                  />
                  <button 
                    onClick={handleRemoveLogo}
                    className="mt-4 flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                  >
                    <Trash2 size={14} /> Eliminar logotipo actual
                  </button>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ImageIcon size={32} className="text-slate-300" />
                  </div>
                  <p className="text-sm font-medium text-slate-600">No hay un logotipo configurado</p>
                  <p className="text-xs text-slate-400">Formatos: PNG, JPG (Máx. 500KB)</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-3">
                <label className="text-sm font-semibold text-slate-700">Subir nueva imagen:</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => logoInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-slate-200 hover:border-blue-500 rounded-xl font-bold bg-white text-slate-700 hover:text-blue-700 transition-all shadow-sm"
                  >
                    <Upload size={20} />
                    {selectedFile ? 'Cambiar Selección' : 'Seleccionar Archivo'}
                  </button>
                  
                  {selectedFile && (
                    <button 
                      onClick={handleSaveLogo}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-100"
                    >
                      <Save size={20} /> Guardar
                    </button>
                  )}
                </div>
              </div>

              {logoStatus.msg && (
                <div className={`p-3 rounded-lg text-sm text-center font-medium ${
                  logoStatus.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'
                }`}>
                  {logoStatus.msg}
                </div>
              )}

              <input 
                type="file"
                ref={logoInputRef}
                className="hidden"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleLogoSelect}
              />
            </div>
          </div>
        </div>

        {/* Panel Celadoras */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <Users className="text-blue-600" size={24} />
            <h2 className="text-lg font-bold text-slate-800">Gestión de Celadoras</h2>
          </div>
          
          <div className="p-6 space-y-6">
            <form onSubmit={handleAddCeladora} className="flex gap-3">
              <input 
                type="text"
                placeholder="Nombre de la celadora..."
                value={newCeladoraName}
                onChange={e => setNewCeladoraName(e.target.value)}
                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
              />
              <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <Plus size={18} /> Agregar
              </button>
            </form>
            {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}

            <div className="border border-slate-100 rounded-xl overflow-hidden">
              <ul className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {celadoras.length === 0 ? (
                  <li className="p-4 text-center text-slate-500 text-sm">No hay celadoras dadas de alta.</li>
                ) : (
                  celadoras.map(c => (
                    <li key={c.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                      <span className="font-medium text-slate-700">{c.name}</span>
                      <button 
                        onClick={() => handleDeleteCeladora(c.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Panel Base de Datos */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <Database className="text-indigo-600" size={24} />
            <h2 className="text-lg font-bold text-slate-800">Base de Datos (LocalStorage)</h2>
          </div>
          
          <div className="p-6 space-y-6">
            
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
              <ShieldAlert className="text-blue-600 mt-1" size={24} />
              <p className="text-sm text-blue-900 leading-relaxed">
                Este sistema funciona <strong>completamente offline</strong>. Toda la información se guarda en su navegador actual. 
                Si necesita usar el sistema en otra computadora (o evitar perder datos al borrar el historial del navegador), 
                <strong>es vital que Exportar la base de datos periódicamente</strong>.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <button 
                onClick={handleExport}
                className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-slate-700 hover:text-blue-700 px-6 py-4 rounded-xl font-bold transition-all"
              >
                <Download size={24} />
                Exportar Base de Datos
              </button>

              <button 
                onClick={handleImportClick}
                className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 px-6 py-4 rounded-xl font-bold transition-all"
              >
                <Upload size={24} />
                Restaurar Base de Datos
              </button>

              <div className="pt-2 border-t border-slate-100">
                <button 
                  onClick={handleClearData}
                  className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 hover:border-red-600 hover:bg-red-50 text-red-500 hover:text-red-700 px-6 py-4 rounded-xl font-bold transition-all"
                >
                  <AlertTriangle size={24} />
                  Eliminar todos los datos
                </button>
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".json"
                onChange={handleFileChange}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
