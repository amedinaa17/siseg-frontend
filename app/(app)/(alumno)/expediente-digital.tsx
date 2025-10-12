import Modal from "@/componentes/layout/Modal";
import Button from "@/componentes/ui/Boton";
import Entrada from "@/componentes/ui/Entrada";
import EntradaMultilinea from "@/componentes/ui/EntradaMultilinea";
import SelectorArchivo from "@/componentes/ui/SelectorArchivo";
import Tabla from "@/componentes/ui/Tabla";
import { useAuth } from "@/context/AuthProvider";
import { completarDocumentos } from "@/lib/documentosHelper";
import { fetchData, postData } from "@/servicios/api";
import { Colores, Fuentes } from "@/temas/colores";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Linking, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

export default function ExpedienteDigital() {
    const { sesion, verificarToken } = useAuth();
    const { width } = useWindowDimensions();
    const esPantallaPequeña = width < 600;

    const [documentos, setDocumentos] = useState<any[]>([]);
    const [docSeleccionado, setDocSeleccionado] = useState<any | null>(null);
    const [archivoSeleccionado, setArchivoSeleccionado] = useState<any>();
    const [errorArchivo, setErrorArchivo] = useState<string>("");

    const [modalVisible, setModalVisible] = useState(false);
    const [modalMensaje, setModalMensaje] = useState('');
    const [modalTipo, setModalTipo] = useState(false);

    const obtenerDocumentos = async () => {
        verificarToken();

        try {
            const response = await fetchData(`users/expedienteDigital?tk=${sesion.token}`);

            if (response.error === 0) {
                const docsBackend = response.documents;
                setDocumentos(completarDocumentos(docsBackend));
            } else {
                setModalTipo(false);
                setModalMensaje("Hubo un error al obtener tus datos del servidor. Intentalo de nuevo más tarde.")
                setModalVisible(true)
            }
        } catch (error) {
            setModalTipo(false);
            setModalMensaje("Hubo un error al conectar con el servidor. Intentalo de nuevo más tarde.")
            setModalVisible(true)
        }
    };

    useEffect(() => {
        obtenerDocumentos();
    }, []);

    const subirArchivo = async (formData: FormData, documento: String) => {
        verificarToken();

        try {
            const response = await postData(
                `users/subirArchivo?tk=${sesion?.token}&nombre=${documento}`,
                formData
            );

            if (response?.message) {
                setDocSeleccionado(null)
                setModalTipo(true);
                setModalMensaje("El archivo se ha subido correctamente.");
                setModalVisible(true);
                obtenerDocumentos();
            } else {
                setDocSeleccionado(null)
                setModalTipo(false);
                setModalMensaje("Hubo un error al subir el archivo. Inténtalo de nuevo más tarde.");
                setModalVisible(true);
            }
        } catch (error) {
            setDocSeleccionado(null)
            setModalTipo(false);
            setModalMensaje("Hubo un error al conectar con el servidor. Inténtalo de nuevo más tarde.");
            setModalVisible(true);
        }
    };

    const handleSubirArchivo = (documento: String) => {
        if (!archivoSeleccionado) {
            setErrorArchivo("Selecciona un archivo para cargar.");
            return;
        } else if ((archivoSeleccionado.size / (1024 * 1024)) > 2) {
            return;
        }

        setErrorArchivo("");
        subirArchivo(archivoSeleccionado, documento);
    };

    const renderModal = () => {
        if (!docSeleccionado) return null;
        const { alumnoBoleta, adminEncargado, estatus, fechaRegistro, nombreArchivo,
            observacion, rutaArchivo, color } = docSeleccionado;

        return (
            <Modal visible={!!docSeleccionado} onClose={() => setDocSeleccionado(null)} titulo={nombreArchivo}
                aceptar={estatus === "Rechazado" ? false : true} textoAceptar={estatus === "Sin cargar" ? "Cargar" : undefined}
                onAceptar={() => estatus === "Sin cargar" ? handleSubirArchivo(nombreArchivo) : setDocSeleccionado(null)}
                cancelar={estatus === "Sin cargar" ? true : false} onCancelar={() => { setArchivoSeleccionado(null); setDocSeleccionado(null); setErrorArchivo("") }}>
                <Text style={{ fontSize: 15, fontWeight: "600", marginBottom: 18, color: color }}>
                    {estatus}
                </Text>

                {estatus === "Sin cargar" && (
                    <>
                        <Text style={{ color: Colores.textoSecundario, marginBottom: 25 }}>Selecciona un archivo PDF no mayor a 2 MB</Text>
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
                            <View style={{ flex: 1, pointerEvents: "none" }} >
                                <Entrada label="Archivo" value={rutaArchivo.split('/').pop()} editable={false} />
                            </View>
                            <Button
                                title=""
                                onPress={() => Linking.openURL(rutaArchivo)}
                                icon={<Ionicons name="eye-outline" size={20} color="white" />}
                            />
                        </View>
                        <View style={{ pointerEvents: "none", marginBottom: 15 }} >
                            <Entrada label="Fecha de modificación" value={new Date(fechaRegistro).toLocaleString()} editable={false} />
                        </View>
                        <View style={{ pointerEvents: "none" }}>
                            <EntradaMultilinea
                                label="Observaciones"
                                value={observacion}
                            />
                        </View>
                    </>
                )}

                {estatus === "Aprobado" && (
                    <>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 15, gap: 10 }}>
                            <View style={{ flex: 1, pointerEvents: "none" }} >
                                <Entrada label="Archivo" value={rutaArchivo.split('/').pop()} editable={false} />
                            </View>
                            <Button
                                title=""
                                onPress={() => Linking.openURL(rutaArchivo)}
                                icon={<Ionicons name="eye-outline" size={20} color="white" />}
                            />
                        </View>
                        <View style={{ pointerEvents: "none", marginBottom: 15 }} >
                            <Entrada label="Fecha de modificación" value={new Date(fechaRegistro).toLocaleString()} editable={false} />
                        </View>
                        <View style={{ pointerEvents: "none", marginBottom: 15 }} >
                            <Entrada label="Reviso" value="{adminEncargado}" editable={false} />
                        </View>
                        <View style={{ pointerEvents: "none" }}>
                            <EntradaMultilinea
                                label="Observaciones"
                                value={observacion}
                            />
                        </View>
                    </>
                )}

                {estatus === "Rechazado" && (
                    <>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 15, gap: 10 }}>
                            <View style={{ flex: 1, pointerEvents: "none" }} >
                                <Entrada label="Archivo" value={rutaArchivo.split('/').pop()} editable={false} />
                            </View>
                            <Button
                                title=""
                                onPress={() => Linking.openURL(rutaArchivo)}
                                icon={<Ionicons name="eye-outline" size={20} color="white" />}
                            />
                        </View>
                        <View style={{ pointerEvents: "none", marginBottom: 15 }} >
                            <Entrada label="Fecha de modificación" value={new Date(fechaRegistro).toLocaleString()} editable={false} />
                        </View>
                        <View style={{ pointerEvents: "none", marginBottom: 15 }} >
                            <Entrada label="Reviso" value="{adminEncargado}" editable={false} />
                        </View>
                        <View style={{ pointerEvents: "none" }}>
                            <EntradaMultilinea
                                label="Observaciones"
                                value={observacion}
                            />
                        </View>
                        <View style={{ marginTop: 15, flexDirection: "row", justifyContent: "flex-end" }}>
                            <Button
                                title="Volver a cargar"
                                onPress={() => {
                                    setDocSeleccionado({
                                        ...docSeleccionado,
                                        estatus: "Sin cargar",
                                        color: Colores.textoAdvertencia,
                                    });
                                }}
                            />
                        </View>
                    </>
                )}
            </Modal>
        );
    };

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={[styles.contenedorFormulario, esPantallaPequeña && { maxWidth: "95%" }]}>
                <Text style={styles.titulo}>Expediente Digital</Text>
                <Text style={styles.subtitulo}>Registro al servicio social</Text>
                <Tabla
                    columnas={[
                        { key: "nombreArchivo", titulo: "Documento" },
                        {
                            key: "estatus",
                            titulo: "Estatus",
                            render: (valor, fila) => (
                                <Text style={[styles.texto, { color: fila.color }]}>
                                    {valor}
                                </Text>
                            ),
                        },
                        { key: "observacion", titulo: "Observaciones" },
                    ]}
                    datos={documentos
                        .filter((d) => d.tipo === 1)
                        .map((fila) => ({
                            ...fila,
                            onPress: () => setDocSeleccionado(fila),
                        }))}
                />

                <Text style={styles.subtitulo}>Término del servicio social</Text>
                <Tabla
                    columnas={[
                        { key: "nombreArchivo", titulo: "Documento" },
                        {
                            key: "estatus",
                            titulo: "Estatus",
                            render: (valor, fila) => (
                                <Text style={[styles.texto, { color: fila.color }]}>
                                    {valor}
                                </Text>
                            ),
                        },
                        { key: "observacion", titulo: "Observaciones" },
                    ]}
                    datos={documentos
                        .filter((d) => d.tipo === 2)
                        .map((fila) => ({
                            ...fila,
                            onPress: () => setDocSeleccionado(fila),
                        }))}
                />
            </View>
            {renderModal()}
            < Modal
                visible={modalVisible}
                titulo={modalTipo ? "" : ""}
                cerrar={false}
                onClose={() => setModalVisible(false)}
            >
                <View style={{ alignItems: "center" }}>
                    <Ionicons
                        name={modalTipo ? "checkmark-circle-outline" : "close-circle-outline"}
                        size={80}
                        color={modalTipo ? Colores.textoExito : Colores.textoError}
                    />
                    <Text style={{ fontSize: Fuentes.cuerpo, color: Colores.textoClaro, marginBottom: 8 }}>
                        {modalTipo ? "¡Todo Listo!" : "¡Algo Salió Mal!"}
                    </Text>
                    <Text style={{ fontSize: Fuentes.cuerpo, color: Colores.textoPrincipal, marginBottom: 8, textAlign: "center" }}>{modalMensaje}</Text>
                </View>
            </Modal>

        </ScrollView >
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
