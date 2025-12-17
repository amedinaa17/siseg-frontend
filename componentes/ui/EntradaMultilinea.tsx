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
  const inputRef = React.useRef<TextInput>(null);
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
    elevation: 2,
    left: 12,
    paddingRight: editable ? 15 : 20,
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
        <Animated.Text
          style={estiloEtiqueta}
          allowFontScaling={false}
          numberOfLines={1}
          ellipsizeMode="tail"
          onPress={() => {
            if (!editable) return;
            inputRef.current?.focus();
          }}
          suppressHighlighting
        >
          {label}
        </Animated.Text>
        <TextInput
          {...props}
          ref={inputRef}
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

      <Text allowFontScaling={false} style={error && styles.errorTexto}>
        {error}
      </Text>
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
    flex: 1,
    minHeight: 100,
    fontSize: 15,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
    color: Colores.textoPrincipal,
  },
  errorTexto: {
    color: Colores.textoError,
    marginTop: 10,
    marginBottom: 10,
    fontSize: Fuentes.caption,
  },
});
