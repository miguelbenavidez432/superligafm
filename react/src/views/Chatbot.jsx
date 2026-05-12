/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect } from 'react';
import axiosClient from '../axios';

const Chatbot = () => {
    const [agent, setAgent] = useState('market');
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    // Filtros específicos para el mercado
    const [ageRange, setAgeRange] = useState({ min: 16, max: 35 });
    const [ca, setCa] = useState({ min: 120, max: 200 });
    const [pa, setPa] = useState({ min: 120, max: 200 });
    const [value, setValue] = useState({ min: 15000000, max: 300000000 });
    const [rating, setRating] = useState({ min: 0, max: 10 });

    const welcomeMessages = {
        rules: { text: "¡Hola! Soy Alvarito, el árbitro virtual. Pregúntame sobre el reglamento, sanciones o formato.", user: 'bot' },
        market: { text: "¡Hola! Soy Bend Otodo. ¿Qué tipo de fichaje rentable estamos buscando hoy?", user: 'bot' }
    };

    // Estados independientes para no mezclar los chats si el usuario cambia de pestaña
    const [chats, setChats] = useState({
        rules: [welcomeMessages.rules],
        market: [welcomeMessages.market]
    });

    const currentMessages = chats[agent];
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [currentMessages, loading, agent]);

    const handleAgentChange = (newAgent) => {
        console.log(`Cambiando agente a: ${newAgent}`);
        setAgent(newAgent);
    };

    const sendMessage = async () => {
        if (input.trim() === '') return;

        const userMessage = { text: input, user: 'user' };

        // Actualizamos el chat del agente actual
        setChats(prev => ({
            ...prev,
            [agent]: [...prev[agent], userMessage]
        }));

        const currentInput = input;
        setInput('');
        setLoading(true);

        try {
            const response = await axiosClient.post('/chatbot', {
                content: currentInput,
                agent: agent,
                filters: agent === 'market' ? { min_age: ageRange.min, max_age: ageRange.max, min_ca: ca.min, max_ca: ca.max, min_pa: pa.min, max_pa: pa.max, min_value: value.min, max_value: value.max, min_rating: rating.min, max_rating: rating.max } : {}
            });

            const botMessage = { text: response.data.message, user: 'bot' };

            setChats(prev => ({
                ...prev,
                [agent]: [...prev[agent], botMessage]
            }));

        } catch (error) {
            const errorText = error.response?.data?.message || 'Ocurrió un error de comunicación.';
            setChats(prev => ({
                ...prev,
                [agent]: [...prev[agent], { text: '❌ ' + errorText, user: 'bot', isError: true }]
            }));
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-8 animate-fade-in-down pb-20">

            {/* ENCABEZADO Y SELECTOR DE AGENTE */}
            <div className="flex flex-col items-center justify-center mb-6 bg-slate-900/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-700 text-center">

                {/* Tabs Selector */}
                <div className="flex bg-slate-950 p-1 rounded-xl mb-6 w-full max-w-md border border-slate-700">
                    <button
                        onClick={() => handleAgentChange('rules')}
                        className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm transition-all ${agent === 'rules' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        ⚖️ Abogado (Reglamento)
                    </button>
                    <button
                        onClick={() => handleAgentChange('market')}
                        className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm transition-all ${agent === 'market' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        💼 Asesor (Mercado)
                    </button>
                </div>

                <span className="text-5xl mb-4 drop-shadow-lg">{agent === 'rules' ? '🤖' : '🕵️‍♂️'}</span>
                <h1 className={`font-black text-2xl sm:text-3xl uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r ${agent === 'rules' ? 'from-blue-400 to-indigo-400' : 'from-emerald-400 to-teal-400'}`}>
                    {agent === 'rules' ? 'Asistente de Reglamento' : 'Consultor de Fichajes'}
                </h1>
                <p className="text-slate-400 mt-2 font-medium tracking-wide">
                    {agent === 'rules' ? 'Resolución de dudas y sanciones' : 'Análisis de rentabilidad y oportunidades'}
                </p>
            </div>

            {/* CAJA DE CHAT */}
            <div className={`bg-slate-900/80 backdrop-blur-md shadow-2xl rounded-2xl border flex flex-col overflow-hidden h-[600px] ${agent === 'rules' ? 'border-slate-700' : 'border-emerald-900/50'}`}>

                {/* FILTROS (Solo visibles si es el Asesor de Mercado) */}
                {agent === 'market' && (
                    <div className="bg-slate-950 p-4 border-b border-emerald-900/50">
                        <h3 className="text-emerald-500/80 text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                            Parámetros del Ojeador
                        </h3>

                        {/* 🔥 TRUCO TAILWIND: Usamos 6 columnas para darle el doble de espacio al Valor */}
                        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">

                            {/* Filtro Edad (Ocupa 1 columna) */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] text-slate-500 font-bold uppercase text-center">Edad</label>
                                <div className="flex bg-slate-900 border border-slate-700 rounded overflow-hidden">
                                    <input type="number" value={ageRange.min} onChange={e => setAgeRange({ ...ageRange, min: e.target.value })} className="w-1/2 bg-transparent text-emerald-400 text-center p-1.5 text-xs outline-none focus:bg-slate-800" placeholder="Min" />
                                    <div className="w-px bg-slate-700"></div>
                                    <input type="number" value={ageRange.max} onChange={e => setAgeRange({ ...ageRange, max: e.target.value })} className="w-1/2 bg-transparent text-emerald-400 text-center p-1.5 text-xs outline-none focus:bg-slate-800" placeholder="Max" />
                                </div>
                            </div>

                            {/* Filtro CA (Ocupa 1 columna) */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] text-slate-500 font-bold uppercase text-center">Calidad (CA)</label>
                                <div className="flex bg-slate-900 border border-slate-700 rounded overflow-hidden">
                                    <input type="number" value={ca.min} onChange={e => setCa({ ...ca, min: e.target.value })} className="w-1/2 bg-transparent text-emerald-400 text-center p-1.5 text-xs outline-none focus:bg-slate-800" placeholder="Min" />
                                    <div className="w-px bg-slate-700"></div>
                                    <input type="number" value={ca.max} onChange={e => setCa({ ...ca, max: e.target.value })} className="w-1/2 bg-transparent text-emerald-400 text-center p-1.5 text-xs outline-none focus:bg-slate-800" placeholder="Max" />
                                </div>
                            </div>

                            {/* Filtro PA (Ocupa 1 columna) */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] text-slate-500 font-bold uppercase text-center">Potencial (PA)</label>
                                <div className="flex bg-slate-900 border border-slate-700 rounded overflow-hidden">
                                    <input type="number" value={pa.min} onChange={e => setPa({ ...pa, min: e.target.value })} className="w-1/2 bg-transparent text-emerald-400 text-center p-1.5 text-xs outline-none focus:bg-slate-800" placeholder="Min" />
                                    <div className="w-px bg-slate-700"></div>
                                    <input type="number" value={pa.max} onChange={e => setPa({ ...pa, max: e.target.value })} className="w-1/2 bg-transparent text-emerald-400 text-center p-1.5 text-xs outline-none focus:bg-slate-800" placeholder="Max" />
                                </div>
                            </div>

                            {/* Filtro Valor (Ocupa 2 COLUMNAS gracias a sm:col-span-2) */}
                            <div className="flex flex-col gap-1 sm:col-span-3">
                                <label className="text-[10px] text-slate-500 font-bold uppercase text-center">Valor ($)</label>
                                <div className="flex bg-slate-900 border border-slate-700 rounded overflow-hidden">
                                    <input type="number" value={value.min} onChange={e => setValue({ ...value, min: e.target.value })} className="w-1/2 bg-transparent text-emerald-400 text-center p-1.5 text-xs outline-none focus:bg-slate-800" placeholder="Min" title="Mínimo" />
                                    <div className="w-px bg-slate-700"></div>
                                    <input type="number" value={value.max} onChange={e => setValue({ ...value, max: e.target.value })} className="w-1/2 bg-transparent text-emerald-400 text-center p-1.5 text-xs outline-none focus:bg-slate-800" placeholder="Max" title="Máximo" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ÁREA DE MENSAJES */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#0a0f1c]/50">
                    {currentMessages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.user === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl shadow-md ${msg.user === 'user'
                                ? (agent === 'rules' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-emerald-700 text-white rounded-br-sm')
                                : msg.isError
                                    ? 'bg-red-900/80 text-white rounded-bl-sm border border-red-700'
                                    : 'bg-slate-800 text-slate-200 rounded-bl-sm border border-slate-700'
                                }`}>
                                <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}

                    {/* INDICADOR DE CARGA */}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-slate-800 p-4 rounded-2xl rounded-bl-sm border border-slate-700 shadow-md flex gap-2 items-center">
                                <div className={`w-2 h-2 rounded-full animate-bounce ${agent === 'rules' ? 'bg-blue-400' : 'bg-emerald-400'}`}></div>
                                <div className={`w-2 h-2 rounded-full animate-bounce ${agent === 'rules' ? 'bg-blue-400' : 'bg-emerald-400'}`} style={{ animationDelay: '0.2s' }}></div>
                                <div className={`w-2 h-2 rounded-full animate-bounce ${agent === 'rules' ? 'bg-blue-400' : 'bg-emerald-400'}`} style={{ animationDelay: '0.4s' }}></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* ÁREA DE INPUT */}
                <div className="p-4 bg-slate-800 border-t border-slate-700 flex gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={agent === 'rules' ? "Ej: ¿Cuántos partidos es una roja?" : "Ej: Búscame un central barato..."}
                        className="flex-1 p-4 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        disabled={loading}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={loading || input.trim() === ''}
                        className={`${agent === 'rules' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-emerald-600 hover:bg-emerald-500'} text-white px-6 py-4 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
                    >
                        <span>Enviar</span>
                        <svg className="w-4 h-4 transform rotate-45 -mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                    </button>
                </div>

            </div>
        </div>
    );
};

export default Chatbot;
