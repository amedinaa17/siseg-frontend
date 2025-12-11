import { useAuth } from "@/context/AuthProvider";
import { Colores, Fuentes } from "@/temas/colores";
import { Link, usePathname } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";

export default function AlumnoMenuWeb() {
  const { cerrarSesion } = useAuth();
  const pathname = usePathname();

  const { width } = useWindowDimensions();
  const menuHamburguesa = width < 790;
  const [menuHamburguesaVisible, setMenuHamburguesaVisible] = useState(false);

  const [mostrarSubmenuExpediente, setMostrarSubmenuExpediente] = useState(false);
  const [mostrarSubmenuPlazas, setMostrarSubmenuPlazas] = useState(false);
  const [mostrarSubmenuReportes, setMostrarSubmenuReportes] = useState(false);

  const [menuItemHoverItem, setmenuItemHoverItem] = useState<string | null>(null);
  const [menuItemHoverSubItem, setmenuItemHoverSubItem] = useState<string | null>(null);

  const activoItem = pathname;

  const handleLogout = async () => {
    await cerrarSesion();
  };

  const toggleCerrar = () => {
    setMostrarSubmenuExpediente(false);
    setMostrarSubmenuPlazas(false);
    setMostrarSubmenuReportes(false);
  }

  return (
    <>
      {menuHamburguesa && (
        <View style={{ width: "100%", backgroundColor: Colores.fondoInstitucional }}>
          <Pressable
            onPress={() => setMenuHamburguesaVisible(!menuHamburguesaVisible)}
            style={styles.botonHamburguesa}
          >
            <Text style={{ fontSize: 24, color: Colores.onPrimario }}>☰</Text>
          </Pressable>
        </View>
      )}

      <View style={[styles.menu, menuHamburguesa ? styles.menuHamburguesa : { top: -10 }]}>
        {(menuHamburguesaVisible || !menuHamburguesa) && (
          <>
            <Link href="/(app)/(alumno)/inicio-alumno" asChild>
              <Pressable
                onHoverIn={() => setmenuItemHoverItem("inicio")}
                onHoverOut={() => setmenuItemHoverItem(null)}
                style={menuHamburguesa && { width: "100%" }}
                onPress={() => { toggleCerrar(); setMenuHamburguesaVisible(false) }}
              >
                <Text
                  style={[
                    menuHamburguesa ? styles.menuItemHamburguesa : styles.menuItem,
                    menuItemHoverItem === "inicio" && styles.menuItemHover,
                    activoItem === "/inicio-alumno" && styles.activo,
                    activoItem === "/inicio-alumno" && !menuHamburguesa && { bottom: -10 },
                  ]}
                >
                  <Text style={activoItem === "/inicio-alumno" && !menuHamburguesa && { top: -10 }}>
                    INICIO
                  </Text>
                </Text>
              </Pressable>
            </Link>

            <View style={menuHamburguesa && { width: "100%" }}>
              <Pressable
                onHoverIn={() => setmenuItemHoverItem("expediente")}
                onHoverOut={() => setmenuItemHoverItem(null)}
                onPress={() => { toggleCerrar(); setMostrarSubmenuExpediente(!mostrarSubmenuExpediente) }}
              >
                <Text
                  style={[
                    menuHamburguesa ? styles.menuItemHamburguesa : styles.menuItem,
                    menuItemHoverItem === "expediente" && styles.menuItemHover,
                    (activoItem === "/expediente-digital" || activoItem === "/acuse-solicitud") && styles.activo,
                    (activoItem === "/expediente-digital" || activoItem === "/acuse-solicitud") && !menuHamburguesa && { bottom: -10 },
                  ]}
                >
                  <Text
                    style={(activoItem === "/expediente-digital" || activoItem === "/acuse-solicitud") && !menuHamburguesa && { top: -10 }}
                  >
                    EXPEDIENTE DIGITAL {mostrarSubmenuExpediente ? "▴" : "▾"}
                  </Text>
                </Text>
              </Pressable>

              {mostrarSubmenuExpediente && (
                <View style={menuHamburguesa ? styles.submenuHamburguesa : styles.submenu}>
                  <Link href="/(app)/(alumno)/acuse-solicitud" asChild>
                    <Pressable
                      onHoverIn={() => setmenuItemHoverSubItem("acuse-solicitud")}
                      onHoverOut={() => setmenuItemHoverSubItem(null)}
                      onPress={() => { toggleCerrar(); setMenuHamburguesaVisible(false) }}
                    >
                      <Text
                        style={[
                          styles.submenuItem,
                          menuItemHoverSubItem === "acuse-solicitud" && styles.submenuItemHover,
                          activoItem === "/acuse-solicitud" && styles.activoSubmenuItem,
                        ]}
                      >
                        Acuse de solicitud
                      </Text>
                    </Pressable>
                  </Link>

                  <Link href="/expediente-digital" asChild>
                    <Pressable
                      onHoverIn={() => setmenuItemHoverSubItem("expediente-digital")}
                      onHoverOut={() => setmenuItemHoverSubItem(null)}
                      onPress={() => { toggleCerrar(); setMenuHamburguesaVisible(false) }}
                    >
                      <Text
                        style={[
                          styles.submenuItem,
                          menuItemHoverSubItem === "expediente-digital" && styles.submenuItemHover,
                          activoItem === "/expediente-digital" && styles.activoSubmenuItem,
                        ]}
                      >
                        Ver expediente
                      </Text>
                    </Pressable>
                  </Link>
                </View>
              )}
            </View>

            <Link href="/(app)/(alumno)/curso-induccion" asChild>
              <Pressable
                onHoverIn={() => setmenuItemHoverItem("curso-induccion")}
                onHoverOut={() => setmenuItemHoverItem(null)}
                onPress={() => { toggleCerrar(); setMenuHamburguesaVisible(false) }}
                style={menuHamburguesa && { width: "100%" }}
              >
                <Text
                  style={[
                    menuHamburguesa ? styles.menuItemHamburguesa : styles.menuItem,
                    menuItemHoverItem === "curso" && styles.menuItemHover,
                    activoItem === "/curso-induccion" && styles.activo,
                    activoItem === "/curso-induccion" && !menuHamburguesa && { bottom: -10 },
                  ]}
                >
                  <Text style={activoItem === "/curso-induccion" && !menuHamburguesa && { top: -10 }}>
                    CURSO DE INDUCCIÓN
                  </Text>
                </Text>
              </Pressable>
            </Link>

            <View style={menuHamburguesa && { width: "100%" }}>
              <Pressable
                onHoverIn={() => setmenuItemHoverItem("plazas")}
                onHoverOut={() => setmenuItemHoverItem(null)}
                onPress={() => { toggleCerrar(); setMostrarSubmenuPlazas(!mostrarSubmenuPlazas) }}
              >
                <Text
                  style={[
                    menuHamburguesa ? styles.menuItemHamburguesa : styles.menuItem,
                    menuItemHoverItem === "plazas" && styles.menuItemHover,
                    (activoItem === "/plazas" || activoItem === "/plaza-asignada") && styles.activo,
                    (activoItem === "/plazas" || activoItem === "/plaza-asignada") && !menuHamburguesa && { bottom: -10 },
                  ]}
                >
                  <Text style={(activoItem === "/plazas" || activoItem === "/plaza-asignada") && !menuHamburguesa && { top: -10 }}>
                    PLAZAS {mostrarSubmenuPlazas ? "▴" : "▾"}
                  </Text>
                </Text>
              </Pressable>

              {mostrarSubmenuPlazas && (
                <View style={menuHamburguesa ? styles.submenuHamburguesa : styles.submenu}>
                  <Link href="/(app)/(alumno)/plazas" asChild>
                    <Pressable
                      onHoverIn={() => setmenuItemHoverSubItem("plazas")}
                      onHoverOut={() => setmenuItemHoverSubItem(null)}
                      onPress={() => { toggleCerrar(); setMenuHamburguesaVisible(false) }}
                    >
                      <Text
                        style={[
                          styles.submenuItem,
                          menuItemHoverSubItem === "plazas" && styles.submenuItemHover,
                          activoItem === "/plazas" && styles.activoSubmenuItem,
                        ]}
                      >
                        Plazas
                      </Text>
                    </Pressable>
                  </Link>

                  <Link href="/(app)/(alumno)/plaza-asignada" asChild>
                    <Pressable
                      onHoverIn={() => setmenuItemHoverSubItem("plaza-asignada")}
                      onHoverOut={() => setmenuItemHoverSubItem(null)}
                      onPress={() => { toggleCerrar(); setMenuHamburguesaVisible(false) }}
                    >
                      <Text
                        style={[
                          styles.submenuItem,
                          menuItemHoverSubItem === "plaza-asignada" && styles.submenuItemHover,
                          activoItem === "/plaza-asignada" && styles.activoSubmenuItem,
                        ]}
                      >
                        Plaza asignada
                      </Text>
                    </Pressable>
                  </Link>
                </View>
              )}
            </View>

            <View style={menuHamburguesa && { width: "100%" }}>
              <Pressable
                onHoverIn={() => setmenuItemHoverItem("reportes")}
                onHoverOut={() => setmenuItemHoverItem(null)}
                onPress={() => { toggleCerrar(); setMostrarSubmenuReportes(!mostrarSubmenuReportes) }}
              >
                <Text
                  style={[
                    menuHamburguesa ? styles.menuItemHamburguesa : styles.menuItem,
                    menuItemHoverItem === "reportes" && styles.menuItemHover,
                    (activoItem === "/reportes-riesgo" || activoItem === "/encuesta-satisfaccion") && styles.activo,
                    (activoItem === "/reportes-riesgo" || activoItem === "/encuesta-satisfaccion") && !menuHamburguesa && { bottom: -10 },
                  ]}
                >
                  <Text style={(activoItem === "/reportes-riesgo" || activoItem === "/encuesta-satisfaccion") && !menuHamburguesa && { top: -10 }}>
                    REPORTES {mostrarSubmenuReportes ? "▴" : "▾"}
                  </Text>
                </Text>
              </Pressable>

              {mostrarSubmenuReportes && (
                <View style={menuHamburguesa ? styles.submenuHamburguesa : styles.submenu}>
                  <Link href="/reportes-riesgo" asChild>
                    <Pressable
                      onHoverIn={() => setmenuItemHoverSubItem("reportes-riesgo")}
                      onHoverOut={() => setmenuItemHoverSubItem(null)}
                      onPress={() => { toggleCerrar(); setMenuHamburguesaVisible(false) }}
                    >
                      <Text
                        style={[
                          styles.submenuItem,
                          menuItemHoverSubItem === "reportes-riesgo" && styles.submenuItemHover,
                          activoItem === "/reportes-riesgo" && styles.activoSubmenuItem,
                        ]}
                      >
                        Situación de riesgo
                      </Text>
                    </Pressable>
                  </Link>

                  <Link href="/encuesta-satisfaccion" asChild>
                    <Pressable
                      onHoverIn={() => setmenuItemHoverSubItem("encuesta-satisfaccion")}
                      onHoverOut={() => setmenuItemHoverSubItem(null)}
                      onPress={() => { toggleCerrar(); setMenuHamburguesaVisible(false) }}
                    >
                      <Text
                        style={[
                          styles.submenuItem,
                          menuItemHoverSubItem === "encuesta-satisfaccion" && styles.submenuItemHover,
                          activoItem === "/encuesta-satisfaccion" && styles.activoSubmenuItem,
                        ]}
                      >
                        Encuesta de satisfacción
                      </Text>
                    </Pressable>
                  </Link>
                </View>
              )}
            </View>

            <Link href="/mi-perfil" asChild>
              <Pressable
                onHoverIn={() => setmenuItemHoverItem("perfil")}
                onHoverOut={() => setmenuItemHoverItem(null)}
                onPress={() => { toggleCerrar(); setMenuHamburguesaVisible(false) }}
                style={menuHamburguesa && { width: "100%" }}
              >
                <Text
                  style={[
                    menuHamburguesa ? styles.menuItemHamburguesa : styles.menuItem,
                    menuItemHoverItem === "perfil" && styles.menuItemHover,
                    activoItem === "/mi-perfil" && styles.activo,
                    activoItem === "/mi-perfil" && !menuHamburguesa && { bottom: -10 },
                  ]}
                >
                  <Text style={activoItem === "/mi-perfil" && !menuHamburguesa && { top: -10 }}>
                    MI PERFIL
                  </Text>
                </Text>
              </Pressable>
            </Link>

            <Pressable
              onPress={handleLogout}
              onHoverIn={() => setmenuItemHoverItem("cerrar")}
              onHoverOut={() => setmenuItemHoverItem(null)}
              style={menuHamburguesa && { width: "100%" }}
            >
              <Text
                style={[
                  menuHamburguesa ? styles.menuItemHamburguesa : styles.menuItem,
                  menuItemHoverItem === "cerrar" && styles.menuItemHover,
                ]}
              >
                CERRAR SESIÓN
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  botonHamburguesa: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    margin: 6,
    alignSelf: "flex-start",
    borderRadius: 6,
  },
  menu: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: Colores.fondoInstitucional,
    position: "relative",
    zIndex: 1,
  },
  menuHamburguesa: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  menuItem: {
    fontSize: Fuentes.cuerpo,
    color: Colores.onPrimario,
    fontWeight: "600",
    paddingTop: 23,
    paddingBottom: 13,
    paddingHorizontal: 10,
  },
  menuItemHamburguesa: {
    fontSize: Fuentes.cuerpo,
    color: Colores.onPrimario,
    fontWeight: "600",
    paddingTop: 13,
    paddingBottom: 13,
    paddingHorizontal: 10,
  },
  menuItemHover: {
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  submenu: {
    backgroundColor: Colores.fondo,
    borderColor: Colores.borde,
    position: "absolute",
    top: 55,
    left: 0,
    borderWidth: 1,
    zIndex: 999,
    minWidth: 160,
    elevation: 5,
  },
  submenuHamburguesa: {
    position: "relative",
    top: 0,
    left: 0,
    borderWidth: 0,
    backgroundColor: Colores.fondo,
    paddingVertical: 4,
  },
  submenuItem: {
    fontSize: Fuentes.cuerpo,
    color: Colores.textoSecundario,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  submenuItemHover: {
    backgroundColor: "rgba(224, 224, 224, 0.8)",
  },
  activo: {
    backgroundColor: "rgba(51, 51, 51, 0.6)",
  },
  activoSubmenuItem: {
    backgroundColor: "rgba(51, 51, 51, 0.8)",
    color: Colores.onPrimario
  },
});
