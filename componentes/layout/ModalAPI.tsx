import Modal from "@/componentes/layout/Modal";
import { Colores, Fuentes } from "@/temas/colores";
import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export interface ModalAPIRef {
    show: (estatus: boolean, mensaje: string, aceptar?: () => void, verDetalles?: () => void) => void;
    close: () => void;
}

const ModalAPI = forwardRef<ModalAPIRef>((_, ref) => {
    const [visible, setVisible] = useState(false);
    const [estatus, setEstatus] = useState(true);
    const [mensaje, setMensaje] = useState("");
    const [modalKey, setModalKey] = useState(0);
    const [onAceptar, setOnAceptar] = useState<(() => void) | undefined>(undefined);
    const [onDetalles, setOnDetalles] = useState<(() => void) | undefined>(undefined);

    useImperativeHandle(ref, () => ({
        show(estatus: boolean, mensaje: string, aceptar?: () => void, verDetalles?: () => void) {
            setEstatus(estatus);
            setMensaje(mensaje);
            setOnAceptar(() => aceptar);
            setOnDetalles(() => verDetalles);

            setVisible(false);
            setModalKey((k) => k + 1);
            setTimeout(() => setVisible(true), 0);
        },
        close() {
            setVisible(false);
        },
    }));

    const correoRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})/;
    const curpRegex = /^[A-ZÑ]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/;
    const boletaRegex = /^\d{10}$/;

    const highlightText = (text: string) => {
        return text.split(" ").map((word, index) => {
            if (correoRegex.test(word)) {
                return <Text key={`correo-${index}`} style={{ color: estatus ? Colores.textoInfo : Colores.textoError }}>{word} </Text>;
            }
            if (curpRegex.test(word)) {
                return <Text key={`curp-${index}`} style={{ color: estatus ? Colores.textoSecundario : Colores.textoError }}>{word} </Text>;
            }
            if (boletaRegex.test(word)) {
                return <Text key={`boleta-${index}`} style={{ color: estatus ? Colores.textoPrimario : Colores.textoError }}>{word} </Text>;
            }
            return <Text key={`text-${index}`}>{word} </Text>;
        });
    };

    return (
        <Modal key={modalKey} visible={visible} titulo=""
            cerrar={false} onClose={() => !onAceptar && setVisible(false)}
            onAceptar={onAceptar}
        >
            <View style={{ alignItems: "center" }}>
                <Ionicons
                    name={estatus ? "checkmark-circle-outline" : "close-circle-outline"}
                    size={80}
                    color={estatus ? Colores.textoExito : Colores.textoError}
                />
                <Text allowFontScaling={false} style={styles.titulo}>
                    {estatus ? "¡Todo listo!" : "¡Algo salió mal!"}
                </Text>
                <Text allowFontScaling={false} style={styles.mensaje}>
                    {highlightText(mensaje)}
                </Text>

                {onDetalles && (
                    <Pressable onPress={onDetalles} style={styles.linkWrap}>
                        <Text allowFontScaling={false} style={styles.link}>Ver detalles</Text>
                    </Pressable>
                )}
            </View>
        </Modal>
    );
});

const styles = StyleSheet.create({
    titulo: {
        fontSize: Fuentes.cuerpo,
        color: Colores.textoClaro,
        marginBottom: 8
    },
    mensaje: {
        fontSize: Fuentes.cuerpo,
        color: Colores.textoPrincipal,
        marginBottom: 12,
        textAlign: "center"
    },
    linkWrap: { paddingVertical: 3 },
    link: {
        color: Colores.textoInfo,
        fontWeight: "700",
        textDecorationLine: "underline"
    }
});

export default ModalAPI;
