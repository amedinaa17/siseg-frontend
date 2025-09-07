import { AuthProvider, useAuth } from "@/context/AuthProvider";
import { Slot, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

function AuthGate() {
  const { session, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  useEffect(() => {
    if (loading) {
      return;
    }
    const inAuthGroup = segments[0] === "(auth)";
    const inAppGroup = segments[0] === "(app)";
    const subGroup = segments[1];
    // console.log("Segments:", segments);

    if (!session && !inAuthGroup) {
      router.replace("/(auth)/login");
    }
    else if (session?.rol === "alumno") {
      if (!inAppGroup || subGroup !== "(alumno)") {
        router.replace("/(app)/(alumno)");
      }
    }
    else if (session?.rol === "administrativo") {
      if (!inAppGroup || subGroup !== "(administrativo)") {
        router.replace("/(app)/(administrativo)");
      }
    }
    else if (!inAuthGroup) {
      router.replace("/(auth)/login");
      console.log("Redirección no válida o rol no asignado:", session?.rol);
    }


  }, [session, loading, segments]);


  if (loading) {
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
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
