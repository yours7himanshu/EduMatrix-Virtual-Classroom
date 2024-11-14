// src/socket.js
import { io } from "socket.io-client";

// Connect to your backend server
const socket = io(process.env.VITE_BACKEND_URL);

export default socket;
