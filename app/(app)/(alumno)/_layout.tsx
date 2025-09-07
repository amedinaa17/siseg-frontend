import AlumnoNavbarWeb from '@/components/layout/AlumnoNavbarWeb';
import { useAuth } from "@/context/AuthProvider";
import { Colors, Fonts } from '@/theme/colors';
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { Slot, useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AlumnoLayout() {
  const isMobile = Platform.OS === "ios" || Platform.OS === "android";

  if (isMobile) {
    return (
      <Drawer
        screenOptions={{
          headerStyle: { backgroundColor: Colors.backgroundIPN },
          headerTintColor: Colors.lightSecondary,
          drawerActiveTintColor: Colors.primary,
          drawerStyle: { backgroundColor: Colors.background },
        }}
        drawerContent={(props) => <AlumnoDrawerContent {...props} />}
      >
        <Drawer.Screen name="index" options={{ title: "Inicio" }} />
        <Drawer.Screen name="AcuseSolicitud" options={{ title: "Acuse de Solicitud" }} />
        <Drawer.Screen name="Expediente" options={{ title: "Ver Expediente" }} />
        <Drawer.Screen name="CursoInduccion" options={{ title: "Curso de Inducción" }} />
        <Drawer.Screen name="CatalogoPlazas" options={{ title: "Catálogo de Plazas" }} />
        <Drawer.Screen name="PlazaAsignada" options={{ title: "Plaza Asignada" }} />
        <Drawer.Screen name="SituacionRiesgo" options={{ title: "Situación de Riesgo" }} />
        <Drawer.Screen name="Encuesta" options={{ title: "Encuesta de Satisfacción" }} />
        <Drawer.Screen name="Perfil" options={{ title: "Mi Perfil" }} />
      </Drawer>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <AlumnoNavbarWeb />
      <Slot />
    </View>
  );
}

function AlumnoDrawerContent(props) {
  const { signOut } = useAuth();
  const router = useRouter();

  const [expedienteOpen, setExpedienteOpen] = useState(false);
  const [plazasOpen, setPlazasOpen] = useState(false);
  const [reportesOpen, setReportesOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    router.replace("/(auth)/login");
  };

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItem
        label="INICIO"
        onPress={() => router.push("/(app)/(alumno)")}
      />

      <TouchableOpacity
        onPress={() => setExpedienteOpen(!expedienteOpen)}
        style={drawerStyles.sectionHeader}
      >
        <Text style={drawerStyles.sectionHeaderText}>
          EXPEDIENTE DIGITAL {expedienteOpen ? "▴" : "▾"}
        </Text>
      </TouchableOpacity>
      {expedienteOpen && (
        <View style={drawerStyles.submenuContainer}>
          <TouchableOpacity
            style={drawerStyles.submenuItem}
            onPress={() => router.push("/")}
          >
            <Text style={drawerStyles.submenuText}>Acuse de Solicitud</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={drawerStyles.submenuItem}
            onPress={() => router.push("/")}
          >
            <Text style={drawerStyles.submenuText}>Ver Expediente</Text>
          </TouchableOpacity>
        </View>
      )}

      <DrawerItem
        label="CURSO DE INDUCCIÓN"
        onPress={() => router.push("/(app)/(alumno)/CatalogoPlazas")}
      />

      <TouchableOpacity
        onPress={() => setPlazasOpen(!plazasOpen)}
        style={drawerStyles.sectionHeader}
      >
        <Text style={drawerStyles.sectionHeaderText}>
          PLAZAS {plazasOpen ? "▴" : "▾"}
        </Text>
      </TouchableOpacity>
      {plazasOpen && (
        <View style={drawerStyles.submenuContainer}>
          <TouchableOpacity
            style={drawerStyles.submenuItem}
            onPress={() => router.push("/(app)/(alumno)/CatalogoPlazas")}
          >
            <Text style={drawerStyles.submenuText}>Catálogo de Plazas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={drawerStyles.submenuItem}
            onPress={() => router.push("/")}
          >
            <Text style={drawerStyles.submenuText}>Plaza Asignada</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        onPress={() => setReportesOpen(!reportesOpen)}
        style={drawerStyles.sectionHeader}
      >
        <Text style={drawerStyles.sectionHeaderText}>
          REPORTES {reportesOpen ? "▴" : "▾"}
        </Text>
      </TouchableOpacity>
      {reportesOpen && (
        <View style={drawerStyles.submenuContainer}>
          <TouchableOpacity
            style={drawerStyles.submenuItem}
            onPress={() => router.push("/")}
          >
            <Text style={drawerStyles.submenuText}>Situación de Riesgo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={drawerStyles.submenuItem}
            onPress={() => router.push("/")}
          >
            <Text style={drawerStyles.submenuText}>Encuesta de Satisfacción</Text>
          </TouchableOpacity>
        </View>
      )}

      <DrawerItem
        label="MI PERFIL"
        onPress={() => router.push("/")}
      />

      <View><Text style={{ color: Colors.borderColor }}>──────────────────</Text></View>

      <DrawerItem
        label="CERRAR SESIÓN"
        labelStyle={{ color: Colors.primary, fontWeight: "600" }}
        onPress={handleLogout}
      />
    </DrawerContentScrollView>
  );
}
const drawerStyles = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    paddingStart: 16,
    paddingEnd: 24,
    backgroundColor: Colors.background,
  },
  sectionHeaderText: {
    flex: 1,
    color: '#5f5f5fff',
    lineHeight: 24,
    fontWeight: "500",
  },
  submenuContainer: {
    overflow: "hidden",
    marginLeft: 32,
  },
  submenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingStart: 16,
    paddingEnd: 24,
  },
  submenuText: {
    fontSize: Fonts.text,
    color: '#5f5f5fff',
    flex: 1,
    lineHeight: 20,
  },
});
