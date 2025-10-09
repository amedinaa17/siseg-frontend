import AlumnoMenuWeb from '@/componentes/layout/AlumnoMenuWeb';
import { useAuth } from "@/context/AuthProvider";
import { Colores, Fuentes } from '@/temas/colores';
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { Slot, useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AlumnoLayout() {
  const esMovil = Platform.OS === "ios" || Platform.OS === "android";

  if (esMovil) {
    return (
      <Drawer
        screenOptions={{
          headerStyle: { backgroundColor: Colores.fondoInstitucional },
          headerTintColor: Colores.onPrimario,
          drawerActiveTintColor: Colores.primario,
          drawerStyle: { backgroundColor: Colores.fondo },
        }}
        drawerContent={(props) => <AlumnoDrawerContent {...props} />}
      >
        <Drawer.Screen name="index" options={{ title: "Inicio" }} />
        <Drawer.Screen name="acuse-solicitud" options={{ title: "Acuse de Solicitud" }} />
        <Drawer.Screen name="expediente-digital" options={{ title: "Ver Expediente" }} />
        <Drawer.Screen name="curso-induccion" options={{ title: "Curso de Inducción" }} />
        <Drawer.Screen name="catalogo-plazas" options={{ title: "Catálogo de Plazas" }} />
        <Drawer.Screen name="plaza-asignada" options={{ title: "Plaza Asignada" }} />
        <Drawer.Screen name="reportes-riesgo" options={{ title: "Situación de Riesgo" }} />
        <Drawer.Screen name="Encuesta" options={{ title: "Encuesta de Satisfacción" }} />
        <Drawer.Screen name="mi-perfil" options={{ title: "Mi Perfil" }} />
      </Drawer>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colores.fondo }}>
      <AlumnoMenuWeb />
      <Slot />
    </View>
  );
}

function AlumnoDrawerContent(props) {
  const { cerrarSesion } = useAuth();
  const router = useRouter();

  const [submenuExpediente, setsubmenuExpediente] = useState(false);
  const [submenuPlazas, setSubmenuPlazas] = useState(false);
  const [submenuReportes, setSubmenuReportes] = useState(false);

  const handleLogout = async () => {
    await cerrarSesion();
    router.replace("/(auth)/iniciar-sesion");
  };

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItem
        label="INICIO"
        onPress={() => router.push("/(app)/(alumno)")}
      />

      <TouchableOpacity
        onPress={() => setsubmenuExpediente(!submenuExpediente)}
        style={drawerStyles.seccionEncabezado}
      >
        <Text style={drawerStyles.seccionEncabezadoTexto}>
          EXPEDIENTE DIGITAL {submenuExpediente ? "▴" : "▾"}
        </Text>
      </TouchableOpacity>
      {submenuExpediente && (
        <View style={drawerStyles.submenuContenedor}>
          <TouchableOpacity
            style={drawerStyles.submenuItem}
            onPress={() => router.push("/acuse-solicitud")}
          >
            <Text style={drawerStyles.submenuText}>Acuse de Solicitud</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={drawerStyles.submenuItem}
            onPress={() => router.push("/expediente-digital")}
          >
            <Text style={drawerStyles.submenuText}>Ver Expediente</Text>
          </TouchableOpacity>
        </View>
      )}

      <DrawerItem
        label="CURSO DE INDUCCIÓN"
        onPress={() => router.push("/(app)/(alumno)/curso-induccion")}
      />

      <TouchableOpacity
        onPress={() => setSubmenuPlazas(!submenuPlazas)}
        style={drawerStyles.seccionEncabezado}
      >
        <Text style={drawerStyles.seccionEncabezadoTexto}>
          PLAZAS {submenuPlazas ? "▴" : "▾"}
        </Text>
      </TouchableOpacity>
      {submenuPlazas && (
        <View style={drawerStyles.submenuContenedor}>
          <TouchableOpacity
            style={drawerStyles.submenuItem}
            onPress={() => router.push("/(app)/(alumno)/catalogo-plazas")}
          >
            <Text style={drawerStyles.submenuText}>Catálogo de Plazas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={drawerStyles.submenuItem}
            onPress={() => router.push("/(app)/(alumno)/plaza-asignada")}
          >
            <Text style={drawerStyles.submenuText}>Plaza Asignada</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        onPress={() => setSubmenuReportes(!submenuReportes)}
        style={drawerStyles.seccionEncabezado}
      >
        <Text style={drawerStyles.seccionEncabezadoTexto}>
          REPORTES {submenuReportes ? "▴" : "▾"}
        </Text>
      </TouchableOpacity>
      {submenuReportes && (
        <View style={drawerStyles.submenuContenedor}>
          <TouchableOpacity
            style={drawerStyles.submenuItem}
            onPress={() => router.push("/reportes-riesgo")}
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
        onPress={() => router.push("/mi-perfil")}
      />

      <View><Text style={{ color: Colores.borderColor }}>──────────────────</Text></View>

      <DrawerItem
        label="CERRAR SESIÓN"
        labelStyle={{ color: Colores.primario, fontWeight: "600" }}
        onPress={handleLogout}
      />
    </DrawerContentScrollView>
  );
}
const drawerStyles = StyleSheet.create({
  seccionEncabezado: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    paddingStart: 16,
    paddingEnd: 24,
    backgroundColor: Colores.fondo,
  },
  seccionEncabezadoTexto: {
    flex: 1,
    color: '#5f5f5fff',
    lineHeight: 24,
    fontWeight: "500",
  },
  submenuContenedor: {
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
    fontSize: Fuentes.cuerpo,
    color: '#5f5f5fff',
    flex: 1,
    lineHeight: 20,
  },
});
