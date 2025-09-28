import { Colores } from '@/temas/colores';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import ModalAvisoPrivacidad from './AvisoPrivacidad';

export default function PiePagina() {
  const [visibleAviso, setVisibleAviso] = useState(false);

  return (
    <SafeAreaView edges={["bottom"]} style={styles.seguro}>
      <View style={styles.piePagina}>
        <Text>
          <Text style={styles.piePaginaTexto}>Desarrollado por la Escuela Superior de Cómputo.</Text>
          <TouchableOpacity onPress={() => setVisibleAviso(true)}>
            <Text style={styles.avisoPrivacidad}> Aviso de Privacidad.</Text>
          </TouchableOpacity>
        </Text>
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
  },
  piePaginaTexto: { color: Colores.onPrimario, paddingEnd: 30 },
  avisoPrivacidad: { color: Colores.onPrimario, fontWeight: '600' },
});
