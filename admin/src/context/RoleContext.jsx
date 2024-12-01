import React, { createContext, useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';


const RoleContext = createContext();


const RoleProvider = ({ children }) => {
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decodedToken = jwtDecode(token);
            setUserRole(decodedToken.role);
        }
    }, []);

    return (
        <RoleContext.Provider value={userRole}>
            {children}
        </RoleContext.Provider>
    );
};

export { RoleContext, RoleProvider };
