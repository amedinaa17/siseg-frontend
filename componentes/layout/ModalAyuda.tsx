import ModalAPI, { ModalAPIRef } from "@/componentes/layout/ModalAPI";
import Boton from "@/componentes/ui/Boton";
import { Colores, Fuentes } from "@/temas/colores";
import Constants from 'expo-constants';
import * as FileSystemLegacy from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import React, { useRef } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import Modal from "./Modal";

const MANUAL_URL = Constants.expoConfig?.extra?.MANUAL_URL;

type Props = {
    visible: boolean;
    onClose: () => void;
};

export default function ModalAyuda({ visible, onClose }: Props) {
    const modalAPI = useRef<ModalAPIRef>(null);

    const descargarPDF = async () => {
        try {
            // Web
            if (Platform.OS === "web") {
                // Descargar como blob
                const res = await fetch(MANUAL_URL, { method: "GET" });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const blob = await res.blob();
                // Forzar descarga
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "MANUAL_DE_USUARIO_SISEG.pdf";
                a.style.display = "none";
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
                return;
            }

            // Móvil
            let rutaArchivo = `${FileSystemLegacy.cacheDirectory}MANUAL_DE_USUARIO_SISEG.pdf`;

            const downloadResult = await FileSystemLegacy.downloadAsync(MANUAL_URL, rutaArchivo);
            rutaArchivo = downloadResult.uri;

            // Abre el diálogo del sistema (Guardar/Compartir)
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(rutaArchivo, {
                    mimeType: "application/pdf",
                    dialogTitle: "Guardar archivo",
                    UTI: "com.adobe.pdf",
                });
            }
        } catch (error: any) {
            modalAPI.current?.show(false, "No se pudo descargar el archivo en este dispositivo.");
        }
    };

    return (
        <>
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
                        onPress={descargarPDF} />
                </View>
            </Modal>
            <ModalAPI ref={modalAPI} />
        </>
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