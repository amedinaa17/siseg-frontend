import { useAuth } from "@/context/AuthProvider";
import { Colors, Fonts } from "@/theme/colors";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AlumnoNavbarWeb() {
  const { signOut } = useAuth();
  const router = useRouter();
  const [showSubmenuExpediente, setShowSubmenuExpediente] = useState(false);
  const [showSubmenuPlazas, setShowSubmenuPlazas] = useState(false);
  const [showSubmenuReportes, setShowSubmenuReportes] = useState(false);

  const handleLogout = async () => {
    await signOut();
    router.replace("/(auth)/login");
  };

  const toggleExpediente = () => {
    setShowSubmenuExpediente(!showSubmenuExpediente);
    setShowSubmenuPlazas(false);
    setShowSubmenuReportes(false);
  };

  const togglePlazas = () => {
    setShowSubmenuPlazas(!showSubmenuPlazas);
    setShowSubmenuExpediente(false);
    setShowSubmenuReportes(false);
  };

  const toggleReportes = () => {
    setShowSubmenuReportes(!showSubmenuReportes);
    setShowSubmenuExpediente(false);
    setShowSubmenuPlazas(false);
  };

  return (
    <View style={styles.navbar}>
      <Link href="/(app)/(alumno)" asChild>
        <TouchableOpacity>
          <Text style={styles.navItem}>INICIO</Text>
        </TouchableOpacity>
      </Link>

      <View style={styles.dropdown}>
        <TouchableOpacity onPress={toggleExpediente}>
          <Text style={styles.navItem}>
            EXPEDIENTE DIGITAL {showSubmenuExpediente ? "▴" : "▾"}
          </Text>
        </TouchableOpacity>

        {showSubmenuExpediente && (
          <View style={styles.submenu}>
            <Link href="/" asChild>
              <TouchableOpacity>
                <Text style={styles.subItem}>Acuse de Solicitud</Text>
              </TouchableOpacity>
            </Link>
            <Link href="/" asChild>
              <TouchableOpacity>
                <Text style={styles.subItem}>Ver Expediente</Text>
              </TouchableOpacity>
            </Link>
          </View>
        )}
      </View>

      <Link href="/" asChild>
        <TouchableOpacity>
          <Text style={styles.navItem}>CURSO DE INDUCCIÓN</Text>
        </TouchableOpacity>
      </Link>

      <View style={styles.dropdown}>
        <TouchableOpacity onPress={togglePlazas}>
          <Text style={styles.navItem}>
            PLAZAS {showSubmenuPlazas ? "▴" : "▾"}
          </Text>
        </TouchableOpacity>

        {showSubmenuPlazas && (
          <View style={styles.submenu}>
            <Link href="/(app)/(alumno)/CatalogoPlazas" asChild>
              <TouchableOpacity>
                <Text style={styles.subItem}>Cátalogo de Plazas</Text>
              </TouchableOpacity>
            </Link>
            <Link href="/" asChild>
              <TouchableOpacity>
                <Text style={styles.subItem}>Plaza Asignada</Text>
              </TouchableOpacity>
            </Link>
          </View>
        )}
      </View>

      <View style={styles.dropdown}>
        <TouchableOpacity onPress={toggleReportes}>
          <Text style={styles.navItem}>
            REPORTES {showSubmenuReportes ? "▴" : "▾"}
          </Text>
        </TouchableOpacity>

        {showSubmenuReportes && (

          <View style={styles.submenu}>
            <Link href="/" asChild>
              <TouchableOpacity>
                <Text style={styles.subItem}>Situación de Riesgo</Text>
              </TouchableOpacity>
            </Link>
            <Link href="/" asChild>
              <TouchableOpacity>
                <Text style={styles.subItem}>Encuesta de Satisfacción</Text>
              </TouchableOpacity>
            </Link>
          </View>
        )}
      </View>

      <Link href="/" asChild>
        <TouchableOpacity>
          <Text style={styles.navItem}>MI PERFIL</Text>
        </TouchableOpacity>
      </Link>

      <TouchableOpacity onPress={handleLogout}>
        <Text style={styles.navItem}>CERRAR SESIÓN</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: Colors.backgroundIPN,
    paddingVertical: 13,
    position: "relative",
    zIndex: 1,
  },
  navItem: {
    fontSize: Fonts.text,
    color: Colors.lightSecondary,
    fontWeight: "600",
  },
  dropdown: {
    position: "relative",
  },
  submenu: {
    backgroundColor: Colors.background,
    borderColor: Colors.borderColor,
    position: "absolute",
    top: 30,
    left: 0,
    borderWidth: 1,
    padding: 5,
    zIndex: 999,
    minWidth: 180,
    elevation: 5,
  },
  subItem: {
    fontSize: Fonts.text,
    color: Colors.darkText,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
});
