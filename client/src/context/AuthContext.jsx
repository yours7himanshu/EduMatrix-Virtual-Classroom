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
            isAuthenticated: !!token, // Helper for login status
            logout,
        }),
        [token]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContextProvider;
