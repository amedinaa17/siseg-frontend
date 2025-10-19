import Modal from "@/componentes/layout/Modal";
import { Colores, Fuentes } from "@/temas/colores";
import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface ModalAPIRef {
    show: (estatus: boolean, mensaje: string) => void;
    close: () => void;
}

const ModalAPI = forwardRef<ModalAPIRef>((_, ref) => {
    const [visible, setVisible] = useState(false);
    const [estatus, setEstatus] = useState(true);
    const [mensaje, setMensaje] = useState("");
    const [modalKey, setModalKey] = useState(0);

    useImperativeHandle(ref, () => ({
        show(estatus: boolean, mensaje: string) {
            setEstatus(estatus);
            setMensaje(mensaje);

            setVisible(false);
            setModalKey((k) => k + 1);
            setTimeout(() => setVisible(true), 0);
        },
        close() {
            setVisible(false);
        },
    }));

    const correoRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})/;
    const mensajePartes = mensaje.split(correoRegex);

    return (
        <Modal key={modalKey} visible={visible} titulo="" cerrar={false} onClose={() => setVisible(false)}>
            <View style={{ alignItems: "center" }}>
                <Ionicons
                    name={estatus ? "checkmark-circle-outline" : "close-circle-outline"}
                    size={80}
                    color={estatus ? Colores.textoExito : Colores.textoError}
                />
                <Text style={styles.titulo}>
                    {estatus ? "¡Todo Listo!" : "¡Algo Salió Mal!"}
                </Text>
                <Text style={styles.mensaje}>
                    {mensajePartes.map((parte, index) => {

                        if (correoRegex.test(parte)) {
                            return (
                                <Text style={{ color: estatus ? Colores.textoInfo : Colores.textoError }}>
                                    {parte}
                                </Text>
                            );
                        }
                        return parte;
                    })}
                </Text>
            </View>
        </Modal>
    );
});

const styles = StyleSheet.create({
    titulo: {
        fontSize: Fuentes.cuerpo, color: Colores.textoClaro, marginBottom: 8
    },
    mensaje: {
        fontSize: Fuentes.cuerpo, color: Colores.textoPrincipal, marginBottom: 8, textAlign: "center"
    }
});

export default ModalAPI;
