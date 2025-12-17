import { Colores, Fuentes } from '@/temas/colores';
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Animated, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

type Propiedades = TextInputProps & {
  label: string;
  error?: string;
};

export default function Entrada({
  label,
  error,
  value,
  onFocus,
  onBlur,
  style,
  editable = true,
  secureTextEntry,
  ...props
}: Propiedades) {
  const [focused, setFocused] = React.useState(false);
  const [mostrarContraseña, setMostrarContraseña] = React.useState(false);
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

        <ScrollView
          horizontal
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        >
          <TextInput
            ref={inputRef}
            {...props}
            editable={editable}
            value={value}
            allowFontScaling={false}
            secureTextEntry={secureTextEntry && !mostrarContraseña}
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
          />
        </ScrollView>

        {secureTextEntry && (
          <Pressable
            onPress={() => setMostrarContraseña((prev) => !prev)}
            style={styles.icono}
          >
            <Ionicons
              name={mostrarContraseña ? "eye-off-outline" : "eye-outline"}
              size={21}
              color="#6b7280"
            />
          </Pressable>
        )}
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
    flexDirection: "row",
    alignItems: "center",
  },
  entrada: {
    flex: 1,
    height: 48,
    fontSize: 15,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
    color: Colores.textoPrincipal,
  },
  icono: {
    position: "absolute",
    right: 12,
    padding: 6,
  },
  errorTexto: {
    color: Colores.textoError,
    marginTop: 10,
    marginBottom: 10,
    fontSize: Fuentes.caption,
  },
});