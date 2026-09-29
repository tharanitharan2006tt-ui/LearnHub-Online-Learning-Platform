import { useEffect, useRef, useState } from "react";
import { api } from "../services/api";
import "./Chatbot.css";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I’m your LearnHub assistant. What would you like to learn?",
    },
  ]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const messageListRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messageListRef.current?.scrollTo({
        top: messageListRef.current.scrollHeight,
        behavior: "smooth",
      });
      inputRef.current?.focus();
    }
  }, [isOpen, messages, isSending]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const text = message.trim();
    if (!text || isSending) return;

    const userMessage = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setMessage("");
    setError("");
    setIsSending(true);

    try {
      const response = await api.sendChatMessage(text);
      if (typeof response?.reply !== "string" || !response.reply.trim()) {
        throw new Error("The assistant returned an empty response. Please try again.");
      }
      setMessages((currentMessages) => [
        ...currentMessages,
        { id: crypto.randomUUID(), role: "assistant", content: response.reply },
      ]);
    } catch (requestError) {
      setError(requestError.message || "Unable to send your message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="learnhub_chatbot">
      {isOpen && (
        <section className="learnhub_chatbot_panel" aria-label="LearnHub AI assistant">
          <header className="learnhub_chatbot_header">
            <div>
              <strong>LearnHub Assistant</strong>
              <span>Here to help you learn</span>
            </div>
            <button
              type="button"
              className="learnhub_chatbot_close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chatbot"
            >
              ×
            </button>
          </header>

          <div className="learnhub_chatbot_messages" ref={messageListRef} aria-live="polite">
            {messages.map((item) => (
              <p
                className={`learnhub_chatbot_message is_${item.role}`}
                key={item.id}
              >
                {item.content}
              </p>
            ))}
            {isSending && (
              <p className="learnhub_chatbot_loading" role="status">
                Assistant is thinking…
              </p>
            )}
          </div>

          {error && (
            <p className="learnhub_chatbot_error" role="alert">
              {error}
            </p>
          )}

          <form className="learnhub_chatbot_form" onSubmit={handleSubmit}>
            <label className="learnhub_chatbot_sr_only" htmlFor="learnhub-chatbot-message">
              Your message
            </label>
            <input
              id="learnhub-chatbot-message"
              ref={inputRef}
              type="text"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Ask a learning question…"
              maxLength={4000}
              disabled={isSending}
            />
            <button type="submit" disabled={isSending || !message.trim()}>
              {isSending ? "Sending…" : "Send"}
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        className="learnhub_chatbot_launcher"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close LearnHub assistant" : "Open LearnHub assistant"}
      >
        {isOpen ? "×" : "Chat"}
      </button>
    </div>
  );
}
