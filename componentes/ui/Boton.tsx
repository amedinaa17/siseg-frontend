import { Colores, Fuentes } from "@/temas/colores";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type PropiedadesBoton = {
  title?: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  color?: string;
};

export default function Boton({ title, onPress, disabled, icon, color }: PropiedadesBoton) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ hovered, pressed }) => [
        styles.base,
        { backgroundColor: color || Colores.textoSecundario },
        hovered && styles.hover,
        pressed && styles.hover,
        disabled && styles.deshabilitado,
        !icon && { paddingVertical: 10, paddingHorizontal: 10 }
      ]}
    >
      <View style={styles.contenedorBoton}>
        {icon && <View>{icon}</View>}
        {title && <Text allowFontScaling={false} style={styles.texto}>{title}</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    fontSize: Fuentes.cuerpo,
    borderRadius: 6,
    alignItems: "center",
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
    fontWeight: "500",
  },
  contenedorBoton: {
    flexDirection: "row",
    margin: "auto",
  },
});
