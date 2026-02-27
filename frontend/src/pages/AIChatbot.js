import React, { useState, useRef, useEffect } from "react";
import "./AIChatbot.css";

const SUGGESTIONS = [
  "💰 How are my savings looking?",
  "📊 Where am I spending the most?",
  "🎯 How can I save more this month?",
  "⚠️ Am I overspending anywhere?",
];

function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = async (text) => {
    const messageText = text || input.trim();
    if (!messageText || isTyping) return;

    const userMsg = { role: "user", text: messageText };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: messageText }),
      });

      const data = await res.json();
      const aiMsg = { role: "ai", text: data.reply || "Sorry, I couldn't process that." };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "⚠️ Couldn't connect to AI. Make sure Ollama is running." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        className={`chatbot-fab ${isOpen ? "chatbot-fab--open" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        title="AI Financial Assistant"
      >
        <span className="chatbot-fab__icon">{isOpen ? "✕" : "🤖"}</span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header__left">
              <div className="chatbot-header__avatar">🧠</div>
              <div className="chatbot-header__info">
                <h4>FinanceAI Assistant</h4>
                <div className="chatbot-header__status">
                  <div className="chatbot-header__status-dot" />
                  Online · Powered by Llama3
                </div>
              </div>
            </div>
            <button
              className="chatbot-header__close"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.length === 0 ? (
              <div className="chatbot-welcome">
                <div className="chatbot-welcome__icon">💬</div>
                <h3>Ask me anything about your finances</h3>
                <p>I have access to your transaction data and can give you personalized advice.</p>
                <div className="chatbot-suggestions">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      className="chatbot-suggestion-btn"
                      onClick={() => sendMessage(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`chatbot-msg chatbot-msg--${msg.role}`}
                  >
                    <div className="chatbot-msg__avatar">
                      {msg.role === "ai" ? "🧠" : "👤"}
                    </div>
                    <div className="chatbot-msg__bubble">
                      {msg.text}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="chatbot-typing">
                    <div className="chatbot-msg__avatar" style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: "linear-gradient(135deg,#00e5a0,#00c97d)",
                      display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: "0.85rem", flexShrink: 0
                    }}>
                      🧠
                    </div>
                    <div className="chatbot-typing__bubble">
                      <div className="chatbot-typing__dot" />
                      <div className="chatbot-typing__dot" />
                      <div className="chatbot-typing__dot" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="chatbot-input-area">
            <textarea
              ref={inputRef}
              className="chatbot-input"
              placeholder="Ask about your finances..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={isTyping}
            />
            <button
              className="chatbot-send"
              onClick={() => sendMessage()}
              disabled={!input.trim() || isTyping}
            >
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default AIChatbot;
