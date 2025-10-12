import { AuthProvider, useAuth } from "@/context/AuthProvider";
import { Slot, useRouter, useSegments } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

function AuthGate() {
  const { sesion, errorMessage, cargando, verificarToken } = useAuth();
  const router = useRouter();
  const segmentos = useSegments();
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
  }, []);

  useEffect(() => {
    if (cargando || !montado) return;

    if (typeof document !== "undefined") document.title = "SISEG";

    const enGrupoAuth = segmentos[0] === "(auth)";
    const enGrupoApp = segmentos[0] === "(app)";
    const enSubgrupo = segmentos[1];

    // Redirigir según la sesión y rol del usuario
    if (segmentos[0] == "[...404]") {
      router.replace("/[...404]");
    } else if (!sesion && !enGrupoAuth) {
      router.replace("/(auth)/iniciar-sesion");
    } else if (sesion?.rol === "ALUMNO") {
      if (!enGrupoApp || enSubgrupo !== "(alumno)") {
        router.replace("/(app)/(alumno)");
      }
    } else if (sesion?.rol === "ADMINISTRATIVO") {
      if (!enGrupoApp || enSubgrupo !== "(administrativo)") {
        router.replace("/(app)/(administrativo)");
      }
    }
  }, [segmentos, montado]);

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
