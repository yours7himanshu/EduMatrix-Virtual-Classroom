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
import { createContext, useContext, useMemo, useState, useEffect } from "React";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("there is useparams in a wrapper");
  }

  return context;
};

const AuthContextProvider = ({ children }) => {
  const [token, settoken] = useState("");
  useEffect(() => {
    const userToken = localStorage.getItem("token");
    settoken(userToken);
  });

  const logout = () => {
    localStorage.removeItem("token");
    settoken("");
  };

  const value = useMemo(() => ({
    token,
    setToken,
    logout,
    isAuthenticated: !!token,
  }));
};
