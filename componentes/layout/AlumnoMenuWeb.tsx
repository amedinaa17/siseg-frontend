import { useAuth } from "@/context/AuthProvider";
import { Colores, Fuentes } from "@/temas/colores";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AlumnoMenuWeb() {
  const { cerrarSesion } = useAuth();
  const router = useRouter();
  const [mostrarSubmenuExpediente, setMostrarSubmenuExpediente] = useState(false);
  const [mostrarSubmenuPlazas, setMostrarSubmenuPlazas] = useState(false);
  const [mostrarSubmenuReportes, setMostrarSubmenuReportes] = useState(false);

  const handleLogout = async () => {
    await cerrarSesion();
    router.replace("/(auth)/iniciar-sesion");
  };

  const toggleExpediente = () => {
    setMostrarSubmenuExpediente(!mostrarSubmenuExpediente);
    setMostrarSubmenuPlazas(false);
    setMostrarSubmenuReportes(false);
  };

  const togglePlazas = () => {
    setMostrarSubmenuPlazas(!mostrarSubmenuPlazas);
    setMostrarSubmenuExpediente(false);
    setMostrarSubmenuReportes(false);
  };

  const toggleReportes = () => {
    setMostrarSubmenuReportes(!mostrarSubmenuReportes);
    setMostrarSubmenuExpediente(false);
    setMostrarSubmenuPlazas(false);
  };

  return (
    <View style={styles.menu}>
      <Link href="/(app)/(alumno)" asChild>
        <TouchableOpacity>
          <Text style={styles.menuItem}>INICIO</Text>
        </TouchableOpacity>
      </Link>

      <View style={styles.submenuContenedor}>
        <TouchableOpacity onPress={toggleExpediente}>
          <Text style={styles.menuItem}>
            EXPEDIENTE DIGITAL {mostrarSubmenuExpediente ? "▴" : "▾"}
          </Text>
        </TouchableOpacity>

        {mostrarSubmenuExpediente && (
          <View style={styles.submenu}>
            <Link href="/" asChild>
              <TouchableOpacity>
                <Text style={styles.submenuitem}>Acuse de Solicitud</Text>
              </TouchableOpacity>
            </Link>
            <Link href="/expediente-digital" asChild>
              <TouchableOpacity>
                <Text style={styles.submenuitem}>Ver Expediente</Text>
              </TouchableOpacity>
            </Link>
          </View>
        )}
      </View>

      <Link href="/" asChild>
        <TouchableOpacity>
          <Text style={styles.menuItem}>CURSO DE INDUCCIÓN</Text>
        </TouchableOpacity>
      </Link>

      <View style={styles.submenuContenedor}>
        <TouchableOpacity onPress={togglePlazas}>
          <Text style={styles.menuItem}>
            PLAZAS {mostrarSubmenuPlazas ? "▴" : "▾"}
          </Text>
        </TouchableOpacity>

        {mostrarSubmenuPlazas && (
          <View style={styles.submenu}>
            <Link href="/(app)/(alumno)/catalogo-plazas" asChild>
              <TouchableOpacity>
                <Text style={styles.submenuitem}>Cátalogo de Plazas</Text>
              </TouchableOpacity>
            </Link>
            <Link href="/" asChild>
              <TouchableOpacity>
                <Text style={styles.submenuitem}>Plaza Asignada</Text>
              </TouchableOpacity>
            </Link>
          </View>
        )}
      </View>

      <View style={styles.submenuContenedor}>
        <TouchableOpacity onPress={toggleReportes}>
          <Text style={styles.menuItem}>
            REPORTES {mostrarSubmenuReportes ? "▴" : "▾"}
          </Text>
        </TouchableOpacity>

        {mostrarSubmenuReportes && (

          <View style={styles.submenu}>
            <Link href="/reportes-riesgo" asChild>
              <TouchableOpacity>
                <Text style={styles.submenuitem}>Situación de Riesgo</Text>
              </TouchableOpacity>
            </Link>
            <Link href="/" asChild>
              <TouchableOpacity>
                <Text style={styles.submenuitem}>Encuesta de Satisfacción</Text>
              </TouchableOpacity>
            </Link>
          </View>
        )}
      </View>

      <Link href="/mi-perfil" asChild>
        <TouchableOpacity>
          <Text style={styles.menuItem}>MI PERFIL</Text>
        </TouchableOpacity>
      </Link>

      <TouchableOpacity onPress={handleLogout}>
        <Text style={styles.menuItem}>CERRAR SESIÓN</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  menu: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: Colores.fondoInstitucional,
    paddingVertical: 13,
    position: "relative",
    zIndex: 1,
  },
  menuItem: {
    fontSize: Fuentes.cuerpo,
    color: Colores.onPrimario,
    fontWeight: "600",
  },
  submenuContenedor: {
    position: "relative",
  },
  submenu: {
    backgroundColor: Colores.fondo,
    borderColor: Colores.borde,
    position: "absolute",
    top: 30,
    left: 0,
    borderWidth: 1,
    padding: 5,
    zIndex: 999,
    minWidth: 180,
    elevation: 5,
  },
  submenuitem: {
    fontSize: Fuentes.cuerpo,
    color: Colores.textoSecundario,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
});
