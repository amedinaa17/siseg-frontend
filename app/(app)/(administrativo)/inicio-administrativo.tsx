import ModalAPI, { ModalAPIRef } from "@/componentes/layout/ModalAPI";
import { useAuth } from "@/context/AuthProvider";
import { fetchData } from "@/servicios/api";
import { Colores, Fuentes } from '@/temas/colores';
import { Link } from 'expo-router';
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

export default function InicioPersonalAdministrativo() {
  const { sesion, verificarToken } = useAuth();

  const [cargando, setCargando] = useState(false);

  const [administrativo, setAdministrativo] = useState<any>(null);
  const modalAPI = useRef<ModalAPIRef>(null);

  const { width } = useWindowDimensions();
  const esPantallaPequeña = width < 790;
  const esMovil = Platform.OS === "ios" || Platform.OS === "android";

  const [kpis, setKpis] = useState({
    alumnosRegistrados: "-",
    alumnosRealizandoSS: "-",
    reportesdeIncidencias: "-",
  });

  useEffect(() => {
    const obtenerKpis = async () => {
      verificarToken();

      try {
        setCargando(true);
        const response = await fetchData(`users/obtenerkpis?tk=${sesion.token}`);
        const data = await response;

        if (data.error === 0) {
          setKpis({
            alumnosRegistrados: data.alumnosRegistrados,
            alumnosRealizandoSS: data.alumnosRealizandoSS,
            reportesdeIncidencias: data.reportesdeIncidencias,
          });
        } else {
          modalAPI.current?.show(false, "Hubo un problema al obtener los datos del servidor. Inténtalo de nuevo más tarde.");
        }
      } catch (error) {
        modalAPI.current?.show(false, "Error al conectar con el servidor. Inténtalo de nuevo más tarde.");
      } finally {
        setCargando(false);
      }
    };

    obtenerKpis();
  }, []);

  useEffect(() => {
    const obtenerDatos = async () => {
      verificarToken();

      if (sesion?.token) {
        try {
          setCargando(true);

          const response = await fetchData(`users/obtenerTodosDatosAdmin?tk=${sesion.token}`);
          if (response.error === 0) {
            setAdministrativo(response.data);
          } else {
            modalAPI.current?.show(false, "Hubo un problema al obtener tus datos del servidor. Inténtalo de nuevo más tarde.");
          }
        } catch (error) {
          modalAPI.current?.show(false, "Error al conectar con el servidor. Inténtalo de nuevo más tarde.");
        } finally {
          setCargando(false);
        }
      }
    };

    obtenerDatos();
  }, []);

  return (
    <>
      {cargando && (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white", position: "absolute", top: 60, left: 0, right: 0, bottom: 0, zIndex: 100 }}>
          <ActivityIndicator size="large" color="#5a0839" />
        </View>
      )}
      <View style={{ flex: 1, backgroundColor: Colores.fondo }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.contenedorFormulario}>
            <View style={styles.sisegContenedor}>
              <Text style={styles.sisegSiglas}>SISEG</Text>
              {!esMovil && (
                <Text style={styles.siseg}>
                  Sistema de Seguimiento del Servicio Social para la Escuela Nacional de Medicina y Homeopatía
                </Text>
              )}
            </View>
            <View style={styles.sisegContenedor}>
              <Text style={[styles.sisegDescripcion, esMovil || esPantallaPequeña ? { textAlign: "justify" } : { textAlign: "right", width: "50%" }]}>
                Es una herramienta informática diseñada para dar seguimiento al servicio social de la <Text style={{ fontWeight: '600' }}>Escuela Nacional de Medicina y Homeopatía</Text>.
              </Text>
            </View>
            <Text style={styles.titulo}>Bienvenido</Text>
            <Text style={styles.nombreAdmin}>{sesion?.nombre + " " + administrativo?.apellido_paterno + " " + administrativo?.apellido_materno}</Text>
            <Text style={styles.boleta}>{sesion?.boleta || ""}</Text>

            <View style={[styles.tarjetaContenedor, { flexDirection: esMovil ? "column" : "row" }]}>
              <Link href="/(app)/(administrativo)/gestionar-alumnos" style={esMovil && { minWidth: "100%", marginBottom: 15 }}>
                <View style={[styles.tarjeta, esMovil && { width: "100%" }]}>
                  <Text style={styles.tarjetaTitulo}>Alumnos registrados</Text>
                  <Text style={styles.tarjetaValor}>{kpis.alumnosRegistrados}</Text>
                </View>
              </Link>
              <Link href="/(app)/(administrativo)/gestionar-alumnos" style={esMovil && { minWidth: "100%", marginBottom: 15 }}>
                <View style={[styles.tarjeta, esMovil && { width: "100%" }]}>
                  <Text style={styles.tarjetaTitulo}>Alumnos realizando su servicio social</Text>
                  <Text style={styles.tarjetaValor}>{kpis.alumnosRealizandoSS}</Text>
                </View>
              </Link>
              <Link href="/(app)/(administrativo)/revisar-reportes-riesgo">
                <View style={[styles.tarjeta, esMovil && { width: "100%" }]}>
                  <Text style={styles.tarjetaTitulo}>Reportes de incidencia nuevos</Text>
                  <Text style={styles.tarjetaValor}>{kpis.reportesdeIncidencias}</Text>
                </View>
              </Link>
            </View>

            <View style={styles.piePagina}>
              <View style={styles.avisoContainer}>
                <Text style={styles.avisoTexto}>AVISO</Text>
                <View style={styles.separacion} />
                <Text style={styles.piePaginaTexto}>
                  Tus datos personales son protegidos conforme a lo establecido por la Ley General de Protección de Datos Personales en Posesión de los Particulares.
                </Text>
              </View>
            </View>
          </View>
          <ModalAPI ref={modalAPI} />
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  contenedorFormulario: {
    width: "90%",
    maxWidth: 1000,
    height: "auto",
    margin: "auto",
    padding: 24,
    marginVertical: 20,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: Colores.borde,
    backgroundColor: Colores.fondo,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
      },
    }),
  },
  sisegContenedor: {
    flexDirection: "row",
    justifyContent: "flex-end",
    flexWrap: "nowrap",
    alignItems: "center",
    marginBottom: 24,
  },
  sisegSiglas: {
    fontSize: Fuentes.display,
    color: Colores.primario,
    fontWeight: "700",
    marginRight: 12,
  },
  siseg: {
    fontSize: Fuentes.cuerpo,
    color: Colores.textoSecundario,
    paddingTop: 3,
    flexWrap: "nowrap",
  },
  sisegDescripcion: {
    fontSize: Fuentes.cuerpo,
    color: Colores.textoSecundario,
  },
  titulo: {
    fontSize: Fuentes.titulo,
    color: Colores.primario,
    fontWeight: "700",
    marginTop: 25,
    marginBottom: 10,
  },
  nombreAdmin: {
    fontSize: Fuentes.subtitulo,
    color: Colores.textoPrincipal,
    fontWeight: "600",
    marginBottom: 3,
  },
  boleta: {
    fontSize: Fuentes.subtitulo,
    color: Colores.textoSecundario,
    marginBottom: 3,
  },
  tarjetaContenedor: {
    justifyContent: "space-around",
    flexWrap: "wrap",
    marginVertical: 20,
    width: "100%"
  },
  tarjeta: {
    flex: 1,
    minWidth: 300,
    margin: 8,
    backgroundColor: Colores.fondos,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colores.borde,
    alignItems: "center",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 6 },
      android: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 6 },
      web: { boxShadow: "0px 4px 6px rgba(0,0,0,0.05)" },
    }),
    elevation: 2,
  },
  tarjetaTitulo: {
    fontSize: Fuentes.cuerpo,
    color: Colores.textoSecundario,
    textAlign: "center",
    marginBottom: 8,
  },
  tarjetaValor: {
    fontSize: Fuentes.titulo,
    fontWeight: "700",
    color: Colores.primario,
  },
  piePagina: {
    marginTop: 50,
    paddingVertical: 10,
    flex: 1,
    justifyContent: 'flex-end',
  },
  avisoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  avisoTexto: {
    fontSize: Fuentes.titulo,
    color: Colores.primario,
    fontWeight: "700",
    marginRight: 10,
  },
  separacion: {
    backgroundColor: Colores.primario,
    width: 1.5,
    height: 35,
    marginRight: 10,
  },
  piePaginaTexto: {
    fontSize: Fuentes.caption,
    color: Colores.textoSecundario,
    flex: 1,
    textAlign: 'right',
  },
});
