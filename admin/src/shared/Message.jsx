/*
Copyright 2024 Himanshu Dinkar

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "../providers/Socket";
import { MessageSquare, Send, X, AlertCircle } from "lucide-react";

/**
 * Modern In-Call & Standalone Live Chat Component.
 * - In Live Class (isDocked=true): Docks as a sleek right sidebar drawer.
 *   Controlled by isOpen / onClose. NO wandering or floating toggle icons!
 * - Standalone (/messages): Renders as a full page chat card.
 */
const Message = ({
  isOpen = true,
  onClose,
  isDocked = false,
  title = "In-Call Chat",
}) => {
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("connect", () => {
      setError("");
    });

    socket.on("receiveMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("messageError", (errorData) => {
      console.error("Message error:", errorData);
      setError(errorData.error || "Error sending message");
    });

    return () => {
      socket.off("connect");
      socket.off("receiveMessage");
      socket.off("messageError");
    };
  }, [socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (inputMessage.trim() && socket) {
      socket.emit("sendMessage", { content: inputMessage.trim() });
      setMessages((prev) => [
        ...prev,
        { sender: "You", content: inputMessage.trim(), timestamp: new Date() },
      ]);
      setInputMessage("");
      setError("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // If docked and closed, do not render anything (NO floating icons across screen!)
  if (isDocked && !isOpen) {
    return null;
  }

  const chatContent = (
    <div className="flex flex-col h-full w-full text-white antialiased select-none">
      {/* Drawer Header */}
      <div
        className="flex-shrink-0 px-5 py-4 flex items-center justify-between border-b"
        style={{
          background: "rgba(13, 18, 41, 0.95)",
          borderColor: "rgba(99, 102, 241, 0.18)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">{title}</h3>
            <p className="text-[11px] text-slate-400">Visible to everyone in call</p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            style={{
              background: "rgba(99, 102, 241, 0.1)",
              border: "1px solid rgba(99, 102, 241, 0.15)",
            }}
            title="Close chat"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div
          className="flex-shrink-0 mx-4 mt-3 p-2.5 rounded-xl text-xs flex items-center gap-2"
          style={{
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            color: "#fca5a5",
          }}
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
          <span className="truncate">{error}</span>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(99, 102, 241, 0.2) transparent",
        }}
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-slate-500">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto"
              style={{
                background: "rgba(99, 102, 241, 0.08)",
                border: "1px solid rgba(99, 102, 241, 0.15)",
              }}
            >
              <MessageSquare className="w-6 h-6 text-indigo-400" />
            </div>
            <p className="text-xs font-semibold text-slate-300">No messages yet</p>
            <p className="text-[11px] text-slate-500 max-w-[200px]">
              Send a message to start the classroom conversation.
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.sender === "You";
            return (
              <div
                key={idx}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                {!isMe && (
                  <span className="text-[10px] font-bold text-indigo-400 mb-1 px-1">
                    {msg.sender || "Participant"}
                  </span>
                )}
                <div
                  className={`px-3.5 py-2 rounded-2xl text-xs max-w-[85%] break-words shadow-sm ${
                    isMe
                      ? "rounded-tr-sm text-white"
                      : "rounded-tl-sm text-slate-200"
                  }`}
                  style={{
                    background: isMe
                      ? "linear-gradient(135deg, #6366f1, #7c3aed)"
                      : "rgba(30, 37, 64, 0.9)",
                    border: isMe
                      ? "1px solid rgba(139, 92, 246, 0.4)"
                      : "1px solid rgba(99, 102, 241, 0.18)",
                  }}
                >
                  <p className="leading-relaxed">{msg.content}</p>
                  <p
                    className={`text-[9px] mt-1 text-right ${
                      isMe ? "text-indigo-200" : "text-slate-400"
                    }`}
                  >
                    {formatTime(msg.timestamp || new Date())}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={sendMessage}
        className="flex-shrink-0 p-3 border-t flex items-center gap-2"
        style={{
          background: "rgba(13, 18, 41, 0.95)",
          borderColor: "rgba(99, 102, 241, 0.15)",
        }}
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Send a message..."
          className="flex-1 px-3.5 py-2.5 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
          style={{
            background: "rgba(99, 102, 241, 0.08)",
            border: "1px solid rgba(99, 102, 241, 0.2)",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "rgba(99, 102, 241, 0.5)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "rgba(99, 102, 241, 0.2)";
          }}
        />
        <button
          type="submit"
          disabled={!inputMessage.trim()}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-40 hover:opacity-90 flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          title="Send"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );

  // If docked inside live classroom: slide-in drawer anchored cleanly to the right
  if (isDocked) {
    return (
      <div
        className="fixed top-0 bottom-0 right-0 w-full sm:w-88 md:w-96 z-50 flex flex-col shadow-2xl transition-transform duration-300"
        style={{
          background: "rgba(13, 18, 41, 0.97)",
          backdropFilter: "blur(20px)",
          borderLeft: "1px solid rgba(99, 102, 241, 0.2)",
          boxShadow: "-10px 0 40px rgba(0, 0, 0, 0.6)",
        }}
      >
        {chatContent}
      </div>
    );
  }

  // Standalone mode for /messages route
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4"
      style={{ background: "#0a0f1e" }}
    >
      <div
        className="w-full max-w-lg h-[650px] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        style={{
          background: "#0d1229",
          border: "1px solid rgba(99, 102, 241, 0.2)",
        }}
      >
        {chatContent}
      </div>
    </div>
  );
};

export default Message;
