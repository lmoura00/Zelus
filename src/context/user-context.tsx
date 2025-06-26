import React from "react";
import { createContext, useState, ReactNode } from "react";
import axios from "axios";
import { api } from "@/api";

type User = {
  id: number;
  name: string;
  email: string;
  cpf: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: async () => {},
  logout: () => {},
  isLoading: false,
  error: null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${api}session`, {
        email,
        password,
      });

      const userData = response.data.user;
      const accessToken = userData.token.token;

      if (accessToken) {
        setUser(userData);
        setToken(accessToken);
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${accessToken}`;
      } else {
        throw new Error("No access token received");
      }
    } catch (error) {
      let errorMessage = "Ocorreu um erro durante o login";

      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.response?.data);
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        console.error("Login error:", error);
        errorMessage = error.message;
      }

      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    delete axios.defaults.headers.common["Authorization"];
  };
  



  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isLoading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
