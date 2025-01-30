import { useState } from 'react';
import axiosClient from '../axios';
import './Chatbot.css';

const Chatbot = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [error, setError] = useState(null);

    const sendMessage = async () => {
        if (input.trim() === '') return;

        const userMessage = { text: input, user: 'user' };
        setMessages([...messages, userMessage]);

        try {
            const response = await axiosClient.post('/chatbot', {
                model: "gpt-4o-mini",
                content: input
            });

            const botMessage = { text: response.data, user: 'bot' };
            setMessages([...messages, userMessage, botMessage]);
        } catch (error) {
            setError(error.response.data.message);
        }

        setInput('');
    };

    return (
        <div>
            <div>
                {messages.map((msg, index) => (
                    <div key={index} className={msg.user === 'user' ? 'user-message' : 'bot-message'}>
                        {msg.text}
                    </div>
                ))}
            </div>
            {error && <div className="error-message">{error}</div>}
            <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu mensaje..."
            />
            <button onClick={sendMessage}>Enviar</button>
        </div>
    );
};

export default Chatbot;
