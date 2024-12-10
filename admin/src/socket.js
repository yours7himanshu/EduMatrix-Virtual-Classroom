import { io } from 'socket.io-client';

// Connect to your backend server
const socket = io(import.meta.env.VITE_BACKEND_URL,{
    withCredentials: true, 
    

  },console.log('connection establised'));

export default socket;
