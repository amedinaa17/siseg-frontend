import ModalAPI, { ModalAPIRef } from "@/componentes/layout/ModalAPI";
import Boton from "@/componentes/ui/Boton";
import { useAuth } from "@/context/AuthProvider";
import { postData } from "@/servicios/api";
import { Colores, Fuentes } from "@/temas/colores";
import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useCallback, useRef, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

export default function CursoInduccion() {
    const { width } = useWindowDimensions();
    const esPantallaPequeña = width < 600;
    const { sesion, verificarToken } = useAuth();
    const modalAPI = useRef<ModalAPIRef>(null);

    const [permission, requestPermission] = useCameraPermissions();
    const [escaneando, setEscaneando] = useState(false);
    const [bloquearLectura, setBloquearLectura] = useState(false);
    const [facing, setFacing] = useState<"back" | "front">("back");
    const [torch, setTorch] = useState(false);

    const iniciarEscaneo = async () => {
        if (!permission?.granted) {
            const res = await requestPermission();
            if (!res.granted) {
                modalAPI.current?.show(false, "El acceso a la cámara ha sido denegado. Para continuar, otorga el permiso necesario.");
                return;
            }
        }
        setBloquearLectura(false);
        setEscaneando(true);
    };

    const detenerEscaneo = () => {
        setEscaneando(false);
        setTorch(false);
    };

    const getBoletaFromQR = (raw: string) => String(raw || "").trim();

    const registrarAsistencia = async (boleta: string) => {
        verificarToken();

        try {

            const response = await postData("qr/registrarQR", {
                tk: sesion?.token,
                boleta: boleta,
            });

            if (response.error === 0) {
                modalAPI.current?.show(true, `Asistencia registrada correctamente para el alumno ${boleta}`);
            } else {
                modalAPI.current?.show(false, "Hubo un problema al registrar la asistencia del alumno. Inténtalo de nuevo más tarde.");
            }
        } catch (error) {
            modalAPI.current?.show(false, "Error al conectar con el servidor. Inténtalo de nuevo más tarde.");
        }
    };

    const onBarcodeScanned = useCallback(
        async ({ data }: { data: string }) => {
            if (bloquearLectura) return;
            setBloquearLectura(true);
            setTorch(false);

            const boleta = getBoletaFromQR(data);
            if (!boleta) {
                modalAPI.current?.show(false, "El código QR no contiene una boleta válida.");
                setTimeout(() => setBloquearLectura(false), 800);
                return;
            }

            await registrarAsistencia(boleta);
            setTimeout(() => setBloquearLectura(false), 1000);
        },
        [bloquearLectura]
    );

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View
                style={[
                    styles.contenedorFormulario,
                    esPantallaPequeña && { maxWidth: "95%" },
                ]}
            >
                <Text style={styles.titulo}>Asistencia al curso de inducción por QR</Text>
                <Text style={styles.subtitulo}>
                    Escanea el código QR del alumno para registrar su asistencia al curso de inducción.
                </Text>
                <Text style={{ fontSize: Fuentes.caption, color: Colores.textoClaro, marginBottom: 20, textAlign: "center"}}>Nota: Habilita el acceso a la cámara de tu dispositivo.</Text>

                <View style={styles.marcoEscaneo}>
                    {escaneando ? (
                        <CameraView
                            style={StyleSheet.absoluteFillObject}
                            facing={facing}
                            enableTorch={torch}
                            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                            onBarcodeScanned={onBarcodeScanned}
                        />
                    ) : (
                        <View style={styles.placeholderCamara}>
                            <Text style={styles.emojiCamara}>📷</Text>
                        </View>
                    )}
                </View>


                <View style={{ marginTop: 18, alignItems: "center", gap: 10 }}>
                    {!escaneando ? (
                        <Boton title="Escanear" onPress={iniciarEscaneo} />
                    ) : (
                        <>
                            <Boton title="Detener" onPress={detenerEscaneo} />
                        </>
                    )}
                </View>
            </View>

            <ModalAPI ref={modalAPI} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    contenedorFormulario: {
        width: "90%",
        maxWidth: 1050,
        margin: "auto",
        padding: 24,
        borderWidth: 1,
        borderRadius: 12,
        borderColor: Colores.borde,
        backgroundColor: Colores.fondo,
        ...Platform.select({
            ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 6 },
            android: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 6 },
            web: { boxShadow: "0px 4px 6px rgba(0,0,0,0.05)" },
        }),
        elevation: 2,
        marginVertical: 30,
    },
    titulo: {
        fontSize: Fuentes.titulo,
        fontWeight: "700",
        color: Colores.textoPrincipal,
        textAlign: "center",
        marginBottom: 10,
    },
    subtitulo: {
        fontSize: Fuentes.cuerpo,
        color: Colores.textoSecundario,
        textAlign: "center",
        paddingHorizontal: 12,
        marginBottom: 8,
    },
    marcoEscaneo: {
        alignSelf: "center",
        width: 350,
        height: 350,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: Colores.borde,
        backgroundColor: Colores.fondos,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },
    placeholderCamara: {
        width: 240,
        height: 240,
        borderRadius: 12,
        backgroundColor: "#e6e6e9",
        justifyContent: "center",
        alignItems: "center",
    },
    placeholderTexto: {
        fontSize: Fuentes.cuerpo,
        color: Colores.textoSecundario,
    },
    emojiCamara: {
        fontSize: 72,
        opacity: 0.7,
        marginBottom: 6,
    },
});
