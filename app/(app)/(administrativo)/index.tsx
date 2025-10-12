import { useAuth } from "@/context/AuthProvider";
import { Colores, Fuentes } from '@/temas/colores';
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";

export default function InicioPersonalAdministrativo() {
  const { sesion } = useAuth();
  const esMovil = Platform.OS === "ios" || Platform.OS === "android";

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
            <View style={styles.tarjeta}>
              <Text style={styles.tarjetaTitulo}>Alumnos registrados</Text>
              <Text style={styles.tarjetaValor}>250</Text>
            </View>
            <View style={styles.tarjeta}>
              <Text style={styles.tarjetaTitulo}>Alumnos realizando su servicio social</Text>
              <Text style={styles.tarjetaValor}>238</Text>
            </View>
            <View style={styles.tarjeta}>
              <Text style={styles.tarjetaTitulo}>Reportes de incidencia nuevos</Text>
              <Text style={styles.tarjetaValor}>3</Text>
            </View>
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
  },
  tarjeta: {
    flex: 1,
    minWidth: 200,
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
