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
        pressed && styles.presionado,
        disabled && styles.deshabilitado,
      ]}
    >
      <Text style={styles.texto}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: "#333333",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  hover: {
    backgroundColor: "#666666",
  },
  presionado: {
    backgroundColor: "#666666",
  },
  deshabilitado: {
    opacity: 0.6,
  },
  texto: {
    color: "white",
    fontWeight: "700",
    textAlign: "center",
  },
});
