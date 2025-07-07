import React, { createContext, useState, useEffect, ReactNode } from "react";
import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from "axios";
import { api } from "@/api";
import { Alert } from "react-native";

type UserData = {
  id: number;
  name: string;
  email: string;
  cpf: string;
};

type AuthResponse = {
  user: UserData;
  token: {
    token: string;
  };
};

type AuthContextType = {
  user: UserData | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  authenticatedRequest: <T = any>(
    method: AxiosRequestConfig["method"],
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ) => Promise<AxiosResponse<T>>;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: async () => {},
  logout: () => {},
  isLoading: false,
  error: null,
  authenticatedRequest: async () => {
    throw new Error("authenticatedRequest not implemented");
  },
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const axiosInstance: AxiosInstance = axios.create();

  axiosInstance.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (err) => Promise.reject(err)
  );

  axiosInstance.interceptors.response.use(
    (response) => response,
    (err) => {
      if (err.response?.status === 401 && err.config?.url !== `${api}/session`) {
        Alert.alert("Sessão Expirada", "Sua sessão expirou. Por favor, faça login novamente.");
        logout();
      }
      return Promise.reject(err);
    }
  );

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response: AxiosResponse<AuthResponse> = await axios.post(
        `${api}/session`,
        { email, password },
        { timeout: 10000 }
      );
      const { user: userData, token: { token: accessToken } } = response.data;

      if (accessToken) {
        setUser(userData);
        setToken(accessToken);
      } else {
        throw new Error("Token de acesso não recebido");
      }
    } catch (err) {
      let errorMessage = "Ocorreu um erro durante o login";
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || err.message;
        if (err.code === 'ECONNABORTED') {
          errorMessage = 'Tempo de resposta excedido. Tente novamente mais tarde.';
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      Alert.alert('Erro de Login', errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    axiosInstance.defaults.headers.common["Authorization"] = undefined;
  };

  const authenticatedRequest = async <T = any>(
    method: AxiosRequestConfig["method"],
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => {
    try {
      const fullUrl = `${api}${url}`;
      return await axiosInstance.request<T>({
        method,
        url: fullUrl,
        data,
        ...config,
      });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401 && url !== '/session') {
          // This specific 401 case is handled by the response interceptor for non-login calls.
          // Re-throwing the error ensures the caller knows there was an issue.
      }
      throw err;
    }
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
        authenticatedRequest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}