import { useAuth } from "@/context/AuthProvider";
import { Colores, Fuentes } from "@/temas/colores";
import { Link, usePathname } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";

export default function AdministrativoMenuWeb() {
  const { cerrarSesion } = useAuth();

  const { width } = useWindowDimensions();
  const menuHamburguesa = width < 790;
  const [menuHamburguesaVisible, setMenuHamburguesaVisible] = useState(false);

  const [mostrarSubmenuAlumnos, setMostrarSubmenuAlumnos] = useState(false);
  const [mostrarSubmenuPlazas, setMostrarSubmenuPlazas] = useState(false);
  const [mostrarSubmenuReportes, setMostrarSubmenuReportes] = useState(false);

  const [menuItemHoverItem, setmenuItemHoverItem] = useState<string | null>(null);
  const [menuItemHoverSubItem, setmenuItemHoverSubItem] = useState<string | null>(null);

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
    <>
      {
        menuHamburguesa && (
          <View style={{ width: '100%', backgroundColor: Colores.fondoInstitucional }}>
            <Pressable onPress={() => setMenuHamburguesaVisible(!menuHamburguesaVisible)} style={styles.botonHamburguesa}>
              <Text style={{ fontSize: 24, color: Colores.onPrimario }}>☰</Text>
            </Pressable>
          </View>
        )
      }
      <View style={[styles.menu, menuHamburguesa ? styles.menuHamburguesa : { top: -10 }]}>
        {(menuHamburguesaVisible || !menuHamburguesa) && (
          <>
            <Link href="/(app)/(administrativo)/inicio-administrativo" asChild>
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
                    activoItem === "/inicio-administrativo" && styles.activo,
                    activoItem === "/inicio-administrativo" && !menuHamburguesa && { bottom: -10 }
                  ]}
                >
                  <Text style={activoItem === "/inicio-administrativo" && !menuHamburguesa && { top: -10 }}>INICIO</Text>
                </Text>
              </Pressable>
            </Link>

            <View style={menuHamburguesa && { width: "100%" }}>
              <Pressable
                onHoverIn={() => setmenuItemHoverItem("alumnos")}
                onHoverOut={() => setmenuItemHoverItem(null)}
                onPress={() => { toggleCerrar(); setMostrarSubmenuAlumnos(!mostrarSubmenuAlumnos) }}
              >
                <Text
                  style={[
                    menuHamburguesa ? styles.menuItemHamburguesa : styles.menuItem,
                    menuItemHoverItem === "alumnos" && styles.menuItemHover,
                    activoItem === "/validar-documentos" || activoItem === "/lista-asistencia" || activoItem === "/gestionar-alumnos" ? styles.activo : [],
                    (activoItem === "/validar-documentos" || activoItem === "/lista-asistencia" || activoItem === "/gestionar-alumnos") && !menuHamburguesa && { bottom: -10 }
                  ]}
                >
                  <Text style={(activoItem === "/validar-documentos" || activoItem === "/lista-asistencia" || activoItem === "/gestionar-alumnos") && !menuHamburguesa && { top: -10 }}>ALUMNOS {mostrarSubmenuAlumnos ? "▴" : "▾"}</Text>
                </Text>
              </Pressable>

              {mostrarSubmenuAlumnos && (
                <View style={menuHamburguesa ? styles.submenuHamburguesa : styles.submenu}>
                  <Link href="/validar-documentos" asChild>
                    <Pressable
                      onHoverIn={() => setmenuItemHoverSubItem("validar-documentos")}
                      onHoverOut={() => setmenuItemHoverSubItem(null)}
                      onPress={() => { toggleCerrar(); setMenuHamburguesaVisible(false) }}
                    >
                      <Text style={[
                        styles.submenuItem,
                        menuItemHoverSubItem === "validar-documentos" && styles.submenuItemHover,
                        activoItem === "/validar-documentos" && styles.activoSubmenuItem,
                      ]}>
                        Validar documentos</Text>
                    </Pressable>
                  </Link>
                  <Link href="/lista-asistencia" asChild>
                    <Pressable
                      onHoverIn={() => setmenuItemHoverSubItem("lista-asistencia")}
                      onHoverOut={() => setmenuItemHoverSubItem(null)}
                      onPress={() => { toggleCerrar(); setMenuHamburguesaVisible(false) }}
                    >
                      <Text style={[
                        styles.submenuItem,
                        menuItemHoverSubItem === "lista-asistencia" && styles.submenuItemHover,
                        activoItem === "/lista-asistencia" && styles.activoSubmenuItem,
                      ]}>
                        Asistencia al curso de inducción
                      </Text>
                    </Pressable>
                  </Link>
                  <Link href="/gestionar-alumnos" asChild>
                    <Pressable
                      onHoverIn={() => setmenuItemHoverSubItem("gestionar-alumnos")}
                      onHoverOut={() => setmenuItemHoverSubItem(null)}
                      onPress={() => { toggleCerrar(); setMenuHamburguesaVisible(false) }}
                    >
                      <Text style={[
                        styles.submenuItem,
                        menuItemHoverSubItem === "gestionar-alumnos" && styles.submenuItemHover,
                        activoItem === "/gestionar-alumnos" && styles.activoSubmenuItem,
                      ]}>Gestionar alumnos</Text>
                    </Pressable>
                  </Link>
                </View>
              )}
            </View>

            <Link href="/gestionar-personal" asChild>
              <Pressable
                onHoverIn={() => setmenuItemHoverItem("personal")}
                onHoverOut={() => setmenuItemHoverItem(null)}
                onPress={() => { toggleCerrar(); setMenuHamburguesaVisible(false) }}
                style={menuHamburguesa && { width: "100%" }}
              >
                <Text
                  style={[
                    menuHamburguesa ? styles.menuItemHamburguesa : styles.menuItem,
                    menuItemHoverItem === "personal" && styles.menuItemHover,
                    activoItem === "/gestionar-personal" && styles.activo,
                    activoItem === "/gestionar-personal" && !menuHamburguesa && { bottom: -10 }
                  ]}
                >
                  <Text style={activoItem === "/gestionar-personal" && !menuHamburguesa && { top: -10 }}>PERSONAL ADMINISTRATIVO</Text>
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
                    (activoItem === "/gestionar-plazas" || activoItem === "/asignar-plaza" || activoItem === "/mapa-plazas") && styles.activo,
                    (activoItem === "/gestionar-plazas" || activoItem === "/asignar-plaza" || activoItem === "/mapa-plazas") && !menuHamburguesa && { bottom: -10 }
                  ]}
                >
                  <Text style={(activoItem === "/gestionar-plazas" || activoItem === "/asignar-plaza" || activoItem === "/mapa-plazas") && !menuHamburguesa && { top: -10 }}>PLAZAS {mostrarSubmenuPlazas ? "▴" : "▾"}</Text>
                </Text>
              </Pressable>

              {mostrarSubmenuPlazas && (
                <View style={menuHamburguesa ? styles.submenuHamburguesa : styles.submenu}>
                  <Link href="/gestionar-plazas" asChild>
                    <Pressable
                      onHoverIn={() => setmenuItemHoverSubItem("gestionar-plazas")}
                      onHoverOut={() => setmenuItemHoverSubItem(null)}
                      onPress={() => { toggleCerrar(); setMenuHamburguesaVisible(false) }}
                    >
                      <Text style={[
                        styles.submenuItem,
                        menuItemHoverSubItem === "gestionar-plazas" && styles.submenuItemHover,
                        activoItem === "/gestionar-plazas" && styles.activoSubmenuItem,
                      ]}>Gestionar plazas</Text>
                    </Pressable>
                  </Link>
                  <Link href="/asignar-plaza" asChild>
                    <Pressable
                      onHoverIn={() => setmenuItemHoverSubItem("asignar-plaza")}
                      onHoverOut={() => setmenuItemHoverSubItem(null)}
                      onPress={() => { toggleCerrar(); setMenuHamburguesaVisible(false) }}
                    >
                      <Text style={[
                        styles.submenuItem,
                        menuItemHoverSubItem === "asignar-plaza" && styles.submenuItemHover,
                        activoItem === "/asignar-plaza" && styles.activoSubmenuItem,
                      ]}>Asignar plaza</Text>
                    </Pressable>
                  </Link>
                  <Link href="/mapa-plazas" asChild>
                    <Pressable
                      onHoverIn={() => setmenuItemHoverSubItem("mapa-plazas")}
                      onHoverOut={() => setmenuItemHoverSubItem(null)}
                      onPress={() => { toggleCerrar(); setMenuHamburguesaVisible(false) }}
                    >
                      <Text style={[
                        styles.submenuItem,
                        menuItemHoverSubItem === "mapa-plazas" && styles.submenuItemHover,
                        activoItem === "/mapa-plazas" && styles.activoSubmenuItem,
                      ]}>Mapa de plazas</Text>
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
                    (activoItem === "/revisar-reportes-riesgo" || activoItem === "/reportes-encuestas") && styles.activo,
                    (activoItem === "/revisar-reportes-riesgo" || activoItem === "/reportes-encuestas") && !menuHamburguesa && { bottom: -10 }
                  ]}
                >
                  <Text style={(activoItem === "/revisar-reportes-riesgo" || activoItem === "/reportes-encuestas") && !menuHamburguesa && { top: -10 }}>REPORTES {mostrarSubmenuReportes ? "▴" : "▾"}</Text>
                </Text>
              </Pressable>

              {mostrarSubmenuReportes && (
                <View style={menuHamburguesa ? styles.submenuHamburguesa : styles.submenu}>
                  <Link href="/revisar-reportes-riesgo" asChild>
                    <Pressable
                      onHoverIn={() => setmenuItemHoverSubItem("revisar-reportes-riesgo")}
                      onHoverOut={() => setmenuItemHoverSubItem(null)}
                      onPress={() => { toggleCerrar(); setMenuHamburguesaVisible(false) }}
                    >
                      <Text style={[
                        styles.submenuItem,
                        menuItemHoverSubItem === "revisar-reportes-riesgo" && styles.submenuItemHover,
                        activoItem === "/revisar-reportes-riesgo" && styles.activoSubmenuItem,
                      ]}>
                        Reportes de situación de riesgo
                      </Text>
                    </Pressable>
                  </Link>
                  <Link href="/reportes-encuestas" asChild>
                    <Pressable
                      onHoverIn={() => setmenuItemHoverSubItem("reportes-encuestas")}
                      onHoverOut={() => setmenuItemHoverSubItem(null)}
                      onPress={() => { toggleCerrar(); setMenuHamburguesaVisible(false) }}
                    >
                      <Text style={[
                        styles.submenuItem,
                        menuItemHoverSubItem === "reportes-encuestas" && styles.submenuItemHover,
                        activoItem === "/reportes-encuestas" && styles.activoSubmenuItem,
                      ]}>Encuestas de satisfacción</Text>
                    </Pressable>
                  </Link>
                </View>
              )}
            </View>

            <Link href="/perfil" asChild>
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
                    activoItem === "/perfil" && styles.activo,
                    activoItem === "/perfil" && !menuHamburguesa && { bottom: -10 }
                  ]}
                >
                  <Text style={activoItem === "/perfil" && !menuHamburguesa && { top: -10 }}>
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
            </Pressable></>
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
