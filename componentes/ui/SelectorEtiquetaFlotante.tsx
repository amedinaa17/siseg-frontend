import { Colores } from '@/temas/colores';
import React, { useEffect, useRef, useState } from "react";
import { Animated, Modal, Pressable, StyleSheet, Text, View, } from "react-native";

type Item = { label: string; value: string };

type Propiedades = {
  label: string;
  selectedValue?: string;
  onValueChange: (value: string) => void;
  items: Item[];
  error?: string;
};

export default function FloatingLabelSelect({
  label,
  selectedValue,
  onValueChange,
  items,
  error,
}: Propiedades) {
  const [focused, setFocused] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const anim = useRef(new Animated.Value(selectedValue ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: focused || !!selectedValue ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [focused, selectedValue]);

  const isError = !!error;

  const estiloEtiqueta = {
    position: "absolute" as const,
    left: 12,
    top: anim.interpolate({ inputRange: [0, 1], outputRange: [14, -8] }),
    fontSize: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 12] }),
    color: isError ? Colores.error : focused ? Colores.link : Colores.textoClaro,
    backgroundColor: Colores.fondo,
    paddingHorizontal: 4,
  };

  return (
    <View>
      <Pressable
        onPress={() => setModalVisible(true)}
        style={[
          styles.contenedor,
          {
            borderColor: isError
              ? Colores.error
              : focused
              ? Colores.link
              : Colores.textoClaro,
          },
        ]}
      >
        <Animated.Text style={estiloEtiqueta}>{label}</Animated.Text>
        <Text
          style={[
            styles.valorTexto,
            { color: selectedValue ? Colores.texto : Colores.textoClaro },
          ]}
        >
          {selectedValue || ""}
        </Text>
      </Pressable>

      {error && <Text style={styles.errorTexto}>{error}</Text>}

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {items.map((item) => (
              <Pressable
                key={item.value}
                onPress={() => {
                  onValueChange(item.value);
                  setModalVisible(false);
                  setFocused(true);
                }}
                style={styles.opcion}
              >
                <Text style={styles.textoOpcion}>{item.label}</Text>
              </Pressable>
            ))}

            <Pressable
              onPress={() => setModalVisible(false)}
              style={[styles.opcion, styles.cancelarOpcion]}
            >
              <Text style={styles.cancelarTexto}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    borderWidth: 1,
    borderRadius: 8,
    borderColor: Colores.textoClaro,
    backgroundColor: Colores.fondo,
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    paddingHorizontal: 12,
  },
  valorTexto: {
    flex: 1,
    fontSize: 16,
    color: Colores.texto,
  },
  errorTexto: {
    color: Colores.error,
    marginTop: 5,
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalBox: {
    backgroundColor: Colores.fondo,
    borderRadius: 12,
    width: "80%",
    maxWidth: 400,
    paddingVertical: 10,
    elevation: 4,
  },
  opcion: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  textoOpcion: {
    fontSize: 16,
    color: Colores.texto,
  },
  cancelarOpcion: {
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  cancelarTexto: {
    fontSize: 16,
    color: Colores.error,
    textAlign: "center",
  },
});
