import { Colores, Fuentes } from "@/temas/colores";
import * as DocumentPicker from "expo-document-picker";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Platform, Pressable, StyleSheet, Text, View } from "react-native";

type ArchivoInfo = {
  name: string;
  uri: string;
  type: string;
  size: number;
  file?: any;
};

type Props = {
  label: string;
  error?: string;
  onArchivoSeleccionado?: (formData: FormData) => void;
  allowedTypes: string[];
  tamanoMaximoMB?: number;
};

export default function SelectorArchivo({
  label,
  error,
  onArchivoSeleccionado,
  allowedTypes,
  tamanoMaximoMB = 2,
}: Props) {
  const [archivo, setArchivo] = useState<ArchivoInfo | null>(null);
  const [errorArchivo, setErrorArchivo] = useState<string>("");
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
    setErrorArchivo("");

    try {
      if (Platform.OS === "web") {
        const input = document.createElement("input");
        input.type = "file";

        if (allowedTypes.length > 0) {
          input.accept = allowedTypes.join(", ");
        }

        input.onchange = async (e: any) => {
          const file = e.target.files[0];
          if (file) {
            const tamanoMB = file.size / (1024 * 1024);
            if (tamanoMB > tamanoMaximoMB) {
              setErrorArchivo("El archivo es demasiado grande.");
              setArchivo(null);
              return;
            }

            const archivoInfo: ArchivoInfo = {
              uri: URL.createObjectURL(file),
              name: file.name,
              type: file.type,
              size: file.size,
              file: file,
            };

            setArchivo(archivoInfo);

            const formData = new FormData();
            formData.append('file', archivoInfo.file || archivoInfo);
            onArchivoSeleccionado?.(formData);
          }
        };
        input.click();
      } else {
        const result = await DocumentPicker.getDocumentAsync({
          type: allowedTypes.length > 0 ? allowedTypes : undefined,
          copyToCacheDirectory: true,
        });

        if (!result.canceled) {
          const file = result.assets[0];
          if (file) {
            const archivoInfo: ArchivoInfo = {
              name: file.name,
              uri: file.uri,
              type: file.mimeType || 'application/pdf',
              size: file.size || 0,
            };

            const tamanoMB = archivoInfo.size / (1024 * 1024);
            if (tamanoMB > tamanoMaximoMB) {
              setErrorArchivo("El archivo es demasiado grande.");
              return;
            }

            setArchivo(archivoInfo);

            const formData = new FormData();
            formData.append('file', {
              uri: archivoInfo.uri,
              name: archivoInfo.name,
              type: archivoInfo.type,
            } as any);
            onArchivoSeleccionado?.(formData);
          }
        }
      }
    } catch (error) {
      setErrorArchivo("No se pudo seleccionar el archivo.");
    }
  };

  const estiloEtiqueta = {
    position: "absolute" as const,
    left: 12,
    top: anim.interpolate({ inputRange: [0, 1], outputRange: [14, -8] }),
    fontSize: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 12] }),
    color: (error || errorArchivo) ? Colores.textoError
      : focused ? Colores.textoInfo
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
            borderColor: (error || errorArchivo) ? Colores.textoError
              : focused ? Colores.textoInfo
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
            {archivo?.name}
          </Text>
        </Pressable>
      </View>
      <View style={{ flexDirection: Platform.OS === "web" ? "row" : "column", justifyContent: errorArchivo ? "space-between" : "flex-end" }}>
        {(error || errorArchivo) && <Text style={styles.errorTexto}>{error ? error : errorArchivo}</Text>}
        {archivo && (
          <Text style={{ color: errorArchivo ? Colores.textoError : Colores.textoInfo, fontSize: Fuentes.caption, marginTop: 5 }}>
            ({(archivo.size / (1024 * 1024)).toFixed(2)} MB)
          </Text>
        )}
      </View>
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
