import ModalAPI, { ModalAPIRef } from "@/componentes/layout/ModalAPI";
import { useAuth } from "@/context/AuthProvider";
import { fetchData } from "@/servicios/api";
import { Colores, Fuentes } from '@/temas/colores';
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

export default function InicioAlumno() {
  const { sesion, verificarToken } = useAuth();

  const [cargando, setCargando] = useState(false);

  const [alumno, setAlumno] = useState<any>(null);
  const modalAPI = useRef<ModalAPIRef>(null);


  const { width } = useWindowDimensions();
  const esPantallaPequeña = width < 790;
  const esMovil = Platform.OS === "ios" || Platform.OS === "android";

  useEffect(() => {
    const obtenerDatos = async () => {
      verificarToken();

      if (sesion?.token) {
        try {
          setCargando(true);

          const response = await fetchData(`users/obtenerTodosDatosAlumno?tk=${sesion.token}`);
          if (response.error === 0) {
            setAlumno(response.data);
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
              <Text style={[styles.sisegDescripcion, esMovil || esPantallaPequeña ? { textAlign: "justify" } : { textAlign: "right", width: "60%" }]}>
                Es una herramienta informática diseñada para dar seguimiento al servicio social de la <Text style={{ fontWeight: '600' }}>Escuela Nacional de Medicina y Homeopatía</Text>.
              </Text>
            </View>
            <Text style={styles.titulo}>Bienvenido</Text>
            <Text style={styles.nombreAlumno}>{sesion?.nombre + " " + alumno?.apellido_paterno + " " + alumno?.apellido_materno}</Text>
            <Text style={styles.boleta}>{sesion?.boleta || ""}</Text>
            <Text style={styles.carrera}>{alumno?.carrera || ""}</Text>

            <View style={styles.piePagina}>
              <View style={styles.avisoContenedor}>
                <Text style={styles.avisoTexto}>AVISO</Text>
                <View style={styles.separador} />
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
    height: "80%",
    margin: "auto",
    padding: 24,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: Colores.borde,
    backgroundColor: Colores.fondo,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 6 },
      android: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 6 },
      web: { boxShadow: "0px 4px 6px rgba(0,0,0,0.05)" },
    }),
    elevation: 2,
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
  nombreAlumno: {
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
  carrera: {
    fontSize: Fuentes.textoClaro,
    color: Colores.textoClaro,
  },
  piePagina: {
    marginTop: 50,
    paddingVertical: 10,
    flex: 1,
    justifyContent: 'flex-end',
  },
  avisoContenedor: {
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
  separador: {
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
