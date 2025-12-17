import { Colores, Fuentes } from '@/temas/colores';
import React, { useEffect, useRef, useState } from "react";
import { Animated, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type Item = { label: string; value: string };

type Propiedades = {
  label: string;
  selectedValue?: string;
  onValueChange: (value: string) => void;
  items: Item[];
  error?: string;
  editable?: boolean;
};

export default function Selector({
  label,
  selectedValue,
  onValueChange,
  items,
  error,
  editable = true,
  ...props
}: Propiedades) {
  const [focused, setFocused] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const anim = useRef(new Animated.Value(selectedValue ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: !!selectedValue ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [focused, selectedValue]);

  const isError = !!error;

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
      <Pressable
        disabled={!editable}
        onPress={() => editable && setModalVisible(true)}
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
        >
          {label}
        </Animated.Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flex: 1 }}
        >
          <Text
            style={[
              styles.valorTexto,
              { color: selectedValue ? Colores.texto : Colores.textoClaro },
            ]}
            numberOfLines={1}
            allowFontScaling={false}
          >
            {selectedValue || ""}
          </Text>
        </ScrollView>

      </Pressable>

      <Text allowFontScaling={false} style={error && styles.errorTexto}>
        {error}
      </Text>

      {editable && (
        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: 300 }}
              >
                {items.map((item) => {
                  const seleccionado = item.value === selectedValue || item.label === selectedValue;

                  return (
                    <Pressable
                      key={item.value}
                      onPress={() => {
                        onValueChange(item.value);
                        setModalVisible(false);
                        setFocused(true);
                      }}
                      style={[
                        styles.opcion,
                        seleccionado && styles.opcionSeleccionada
                      ]}
                    >
                      <Text
                        style={[
                          styles.textoOpcion,
                          seleccionado && styles.textoSeleccionado
                        ]}
                        allowFontScaling={false}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <Pressable
                onPress={() => setModalVisible(false)}
                style={[styles.opcion, styles.cancelarOpcion]}
              >
                <Text allowFontScaling={false} style={styles.cancelarTexto}>Cancelar</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
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
    fontSize: 15,
    color: Colores.textoPrincipal,
  },
  errorTexto: {
    color: Colores.textoError,
    marginTop: 10,
    marginBottom: 10,
    fontSize: Fuentes.caption,
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
    maxWidth: 500,
    paddingVertical: 10,
    elevation: 4,
  },
  opcion: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  textoOpcion: {
    fontSize: 16,
    color: Colores.textoPrincipal,
  },
  cancelarOpcion: {
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  cancelarTexto: {
    fontSize: 16,
    color: Colores.textoError,
    textAlign: "center",
  },
  opcionSeleccionada: {
    backgroundColor: Colores.primario + "22",
    borderLeftWidth: 4,
    borderLeftColor: Colores.primario,
  },
  textoSeleccionado: {
    color: Colores.primario,
    fontWeight: "600",
  },

});
