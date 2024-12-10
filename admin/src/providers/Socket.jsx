import { createContext, useContext, useMemo } from "react";
import {io} from 'socket.io-client'

const SocketContext = createContext(null);

export const useSocket = ()=>{
    return useContext(SocketContext);
}

export const SocketProvider = (props)=>{
    const socket = useMemo(
        ()=> io(import.meta.env.VITE_BACKEND_URL),[]
    )

    return (
        <SocketContext.Provider value={{socket}} >
         {props.children}
        </SocketContext.Provider>
      )
};

