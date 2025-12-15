import { Colores } from '@/temas/colores';
import React, { useState } from 'react';
import { ImageBackground, Platform, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import ModalAvisoPrivacidad from './AvisoPrivacidad';
import ModalAyuda from './ModalAyuda';
import ModalTC from './ModalTC';

export default function PiePagina() {
  const [visibleAviso, setVisibleAviso] = useState(false);
  const [visibleTC, setVisibleTC] = useState(false);
  const [visibleAyuda, setVisibleAyuda] = useState(false);
  const { width } = useWindowDimensions();
  const esPantallaPequeña = Platform.OS === "ios" || Platform.OS === "android" || width < 625;

  return (
    <ImageBackground
      source={require('@/activos/imagenes/pattern-gris.png')}
      style={{ width: '100%', height: "auto" }}
      resizeMode='repeat'
    >
      <SafeAreaView edges={["bottom"]} style={{ backgroundColor: "transparent" }}>
        <View style={[styles.contenedor, { flexDirection: esPantallaPequeña ? 'column' : 'row' }]}>
          {esPantallaPequeña && (
            <>
              <Text allowFontScaling={false} style={[styles.texto, { marginBottom: 5 }]}>Desarrollado por la Escuela Superior de Cómputo</Text>
              <View style={[styles.fila, { gap: 50 }]}>
                <TouchableOpacity onPress={() => setVisibleAviso(true)}>
                  <Text allowFontScaling={false} style={styles.texto}> Aviso de Privacidad</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setVisibleTC(true)}>
                  <Text allowFontScaling={false} style={styles.texto}>TyC</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setVisibleAyuda(true)}>
                  <Text allowFontScaling={false} style={styles.texto}>Ayuda</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
          {!esPantallaPequeña && (
            <>
              <TouchableOpacity style={styles.fila} onPress={() => setVisibleAviso(true)}>
                <Text allowFontScaling={false} style={styles.texto}>Aviso de Privacidad</Text>
              </TouchableOpacity>
              <Text allowFontScaling={false} style={styles.texto}>Desarrollado por la Escuela Superior de Cómputo</Text>
              <TouchableOpacity style={styles.fila} onPress={() => setVisibleTC(true)}>
                <Text allowFontScaling={false} style={styles.texto}>Términos y Condiciones</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.fila} onPress={() => setVisibleAyuda(true)}>
                <Text allowFontScaling={false} style={styles.texto}>Ayuda</Text>
              </TouchableOpacity>
            </>
          )}

          <ModalAvisoPrivacidad
            visible={visibleAviso}
            onClose={() => setVisibleAviso(false)}
          />
          <ModalTC
            visible={visibleTC}
            onClose={() => setVisibleTC(false)}
          />
          <ModalAyuda
            visible={visibleAyuda}
            onClose={() => setVisibleAyuda(false)}
          />
        </View>
      </SafeAreaView>
    </ImageBackground >
  );
}

const styles = StyleSheet.create({
  contenedor: {
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: "space-evenly",
    height: "auto",
    bottom: 0,
  },
  imagen: {
    width: 30,
    height: 30,
    marginRight: 5,
  },
  texto: {
    color: Colores.onPrimario,
    fontSize: 12,
  },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginRight: 10
  },
});
