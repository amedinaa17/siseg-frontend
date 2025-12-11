import ChatbotWidget from "@/componentes/chat/ChatbotWidget";
import AlumnoMenuWeb from '@/componentes/layout/AlumnoMenuWeb';
import { useAuth } from "@/context/AuthProvider";
import { Colores, Fuentes } from '@/temas/colores';
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { Slot, usePathname, useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import React, { useState } from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AlumnoLayout() {
  const esMovil = Platform.OS === "ios" || Platform.OS === "android";

  if (esMovil) {
    return (
      <View style={{ flex: 1, backgroundColor: Colores.fondo }}>
        <Drawer
          screenOptions={{
            headerStyle: { backgroundColor: Colores.fondoInstitucional },
            headerTintColor: Colores.onPrimario,
            drawerStyle: { backgroundColor: Colores.fondoInstitucional },
          }}
          drawerContent={(props) => <AlumnoDrawerContent {...props} />}
        >
          <Drawer.Screen name="inicio-alumno" options={{ title: "" }} />
          <Drawer.Screen name="acuse-solicitud" options={{ title: "" }} />
          <Drawer.Screen name="expediente-digital" options={{ title: "" }} />
          <Drawer.Screen name="curso-induccion" options={{ title: "" }} />
          <Drawer.Screen name="plazas" options={{ title: "" }} />
          <Drawer.Screen name="plaza-asignada" options={{ title: "" }} />
          <Drawer.Screen name="reportes-riesgo" options={{ title: "" }} />
          <Drawer.Screen name="encuesta-satisfaccion" options={{ title: "" }} />
          <Drawer.Screen name="mi-perfil" options={{ title: "" }} />
        </Drawer>

        <ChatbotWidget endpoint="chatbot/chatbotQuery" title="Asistente SISEG" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colores.fondo }}>
      <AlumnoMenuWeb />
      <Slot />

      <ChatbotWidget endpoint="chatbot/chatbotQuery" title="Asistente SISEG" />
    </View>
  );
}

function AlumnoDrawerContent(props) {
  const { cerrarSesion } = useAuth();
  const router = useRouter();

  const [mostrarSubmenuExpediente, setMostrarSubmenuExpediente] = useState(false);
  const [mostrarSubmenuPlazas, setMostrarSubmenuPlazas] = useState(false);
  const [mostrarSubmenuReportes, setMostrarSubmenuReportes] = useState(false);

  const pathname = usePathname();

  const activoItem = pathname;

  const handleLogout = async () => {
    await cerrarSesion();
  };

  const toggleCerrar = () => {
    setMostrarSubmenuReportes(false);
    setMostrarSubmenuExpediente(false);
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
        allowFontScaling={false}
        labelStyle={{ color: Colores.onPrimario }}
        style={activoItem === "/inicio-alumno" && drawerStyles.activo}
        onPress={() => { toggleCerrar(); router.push("/(app)/(alumno)/inicio-alumno") }}
      />

      <TouchableOpacity
        onPress={() => { toggleCerrar(); setMostrarSubmenuExpediente(!mostrarSubmenuExpediente) }}
        style={[drawerStyles.seccionEncabezado, activoItem === "/acuse-solicitud" || activoItem === "/expediente-digital" ? drawerStyles.activo : []]}
      >
        <Text allowFontScaling={false} style={drawerStyles.seccionEncabezadoTexto}>
          EXPEDIENTE DIGITAL {mostrarSubmenuExpediente ? "▴" : "▾"}
        </Text>
      </TouchableOpacity>
      {mostrarSubmenuExpediente && (
        <View style={drawerStyles.mostrarSubmenuContenedor}>
          <TouchableOpacity
            style={[drawerStyles.mostrarSubmenuItem, activoItem === "/acuse-solicitud" && drawerStyles.activoSubmenuItem]}
            onPress={() => { toggleCerrar(); router.push("/acuse-solicitud") }}
          >
            <Text allowFontScaling={false} style={[drawerStyles.mostrarSubmenuText, activoItem === "/acuse-solicitud" && { color: Colores.onPrimario }]}>Acuse de solicitud</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[drawerStyles.mostrarSubmenuItem, activoItem === "/expediente-digital" && drawerStyles.activoSubmenuItem]}
            onPress={() => { toggleCerrar(); router.push("/expediente-digital") }}
          >
            <Text allowFontScaling={false} style={[drawerStyles.mostrarSubmenuText, activoItem === "/expediente-digital" && { color: Colores.onPrimario }]}>Ver expediente</Text>
          </TouchableOpacity>
        </View>
      )}

      <DrawerItem
        label="CURSO DE INDUCCIÓN"
        allowFontScaling={false}
        labelStyle={{ color: Colores.onPrimario }}
        style={activoItem === "/curso-induccion" && drawerStyles.activo}
        onPress={() => { toggleCerrar(); router.push("/(app)/(alumno)/curso-induccion") }}
      />

      <TouchableOpacity
        onPress={() => { toggleCerrar(); setMostrarSubmenuPlazas(!mostrarSubmenuPlazas) }}
        style={[drawerStyles.seccionEncabezado, activoItem === "/plazas" || activoItem === "/plaza-asignada" ? drawerStyles.activo : []]}
      >
        <Text allowFontScaling={false} style={drawerStyles.seccionEncabezadoTexto}>
          PLAZAS {mostrarSubmenuPlazas ? "▴" : "▾"}
        </Text>
      </TouchableOpacity>
      {mostrarSubmenuPlazas && (
        <View style={drawerStyles.mostrarSubmenuContenedor}>
          <TouchableOpacity
            style={[drawerStyles.mostrarSubmenuItem, activoItem === "/plazas" && drawerStyles.activoSubmenuItem]}
            onPress={() => { toggleCerrar(); router.push("/plazas") }}
          >
            <Text allowFontScaling={false} style={[drawerStyles.mostrarSubmenuText, activoItem === "/plazas" && { color: Colores.onPrimario }]}>Plazas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[drawerStyles.mostrarSubmenuItem, activoItem === "/plaza-asignada" && drawerStyles.activoSubmenuItem]}
            onPress={() => { toggleCerrar(); router.push("/plaza-asignada") }}
          >
            <Text allowFontScaling={false} style={[drawerStyles.mostrarSubmenuText, activoItem === "/plaza-asignada" && { color: Colores.onPrimario }]}>Plaza asignada</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        onPress={() => { toggleCerrar(); setMostrarSubmenuReportes(!mostrarSubmenuReportes) }}
        style={[drawerStyles.seccionEncabezado, activoItem === "/reportes-riesgo" || activoItem === "/encuesta-satisfaccion" ? drawerStyles.activo : []]}
      >
        <Text allowFontScaling={false} style={drawerStyles.seccionEncabezadoTexto}>
          REPORTES {mostrarSubmenuReportes ? "▴" : "▾"}
        </Text>
      </TouchableOpacity>
      {mostrarSubmenuReportes && (
        <View style={drawerStyles.mostrarSubmenuContenedor}>
          <TouchableOpacity
            style={[drawerStyles.mostrarSubmenuItem, activoItem === "/reportes-riesgo" && drawerStyles.activoSubmenuItem]}
            onPress={() => { toggleCerrar(); router.push("/reportes-riesgo") }}
          >
            <Text allowFontScaling={false} style={[drawerStyles.mostrarSubmenuText, activoItem === "/reportes-riesgo" && { color: Colores.onPrimario }]}>Situación de riesgo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[drawerStyles.mostrarSubmenuItem, activoItem === "/encuesta-satisfaccion" && drawerStyles.activoSubmenuItem]}
            onPress={() => { toggleCerrar(); router.push("/encuesta-satisfaccion") }}
          >
            <Text allowFontScaling={false} style={[drawerStyles.mostrarSubmenuText, activoItem === "/encuesta-satisfaccion" && { color: Colores.onPrimario }]}>Encuesta de satisfacción</Text>
          </TouchableOpacity>
        </View>
      )}

      <DrawerItem
        label="MI PERFIL"
        allowFontScaling={false}
        labelStyle={{ color: Colores.onPrimario }}
        style={activoItem === "/mi-perfil" && drawerStyles.activo}
        onPress={() => { toggleCerrar(); router.push("/mi-perfil") }}
      />

      <View><Text allowFontScaling={false} style={{ width: "100%", borderBottomColor: Colores.onPrimario, borderBottomWidth: 1 }}></Text></View>

      <DrawerItem
        label="CERRAR SESIÓN"
        allowFontScaling={false}
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
