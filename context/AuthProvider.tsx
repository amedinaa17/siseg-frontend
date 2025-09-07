import { sessionStorage } from "@/lib/session";
import React, { createContext, useContext, useEffect, useState } from "react";

export type Session = { boleta: string; correo?: string; rol?: string } | null;

type AuthContextType = {
  session: Session;
  loading: boolean;
  signIn: (boleta: string, password: string) => Promise<void>;
  signUp: (correo: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const loadSession = async () => {
    try {
      const raw = await sessionStorage.getItem("AUTH_SESSION");
      if (raw) {
        setSession(JSON.parse(raw));
      }
    } catch (e) {
      console.error("Error cargando sesión:", e);
    } finally {
      setLoading(false);
    }
  };

  loadSession();
}, []);


  const signIn = async (boleta: string, password: string) => {
    setLoading(true);
    try {
      const authenticatedSession = { boleta: boleta, rol: "alumno" };

      await sessionStorage.setItem("AUTH_SESSION", JSON.stringify(authenticatedSession));
      setSession(authenticatedSession);
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (correo: string) => {
    console.log("Nuevo usuario registrado:", correo);
  };

  const signOut = async () => {
    await sessionStorage.removeItem("AUTH_SESSION");
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}
