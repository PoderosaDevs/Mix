import { apiService } from "@/api/routes";
import { api } from "@/api/index";
import { CriarUsuarioInput, Usuario } from "@/api/types";
import React, { createContext, useState, useContext } from "react";

interface AuthContextData {
  signed: boolean;
  usuario: Usuario | null;
  login(dados: Pick<CriarUsuarioInput, "email" | "senha">): Promise<void>;
  logout(): void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const storagedUser = localStorage.getItem("@App:user");
    const storagedToken = localStorage.getItem("@App:token");

    if (storagedUser && storagedToken) {
      try {
        return JSON.parse(storagedUser);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(false);

  async function login(dados: Pick<CriarUsuarioInput, "email" | "senha">) {
    setLoading(true);
    try {
      const response = await apiService.auth.login(dados);
      const { usuario: userResponse, token } = response.data;

      // Primeiro salvamos no storage para o interceptor pegar na próxima chamada
      localStorage.setItem("@App:token", token);
      localStorage.setItem("@App:user", JSON.stringify(userResponse));
      
      setUsuario(userResponse);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("@App:user");
    localStorage.removeItem("@App:token");
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ signed: !!usuario, usuario, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}