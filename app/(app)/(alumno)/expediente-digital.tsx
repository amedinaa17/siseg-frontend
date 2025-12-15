import Modal from "@/componentes/layout/Modal";
import ModalAPI, { ModalAPIRef } from "@/componentes/layout/ModalAPI";
import PiePagina from "@/componentes/layout/PiePagina";
import Boton from "@/componentes/ui/Boton";
import Entrada from "@/componentes/ui/Entrada";
import EntradaMultilinea from "@/componentes/ui/EntradaMultilinea";
import SelectorArchivo from "@/componentes/ui/SelectorArchivo";
import Tabla from "@/componentes/ui/Tabla";
import { useAuth } from "@/context/AuthProvider";
import { completarDocumentos } from "@/lib/documentosHelper";
import { fetchData, postData } from "@/servicios/api";
import { Colores, Fuentes } from "@/temas/colores";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { WebView } from "react-native-webview";

export default function ExpedienteDigital() {
    const { sesion, verificarToken } = useAuth();
    const router = useRouter();

    const [cargando, setCargando] = useState(false);

    const { width } = useWindowDimensions();
    const esPantallaPequeña = width < 790;

    const modalAPI = useRef<ModalAPIRef>(null);
    const [documentos, setDocumentos] = useState<any[]>([]);
    const [docSeleccionado, setDocSeleccionado] = useState<any | null>(null);
    const [verDetallesDocumento, setVerDetallesDocumento] = useState(false);
    const [verDocumento, setVerDocumento] = useState(false);
    const [archivoSeleccionado, setArchivoSeleccionado] = useState<any>();
    const [errorArchivo, setErrorArchivo] = useState<string>("");

    const obtenerDocumentos = async () => {
        verificarToken();

        try {
            setCargando(true);
            const response = await fetchData(`users/expedienteDigital?boleta=${sesion.boleta}&tk=${sesion.token}`);

            if (response.error === 0) {
                const docsBackend = response.documents;
                setDocumentos(completarDocumentos(docsBackend));
            } else {
                modalAPI.current?.show(false, "Hubo un problema al obtener tus datos del servidor. Inténtalo de nuevo más tarde.", () => { router.replace("/inicio-alumno"); });
            }
        } catch (error) {
            modalAPI.current?.show(false, "Error al conectar con el servidor. Inténtalo de nuevo más tarde.", () => { router.replace("/inicio-alumno"); });
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        obtenerDocumentos();
    }, []);

    const {
        handleSubmit,
        formState: { isSubmitting } } = useForm<any>();

    const subirArchivo = async (formData: FormData, documento: String) => {
        verificarToken();

        try {
            const response = await postData(
                `users/subirArchivo?tk=${sesion?.token}&nombre=${documento}`,
                formData
            );

            if (response?.message) {
                setVerDetallesDocumento(false);
                setDocSeleccionado(null);
                obtenerDocumentos();
                modalAPI.current?.show(true, "El archivo se ha subido correctamente.");
            } else {
                setVerDetallesDocumento(false);
                modalAPI.current?.show(false, "Hubo un problema al subir el archivo. Inténtalo de nuevo más tarde.", () => { modalAPI.current?.close(); setVerDetallesDocumento(true); });
            }
        } catch (error) {
            setVerDetallesDocumento(false);
            modalAPI.current?.show(false, "Error al conectar con el servidor. Inténtalo de nuevo más tarde.", () => { modalAPI.current?.close(); setVerDetallesDocumento(true); });
        }
    };

    const handleSubirArchivo = (documento: String) => {
        if (!archivoSeleccionado) {
            setErrorArchivo("Selecciona un archivo para cargar.");
            return;
        } else if ((archivoSeleccionado.get("file").size / (1024 * 1024)) > 2) {
            return;
        }

        setErrorArchivo("");
        handleSubmit(() => subirArchivo(archivoSeleccionado, documento))();
    };

    const renderModalDetalle = () => {
        if (!docSeleccionado) return null;
        const { alumnoBoleta, adminEncargado, estatus, fechaRegistro, nombreArchivo,
            observacion, rutaArchivo, color } = docSeleccionado;

        return (
            <Modal visible={verDetallesDocumento}
                onClose={() => { setArchivoSeleccionado(null); setDocSeleccionado(null); setErrorArchivo(""); setVerDetallesDocumento(false) }} titulo={nombreArchivo}
                aceptar={true} textoAceptar={isSubmitting ? "Cargando…" : estatus === "Sin cargar" ? "Cargar archivo" : estatus === "Rechazado" ? "Volver a cargar" : undefined}
                onAceptar={() => {
                    estatus === "Sin cargar" ? handleSubirArchivo(nombreArchivo)
                        : estatus === "Rechazado" ? setDocSeleccionado({ ...docSeleccionado, estatus: "Sin cargar", color: Colores.textoAdvertencia, })
                            : setDocSeleccionado(null)
                }}
                cancelar={estatus === "Sin cargar" ? true : false} deshabilitado={isSubmitting}
            >
                <Text allowFontScaling={false} style={{ fontSize: 15, fontWeight: "600", marginBottom: 18, color: color }}>
                    {estatus}
                </Text>

                {estatus === "Sin cargar" && (
                    <>
                        <Text allowFontScaling={false} style={{ color: Colores.textoSecundario, marginBottom: 25 }}>Selecciona un archivo PDF no mayor a 2 MB</Text>
                        <SelectorArchivo
                            label="Archivo"
                            allowedTypes={[".pdf", "application/pdf"]}
                            onArchivoSeleccionado={(file) => {
                                setArchivoSeleccionado(file);
                                setErrorArchivo("");
                            }}
                            error={errorArchivo}
                        />
                    </>
                )}

                {estatus === "Pendiente" && (
                    <>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 15, gap: 10 }}>
                            <View style={{ flex: 1 }} >
                                <Entrada label="Archivo" value={rutaArchivo.split('/').pop()} editable={false} />
                            </View>
                            <Boton
                                title=""
                                onPress={() => { setVerDetallesDocumento(false); setVerDocumento(true); }}
                                icon={<Ionicons name="eye-outline" size={20} color="white" style={{ paddingHorizontal: 10 }} />}
                            />
                        </View>
                        <View style={{ marginBottom: 15 }} >
                            <Entrada label="Fecha de envío" value={new Date(fechaRegistro).toLocaleDateString()} editable={false} />
                        </View>
                        {adminEncargado && (
                            <>
                                <Text allowFontScaling={false} style={{ fontSize: Fuentes.caption, color: Colores.textoClaro, marginBottom: 15, textAlign: "right" }}>Nota: Este documento fue rechazado anteriormente.</Text>
                                <View style={{ marginBottom: 15 }} >
                                    <Entrada label="Revisado anteriormente por" value={adminEncargado.nombre + " " + adminEncargado.APELLIDO_PATERNO + " " + adminEncargado.APELLIDO_MATERNO} editable={false} />
                                </View>
                            </>
                        )}
                        <View>
                            <EntradaMultilinea
                                label="Observaciones"
                                value={observacion}
                                editable={false}
                            />
                        </View>
                    </>
                )}

                {estatus === "Aprobado" && (
                    <>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 15, gap: 10 }}>
                            <View style={{ flex: 1 }} >
                                <Entrada label="Archivo" value={rutaArchivo.split('/').pop()} editable={false} />
                            </View>
                            <Boton
                                title=""
                                onPress={() => { setVerDetallesDocumento(false); setVerDocumento(true); }}
                                icon={<Ionicons name="eye-outline" size={20} color="white" style={{ paddingHorizontal: 10 }} />}
                            />
                        </View>
                        <View style={{ marginBottom: 15 }} >
                            <Entrada label="Fecha de envío" value={new Date(fechaRegistro).toLocaleDateString()} editable={false} />
                        </View>
                        <View style={{ marginBottom: 15 }} >
                            <Entrada label="Revisado por" value={adminEncargado.nombre + " " + adminEncargado.APELLIDO_PATERNO + " " + adminEncargado.APELLIDO_MATERNO} editable={false} />
                        </View>
                        <View>
                            <EntradaMultilinea
                                label="Observaciones"
                                value={observacion}
                                editable={false}
                            />
                        </View>
                    </>
                )}

                {estatus === "Rechazado" && (
                    <>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 15, gap: 10 }}>
                            <View style={{ flex: 1 }} >
                                <Entrada label="Archivo" value={rutaArchivo.split('/').pop()} editable={false} />
                            </View>
                            <Boton
                                title=""
                                onPress={() => { setVerDetallesDocumento(false); setVerDocumento(true); }}
                                icon={<Ionicons name="eye-outline" size={20} color="white" style={{ paddingHorizontal: 10 }} />}
                            />
                        </View>
                        <View style={{ marginBottom: 15 }} >
                            <Entrada label="Fecha de envío" value={new Date(fechaRegistro).toLocaleDateString()} editable={false} />
                        </View>
                        <View style={{ marginBottom: 15 }} >
                            <Entrada label="Revisado por" value={adminEncargado.nombre + " " + adminEncargado.APELLIDO_PATERNO + " " + adminEncargado.APELLIDO_MATERNO} editable={false} />
                        </View>
                        <View>
                            <EntradaMultilinea
                                label="Observaciones"
                                value={observacion}
                                editable={false}
                            />
                        </View>
                    </>
                )}
            </Modal>
        );
    };

    const renderModalDocumento = () => {
        if (!docSeleccionado) return null;
        const { adminEncargado, estatus, fechaRegistro, nombreArchivo,
            observacion, rutaArchivo, color } = docSeleccionado;

        return (
            <Modal visible={verDocumento} onClose={() => { setVerDocumento(false); setVerDetallesDocumento(true) }} titulo={nombreArchivo}
                aceptar={true}
                cancelar={false}
                maxWidth={800}>
                <View style={{ height: esPantallaPequeña ? 320 : 520, borderWidth: 1, borderColor: Colores.borde, borderRadius: 8, overflow: "hidden" }}>
                    {Platform.OS === "web" ? (
                        <iframe
                            src={`https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(rutaArchivo)}`}
                            style={{
                                width: "100%",
                                height: "100%",
                                border: "none",
                            }}
                            title="Vista previa PDF"
                        />
                    ) : (
                        <WebView
                            source={{
                                uri: `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(rutaArchivo)}`,
                            }}
                            style={{ flex: 1 }}
                            startInLoadingState
                        />
                    )}
                </View>
            </Modal>
        );
    };

    return (
        <>
            {cargando && (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white", position: "absolute", top: 60, left: 0, right: 0, bottom: 0, zIndex: 100 }}>
                    <ActivityIndicator size="large" color="#5a0839" />
                </View>
            )}
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={{ flex: 1 }}>
                    <View style={[styles.contenedorFormulario, esPantallaPequeña && { maxWidth: "95%" }]}>
                        <Text allowFontScaling={false} style={styles.titulo}>Expediente digital</Text>
                        <Text allowFontScaling={false} style={{ fontSize: Fuentes.cuerpo, color: Colores.textoPrincipal }}>
                            Sube los documentos requeridos según la etapa en la que te encuentres del servicio social. Verifica que cada archivo sea claro y corresponda al documento solicitado.
                        </Text>
                        <Text allowFontScaling={false} style={styles.subtitulo}>Registro al servicio social</Text>
                        <ScrollView horizontal={esPantallaPequeña}>
                            <Tabla
                                columnas={[
                                    { key: "nombreArchivo", titulo: "Documento", ...(esPantallaPequeña && { ancho: 300 }) },
                                    {
                                        key: "estatus",
                                        titulo: "Estatus",
                                        render: (valor, fila) => (
                                            <Text allowFontScaling={false} style={[styles.texto, { color: fila.color }]}>
                                                {valor}
                                            </Text>
                                        ),
                                        ...(esPantallaPequeña && { ancho: 190 })
                                    },
                                    { key: "observacion", titulo: "Observaciones", ...(esPantallaPequeña && { ancho: 300 }) },
                                ]}
                                datos={documentos
                                    .filter((d) => d.tipo === 1)
                                    .map((fila) => ({
                                        ...fila,
                                        observacion: fila.estatus === "Pendiente" ? "En espera de revisión." : fila.observacion,
                                        onPress: () => { setDocSeleccionado(fila); setVerDetallesDocumento(true) },
                                    }))}
                            />
                        </ScrollView>

                        <Text allowFontScaling={false} style={styles.subtitulo}>Término del servicio social</Text>

                        <ScrollView horizontal={esPantallaPequeña}>
                            <Tabla
                                columnas={[
                                    { key: "nombreArchivo", titulo: "Documento", ...(esPantallaPequeña && { ancho: 300 }) },
                                    {
                                        key: "estatus",
                                        titulo: "Estatus",
                                        render: (valor, fila) => (
                                            <Text allowFontScaling={false} style={[styles.texto, { color: fila.color }]}>
                                                {valor}
                                            </Text>
                                        ),
                                        ...(esPantallaPequeña && { ancho: 190 })
                                    },
                                    { key: "observacion", titulo: "Observaciones", ...(esPantallaPequeña && { ancho: 300 }) },
                                ]}
                                datos={documentos
                                    .filter((d) => d.tipo === 2)
                                    .map((fila) => ({
                                        ...fila,
                                        observacion: fila.estatus === "Pendiente" ? "En espera de revisión." : fila.observacion,
                                        onPress: () => { setDocSeleccionado(fila); setVerDetallesDocumento(true) },
                                    }))}
                            />
                        </ScrollView>
                    </View>
                </View>
                {renderModalDetalle()}
                {renderModalDocumento()}
                <ModalAPI ref={modalAPI} />
                <PiePagina />
            </ScrollView >
        </>
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
        marginBottom: 20,
    },
    subtitulo: {
        fontSize: Fuentes.cuerpo,
        fontWeight: "500",
        color: Colores.textoClaro,
        marginTop: 20,
        marginBottom: 10,
    },
    texto: {
        fontSize: Fuentes.cuerpo,
        paddingHorizontal: 15,
        paddingVertical: 8,
        fontWeight: "500"
    },
});
