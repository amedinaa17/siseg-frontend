import { Colores } from '@/temas/colores';
import React, { useState } from 'react';
import { ImageBackground, Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import ModalAvisoPrivacidad from './AvisoPrivacidad';

export default function PiePagina() {
  const [visibleAviso, setVisibleAviso] = useState(false);
  const esMovil = Platform.OS === "ios" || Platform.OS === "android";

  return (
    <SafeAreaView edges={["bottom"]} style={styles.seguro}>
      <ImageBackground
        source={require('@/activos/imagenes/pattern-gris.png')}
        style={styles.piePagina}
        imageStyle={{ resizeMode: 'repeat' }}
      >
        <Text style={{ color: Colores.onPrimario }}>Desarrollado por la Escuela Superior de Cómputo.</Text>
        <TouchableOpacity onPress={() => setVisibleAviso(true)}>
          <Text style={{ color: Colores.onPrimario }}> Aviso de Privacidad.</Text>
        </TouchableOpacity>
      </ImageBackground>
      <ModalAvisoPrivacidad
        visible={visibleAviso}
        onClose={() => setVisibleAviso(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  seguro: {
    backgroundColor: Colores.fondoInstitucional,
    width: "100%",
  },
  piePagina: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: "space-evenly",
    width: '100%',
    height: "auto",
    ...Platform.select({
      ios: {
        flexDirection: 'column',
        gap: 5,
        marginBottom: -35,
      },
      android: {
        flexDirection: 'column',
        gap: 5,
        marginBottom: -35,
      },
      web: {
        flexDirection: 'row',
      },
    }),
  },
});
