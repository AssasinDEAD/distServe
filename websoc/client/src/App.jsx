// src/App.jsx
import React, { useState, useEffect } from 'react';
import './App.css'; // Для кастомных стилей

function App() {
    const [ws, setWs] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [username, setUsername] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        if (isLoggedIn && username) {
            const websocket = new WebSocket('ws://localhost:8000');
            websocket.onopen = () => {
                websocket.send(JSON.stringify({ type: 'connect', username }));
            };
            websocket.onmessage = (event) => {
                const message = JSON.parse(event.data);
                setMessages(prevMessages => [...prevMessages, message]);
            };
            setWs(websocket);

            return () => {
                websocket.send(JSON.stringify({ type: 'disconnect', username }));
                websocket.close();
            };
        }
    }, [isLoggedIn, username]);

    const sendMessage = () => {
        if (ws && input) {
            ws.send(JSON.stringify({ type: 'message', username, content: input }));
            setInput("");
        }
    };

    const handleLogin = () => {
        if (username.trim()) {
            setIsLoggedIn(true);
        }
    };

    return (
        <div className="chat-container">
            {!isLoggedIn ? (
                <div className="login-container">
                    <input
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="input"
                    />
                    <button onClick={handleLogin} className="button">Join Chat</button>
                </div>
            ) : (
                <div className="chat-box">
                    <div className="messages">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`message ${msg.type === 'message' ? (msg.username === username ? 'right' : 'left') : 'notification'}`}
                            >
                                {msg.type === 'message' ? (
                                    <>
                                        <span className="username">{msg.username}:</span>
                                        <span className="content">{msg.content}</span>
                                    </>
                                ) : (
                                    <span className="notification-content">{msg.content}</span>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="input-container">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="input"
                            placeholder="Type a message..."
                        />
                        <button onClick={sendMessage} className="button">Send</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
