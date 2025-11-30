import { Colores } from '@/temas/colores';
import React, { useState } from 'react';
import { ImageBackground, Platform, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import ModalAvisoPrivacidad from './AvisoPrivacidad';
import ModalContacto from './Contacto';

export default function PiePagina() {
  const [visibleAviso, setVisibleAviso] = useState(false);
  const [visibleContacto, setVisibleContacto] = useState(false);
  const { width } = useWindowDimensions();
  const esPantallaPequeña = Platform.OS === "ios" || Platform.OS === "android" || width < 790;

  return (
    <ImageBackground
      source={require('@/activos/imagenes/pattern-gris.png')}
      style={{ width: '100%', height: "auto" }}
      resizeMode='repeat'
    >
      <SafeAreaView edges={["bottom"]} style={{ backgroundColor: "transparent" }}>
        <View style={[styles.contenedor, { flexDirection: esPantallaPequeña ? 'column' : 'row' }]}>
          {esPantallaPequeña && (<>
            <Text style={styles.texto}>Desarrollado por la Escuela Superior de Cómputo</Text>
            <View style={[styles.fila, { gap: 50 }]}>
              <TouchableOpacity onPress={() => setVisibleAviso(true)}>
                <Text style={styles.texto}> Aviso de Privacidad</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setVisibleContacto(true)}>
                <Text style={styles.texto}>Contacto</Text>
              </TouchableOpacity>
            </View>
          </>
          )}
          {!esPantallaPequeña && (
            <>
              <TouchableOpacity style={styles.fila} onPress={() => setVisibleAviso(true)}>
                <Text style={styles.texto}>Aviso de Privacidad</Text>
              </TouchableOpacity>
              <Text style={styles.texto}>Desarrollado por la Escuela Superior de Cómputo</Text>

              <TouchableOpacity style={styles.fila} onPress={() => setVisibleContacto(true)}>
                <Text style={styles.texto}>Contacto{"         "}</Text>
              </TouchableOpacity>
            </>
          )}

          <ModalAvisoPrivacidad
            visible={visibleAviso}
            onClose={() => setVisibleAviso(false)}
          />

          <ModalContacto
            visible={visibleContacto}
            onClose={() => setVisibleContacto(false)}
          />
        </View>
      </SafeAreaView>
    </ImageBackground >
  );
}

const styles = StyleSheet.create({
  contenedor: {
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: "space-evenly",
    height: "auto",
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
