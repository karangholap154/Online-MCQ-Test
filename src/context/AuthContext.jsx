import { createContext, useContext, useState } from "react";
import { login as loginService } from "../services/authService";
import { logout } from "../utils/security";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user"))
  );

  const login = async (data) => {
    const res = await loginService(data);
    setUser(res.user);
    return res;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuthContext must be used inside AuthProvider"
    );
  }
  return context;
};
