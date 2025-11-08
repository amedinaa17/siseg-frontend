import { Colores, Fuentes } from '@/temas/colores';
import { Link } from 'expo-router';
import React from "react";
import { Image, Platform, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Encabezado() {
  const esMovil = Platform.OS === "ios" || Platform.OS === "android";
  const { width } = useWindowDimensions();
  const esPantallaPequeña = width < 600;

  return (
    <SafeAreaView edges={["top"]} style={styles.seguro}>
      <View style={styles.encabezado}>
        <Link href="/(auth)/iniciar-sesion">
          <Image
            source={require('@/activos/imagenes/enmyh.png')}
            style={styles.logo}
          />
        </Link>
        <Text style={styles.titulo}>SISEG </Text>
        {!esMovil && !esPantallaPequeña && (
          <Text style={styles.subtitulo}>
            Sistema de Seguimiento del Servicio Social para la Escuela Nacional de Medicina y Homeopatía
          </Text>
        )}
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
  titulo: {
    fontSize: Fuentes.subtitulo,
    fontWeight: "700",
    color: Colores.onPrimario,
    marginLeft: 12,
    marginRight: 12,
  },
  subtitulo: {
    fontSize: Fuentes.cuerpo,
    color: Colores.onPrimario,
  },
});
