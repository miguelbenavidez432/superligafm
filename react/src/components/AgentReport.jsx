/* eslint-disable react/prop-types */
/* eslint-disable react/no-unescaped-entities */
import { useState } from 'react';
import axiosClient from '../axios';

export default function AgentReport({ playerId, playerName }) {
    const [status, setStatus] = useState('idle');
    const [report, setReport] = useState('');

    const fetchReport = async () => {
        setStatus('loading');
        try {
            // Hacemos la petición a la nueva ruta de nuestro Agente
            const response = await axiosClient.get(`/agent/scout/${playerId}`);
            setReport(response.data.agent_report);
            setStatus('success');
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    return (
        <div className="mt-6 w-full">
            {/* ESTADO INICIAL: Botón para llamar al agente */}
            {status === 'idle' && (
                <button
                    onClick={fetchReport}
                    className="w-full flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 border border-slate-600 hover:border-amber-500/50 p-4 rounded-2xl font-bold tracking-wide transition-all shadow-lg"
                >
                    <span className="text-2xl">🕵️‍♂️</span>
                    Consultar a tu Agente Deportivo
                </button>
            )}

            {/* ESTADO DE CARGA: Animación mientras Gemini piensa */}
            {status === 'loading' && (
                <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[160px] relative overflow-hidden">
                    <div className="absolute inset-0 bg-slate-800/20 animate-pulse"></div>
                    <div className="w-10 h-10 border-4 border-slate-700 border-t-amber-500 rounded-full animate-spin mb-4 relative z-10"></div>
                    <p className="text-amber-500/80 font-mono text-sm uppercase tracking-widest relative z-10 animate-pulse">
                        Contactando informantes...
                    </p>
                </div>
            )}

            {/* ESTADO DE ERROR */}
            {status === 'error' && (
                <div className="bg-red-950/30 border border-red-800 rounded-2xl p-6 text-center">
                    <p className="text-black-400 font-bold">El agente no responde. Su teléfono está apagado.</p>
                    <button onClick={() => setStatus('idle')} className="mt-3 text-sm text-red-300 underline">Intentar de nuevo</button>
                </div>
            )}

            {/* ESTADO DE ÉXITO: El Dossier Confidencial */}
            {status === 'success' && (
                <div className="relative bg-[#0f172a] border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden animate-fade-in-down">

                    {/* Sello de agua confidencial */}
                    <div className="absolute -top-6 -right-6 text-slate-800/40 transform rotate-12 pointer-events-none">
                        <svg className="w-48 h-48" viewBox="0 0 100 100" fill="currentColor">
                            <text x="50" y="50" fontSize="12" fontWeight="bold" textAnchor="middle" transform="rotate(-45 50 50)">CONFIDENCIAL</text>
                        </svg>
                    </div>

                    {/* Cabecera del informe */}
                    <div className="flex items-center gap-3 border-b border-slate-700/60 pb-4 mb-4 relative z-10">
                        <div className="bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                            <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        </div>
                        <div>
                            <h3 className="text-amber-500 font-mono text-xs uppercase tracking-widest font-bold">Reporte de Ojeo</h3>
                            <h4 className="text-white font-black text-lg">Objetivo: {playerName}</h4>
                        </div>
                    </div>

                    {/* Cuerpo del mensaje */}
                    <div className="relative z-10">
                        <p className="text-slate-300 text-sm md:text-base leading-relaxed italic border-l-2 border-amber-500/50 pl-4 py-1">
                            "{report}"
                        </p>
                    </div>

                    {/* Firma */}
                    <div className="mt-6 flex justify-end relative z-10">
                        <span className="text-slate-500 font-mono text-xs uppercase tracking-widest border-t border-slate-700 pt-2">
                            - Agente Superliga
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
