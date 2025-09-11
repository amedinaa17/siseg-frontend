import { Colores, Fuentes } from '@/temas/colores';
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";

export default function InicioPersonalAdministrativo() {
  const esMovil = Platform.OS === "ios" || Platform.OS === "android";

  return (
    <View style={{ flex: 1, backgroundColor: Colores.background }}>
      <ScrollView contentContainerStyle={styles.scroll}>
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
          <Text style={styles.nombrePersonalAdministrativo}>MEDINA ANGELES ANA CRISTINA</Text>
          <Text style={styles.idPersonalAdministrativo}>2022630301</Text>

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
  scroll: {
    flexGrow: 1,
    justifyContent: "space-between",
    alignItems: "center",
  },
  contenedorFormulario: {
    width: "90%",
    maxWidth: 1000,
    height: "auto",
    margin: "auto",
    padding: 24,
    marginVertical: 20,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: Colores.bordes,
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
    fontSize: Fuentes.grande,
    color: Colores.textoGuinda,
    fontWeight: "700",
    marginRight: 12,
  },
  sisegDescripcion: {
    fontSize: Fuentes.texto,
    color: Colores.textoOscuro,
    flexWrap: "nowrap",
  },
  titulo: {
    fontSize: Fuentes.titulo,
    color: Colores.textoGuinda,
    fontWeight: "700",
    marginTop: 25,
    marginBottom: 5,
  },
  nombrePersonalAdministrativo: {
    fontSize: Fuentes.mediano,
    color: Colores.texto,
  },
  idPersonalAdministrativo: {
    fontSize: Fuentes.mediano,
    color: Colores.textoOscuro,
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
    borderColor: Colores.bordes,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
      },
    }),
  },
  tarjetaTitulo: {
    fontSize: Fuentes.texto,
    color: Colores.textoOscuro,
    textAlign: "center",
    marginBottom: 8,
  },
  tarjetaValor: {
    fontSize: Fuentes.titulo,
    fontWeight: "700",
    color: Colores.textoGuinda,
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
    color: Colores.textoGuinda,
    fontWeight: "700",
    marginRight: 10,
  },
  separacion: {
    backgroundColor: Colores.textoGuinda,
    width: 1.5,
    height: 35,
    marginRight: 10,
  },
  piePaginaTexto: {
    fontSize: Fuentes.pequeño,
    color: Colores.textoOscuro,
    flex: 1,
    textAlign: 'right',
  },
});
