import { Colores, Fuentes } from "@/temas/colores";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Linking, StyleSheet, Text, View } from "react-native";
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
            <View>
                <Text style={styles.titulo}>Escuela Nacional de Medicina y Homeopatía (ENMyH)</Text>
                <Text style={styles.texto}><Ionicons name="location-outline" size={15} color={Colores.primario} />{"   "}Av. Guillermo Massieu Helguera 239, La Purísima Ticoman, Gustavo A. Madero, 07320 Ciudad de México, CDMX.</Text>
                <Text style={styles.texto}><Ionicons name="call-outline" size={15} color={Colores.primario} />{"   "}Tel: 55 5729 6000, Ext. 55567.</Text>
                <Text style={styles.texto}><Ionicons name="mail-outline" size={15} color={Colores.primario} />{"   "}ccordovao@ipn.mx, deae.enmh@ipn.mx</Text>
                <Text onPress={() => Linking.openURL("https://www.facebook.com/enmhoficial/")} style={styles.texto}><Ionicons name="logo-facebook" size={15} color={Colores.primario} />{"   "}enmhoficial</Text>
                <Text onPress={() => Linking.openURL("https://x.com/ENMH_Oficial")} style={styles.texto}><Ionicons name="logo-x" size={15} color={Colores.primario} />{"   "}ENMH_Oficial</Text>
            </View>
            <View style={{ marginTop: 25 }}>
                <Text style={styles.titulo}>Escuela Superior de Cómputo (ESCOM)</Text>
                <Text style={styles.texto}><Ionicons name="location-outline" size={15} color={Colores.primario} />{"   "}Av. Juan de Dios Bátiz s/n esq. Av. Miguel Othón de Mendizabal. Colonia Lindavista. Alcaldia: Gustavo A. Madero. C. P. 07738. Ciudad de México.</Text>
                <Text style={styles.texto}><Ionicons name="call-outline" size={15} color={Colores.primario} />{"   "}Tel. 57296000 Ext. 46188</Text>
                <Text style={styles.texto}><Ionicons name="mail-outline" size={15} color={Colores.primario} />{"   "}direccion_escom@ipn.mx</Text>
                <Text onPress={() => Linking.openURL("https://www.facebook.com/escomipnmx")} style={styles.texto}><Ionicons name="logo-facebook" size={15} color={Colores.primario} />{"   "}escomipnmx</Text>
                <Text onPress={() => Linking.openURL("https://x.com/escomunidad")} style={styles.texto}><Ionicons name="logo-x" size={15} color={Colores.primario} />{"   "}escomunidad</Text>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    titulo: {
        fontWeight: 600,
        fontSize: 16,
    },
    texto: {
        color: Colores.textoPrincipal,
        fontSize: Fuentes.cuerpo,
        textAlign: "justify",
        marginTop: 15,
    }
});