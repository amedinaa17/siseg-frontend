import { sessionStorage } from "@/lib/sesion";
import React, { createContext, useContext, useEffect, useState } from "react";

export type Sesion = { boleta: string; correo?: string; rol?: string } | null;

type AuthContextType = {
  sesion: Sesion;
  cargando: boolean;
  iniciarSesion: (boleta: string, contraseña: string) => Promise<void>;
  registro: (correo: string) => Promise<void>;
  cerrarSesion: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [sesion, setSesion] = useState<Sesion>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
  const cargarSesion = async () => {
    try {
      const fila = await sessionStorage.getItem("AUTH_SESSION");
      if (fila) {
        setSesion(JSON.parse(fila));
      }
    } catch (e) {
      console.error("Error cargando sesión:", e);
    } finally {
      setCargando(false);
    }
  };

  cargarSesion();
}, []);


  const iniciarSesion = async (boleta: string, contraseña: string) => {
    setCargando(true);
    try {
      const sesionAutenticada = { boleta: boleta, rol: "alumno" };

      await sessionStorage.setItem("AUTH_SESSION", JSON.stringify(sesionAutenticada));
      setSesion(sesionAutenticada);
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
    } finally {
      setCargando(false);
    }
  };

  const registro = async (correo: string) => {
    console.log("Nuevo usuario registrado:", correo);
  };

  const cerrarSesion = async () => {
    await sessionStorage.removeItem("AUTH_SESSION");
    setSesion(null);
  };

  return (
    <AuthContext.Provider value={{ sesion, cargando, iniciarSesion, registro, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  }
  return ctx;
}
