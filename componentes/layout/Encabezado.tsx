import { Colores, Fuentes } from '@/temas/colores';
import { Link } from 'expo-router';
import React from "react";
import { Image, Platform, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Encabezado() {
  const esMovil = Platform.OS === "ios" || Platform.OS === "android";

  return (
    <SafeAreaView edges={["top"]} style={styles.seguro}>
      <View style={styles.encabezado}>
        <Link href="/">
          <Image
            source={require('@/activos/imagenes/enmyh.png')}
            style={styles.logo}
          />
        </Link>
        <Text style={styles.textoEnLinea}>
          <Text style={styles.titulo}>SISEG </Text>
          {!esMovil && (
            <Text style={styles.subtitulo}>
              Sistema de Seguimiento del Servicio Social para la Escuela Nacional de Medicina y Homeopatía
            </Text>
          )}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  seguro: {
    backgroundColor: Colores.fondoInstitucional,
    width: "100%",
  },
  encabezado: {
    backgroundColor: Colores.fondoInstitucional,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  logo: {
    width: 60,
    height: 60,
    marginLeft: "5%",
  },
  textoEnLinea: {
    flex: 1,
    flexWrap: "wrap",
    color: Colores.onPrimario,
  },
  titulo: {
    fontSize: Fuentes.subtitulo,
    fontWeight: "700",
    color: Colores.onPrimario,
    marginLeft: 12,
    marginRight: 12,
  },
  subtitulo: {
    fontSize: Fuentes.cuerpo
  },
});
