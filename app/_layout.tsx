import { AuthProvider, useAuth } from "@/context/AuthProvider";
import { Slot, useRouter, useSegments } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

function AuthGate() {
  const { sesion, cargando, verificarToken } = useAuth();
  const router = useRouter();
  const segmentos = useSegments() as string[];
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
  }, []);

  useEffect(() => {
    if (cargando || !montado) return;

    if (typeof document !== "undefined") document.title = "SISEG";

    const grupo = segmentos[0];
    const subgrupo = segmentos[1];

    const enGrupoAuth = grupo === "(auth)";
    const enGrupoApp = grupo === "(app)";

    // 404
    if (grupo === "[...404]") {
      router.replace("/[...404]");
      return;
    }

    // Si NO hay sesión
    if (!sesion) {
      if (!enGrupoAuth) {
        router.replace("/(auth)/iniciar-sesion");
      }
      return;
    }

    // Si HAY sesión
    if (enGrupoAuth) {
      // Cambiar contraseña en primer inicio de sesión
      if (sesion.estatus === 0) {
        router.replace("/(auth)/cambiar-contrasena");
        return;
      }

      // Redirigir según rol
      if (sesion.rol === "ALUMNO") {
        router.replace("/(app)/(alumno)/inicio-alumno");
        return;
      }
      if (sesion.rol === "P_ADMIN") {
        router.replace("/(app)/(administrativo)/inicio-administrativo");
        return;
      }
    }

    // Si HAY sesión y está en (app)
    if (sesion.rol === "ALUMNO") {
      if (!enGrupoApp || subgrupo !== "(alumno)") {
        router.replace("/(app)/(alumno)/inicio-alumno");
      }
      return;
    }

    if (sesion.rol === "P_ADMIN") {
      if (!enGrupoApp || subgrupo !== "(administrativo)") {
        router.replace("/(app)/(administrativo)/inicio-administrativo");
      }
      return;
    }

  }, [segmentos, montado, sesion, cargando, router]);

  useEffect(() => {
    verificarToken();
  }, [segmentos])

  if (cargando || !montado) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#5a0839" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <View style={StyleSheet.absoluteFill}>
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </View>
  );
}
