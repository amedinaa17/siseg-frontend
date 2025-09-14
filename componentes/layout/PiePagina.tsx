import { Colores } from '@/temas/colores';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

export default function PiePagina() {
  return (
    <SafeAreaView edges={["bottom"]} style={styles.seguro}>
      <View style={styles.piePagina}>
        <Text style={styles.piePaginaTexto}>Desarrollado por la Escuela Superior de Cómputo</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  seguro: {
    backgroundColor: Colores.fondoInstitucional,
    width: "100%",
  },
  piePagina: {
    backgroundColor: Colores.fondoSecundario,
    padding: 10,
    alignItems: 'center',
  },
  piePaginaTexto: { color: Colores.onPrimario, fontWeight: '600', textAlign: 'center', },
});
