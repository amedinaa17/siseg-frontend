import { Colores, Fuentes } from "@/temas/colores";
import * as DocumentPicker from "expo-document-picker";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  label: string;
  error?: string;
  onArchivoSeleccionado?: (file: {
    name: string;
    uri: string;
    mimeType?: string;
  }) => void;
  allowedTypes: string[];
};

export default function SelectorArchivo({
  label,
  error,
  onArchivoSeleccionado,
  allowedTypes,
}: Props) {
  const [archivo, setArchivo] = useState<string>("");
  const [focused, setFocused] = useState(false);

  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: focused || !!archivo ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [focused, archivo]);

  const seleccionarArchivo = async () => {
    setFocused(true);

    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      
      if (allowedTypes.length > 0) {
        input.accept = allowedTypes.join(", ");
      }

      input.onchange = (e: any) => {
        const file = e.target.files[0];
        if (file) {
          setArchivo(file.name);
          onArchivoSeleccionado?.({
            name: file.name,
            uri: "",
            mimeType: file.type,
          });
        }
      };
      input.click();
    } else {
      const result = await DocumentPicker.getDocumentAsync({
        type: allowedTypes.length > 0 ? allowedTypes.join(", ") : "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        const file = result.assets[0];
        
        if (file.mimeType && allowedTypes.includes(file.mimeType)) {
          setArchivo(file.name);
          onArchivoSeleccionado?.({
            name: file.name,
            uri: file.uri,
            mimeType: file.mimeType,
          });
        } else {
          alert("El archivo seleccionado no es válido. Por favor, elige un archivo de tipo permitido.");
        }
      }
    }
  };

  const estiloEtiqueta = {
    position: "absolute" as const,
    left: 12,
    top: anim.interpolate({ inputRange: [0, 1], outputRange: [14, -8] }),
    fontSize: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 12] }),
    color: error
      ? Colores.textoError
      : focused
      ? Colores.textoInfo
      : Colores.textoClaro,
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
              : focused
              ? Colores.textoInfo
              : Colores.borde,
          },
        ]}
      >
        <Animated.Text style={estiloEtiqueta}>{label}</Animated.Text>
        <Pressable style={styles.entrada} onPress={seleccionarArchivo}>
          <Text
            style={{
              color: archivo ? Colores.textoPrincipal : Colores.textoClaro,
              fontSize: 15,
            }}
            numberOfLines={1}
          >
            {archivo}
          </Text>
        </Pressable>
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
    height: 48,
  },
  entrada: {
    flex: 1,
    height: 48,
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
  },
  errorTexto: {
    color: Colores.textoError,
    marginTop: 5,
    fontSize: Fuentes.caption,
  },
});
