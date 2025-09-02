import { sessionStorage } from "@/lib/session";
import React, { createContext, useContext, useEffect, useState } from "react";

export type Session = { boleta: string; correo?: string } | null;

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
    (async () => {
      try {
        const raw = await sessionStorage.getItem("AUTH_SESSION");
        if (raw) setSession(JSON.parse(raw));
      } catch (e) {
        console.error("Error cargando sesión:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const signIn = async (boleta: string, password: string) => {
    // ⚠️ Aquí va tu lógica real contra la API de login
    const fakeSession = { boleta };
    await sessionStorage.setItem("AUTH_SESSION", JSON.stringify(fakeSession));
    setSession(fakeSession);
  };

  const signUp = async (correo: string,) => {
    console.log("Nuevo usuario registrado:", correo);

    // Supongamos que al registrarse el backend devuelve la boleta asignada
    const fakeSession = { boleta: "20250001", correo };
    await sessionStorage.setItem("AUTH_SESSION", JSON.stringify(fakeSession));
    setSession(fakeSession);
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
