import { Colores, Fuentes } from "@/temas/colores";
import React, { useState } from "react";
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

type Props = {
  visible: boolean;
  titulo?: string;
  children: React.ReactNode;
  onClose: () => void;
  cerrar?: boolean;
  maxWidth?: number;

  // Footer
  aceptar?: boolean;
  cancelar?: boolean;
  textoAceptar?: string;
  textoCancelar?: string;
  onAceptar?: () => void;
  onCancelar?: () => void;
};

export default function ModalPersonalizado({
  visible,
  titulo,
  children,
  onClose,
  cerrar = true,
  maxWidth = 500,

  aceptar = true,
  cancelar = false,
  textoAceptar = "Aceptar",
  textoCancelar = "Cancelar",
  onAceptar,
  onCancelar,
}: Props) {
  const [hoverAceptar, setHoverAceptar] = useState(false);
  const [hoverCancelar, setHoverCancelar] = useState(false);
  const { height } = useWindowDimensions();

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.contenedor, { maxHeight: height * 0.9, maxWidth }]}>
          {/* Encabezado */}
          <View style={styles.encabezado}>
            <Text style={styles.titulo}>{titulo}</Text>
            {cerrar && (
              <Pressable onPress={onClose}>
                <Text style={{ fontSize: 20, color: Colores.textoPrincipal }}>✕</Text>
              </Pressable>
            )}
          </View>

          {/* Contenido */}
          <ScrollView
            contentContainerStyle={{ padding: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {children}

            {/* Footer */}
            {(aceptar || cancelar) && (
              <View style={styles.footer}>
                {cancelar && (
                  <Pressable
                    onPress={onCancelar || onClose}
                    onHoverIn={() => setHoverCancelar(true)}
                    onHoverOut={() => setHoverCancelar(false)}
                    style={[
                      styles.boton,
                      { backgroundColor: hoverCancelar ? Colores.borde : Colores.textoClaro },
                    ]}
                  >
                    <Text style={{ color: Colores.textoPrincipal }}>{textoCancelar}</Text>
                  </Pressable>
                )}
                {aceptar && (
                  <Pressable
                    onPress={onAceptar || onClose}
                    onHoverIn={() => setHoverAceptar(true)}
                    onHoverOut={() => setHoverAceptar(false)}
                    style={[
                      styles.boton,
                      { backgroundColor: hoverAceptar ? Colores.hover : Colores.textoSecundario },
                    ]}
                  >
                    <Text style={{ color: Colores.onPrimario }}>{textoAceptar}</Text>
                  </Pressable>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  contenedor: {
    width: "100%",
    backgroundColor: Colores.fondo,
    borderRadius: 12,
    overflow: "hidden",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 6 },
      android: { elevation: 5 },
    }),
  },
  encabezado: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  titulo: {
    fontSize: Fuentes.subtitulo,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 20,
    paddingTop: 20,
  },
  boton: {
    fontSize: Fuentes.cuerpo,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    fontWeight: "700",
  },
});