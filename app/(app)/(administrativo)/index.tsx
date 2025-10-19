import ModalAPI, { ModalAPIRef } from "@/componentes/layout/ModalAPI";
import { useAuth } from "@/context/AuthProvider";
import { fetchData } from "@/servicios/api";
import { Colores, Fuentes } from '@/temas/colores';
import { Link } from 'expo-router';
import React, { useEffect, useRef, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";

export default function InicioPersonalAdministrativo() {
  const { sesion, verificarToken } = useAuth();
  const esMovil = Platform.OS === "ios" || Platform.OS === "android";

  const modalAPI = useRef<ModalAPIRef>(null);

  const [kpis, setKpis] = useState({
    alumnosRegistrados: 0,
    alumnosRealizandoSS: 0,
    reportesdeIncidencias: 0,
  });

  useEffect(() => {
    const obtenerKpis = async () => {
      verificarToken();

      try {
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
      }
    };

    obtenerKpis();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: Colores.background }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.contenedorFormulario}>
          <View style={styles.encabezado}>
            <Text style={styles.sisegTexto}>SISEG</Text>
            {!esMovil && (
              <Text style={styles.sisegDescripcion}>
                Sistema de Seguimiento del Servicio Social para la Escuela Nacional de Medicina y Homeopatía
              </Text>
            )}
          </View>

          <Text style={styles.titulo}>Bienvenido</Text>
          <Text style={styles.nombrePersonalAdministrativo}>{sesion?.nombre || "Personal Administrativo"}</Text>
          <Text style={styles.idPersonalAdministrativo}>{sesion?.boleta || ""}</Text>

          <View style={styles.tarjetaContenedor}>
            <Link href="/(app)/(administrativo)/gestionar-alumnos">
              <View style={styles.tarjeta}>
                <Text style={styles.tarjetaTitulo}>Alumnos registrados</Text>
                <Text style={styles.tarjetaValor}>{kpis.alumnosRegistrados}</Text>
              </View>
            </Link>
            <Link href="/(app)/(administrativo)/gestionar-alumnos">
              <View style={styles.tarjeta}>
                <Text style={styles.tarjetaTitulo}>Alumnos realizando su servicio social</Text>
                <Text style={styles.tarjetaValor}>{kpis.alumnosRealizandoSS}</Text>
              </View>
            </Link>
            <Link href="/(app)/(administrativo)/revisar-reportes-riesgo">
              <View style={styles.tarjeta}>
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
  encabezado: {
    flexDirection: "row",
    justifyContent: "flex-end",
    flexWrap: "nowrap",
    alignItems: "center",
    marginBottom: 24,
  },
  sisegTexto: {
    fontSize: Fuentes.display,
    color: Colores.primario,
    fontWeight: "700",
    marginRight: 12,
  },
  sisegDescripcion: {
    fontSize: Fuentes.cuerpo,
    color: Colores.textoSecundario,
    flexWrap: "nowrap",
  },
  titulo: {
    fontSize: Fuentes.titulo,
    color: Colores.primario,
    fontWeight: "700",
    marginTop: 25,
    marginBottom: 10,
  },
  nombrePersonalAdministrativo: {
    fontSize: Fuentes.subtitulo,
    color: Colores.textoPrincipal,
    marginBottom: 3,
  },
  idPersonalAdministrativo: {
    fontSize: Fuentes.subtitulo,
    color: Colores.textoSecundario,
    marginBottom: 20,
  },
  tarjetaContenedor: {
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: "wrap",
    marginVertical: 20,
    width:"100%"
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
