import AdministrativoMenuWeb from '@/componentes/layout/AdministrativoMenuWeb';
import { useAuth } from "@/context/AuthProvider";
import { Colores, Fuentes } from '@/temas/colores';
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { Slot, useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AdministrativoLayout() {
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
        drawerContent={(props) => <AdministrativoDrawerContent {...props} />}
      >
        <Drawer.Screen name="index" options={{ title: "Inicio" }} />
        <Drawer.Screen name="validar-documentos" options={{ title: "Validar Documentos" }} />
        <Drawer.Screen name="validar-documentos/[boleta]" options={{ title: "Validar Documentos" }} />
        <Drawer.Screen name="lista-asistencia" options={{ title: "Asistencia al Curso de Inducción" }} />
        <Drawer.Screen name="gestionar-alumnos" options={{ title: "Gestionar Alumnos" }} />
        <Drawer.Screen name="gestionar-personal" options={{ title: "Personal Administrativo" }} />
        <Drawer.Screen name="catalogo-plazas" options={{ title: "Plazas" }} />
        <Drawer.Screen name="asignar-plaza" options={{ title: "Asignar Plaza" }} />
        <Drawer.Screen name="mapa-plazas" options={{ title: "Mapa de Plazas" }} />
        <Drawer.Screen name="revisar-reportes-riesgo" options={{ title: "Reportes de Situación de Riesgo" }} />
        <Drawer.Screen name="reportes-encuestas" options={{ title: "Encuestas de Satisfacción" }} />
        <Drawer.Screen name="perfil" options={{ title: "Mi Perfil" }} />
      </Drawer>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colores.fondo }}>
      <AdministrativoMenuWeb />
      <Slot />
    </View>
  );
}

function AdministrativoDrawerContent(props) {
  const { cerrarSesion } = useAuth();
  const router = useRouter();

  const [submenuAlumnos, setSubmenuAlumnos] = useState(false);
  const [submenuPlazas, setSubmenuPlazas] = useState(false);
  const [submenuReportes, setSubmenuReportes] = useState(false);

  const handleLogout = async () => {
    await cerrarSesion();
  };

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItem
        label="INICIO"
        onPress={() => router.push("/(app)/(administrativo)")}
      />

      <TouchableOpacity
        onPress={() => setSubmenuAlumnos(!submenuAlumnos)}
        style={drawerStyles.seccionEncabezado}
      >
        <Text style={drawerStyles.seccionEncabezadoTexto}>
          ALUMNOS {submenuAlumnos ? "▴" : "▾"}
        </Text>
      </TouchableOpacity>
      {submenuAlumnos && (
        <View style={drawerStyles.submenuContenedor}>
          <TouchableOpacity
            style={drawerStyles.submenuItem}
            onPress={() => router.push("/validar-documentos")}
          >
            <Text style={drawerStyles.submenuText}>Validar Documentos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={drawerStyles.submenuItem}
            onPress={() => router.push("/lista-asistencia")}
          >
            <Text style={drawerStyles.submenuText}>Asistencia al Curso de Inducción</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={drawerStyles.submenuItem}
            onPress={() => router.push("/gestionar-alumnos")}
          >
            <Text style={drawerStyles.submenuText}>Gestionar Alumnos</Text>
          </TouchableOpacity>
        </View>
      )}

      <DrawerItem
        label="PERSONAL ADMINISTRATIVO"
        onPress={() => router.push("/gestionar-personal")}
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
            onPress={() => router.push("/catalogo-plazas")}
          >
            <Text style={drawerStyles.submenuText}>Plazas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={drawerStyles.submenuItem}
            onPress={() => router.push("/asignar-plaza")}
          >
            <Text style={drawerStyles.submenuText}>Asignar Plaza</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={drawerStyles.submenuItem}
            onPress={() => router.push("/mapa-plazas")}
          >
            <Text style={drawerStyles.submenuText}>Mapa de Plazas</Text>
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
            onPress={() => router.push("/revisar-reportes-riesgo")}
          >
            <Text style={drawerStyles.submenuText}>Reportes de Situación de Riesgo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={drawerStyles.submenuItem}
            onPress={() => router.push("/reportes-encuestas")}
          >
            <Text style={drawerStyles.submenuText}>Reportes de Encuestas de Satisfacción</Text>
          </TouchableOpacity>
        </View>
      )}

      <DrawerItem
        label="MI PERFIL"
        onPress={() => router.push("/perfil")}
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
