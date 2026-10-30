import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

import { loginUser, getMyProfile } from "../api/authApi";
import socket from "../socket";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);

  const [token, setToken] = useState(
    () => localStorage.getItem("token")
  );

  const [loading, setLoading] = useState(true);


  // Restore user
  useEffect(() => {

    const restoreUser = async () => {

      if (!token) {
        setLoading(false);
        return;
      }

      try {

        const result = await getMyProfile();

        setUser(result.data ?? result);

      } catch (error) {

        localStorage.removeItem("token");
        setToken(null);
        setUser(null);

      } finally {

        setLoading(false);

      }
    };

    restoreUser();

  }, []);


  // Socket connection after authentication
  useEffect(() => {

    if (!token || !user) {
      socket.disconnect();
      return;
    }

    socket.connect();

    return () => {
      socket.disconnect();
    };

  }, [token, user?._id, user?.id]);


  // Login
  const login = async (credentials) => {

    const result = await loginUser(credentials);

    if (!result.token) {
      throw new Error("Login response mein token nahi mila.");
    }

    localStorage.setItem("token", result.token);

    setToken(result.token);
    setUser(result.data ?? null);

    return result;
  };


  // Logout
  const logout = () => {

    socket.disconnect();

    localStorage.removeItem("token");

    setToken(null);
    setUser(null);
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(token),
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {

  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}