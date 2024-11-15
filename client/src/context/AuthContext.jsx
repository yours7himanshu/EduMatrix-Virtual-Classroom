import { useState, useEffect, createContext, useMemo } from "react";

export const AuthContext = createContext();

const AuthContextProvider = ({ children }) => {
    const [token, setToken] = useState("");

    // Check for token in localStorage on mount
    useEffect(() => {
        const localToken = localStorage.getItem("token");
        if (localToken) {
            setToken(localToken);
        }
    }, []);

    // Logout function
    const logout = () => {
        localStorage.removeItem("token");
        setToken("");
    };

    // Context value with useMemo for performance optimization
    const value = useMemo(
        () => ({
            token,
            setToken,
            isAuthenticated: !!token, // Renamed for consistency
            logout,
        }),
        [token]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContextProvider;
