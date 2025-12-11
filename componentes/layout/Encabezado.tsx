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
        <Link href="/(auth)/iniciar-sesion" style={{ marginLeft: "8%" }}>
          <View style={{ width: 80, height: 80, position: 'relative' }}>
            <Image
              source={require('@/activos/imagenes/enmyh.png')}
              style={[styles.logo, { marginTop: esMovil ? 0 : 12 }]}
            />
            <View style={[styles.logoTail, { marginTop: esMovil ? 80 : 91.5 }]} />
          </View>
        </Link>
        <Text allowFontScaling={false} style={styles.titulo}>SISEG </Text>
        {!esMovil && !esPantallaPequeña && (
          <Text allowFontScaling={false} style={styles.subtitulo}>
            Sistema de Seguimiento del Servicio Social para la Escuela Nacional de Medicina y Homeopatía
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  seguro: {
    backgroundColor: "rgba(51, 51, 51, 0.5)",
    width: "100%",
  },
  encabezado: {
    backgroundColor: Colores.fondoInstitucional,
    flexDirection: "row",
    alignItems: "center",
    height: 60,
  },
  logo: {
    width: 80,
    height: 80,
    position: 'absolute',
    backgroundColor: "rgba(51, 51, 51, 0.5)",
  },
  logoTail: {
    position: 'absolute',
    width: 80,
    left: 0,
    height: 0,
    borderLeftWidth: 40,
    borderRightWidth: 40,
    borderTopWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: "rgba(51, 51, 51, 0.5)",
  },
  titulo: {
    fontSize: Fuentes.subtitulo,
    fontWeight: "700",
    color: Colores.onPrimario,
    marginLeft: 30,
    marginRight: 12,
  },
  subtitulo: {
    fontSize: Fuentes.cuerpo,
    color: Colores.onPrimario,
  },
});
