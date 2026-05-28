import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { send } from "@emailjs/browser";

export default function OnePieceChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "crew",
      text: "Ahoy! I'm D.Shaurya's AI assistant ⚓ Ask me about projects, skills, achievements, or leave a message for the captain."
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    const updatedMessages = [
      ...messages,
      { sender: "user", text: userMessage }
    ];

    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    const chatTranscript = updatedMessages
      .map((msg) => `${msg.sender === "user" ? "Visitor" : "D.Shaurya AI"}: ${msg.text}`)
      .join("\n");

    try {
      await send(
        "service_qeqrp17",
        "template_bu4ag6c",
        { message: `--- NEW PORTFOLIO CONVERSATION ---\n\n${chatTranscript}` },
        { publicKey: "O2S5xMpkI3xI90ysE" }
      );

      const systemPrompt = `You are the AI assistant of D.Shaurya.
You speak like a smart and friendly One Piece crew assistant.
Tone: cinematic, adventurous, confident, short responses.

Conversation:
${chatTranscript}

D.Shaurya AI:`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyB7_etrxbKQ2Y8Hretn9zQXPfWpkrzxb-c`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }]
          })
        }
      );

      const data = await response.json();
      const aiReply =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "The Grand Line seas are choppy right now... Try throwing another line.";

      setMessages((prev) => [...prev, { sender: "crew", text: aiReply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: "crew", text: "Den Den Mushi connection lost ⚓" }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "30px",
        right: "30px",
        zIndex: 999999,
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "flex-end"
      }}
    >
      {/* ================= CHAT WINDOW ================= */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", damping: 24, stiffness: 280 }}
            style={{
              width: "385px",
              height: "580px",
              maxHeight: "80vh",
              position: "absolute",
              bottom: 0,
              right: 0,
              overflow: "hidden",
              borderRadius: "24px",
              background: "linear-gradient(180deg, #FAF6EE 0%, #F3EAD3 100%)",
              border: "2px solid #5C3A1F",
              boxShadow: "0 20px 50px rgba(44, 27, 14, 0.15), 0 4px 12px rgba(0,0,0,0.05)",
              display: "flex",
              flexDirection: "column"
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: "radial-gradient(rgba(92,58,31,0.02) 1.5px, transparent 1.5px)",
                backgroundSize: "8px 8px",
                pointerEvents: "none",
                zIndex: 1
              }}
            />

            {/* HEADER */}
            <div
              style={{
                padding: "20px 24px",
                background: "rgba(255, 255, 255, 0.35)",
                backdropFilter: "blur(8px)",
                borderBottom: "1px solid rgba(92,58,31,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                position: "relative",
                zIndex: 2
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ position: "relative", display: "flex" }}>
                  <img
                    src="image.png" 
                    alt="Luffy Sticker"
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "12px",
                      objectFit: "cover",
                      border: "1.5px solid #5C3A1F",
                      background: "#FFF"
                    }}
                  />
                  <span style={{ position: "absolute", bottom: "-3px", right: "-3px", fontSize: "10px" }}>🍖</span>
                </div>
                <div>
                  <div style={{ fontFamily: "'Cinzel', serif", fontSize: "1.15rem", color: "#3A2213", fontWeight: 700, letterSpacing: "0.5px" }}>
                    D.Shaurya
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#8A715E", display: "flex", alignItems: "center", gap: "5px" }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4BAF67", display: "inline-block" }} />
                    Online on the Sunny
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ opacity: 0.8, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#5C3A1F",
                  cursor: "pointer",
                  fontSize: "1.1rem",
                  padding: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                ✕
              </motion.button>
            </div>

            {/* MESSAGES LAYER */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                zIndex: 2
              }}
              className="scrollbar"
            >
              {messages.map((msg, index) => {
                const isUser = msg.sender === "user";
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}
                  >
                    <div
                      style={{
                        maxWidth: "80%",
                        padding: "12px 16px",
                        borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                        background: isUser ? "#4A2E1B" : "rgba(255, 255, 255, 0.65)",
                        color: isUser ? "#FFF0DC" : "#2C1B0E",
                        border: isUser ? "none" : "1px solid rgba(92,58,31,0.08)",
                        lineHeight: 1.5,
                        fontSize: "0.92rem",
                        boxShadow: isUser ? "0 4px 12px rgba(74,46,27,0.15)" : "0 4px 12px rgba(0,0,0,0.02)",
                        wordBreak: "break-word"
                      }}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                );
              })}

              {isTyping && (
                <div style={{ display: "flex", gap: "5px", marginLeft: "4px", padding: "4px 0" }}>
                  {[0, 1, 2].map((dot) => (
                    <motion.div
                      key={dot}
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.9, delay: dot * 0.15, ease: "easeInOut" }}
                      style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#8A715E" }}
                    />
                  ))}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* INPUT PANEL */}
            <form 
              onSubmit={handleSend} 
              style={{ 
                padding: "20px 24px", 
                background: "rgba(255, 255, 255, 0.2)", 
                borderTop: "1px solid rgba(92,58,31,0.08)",
                zIndex: 2 
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "#FFFFFF",
                  border: "1.5px solid rgba(92,58,31,0.15)",
                  borderRadius: "14px",
                  padding: "4px 6px 4.5px 14px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
                }}
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  disabled={isTyping}
                  style={{
                    flex: 1,
                    border: "none",
                    background: "transparent",
                    outline: "none",
                    color: "#2C1B0E",
                    fontSize: "0.92rem",
                    paddingRight: "8px"
                  }}
                />

                <motion.button
                  whileHover={{ scale: input.trim() && !isTyping ? 1.03 : 1 }}
                  whileTap={{ scale: input.trim() && !isTyping ? 0.97 : 1 }}
                  type="submit"
                  disabled={isTyping || !input.trim()}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    border: "none",
                    background: input.trim() && !isTyping ? "#4A2E1B" : "#D5CABD",
                    color: "#FFF",
                    cursor: input.trim() && !isTyping ? "pointer" : "default",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background-color 0.2s ease",
                    fontSize: "0.9rem"
                  }}
                >
                  ➤
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= PURE IMAGE TOGGLE TRIGGER ================= */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            style={{
              width: "70px", // Size of your fruit
              height: "70px",
              cursor: "pointer",
              zIndex: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <img
              src="/image 53.png"
              alt="Open Chat"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                // Adds a soft shadow behind the actual shape of the fruit, not a box
                filter: "drop-shadow(0px 8px 16px rgba(0,0,0,0.3))" 
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <style>
        {`
          .scrollbar::-webkit-scrollbar {
            width: 5px;
          }
          .scrollbar::-webkit-scrollbar-thumb {
            background: rgba(92, 58, 31, 0.15);
            border-radius: 10px;
          }
          .scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
        `}
      </style>
    </div>
  );
}