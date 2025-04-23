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


import { createContext, useContext, useMemo } from "react";
import {io} from 'socket.io-client'

// Retrieve auth token from storage
const getAuthToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');

const SocketContext = createContext(null);

export const useSocket = ()=>{
    return useContext(SocketContext);
}

export const SocketProvider = (props)=>{
    const socket = useMemo(() => {
        const s = io(import.meta.env.VITE_BACKEND_URL, {
            withCredentials: true,
            auth: { token: getAuthToken() },
            query: { token: getAuthToken() },
        });
        // Connection status logs
        s.on('connect', () => console.log('Socket connected with ID:', s.id));
        s.on('connect_error', (error) => console.error('Socket connection error:', error.message));
        return s;
    }, []);

    return (
        <SocketContext.Provider value={{socket}} >
         {props.children}
        </SocketContext.Provider>
      )
};
