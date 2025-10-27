import { Colores, Fuentes } from '@/temas/colores';
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

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
  secureTextEntry,
  editable = true,
  ...props
}: Propiedades) {
  const [focused, setFocused] = React.useState(false);
  const [mostrarContraseña, setMostrarContraseña] = React.useState(false);
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
    left: 12,
    top: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [14, -8],
    }),
    fontSize: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: error
      ? Colores.textoError
      : focused
      ? Colores.textoInfo
      : Colores.textoClaro,
    backgroundColor: Colores.fondo,
    paddingHorizontal: 4,
  };

  if (!editable) {
    return (
      <View style={{ marginBottom: 8 }}>
        <View style={styles.contenedorReadonly}>
          <Text style={styles.labelReadonly}>{label}</Text>
          <Text
            style={styles.textReadonly}
            numberOfLines={0}
            selectable={true}
          >
            {value ?? ""}
          </Text>
        </View>
        {error && <Text style={styles.errorTexto}>{error}</Text>}
      </View>
    );
  }

  return (
    <View style={{ marginBottom: 8 }}>
      <View
        style={[
          styles.contenedor,
          {
            borderColor: error
              ? Colores.textoError
              : focused
              ? Colores.textoInfo
              : Colores.borde,
          },
        ]}
      >
        <Animated.Text style={estiloEtiqueta}>{label}</Animated.Text>

        <TextInput
          {...props}
          value={value}
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
            Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : null,
          ]}
          underlineColorAndroid="transparent"
          textAlignVertical="center"
          multiline={false}
        />

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
    flexDirection: "row",
    alignItems: "center",
  },
  entrada: {
    flex: 1,
    height: 48,
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colores.textoPrincipal,
    lineHeight: 20, 
  },
  icono: {
    position: "absolute",
    right: 12,
    padding: 6,
  },
  errorTexto: {
    color: Colores.textoError,
    marginTop: 5,
    fontSize: Fuentes.caption,
  },

  contenedorReadonly: {
    borderWidth: 1,
    borderRadius: 8,
    borderColor: Colores.borde,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  labelReadonly: {
    fontSize: 12,
    color: Colores.textoClaro,
    marginBottom: 4,
  },
  textReadonly: {
    fontSize: 15,
    color: Colores.textoPrincipal,
    lineHeight: 20,
  },
});
