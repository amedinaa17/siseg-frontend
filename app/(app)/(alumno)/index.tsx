import { useAuth } from "@/context/AuthProvider";
import { Colores, Fuentes } from '@/temas/colores';
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";

export default function InicioAlumno() {
  const { sesion } = useAuth();
  const esMovil = Platform.OS === "ios" || Platform.OS === "android";

  return (
    <View style={{ flex: 1, backgroundColor: Colores.fondo }}>
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
          <Text style={styles.nombreAlumno}>{sesion?.nombre || "Alumno"}</Text>
          <Text style={styles.idAlumno}>{sesion?.boleta || ""}</Text>

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
      </ScrollView>
    </View>
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
  nombreAlumno: {
    fontSize: Fuentes.subtitulo,
    color: Colores.textoPrincipal,
    marginBottom: 3,
  },
  idAlumno: {
    fontSize: Fuentes.subtitulo,
    color: Colores.textoSecundario,
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
