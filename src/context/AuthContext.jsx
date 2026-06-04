import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load session
    const storedUser = localStorage.getItem("dermai_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post("http://localhost:3000/api/auth/login", { email, password });
      const userData = res.data;
      setUser(userData);
      localStorage.setItem("dermai_user", JSON.stringify(userData));
      return { success: true, role: userData.role };
    } catch (err) {
      console.error(err);
      return { success: false, message: err.response?.data?.error || "Invalid email or password" };
    }
  };

  const register = async (name, email, password, metadata = {}) => {
    try {
      const res = await axios.post("http://localhost:3000/api/auth/register", { 
        name, 
        email, 
        password,
        age: metadata.age,
        gender: metadata.gender
      });
      // Don't auto login, let them login
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, message: err.response?.data?.error || "Registration failed" };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await axios.put("http://localhost:3000/api/profile", profileData, {
        headers: { Authorization: `Bearer ${user.id}` }
      });
      const updatedUser = { ...user, ...res.data };
      setUser(updatedUser);
      localStorage.setItem("dermai_user", JSON.stringify(updatedUser));
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, message: err.response?.data?.error || "Update failed" };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("dermai_user");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
