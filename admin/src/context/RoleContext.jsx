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


import React, { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const RoleContext = createContext();

const RoleProvider = ({ children }) => {
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const decodedToken = jwtDecode(token);
            setUserRole(decodedToken.role); 
        }
    }, []); // Runs only on initial mount, updates based on token

    return (
        <RoleContext.Provider value={{ userRole, setUserRole }}>
            {children}
        </RoleContext.Provider>
    );
};

export { RoleContext, RoleProvider };
