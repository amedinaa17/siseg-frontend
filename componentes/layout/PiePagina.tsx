import { Colores } from '@/temas/colores';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import ModalAvisoPrivacidad from './AvisoPrivacidad';

export default function PiePagina() {
  const [visibleAviso, setVisibleAviso] = useState(false);
  const esMovil = Platform.OS === "ios" || Platform.OS === "android";

  return (
    <SafeAreaView edges={["bottom"]} style={styles.seguro}>
      <View style={styles.piePagina}>
        <Text style={styles.piePaginaTexto}>Desarrollado por la Escuela Superior de Cómputo.</Text>
        <TouchableOpacity onPress={() => setVisibleAviso(true)}>
          <Text style={styles.avisoPrivacidad}> Aviso de Privacidad.</Text>
        </TouchableOpacity>
      </View>
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
    backgroundColor: Colores.fondoInstitucional,
    paddingVertical: 10,
    alignItems: 'center',
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
        gap: 50,
      },
    }),
    justifyContent: 'center',
  },
  piePaginaTexto: { color: Colores.onPrimario },
  avisoPrivacidad: { color: Colores.onPrimario },
});
