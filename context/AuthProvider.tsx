import { almacenamiento } from "@/lib/almacenamiento";
import { login, logout, verificarJWT } from "@/lib/auth/authServicio";
import { activarSesionUnica, liberarSesionUnica } from "@/lib/auth/sesionUnica";
import { useRouter } from "expo-router";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";

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

  React.useEffect(() => {
    if (Platform.OS != "web" || !sesion) return;

    const stop = activarSesionUnica(async () => {
      await almacenamiento.eliminarItem("token");
      setSesion(null);
      setErrorMessage("La sesión ya está activa en otra pestaña.");
      router.replace("/(auth)/iniciar-sesion");
    });

    return stop;
  }, [sesion]);

  useEffect(() => {
    if (Platform.OS != "web" || !sesion) return;
    
    const handleBeforeUnload = () => {
      liberarSesionUnica();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Verificar token al cargar la página y cada vez que se haga una petición
  const verificarToken = async () => {
    const token = await almacenamiento.obtenerItem("token");

    try {
      if (sesion && !token) {
        cerrarSesion();
        throw new Error("La sesión no es válida. Inicia sesión de nuevo para continuar.");
      }

      const usuario = await verificarJWT();
      setSesion(usuario);
    } catch (error) {
      router.replace("/(auth)/iniciar-sesion");
      cerrarSesion();
      setErrorMessage(error instanceof Error ? error.message : "Error al verificar el token.");
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
      liberarSesionUnica();
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
