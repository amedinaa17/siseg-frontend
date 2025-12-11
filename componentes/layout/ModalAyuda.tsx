import Boton from "@/componentes/ui/Boton";
import { Colores, Fuentes } from "@/temas/colores";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Modal from "./Modal";

type Props = {
    visible: boolean;
    onClose: () => void;
};

export default function ModalAyuda({ visible, onClose }: Props) {
    return (
        <Modal
            visible={visible}
            onClose={onClose}
            titulo="Ayuda"
            cancelar={false}
            aceptar={false}
            textoAceptar="Aceptar"
            onAceptar={onClose}
        >
            <Text allowFontScaling={false} style={{ color: Colores.textoPrincipal, fontSize: 14 }}>
                Descarga el Manual de Usuario para guías rápidas sobre el uso del{" "}
                <Text style={styles.siseg}>Sistema de Seguimiento del Servicio Social para la ENMyH (SISEG)</Text>.
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "center", marginVertical: 20 }}>
                <Boton
                    title="Descargar"
                    onPress={() => { }} />
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    subtitulo: {
        fontSize: Fuentes.cuerpo,
        fontWeight: 600,
    },
    siseg: {
        fontSize: Fuentes.cuerpo,
        color: Colores.primario,
        fontWeight: 600,
    }
});