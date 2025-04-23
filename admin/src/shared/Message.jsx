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
import SendIcon from "@mui/icons-material/Send";
import { TextField, IconButton, Paper, Typography, Divider } from "@mui/material";
import { div } from "@tensorflow/tfjs";
import {MessageSquare} from "lucide-react";

const Message = () => {
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const [toggleChat,setToggleChat]=useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      setError("");
    });

    socket.on("receiveMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
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
  }, []);

  const hideChat = (e)=>{
    e.preventDefault();
    setToggleChat((prev)=>!prev);
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (inputMessage.trim()) {
      socket.emit("sendMessage", { content: inputMessage });
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "You", content: inputMessage, timestamp: new Date() },
      ]);
      setInputMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      {toggleChat ? <MessageSquare onClick={hideChat} className="absolute border h-16 w-16 rounded-full p-2 left-[50%] top-[77%] text-white bg-gradient-to-tr from-pink-700 to bg-indigo-600 font-bold cursor-pointer  z-99"/ >: 
        <Paper elevation={3} className="max-w-lg mx-auto  p-4 h-screen overflow-hidden w-[350px]  bg-white   flex flex-col">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-3  -mt-4 -mx-4 mb-3">
        <Typography variant="h5" className="font-bold text-center flex justify-between text-white">
          Live Chat
          <button cl onClick={hideChat} className=" h-10 w-10 rounded-md bg-red-700 border" >x</button>
        </Typography>
      </div>
      
      <Divider className="mb-3" />
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-3 text-sm">
          {error}
        </div>
      )}
      
      <div className="flex-grow border border-gray-200 rounded-md p-3 overflow-y-auto bg-gray-50 custom-scrollbar">
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-3 ${
                msg.sender === "You" ? "flex justify-end" : "flex justify-start"
              }`}
            >
              <div
                className={`px-3 py-2 text-sm rounded-md max-w-[100%] shadow-sm  ${
                  msg.sender === "You"
                    ? "bg-indigo-600 text-white"
                    : "bg-white border border-gray-200 text-gray-800"
                }`}
              >
                <div className={`text-xs font-medium  ${msg.sender === "You" ? "text-indigo-200" : "text-blue-600"}`}>
                  {msg.sender}
                </div>
                <div className="text-sm">{msg.content}</div>
                <div className={`text-xs mt-1 text-right ${msg.sender === "You" ? "text-indigo-200" : "text-gray-500"}`}>
                  {formatTime(msg.timestamp)}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="h-full flex items-center justify-center">
            <Typography variant="body2" className="text-gray-500 italic">
              No messages yet. Start the conversation!
            </Typography>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="flex items-center mt-3 gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
        <TextField
          variant="outlined"
          size="small"
          fullWidth
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="bg-white rounded-md"
          sx={{
            '& fieldset': { borderColor: 'rgb(209, 213, 219)' },
            '&:hover fieldset': { borderColor: 'rgb(79, 70, 229) !important' }
          }}
        />
        <IconButton
          color="primary"
          onClick={sendMessage}
          disabled={!inputMessage.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-2"
          sx={{ 
            backgroundColor: 'rgb(79, 70, 229)',
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgb(67, 56, 202)',
            },
            '&.Mui-disabled': {
              backgroundColor: 'rgb(229, 231, 235)',
              color: 'rgb(156, 163, 175)'
            }
          }}
        >
          <SendIcon />
        </IconButton>
      </div>
    </Paper>
}
    </div>
  );
};

export default Message;
