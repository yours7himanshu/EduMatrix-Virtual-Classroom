
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




import { useState, useEffect, useContext, createContext, useMemo } from "react";

// Create the AuthContext
const AuthContext = createContext();

// Custom hook for consuming the AuthContext
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthContextProvider");
    }
    return context;
};

const AuthContextProvider = ({ children }) => {
    const [token, setToken] = useState("");
    
   
    
    useEffect(() => {
        const localToken = localStorage.getItem("token");
        if (localToken) {
            setToken(localToken);
        }
    }, []);


    const logout = () => {
        localStorage.removeItem("token");
        setToken("");
    };

    
    const value = useMemo(
        () => ({
            token,
            setToken,
            isAuthenticated: !!token, 
            logout,
        }),
        [token]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContextProvider;
