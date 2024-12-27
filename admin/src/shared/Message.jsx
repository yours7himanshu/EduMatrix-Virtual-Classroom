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


import React, { useState, useEffect } from "react";
import socket from "../socket";
import SendIcon from "@mui/icons-material/Send";
import { TextField, IconButton } from "@mui/material";

const Message = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    // Listen for receiving the event
    socket.on("receiveMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Clean up the socket connection when the component unmounts
    return () => {
      socket.off("connect");
      socket.off("receiveMessage");
    };
  }, []);

  const sendMessage = () => {
    if (inputMessage.trim()) {
      socket.emit("sendMessage", { content: inputMessage }); // Send the message
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "You", content: inputMessage, timestamp: new Date() },
      ]); // Add the sent message to local state
      setInputMessage(""); // Clear the input field
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4 w-[30%] h-[90%] bg-gray-50  rounded-lg">
      <h1 className="text-2xl font-bold text-center text-red-600 mb-4">Live Chat</h1>
      <div className="border h-[93%] border-gray-300 rounded-md p-4  overflow-y-scroll ">
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-2 pl-3 pr-3 p-1 rounded-lg max-w-[80%] ${
                msg.sender === "You"
                  ? "ml-auto bg-violet-700 text-white text-right"
                  : "mr-auto p-1  bg-gray-200 text-gray-900 text-left"
              }`}
            >
              <strong className={msg.sender === "You" ? "block text-sm" : "block text-blue-500"}>
                {msg.sender}
              </strong>
              <span>{msg.content}</span>
              <span className="block text-xs text-gray-200">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))
        ) : (
          <p className="text-gray-500  text-center">No messages yet.</p>
        )}
      </div>
      <div className="flex items-center mt-2 gap-2">
        <TextField
          variant="outlined"
          size="small"
          className="flex-grow"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <IconButton
          type="submit"
          color="primary"
          onClick={sendMessage}
          className="focus:outline-none"
        >
          <SendIcon />
        </IconButton>
      </div>
    </div>
  );
};

export default Message;
