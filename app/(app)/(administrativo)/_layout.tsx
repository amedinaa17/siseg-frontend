import AdministrativoMenuWeb from '@/componentes/layout/AdministrativoMenuWeb';
import { useAuth } from "@/context/AuthProvider";
import { Colores, Fuentes } from '@/temas/colores';
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { Slot, usePathname, useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import React, { useState } from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AdministrativoLayout() {
  const esMovil = Platform.OS === "ios" || Platform.OS === "android";

  if (esMovil) {
    return (
      <Drawer
        screenOptions={{
          headerStyle: { backgroundColor: Colores.fondoInstitucional },
          headerTintColor: Colores.onPrimario,
          drawerStyle: { backgroundColor: Colores.fondoInstitucional },
        }}
        drawerContent={(props) => <AdministrativoDrawerContent {...props} />}
      >
        <Drawer.Screen name="inicio-administrativo" options={{ title: "" }} />
        <Drawer.Screen name="validar-documentos" options={{ title: "" }} />
        <Drawer.Screen name="validar-documentos/[boleta]" options={{ title: "" }} />
        <Drawer.Screen name="lista-asistencia" options={{ title: "" }} />
        <Drawer.Screen name="gestionar-alumnos" options={{ title: "" }} />
        <Drawer.Screen name="gestionar-personal" options={{ title: "" }} />
        <Drawer.Screen name="gestionar-plazas" options={{ title: "" }} />
        <Drawer.Screen name="asignar-plaza" options={{ title: "" }} />
        <Drawer.Screen name="mapa-plazas" options={{ title: "" }} />
        <Drawer.Screen name="revisar-reportes-riesgo" options={{ title: "" }} />
        <Drawer.Screen name="reportes-encuestas" options={{ title: "" }} />
        <Drawer.Screen name="perfil" options={{ title: "" }} />
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

  const [mostrarSubmenuAlumnos, setMostrarSubmenuAlumnos] = useState(false);
  const [mostrarSubmenuPlazas, setMostrarSubmenuPlazas] = useState(false);
  const [mostrarSubmenuReportes, setMostrarSubmenuReportes] = useState(false);

  const pathname = usePathname();

  const activoItem = pathname;

  const handleLogout = async () => {
    await cerrarSesion();
  };

  const toggleCerrar = () => {
    setMostrarSubmenuReportes(false);
    setMostrarSubmenuAlumnos(false);
    setMostrarSubmenuPlazas(false);
  }

  return (
    <DrawerContentScrollView {...props}>
      <View style={{ alignItems: "center" }}>
        <Image
          source={require('@/activos/imagenes/favicon.png')}
          style={{ width: 50, height: 50, marginVertical: 15 }}
          tintColor={Colores.onPrimario}
        />
      </View>
      <DrawerItem
        label="INICIO"
        labelStyle={{ color: Colores.onPrimario }}
        style={activoItem === "/inicio-administrativo" && drawerStyles.activo}
        onPress={() => { toggleCerrar(); router.push("/(app)/(administrativo)/inicio-administrativo") }}
      />

      <TouchableOpacity
        onPress={() => { toggleCerrar(); setMostrarSubmenuAlumnos(!mostrarSubmenuAlumnos) }}
        style={[drawerStyles.seccionEncabezado, activoItem === "/validar-documentos" || activoItem === "/lista-asistencia" || activoItem === "/gestionar-alumnos" ? drawerStyles.activo : []]}
      >
        <Text style={drawerStyles.seccionEncabezadoTexto}>
          ALUMNOS {mostrarSubmenuAlumnos ? "▴" : "▾"}
        </Text>
      </TouchableOpacity>
      {mostrarSubmenuAlumnos && (
        <View style={drawerStyles.mostrarSubmenuContenedor}>
          <TouchableOpacity
            style={[drawerStyles.mostrarSubmenuItem, activoItem === "/validar-documentos" && drawerStyles.activoSubmenuItem]}
            onPress={() => { toggleCerrar(); router.push("/validar-documentos") }}
          >
            <Text style={[drawerStyles.mostrarSubmenuText, activoItem === "/validar-documentos" && { color: Colores.onPrimario }]}>Validar Documentos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[drawerStyles.mostrarSubmenuItem, activoItem === "/lista-asistencia" && drawerStyles.activoSubmenuItem]}
            onPress={() => { toggleCerrar(); router.push("/lista-asistencia") }}
          >
            <Text style={[drawerStyles.mostrarSubmenuText, activoItem === "/lista-asistencia" && { color: Colores.onPrimario }]}>Asistencia al Curso de Inducción</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[drawerStyles.mostrarSubmenuItem, activoItem === "/gestionar-alumnos" && drawerStyles.activoSubmenuItem]}
            onPress={() => { toggleCerrar(); router.push("/gestionar-alumnos") }}
          >
            <Text style={[drawerStyles.mostrarSubmenuText, activoItem === "/gestionar-alumnos" && { color: Colores.onPrimario }]}>Gestionar Alumnos</Text>
          </TouchableOpacity>
        </View>
      )}

      <DrawerItem
        label="PERSONAL ADMINISTRATIVO"
        labelStyle={{ color: Colores.onPrimario }}
        style={activoItem === "/gestionar-personal" && drawerStyles.activo}
        onPress={() => { toggleCerrar(); router.push("/gestionar-personal") }}
      />

      <TouchableOpacity
        onPress={() => { toggleCerrar(); setMostrarSubmenuPlazas(!mostrarSubmenuPlazas) }}
        style={[drawerStyles.seccionEncabezado, activoItem === "/gestionar-plazas" || activoItem === "/asignar-plaza" || activoItem === "/mapa-plazas" ? drawerStyles.activo : []]}
      >
        <Text style={drawerStyles.seccionEncabezadoTexto}>
          PLAZAS {mostrarSubmenuPlazas ? "▴" : "▾"}
        </Text>
      </TouchableOpacity>
      {mostrarSubmenuPlazas && (
        <View style={drawerStyles.mostrarSubmenuContenedor}>
          <TouchableOpacity
            style={[drawerStyles.mostrarSubmenuItem, activoItem === "/gestionar-plazas" && drawerStyles.activoSubmenuItem]}
            onPress={() => { toggleCerrar(); router.push("/gestionar-plazas") }}
          >
            <Text style={[drawerStyles.mostrarSubmenuText, activoItem === "/gestionar-plazas" && { color: Colores.onPrimario }]}>Gestionar plazas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[drawerStyles.mostrarSubmenuItem, activoItem === "/asignar-plaza" && drawerStyles.activoSubmenuItem]}
            onPress={() => { toggleCerrar(); router.push("/asignar-plaza") }}
          >
            <Text style={[drawerStyles.mostrarSubmenuText, activoItem === "/asignar-plaza" && { color: Colores.onPrimario }]}>Asignar Plaza</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[drawerStyles.mostrarSubmenuItem, activoItem === "/mapa-plazas" && drawerStyles.activoSubmenuItem]}
            onPress={() => { toggleCerrar(); router.push("/mapa-plazas") }}
          >
            <Text style={[drawerStyles.mostrarSubmenuText, activoItem === "/mapa-plazas" && { color: Colores.onPrimario }]}>Mapa de Plazas</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        onPress={() => { toggleCerrar(); setMostrarSubmenuReportes(!mostrarSubmenuReportes) }}
        style={[drawerStyles.seccionEncabezado, activoItem === "/revisar-reportes-riesgo" || activoItem === "/reportes-encuestas" ? drawerStyles.activo : []]}
      >
        <Text style={drawerStyles.seccionEncabezadoTexto}>
          REPORTES {mostrarSubmenuReportes ? "▴" : "▾"}
        </Text>
      </TouchableOpacity>
      {mostrarSubmenuReportes && (
        <View style={drawerStyles.mostrarSubmenuContenedor}>
          <TouchableOpacity
            style={[drawerStyles.mostrarSubmenuItem, activoItem === "/revisar-reportes-riesgo" && drawerStyles.activoSubmenuItem]}
            onPress={() => { toggleCerrar(); router.push("/revisar-reportes-riesgo") }}
          >
            <Text style={[drawerStyles.mostrarSubmenuText, activoItem === "/revisar-reportes-riesgo" && { color: Colores.onPrimario }]}>Situación de Riesgo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[drawerStyles.mostrarSubmenuItem, activoItem === "/reportes-encuestas" && drawerStyles.activoSubmenuItem]}
            onPress={() => { toggleCerrar(); router.push("/reportes-encuestas") }}
          >
            <Text style={[drawerStyles.mostrarSubmenuText, activoItem === "/reportes-encuestas" && { color: Colores.onPrimario }]}>Encuestas de Satisfacción</Text>
          </TouchableOpacity>
        </View>
      )}

      <DrawerItem
        label="MI PERFIL"
        labelStyle={{ color: Colores.onPrimario }}
        style={activoItem === "/perfil" && drawerStyles.activo}
        onPress={() => { toggleCerrar(); router.push("/perfil") }}
      />

      <View><Text style={{ width: "100%", borderBottomColor: Colores.onPrimario, borderBottomWidth: 1 }}></Text></View>

      <DrawerItem
        label="CERRAR SESIÓN"
        labelStyle={{ color: Colores.onPrimario, fontWeight: "700" }}
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
    backgroundColor: Colores.fondoInstitucional,
  },
  seccionEncabezadoTexto: {
    flex: 1,
    color: Colores.onPrimario,
    lineHeight: 24,
    fontWeight: "500",
  },
  mostrarSubmenuContenedor: {
    overflow: "hidden",
    backgroundColor: Colores.onPrimario
  },
  mostrarSubmenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingStart: 16,
    paddingEnd: 24,
  },
  mostrarSubmenuText: {
    fontSize: Fuentes.cuerpo,
    color: Colores.textoPrincipal,
    flex: 1,
    lineHeight: 20,
  },
  activo: {
    backgroundColor: "rgba(51, 51, 51, 0.6)",
    borderRadius: 0
  },
  activoSubmenuItem: {
    backgroundColor: "rgba(51, 51, 51, 0.6)",
    color: Colores.onPrimario,
    borderRadius: 0,
  },
});
