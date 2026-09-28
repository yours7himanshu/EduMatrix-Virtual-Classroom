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


import { createContext, useContext } from "react";

const SocketContext = createContext(null);

export const useSocket = () => {
    return useContext(SocketContext);
};

// NOTE: Socket.IO auto-connect is intentionally disabled. The Cloudflare
// Worker backend does not implement the Engine.IO polling handshake and
// answers `/socket.io/` polling with an explicit 503, so creating a client
// here only produced endless failing polling requests (with reconnection
// retries) and placed the auth token in request URLs. Every working feature
// already runs on verified transports: LiveKit Data Channel for chat/video
// and HTTP catch-up for quizzes (see Message and other consumers, whose
// socket branches stay dormant while `socket` is null). Re-enable client
// creation here only once a supported backend transport exists.
export const SocketProvider = (props) => {
    return (
        <SocketContext.Provider value={{ socket: null }}>
            {props.children}
        </SocketContext.Provider>
    );
};
