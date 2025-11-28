import { storage } from "@/lib/almacenamiento";
import { useRouter } from "expo-router";
import React, { createContext, ReactNode, useContext, useState } from "react";
import { login, logout, verificarJWT } from "../lib/auth/authServicio";

interface AuthContextType {
  sesion: any;
  cargando: boolean;
  errorMessage: string;
  iniciarSesion: (boleta: string, contraseña: string) => Promise<void>;
  cerrarSesion: () => Promise<void>;
  verificarToken: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [sesion, setSesion] = useState<any>(null);
  const [cargando, setCargando] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const router = useRouter();

  // Verificar token al cargar la página y cada vez que se haga una petición
  const verificarToken = async () => {
    const token = await storage.getItem("token");

    try {
      if (sesion && !token) throw new Error("La sesión no es válida. Inicia sesión de nuevo para continuar.");
      
      const usuario = await verificarJWT();
      setSesion(usuario);
    } catch (error) {
      router.replace("/(auth)/iniciar-sesion");
      setErrorMessage(error instanceof Error ? error.message : "Error al verificar el token.");
      setSesion(null);
    }
  };

  const iniciarSesion = async (boleta: string, contraseña: string) => {
    setErrorMessage("");
    try { 
      const usuario = await login(boleta, contraseña);
      setSesion(usuario);
      if (usuario.rol === "ALUMNO")
        router.replace("/(app)/(alumno)/");
      else if (usuario.rol === "P_ADMIN")
        router.replace("/(app)/(administrativo)/");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Error desconocido");
    }
  };

  const cerrarSesion = async () => {
    try {
      await logout();
      setSesion(null);
      router.replace("/(auth)/iniciar-sesion");
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  return (
    <AuthContext.Provider value={{ sesion, cargando, errorMessage, iniciarSesion, cerrarSesion, verificarToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};
