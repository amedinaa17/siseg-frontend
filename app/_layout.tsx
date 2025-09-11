import { AuthProvider, useAuth } from "@/context/AuthProvider";
import { Slot, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

function AuthGate() {
  const { sesion, cargando } = useAuth();
  const router = useRouter();
  const segmentos = useSegments();
  useEffect(() => {
    if (cargando) {
      return;
    }
    const enGrupoAuth = segmentos[0] === "(auth)";
    const enGrupoApp = segmentos[0] === "(app)";
    const enSubgrupo = segmentos[1];
    // console.log("segmentos:", segmentos);

    if (!sesion && !enGrupoAuth) {
      router.replace("/(auth)/iniciar-sesion");
    }
    else if (sesion?.rol === "alumno") {
      if (!enGrupoApp || enSubgrupo !== "(alumno)") {
        router.replace("/(app)/(alumno)");
      }
    }
    else if (sesion?.rol === "administrativo") {
      if (!enGrupoApp || enSubgrupo !== "(administrativo)") {
        router.replace("/(app)/(administrativo)");
      }
    }
    else if (!enGrupoAuth) {
      router.replace("/(auth)/iniciar-sesion");
      console.log("Redirección no válida o rol no asignado:", sesion?.rol);
    }


  }, [sesion, cargando, segmentos]);


  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: "space-between", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#5a0839" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
