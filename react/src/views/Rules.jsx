/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import axiosClient from '../axios';
import { useStateContext } from '../context/ContextProvider';

// --- COMPONENTE ACORDEÓN (MODO LECTURA) ---
const AccordionSection = ({ title, icon, isOpen, onClick, content }) => {
    return (
        <div className="mb-4 bg-slate-900/70 backdrop-blur-md border border-slate-700 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:border-slate-500">
            <button
                className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-slate-800/80 transition-colors focus:outline-none group"
                onClick={onClick}
            >
                <h2 className="font-black text-lg sm:text-xl text-white flex items-center gap-3 uppercase tracking-wide">
                    <span className="text-2xl drop-shadow-md group-hover:scale-110 transition-transform">{icon}</span>
                    {title}
                </h2>
                <span className={`text-slate-400 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    ▼
                </span>
            </button>

            <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    {/* Usamos dangerouslySetInnerHTML para renderizar el HTML guardado en la BD */}
                    <div
                        className="p-6 pt-0 border-t border-slate-700/50 text-slate-300 space-y-4 text-sm sm:text-base leading-relaxed mt-4 html-content"
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                </div>
            </div>
        </div>
    );
};

export default function Rules() {
    const { user, setNotification } = useStateContext();
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openSection, setOpenSection] = useState(null);

    // Estados para el Modo Edición
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState([]);

    // Verificar si es administrador
    const isAdmin = user?.rol === 'Admin' || user?.rol === 'Organizador';

    useEffect(() => {
        fetchRules();
    }, []);

    const fetchRules = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get('/rules');
            setRules(response.data);
            setEditForm(response.data);
        } catch (error) {
            console.error("Error al cargar el reglamento", error);
            setNotification('Error al cargar el reglamento');
        } finally {
            setLoading(false);
        }
    };

    const toggleSection = (sectionId) => {
        setOpenSection(openSection === sectionId ? null : sectionId);
    };

    // Manejadores del Modo Edición
    const handleEditChange = (index, field, value) => {
        const updatedForm = [...editForm];
        updatedForm[index][field] = value;
        setEditForm(updatedForm);
    };

    const saveRules = async () => {
        try {
            await axiosClient.post('/rules/update', { rules: editForm });
            setNotification('Reglamento actualizado exitosamente');
            setRules(editForm); // Actualiza la vista de lectura
            setIsEditing(false); // Sale del modo edición
        } catch (error) {
            console.error("Error al guardar", error);
            setNotification('Ocurrió un error al guardar los cambios');
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-10 px-4 sm:px-8 animate-fade-in-down pb-20">

            {/* ENCABEZADO Y BOTÓN DE EDICIÓN */}
            <div className="relative flex flex-col items-center justify-center mb-10 bg-slate-900/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-slate-700 text-center transition-all">

                {isAdmin && (
                    <div className="absolute top-4 right-4 md:top-6 md:right-6">
                        <button
                            onClick={() => {
                                setIsEditing(!isEditing);
                                setEditForm([...rules]); // Resetear formulario a los datos originales si cancela
                            }}
                            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-lg border ${
                                isEditing
                                ? 'bg-red-900/50 text-red-400 border-red-800 hover:bg-red-800/50'
                                : 'bg-slate-800 text-blue-400 border-slate-600 hover:bg-slate-700'
                            }`}
                        >
                            {isEditing ? '❌ Cancelar Edición' : '✏️ Editar Reglamento'}
                        </button>
                    </div>
                )}

                <span className="text-5xl mb-4 drop-shadow-lg">{isEditing ? '🛠️' : '📖'}</span>
                <h1 className="font-black text-3xl sm:text-4xl text-white uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                    {isEditing ? 'Modo Edición' : 'Reglamento'}
                </h1>
                <p className="text-slate-400 mt-2 font-bold tracking-widest uppercase">
                    {isEditing ? 'Administración de la Superliga' : 'Administración de la Superliga'}
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="loader inline-block border-4 border-slate-600 border-t-blue-500 rounded-full w-12 h-12 animate-spin mb-4"></div>
                </div>
            ) : rules.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-700">
                    <p className="text-slate-400">El reglamento aún no ha sido cargado en la base de datos.</p>
                </div>
            ) : (
                <>
                    {/* MODO LECTURA (ACORDEÓN) */}
                    {!isEditing && (
                        <div>
                            {rules.map((rule) => (
                                <AccordionSection
                                    key={rule.id}
                                    title={rule.title}
                                    icon={rule.icon}
                                    isOpen={openSection === rule.id}
                                    onClick={() => toggleSection(rule.id)}
                                    content={rule.content}
                                />
                            ))}
                        </div>
                    )}

                    {/* MODO EDICIÓN (FORMULARIOS) */}
                    {isEditing && (
                        <div className="space-y-8 animate-fade-in-up">
                            {editForm.map((rule, index) => (
                                <div key={rule.id} className="bg-slate-900/80 backdrop-blur-md border border-blue-900/50 rounded-2xl shadow-xl p-6">
                                    <div className="flex gap-4 mb-4">
                                        <div className="w-20">
                                            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Icono</label>
                                            <input
                                                type="text"
                                                value={rule.icon}
                                                onChange={(e) => handleEditChange(index, 'icon', e.target.value)}
                                                className="w-full p-3 border border-slate-600 rounded-lg bg-slate-800 text-white text-center text-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Título de la Sección</label>
                                            <input
                                                type="text"
                                                value={rule.title}
                                                onChange={(e) => handleEditChange(index, 'title', e.target.value)}
                                                className="w-full p-3 border border-slate-600 rounded-lg bg-slate-800 text-white font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 flex justify-between">
                                            <span>Contenido (Soporta etiquetas HTML)</span>
                                            <span className="text-blue-400 normal-case font-normal text-xs">Puedes usar &lt;b&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;p&gt;</span>
                                        </label>
                                        <textarea
                                            value={rule.content}
                                            onChange={(e) => handleEditChange(index, 'content', e.target.value)}
                                            rows="8"
                                            className="w-full p-4 border border-slate-600 rounded-lg bg-slate-800/50 text-slate-300 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                                        />
                                    </div>
                                </div>
                            ))}

                            {/* BOTÓN FLOTANTE PARA GUARDAR */}
                            <div className="sticky bottom-6 z-50 mt-8">
                                <button
                                    onClick={saveRules}
                                    className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-black py-4 rounded-xl shadow-[0_0_20px_rgba(52,211,238,0.3)] transition-all hover:-translate-y-1 text-lg flex justify-center items-center gap-2"
                                >
                                    💾 GUARDAR REGLAMENTO
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
