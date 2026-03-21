import { useState, useRef, useEffect } from 'react';
import axiosClient from '../axios';

const Chatbot = () => {
    // Iniciamos con un mensaje de bienvenida por defecto
    const [messages, setMessages] = useState([
        { text: "¡Hola! Soy Alvarito, el asistente virtual de la Superliga. Pregúntame lo que necesites sobre el reglamento (sanciones, formato, mercado, etc).", user: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto-scroll hacia abajo cuando hay nuevos mensajes
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const sendMessage = async () => {
        if (input.trim() === '') return;

        const userMessage = { text: input, user: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await axiosClient.post('/chatbot', {
                content: userMessage.text
            });

            const botMessage = { text: response.data.message, user: 'bot' };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            const errorText = error.response?.data?.message || 'Ocurrió un error al consultar el reglamento.';
            setMessages(prev => [...prev, { text: '❌ ' + errorText, user: 'bot', isError: true }]);
        } finally {
            setLoading(false);
        }
    };

    // Permitir enviar con la tecla Enter
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-8 animate-fade-in-down pb-20">

            {/* ENCABEZADO */}
            <div className="flex flex-col items-center justify-center mb-6 bg-slate-900/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-700 text-center">
                <span className="text-5xl mb-4 drop-shadow-lg">🤖</span>
                <h1 className="font-black text-2xl sm:text-3xl text-white uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                    Asistente de Reglamento
                </h1>
                <p className="text-slate-400 mt-2 font-medium tracking-wide">Resolución de dudas en tiempo real</p>
            </div>

            {/* CAJA DE CHAT */}
            <div className="bg-slate-900/80 backdrop-blur-md shadow-2xl rounded-2xl border border-slate-700 flex flex-col overflow-hidden h-[600px]">

                {/* ÁREA DE MENSAJES */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#0a0f1c]/50">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.user === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl shadow-md ${
                                msg.user === 'user'
                                    ? 'bg-blue-600 text-white rounded-br-sm'
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
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
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
                        placeholder="Ej: ¿Cuántos partidos de sanción es una roja directa?"
                        className="flex-1 p-4 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        disabled={loading}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={loading || input.trim() === ''}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-4 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
