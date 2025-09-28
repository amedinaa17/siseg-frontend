import { useAuth } from "@/context/AuthProvider";
import { Colores, Fuentes } from "@/temas/colores";
import { Link, usePathname, useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";

export default function AlumnoMenuWeb() {
  const { cerrarSesion } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const { width } = useWindowDimensions();
  const menuHamburguesa = width < 780;
  const [menuHamburguesaVisible, setMenuHamburguesaVisible] = useState(false);

  const [mostrarSubmenuExpediente, setMostrarSubmenuExpediente] = useState(false);
  const [mostrarSubmenuPlazas, setMostrarSubmenuPlazas] = useState(false);
  const [mostrarSubmenuReportes, setMostrarSubmenuReportes] = useState(false);

  const [menuItemHoverItem, setmenuItemHoverItem] = useState<string | null>(null);
  const [menuItemHoverSubItem, setmenuItemHoverSubItem] = useState<string | null>(null);

  const getActivoItem = (): string | null => {
    if (pathname === "/") return "inicio";
    if (["/expediente-digital", "/acuse-solicitud"].includes(pathname)) return "expediente";
    if (pathname === "/curso-induccion") return "curso";
    if (["/catalogo-plazas", "/plaza-asignada"].includes(pathname)) return "plazas";
    if (["/reportes-riesgo", "/encuesta-satisfaccion"].includes(pathname)) return "reportes";
    if (pathname === "/mi-perfil") return "perfil";
    return null;
  };

  const activoItem = getActivoItem();

  const handleLogout = async () => {
    await cerrarSesion();
    router.replace("/(auth)/iniciar-sesion");
  };

  const toggleExpediente = () => {
    const next = !mostrarSubmenuExpediente;
    setMostrarSubmenuExpediente(next);
    setMostrarSubmenuPlazas(false);
    setMostrarSubmenuReportes(false);
  };
  const togglePlazas = () => {
    const next = !mostrarSubmenuPlazas;
    setMostrarSubmenuPlazas(next);
    setMostrarSubmenuExpediente(false);
    setMostrarSubmenuReportes(false);
  };
  const toggleReportes = () => {
    const next = !mostrarSubmenuReportes;
    setMostrarSubmenuReportes(next);
    setMostrarSubmenuExpediente(false);
    setMostrarSubmenuPlazas(false);
  };

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
            <Link href="/(app)/(alumno)" asChild>
              <Pressable
                onHoverIn={() => setmenuItemHoverItem("inicio")}
                onHoverOut={() => setmenuItemHoverItem(null)}
                style={menuHamburguesa && { width: "100%" }}
                onPress={() => setMenuHamburguesaVisible(false)}
              >
                <Text
                  style={[
                    menuHamburguesa ? styles.menuItemHamburguesa : styles.menuItem,
                    menuItemHoverItem === "inicio" && styles.menuItemHover,
                    activoItem === "inicio" && styles.activo,
                    activoItem === "inicio" && !menuHamburguesa && { bottom: -10 },
                  ]}
                >
                  <Text style={activoItem === "inicio" && !menuHamburguesa && { top: -10 }}>
                    INICIO
                  </Text>
                </Text>
              </Pressable>
            </Link>

            <View style={menuHamburguesa && { width: "100%" }}>
              <Pressable
                onHoverIn={() => setmenuItemHoverItem("expediente")}
                onHoverOut={() => setmenuItemHoverItem(null)}
                onPress={toggleExpediente}
              >
                <Text
                  style={[
                    menuHamburguesa ? styles.menuItemHamburguesa : styles.menuItem,
                    menuItemHoverItem === "expediente" && styles.menuItemHover,
                    activoItem === "expediente" && styles.activo,
                    activoItem === "expediente" && !menuHamburguesa && { bottom: -10 },
                  ]}
                >
                  <Text
                    style={activoItem === "expediente" && !menuHamburguesa && { top: -10 }}
                  >
                    EXPEDIENTE DIGITAL {mostrarSubmenuExpediente ? "▴" : "▾"}
                  </Text>
                </Text>
              </Pressable>

              {mostrarSubmenuExpediente && (
                <View style={menuHamburguesa ? styles.submenuHamburguesa : styles.submenu}>
                  <Link href="/" asChild>
                    <Pressable
                      onHoverIn={() => setmenuItemHoverSubItem("acuse")}
                      onHoverOut={() => setmenuItemHoverSubItem(null)}
                      onPress={() => {
                        setMostrarSubmenuExpediente(false);
                        setMenuHamburguesaVisible(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.submenuitem,
                          menuItemHoverSubItem === "acuse" && styles.submenuItemHover,
                        ]}
                      >
                        Acuse de Solicitud
                      </Text>
                    </Pressable>
                  </Link>

                  <Link href="/expediente-digital" asChild>
                    <Pressable
                      onHoverIn={() => setmenuItemHoverSubItem("expediente-digital")}
                      onHoverOut={() => setmenuItemHoverSubItem(null)}
                      onPress={() => {
                        setMostrarSubmenuExpediente(false);
                        setMenuHamburguesaVisible(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.submenuitem,
                          menuItemHoverSubItem === "expediente-digital" &&
                            styles.submenuItemHover,
                        ]}
                      >
                        Ver Expediente
                      </Text>
                    </Pressable>
                  </Link>
                </View>
              )}
            </View>

            <Link href="/" asChild>
              <Pressable
                onHoverIn={() => setmenuItemHoverItem("curso")}
                onHoverOut={() => setmenuItemHoverItem(null)}
                onPress={() => setMenuHamburguesaVisible(false)}
                style={menuHamburguesa && { width: "100%" }}
              >
                <Text
                  style={[
                    menuHamburguesa ? styles.menuItemHamburguesa : styles.menuItem,
                    menuItemHoverItem === "curso" && styles.menuItemHover,
                    activoItem === "curso" && styles.activo,
                    activoItem === "curso" && !menuHamburguesa && { bottom: -10 },
                  ]}
                >
                  <Text style={activoItem === "curso" && !menuHamburguesa && { top: -10 }}>
                    CURSO DE INDUCCIÓN
                  </Text>
                </Text>
              </Pressable>
            </Link>

            <View style={menuHamburguesa && { width: "100%" }}>
              <Pressable
                onHoverIn={() => setmenuItemHoverItem("plazas")}
                onHoverOut={() => setmenuItemHoverItem(null)}
                onPress={togglePlazas}
              >
                <Text
                  style={[
                    menuHamburguesa ? styles.menuItemHamburguesa : styles.menuItem,
                    menuItemHoverItem === "plazas" && styles.menuItemHover,
                    activoItem === "plazas" && styles.activo,
                    activoItem === "plazas" && !menuHamburguesa && { bottom: -10 },
                  ]}
                >
                  <Text style={activoItem === "plazas" && !menuHamburguesa && { top: -10 }}>
                    PLAZAS {mostrarSubmenuPlazas ? "▴" : "▾"}
                  </Text>
                </Text>
              </Pressable>

              {mostrarSubmenuPlazas && (
                <View style={menuHamburguesa ? styles.submenuHamburguesa : styles.submenu}>
                  <Link href="/(app)/(alumno)/catalogo-plazas" asChild>
                    <Pressable
                      onHoverIn={() => setmenuItemHoverSubItem("catalogo-plazas")}
                      onHoverOut={() => setmenuItemHoverSubItem(null)}
                      onPress={() => {
                        setMostrarSubmenuPlazas(false);
                        setMenuHamburguesaVisible(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.submenuitem,
                          menuItemHoverSubItem === "catalogo-plazas" &&
                            styles.submenuItemHover,
                        ]}
                      >
                        Cátalogo de Plazas
                      </Text>
                    </Pressable>
                  </Link>

                  <Link href="/" asChild>
                    <Pressable
                      onHoverIn={() => setmenuItemHoverSubItem("plaza-asignada")}
                      onHoverOut={() => setmenuItemHoverSubItem(null)}
                      onPress={() => {
                        setMostrarSubmenuPlazas(false);
                        setMenuHamburguesaVisible(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.submenuitem,
                          menuItemHoverSubItem === "plaza-asignada" &&
                            styles.submenuItemHover,
                        ]}
                      >
                        Plaza Asignada
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
                onPress={toggleReportes}
              >
                <Text
                  style={[
                    menuHamburguesa ? styles.menuItemHamburguesa : styles.menuItem,
                    menuItemHoverItem === "reportes" && styles.menuItemHover,
                    activoItem === "reportes" && styles.activo,
                    activoItem === "reportes" && !menuHamburguesa && { bottom: -10 },
                  ]}
                >
                  <Text style={activoItem === "reportes" && !menuHamburguesa && { top: -10 }}>
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
                      onPress={() => {
                        setMostrarSubmenuReportes(false);
                        setMenuHamburguesaVisible(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.submenuitem,
                          menuItemHoverSubItem === "reportes-riesgo" &&
                            styles.submenuItemHover,
                        ]}
                      >
                        Situación de Riesgo
                      </Text>
                    </Pressable>
                  </Link>

                  <Link href="/" asChild>
                    <Pressable
                      onHoverIn={() => setmenuItemHoverSubItem("encuesta-satisfaccion")}
                      onHoverOut={() => setmenuItemHoverSubItem(null)}
                      onPress={() => {
                        setMostrarSubmenuReportes(false);
                        setMenuHamburguesaVisible(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.submenuitem,
                          menuItemHoverSubItem === "encuesta-satisfaccion" &&
                            styles.submenuItemHover,
                        ]}
                      >
                        Encuesta de Satisfacción
                      </Text>
                    </Pressable>
                  </Link>
                </View>
              )}
            </View>

            {/* PERFIL */}
            <Link href="/mi-perfil" asChild>
              <Pressable
                onHoverIn={() => setmenuItemHoverItem("perfil")}
                onHoverOut={() => setmenuItemHoverItem(null)}
                onPress={() => setMenuHamburguesaVisible(false)}
                style={menuHamburguesa && { width: "100%" }}
              >
                <Text
                  style={[
                    menuHamburguesa ? styles.menuItemHamburguesa : styles.menuItem,
                    menuItemHoverItem === "perfil" && styles.menuItemHover,
                    activoItem === "perfil" && styles.activo,
                    activoItem === "perfil" && !menuHamburguesa && { bottom: -10 },
                  ]}
                >
                  <Text style={activoItem === "perfil" && !menuHamburguesa && { top: -10 }}>
                    MI PERFIL
                  </Text>
                </Text>
              </Pressable>
            </Link>

            {/* CERRAR SESIÓN */}
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
  activo: {
    backgroundColor: "rgba(51, 51, 51, 0.6)",
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
  submenuitem: {
    fontSize: Fuentes.cuerpo,
    color: Colores.textoSecundario,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  submenuItemHover: {
    backgroundColor: "rgba(51, 51, 51, 0.8)",
    color: Colores.onPrimario,
  },
});
