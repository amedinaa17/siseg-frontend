import { Colores, Fuentes } from "@/temas/colores";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text } from "react-native";
import Modal from "./Modal";

type Props = {
    visible: boolean;
    onClose: () => void;
};

export default function ModalAvisoPrivacidad({ visible, onClose }: Props) {
    return (
        <Modal
            visible={visible}
            onClose={onClose}
            titulo="Contacto"
            cerrar={false}
            cancelar={false}
            aceptar={true}
            textoAceptar="Aceptar"
            onAceptar={onClose}
        >
            <Text style={styles.titulo}>Escuela Superior de Cómputo</Text>
            <Text style={styles.texto}><Ionicons name="location-outline" size={15} color={Colores.primario} />{"   "}Av. Juan de Dios Bátiz s/n esq. Av. Miguel Othón de Mendizabal. Colonia Lindavista. Alcaldia: Gustavo A. Madero. C. P. 07738. Ciudad de México.</Text>
            <Text style={styles.texto}><Ionicons name="call-outline" size={15} color={Colores.primario} />{"   "}Tel. 57296000 Ext. 46188</Text>
            <Text style={styles.texto}><Ionicons name="mail-outline" size={15} color={Colores.primario} />{"   "}direccion_escom@ipn.mx</Text>
            <Text style={styles.texto}><Ionicons name="logo-facebook" size={15} color={Colores.primario} />{"   "}escomipnmx</Text>
            <Text style={styles.texto}><Ionicons name="logo-x" size={15} color={Colores.primario} />{"   "}escomunidad</Text>
        </Modal>
    );
}

const styles = StyleSheet.create({
    titulo: {
        fontWeight: 600,
        fontSize: 16,
        marginBottom: 5,
    },
    texto: {
        color: Colores.textoPrincipal,
        fontSize: Fuentes.cuerpo,
        textAlign: "justify",
        marginTop: 15,
    }
});