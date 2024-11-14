import React, { useEffect, useState } from "react";
import socket from "../socket";

const JoinLecture = ({ lectureId }) => {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        socket.emit("joinLecture", lectureId);

        // Listen for messages from the server
        socket.on("receiveMessage", (data) => {
            setMessages((prevMessages) => [...prevMessages, data]);
        });

        return () => {
            socket.off("receiveMessage");
        };
    }, [lectureId]);

    const handleSendMessage = () => {
        const chatData = {
            userId: "ClientUser", // Replace with actual user ID
            message,
            lectureId,
        };
        socket.emit("sendMessage", chatData); // Send message to server
        setMessage(""); // Clear input field
    };

    return (
        <div className="flex flex-col items-center bg-gray-100 p-4 rounded-lg shadow-md max-w-lg mx-auto">
            <div className="w-full bg-white p-4 rounded-lg shadow-sm mb-4 overflow-y-auto max-h-96">
                {/* Displaying messages */}
                {messages.map((msg, index) => (
                    <div key={index} className="flex flex-col mb-2">
                        <span className="font-semibold text-sm text-blue-600">{msg.userId}</span>
                        <p className="text-gray-800 text-sm">{msg.message}</p>
                    </div>
                ))}
            </div>

            <div className="flex w-full space-x-2">
                {/* Message input field */}
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Send button */}
                <button
                    onClick={handleSendMessage}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default JoinLecture;
