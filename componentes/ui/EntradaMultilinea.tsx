import { Colores, Fuentes } from '@/temas/colores';
import React, { useState } from "react";
import { Animated, Platform, StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

type Propiedades = TextInputProps & {
  label: string;
  error?: string;
};

export default function EntradaMultilinea({
  label,
  error,
  value,
  onFocus,
  onBlur,
  style,
  editable = true,
  ...props
}: Propiedades) {
  const [focused, setFocused] = useState(false);
  const anim = React.useRef(new Animated.Value(value ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(anim, {
      toValue: focused || !!value ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [focused, value]);

  const estiloEtiqueta = {
    position: "absolute" as const,
    zIndex: 100,
    left: 12,
    top: anim.interpolate({ inputRange: [0, 1], outputRange: [14, -8] }),
    fontSize: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 12] }),
    color: error ? Colores.textoError : focused && editable ? Colores.textoInfo : Colores.textoClaro,
    backgroundColor: Colores.fondo,
    paddingHorizontal: 4,
  };

  return (
    <View>
      <View
        style={[
          styles.contenedor,
          {
            borderColor: error
              ? Colores.textoError
              : focused && editable
                ? Colores.textoInfo
                : Colores.borde,
          },
        ]}
      >
        <Animated.Text style={estiloEtiqueta} allowFontScaling={false}>{label}</Animated.Text>
        <TextInput
          {...props}
          editable={editable}
          value={value}
          allowFontScaling={false}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[
            styles.entrada,
            style,
            Platform.OS === "web"
              ? ({ outlineStyle: "none" } as any)
              : null,
          ]}
          multiline={true}
          textAlignVertical="top"
        />
      </View>

      {error && <Text style={styles.errorTexto}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    borderWidth: 1,
    borderRadius: 8,
    borderColor: Colores.borde,
    backgroundColor: Colores.fondo,
    position: "relative",
  },
  entrada: {
    minHeight: 100,
    fontSize: 15,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
    color: Colores.textoPrincipal,
  },
  errorTexto: {
    color: Colores.textoError,
    marginTop: 5,
    fontSize: Fuentes.caption,
  },
});
