// src/socket.js
import { io } from "socket.io-client";

// Connect to your backend server
const socket = io(import.meta.env.VITE_BACKEND_URL);

export default socket;
