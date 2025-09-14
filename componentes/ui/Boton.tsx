import { Colores, Fuentes } from "@/temas/colores";
import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

type PropiedadesBoton = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
};

export default function Boton({ title, onPress, disabled }: PropiedadesBoton) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ hovered, pressed }) => [
        styles.base,
        hovered && styles.hover,
        pressed && styles.hover,
        disabled && styles.deshabilitado,
      ]}
    >
      <Text style={styles.texto}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colores.textoSecundario,
    fontSize: Fuentes.cuerpo,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: "center"
  },
  hover: {
    backgroundColor: Colores.hover,
  },
  deshabilitado: {
    opacity: 0.6,
  },
  texto: {
    color: Colores.onPrimario,
    textAlign: "center",
    fontWeight: "500"
  },
});
