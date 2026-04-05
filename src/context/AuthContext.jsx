import React, { createContext, useContext, useState, useEffect } from "react";
import { MOCK_USERS } from "../mocks/db";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for simulated session
    const storedUser = localStorage.getItem("dermai_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (email, password) => {
    const foundUser = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );
    if (foundUser) {
      // Omit password from stored state
      const { password: _, ...userData } = foundUser;
      setUser(userData);
      localStorage.setItem("dermai_user", JSON.stringify(userData));
      return { success: true, role: userData.role };
    }
    return { success: false, message: "Invalid email or password" };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("dermai_user");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
