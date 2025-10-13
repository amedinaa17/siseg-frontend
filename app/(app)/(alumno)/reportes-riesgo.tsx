import Modal from "@/componentes/layout/Modal";
import Boton from "@/componentes/ui/Boton";
import Entrada from "@/componentes/ui/Entrada";
import EntradaMultilinea from "@/componentes/ui/EntradaMultilinea";
import Tabla from "@/componentes/ui/Tabla";
import { useAuth } from "@/context/AuthProvider";
import { fetchData } from "@/servicios/api";
import { Colores, Fuentes } from "@/temas/colores";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import React, { useEffect, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View
} from "react-native";

export default function ReportesRiesgo() {
    const { sesion, verificarToken } = useAuth();

    const { width } = useWindowDimensions();
    const esPantallaPequeña = width < 790;

    const [reporteSeleccionado, setReporteSeleccionado] = useState<any | null>(null);
    const [modalAgregar, setModalAgregar] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [modalMensaje, setModalMensaje] = useState('');
    const [modalTipo, setModalTipo] = useState(false);

    const [reportes, setReportes] = useState<any[]>([]);
    const [descripcionNueva, setDescripcionNueva] = useState("");
    const [evidenciasNueva, setEvidenciasNueva] = useState<
        { nombre: string; peso: string; tipo: "image" | "audio" | "pdf" }[]
    >([]);

    const obtenerReportes = async () => {
        verificarToken();

        try {
            const response = await fetchData(`reportes/obtenerReportesAlumno?tk=${sesion.token}`);

            if (response.error === 0) {
                setReportes(response.reportes);
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
        obtenerReportes();
    }, []);

    const cerrarModal = () => setReporteSeleccionado(null);

    const handleAgregarEvidencia = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ["image/*", "application/pdf", "audio/*"],
                copyToCacheDirectory: true,
            });

            if (result.canceled) return;

            const file = result.assets[0];
            const sizeKB = (file.size ?? 0) / 1024;
            let tipo: "image" | "audio" | "pdf" = "pdf";
            if (file.mimeType?.includes("image")) tipo = "image";
            if (file.mimeType?.includes("audio")) tipo = "audio";

            setEvidenciasNueva((prev) => [
                ...prev,
                {
                    nombre: file.name,
                    peso: `${sizeKB.toFixed(0)} KB`,
                    tipo,
                },
            ]);
        } catch (err) {
            console.log("Error seleccionando archivo:", err);
        }
    };

    const handleCancelar = () => {
        setDescripcionNueva("");
        setEvidenciasNueva([]);
        setModalAgregar(false);
    };

    const renderModalAgregar = () => {
        return (
            <Modal
                visible={modalAgregar}
                onClose={handleCancelar}
                titulo="Agregar Reporte"
                textoAceptar="Enviar reporte"
                cancelar
                maxWidth={600}
                onAceptar={() => {
                    setDescripcionNueva("");
                    setEvidenciasNueva([]);
                    setModalAgregar(false);
                }}
            >
                <ScrollView>
                    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "web" ? undefined : "padding"} keyboardVerticalOffset={80} >
                        <View style={{ marginTop: 5, marginBottom: 20 }}>
                            <EntradaMultilinea
                                label="Descripción"
                                value={descripcionNueva}
                                onChangeText={setDescripcionNueva}
                            />
                        </View>
                    </KeyboardAvoidingView>

                    <View style={{ marginBottom: 15, flexDirection: "row", justifyContent: "flex-end" }}>
                        <Boton title="+ Agregar evidencia" onPress={handleAgregarEvidencia} />
                    </View>

                    {evidenciasNueva.length > 0 && <Text style={styles.seccionTitulo}>Evidencias</Text>}

                    <View style={{ marginBottom: 15 }}>
                        {evidenciasNueva.map((evi, idx) => (
                            <View key={idx} style={styles.evidenciaFila}>
                                <Ionicons
                                    name={
                                        evi.tipo === "image"
                                            ? "image-outline"
                                            : evi.tipo === "audio"
                                                ? "musical-notes-outline"
                                                : "document-outline"
                                    }
                                    size={18}
                                    color={Colores.textoClaro}
                                    style={{ marginRight: 8 }}
                                />
                                <Text
                                    style={styles.evidenciaTexto}
                                    numberOfLines={1}
                                    ellipsizeMode="middle"
                                >
                                    {evi.nombre}
                                </Text>
                                <Text style={styles.evidenciaPeso}>{evi.peso}</Text>
                                <Pressable
                                    onPress={() =>
                                        setEvidenciasNueva((prev) =>
                                            prev.filter((_, i) => i !== idx)
                                        )
                                    }
                                >
                                    <Ionicons name="trash-outline" size={20} color={Colores.textoError} />
                                </Pressable>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </Modal>
        );
    };

    const renderModalDetalle = () => {
        if (!reporteSeleccionado) return null;
        const { descripcion, fecha, estatus, evidencias, observaciones } = reporteSeleccionado;

        return (
            <Modal
                visible={!!reporteSeleccionado}
                onClose={cerrarModal}
                titulo="Detalle del Reporte"
                maxWidth={750}
            >
                <View>
                    <Text style={{ marginBottom: 20, fontWeight: "600", fontSize: 15 }}>Estatus:
                        <Text
                            style={[
                                estatus === "Finalizado" && { color: Colores.textoExito },
                                estatus === "En revisión" && { color: Colores.textoInfo },
                                estatus === "Pendiente" && { color: Colores.textoAdvertencia },
                            ]}
                        >
                            {" " + estatus}
                        </Text>
                    </Text>
                </View>
                <View style={{ pointerEvents: "none", marginBottom: 15 }} >
                    <Entrada label="Fecha" value={fecha} editable={false} />
                </View>
                <View style={{ pointerEvents: "none", marginBottom: 15 }}>
                    <EntradaMultilinea
                        label="Descripción"
                        value={descripcion}
                    />
                </View>

                {evidencias && evidencias.length > 0 && (
                    <View style={{ marginBottom: 20 }}>
                        <Text style={styles.seccionTitulo}>Evidencias</Text>
                        {evidencias.map((evi, idx) => (
                            <View key={idx} style={styles.evidenciaFila}>
                                <Ionicons
                                    name={
                                        evi.tipo === "image"
                                            ? "image-outline"
                                            : evi.tipo === "audio"
                                                ? "musical-notes-outline"
                                                : "document-outline"
                                    }
                                    size={18}
                                    color={Colores.textoClaro}
                                    style={{ marginRight: 8 }}
                                />
                                <Text style={styles.evidenciaTexto} numberOfLines={1} ellipsizeMode="middle">{evi.nombre}</Text>
                                <Text style={styles.evidenciaPeso}>{evi.peso}</Text>
                            </View>
                        ))}
                    </View>
                )}
                {observaciones && observaciones.length > 0 && (
                    <View>
                        <Text style={styles.seccionTitulo}>Observaciones</Text>
                        <Tabla
                            columnas={[
                                { key: "fecha", titulo: "Fecha" },
                                { key: "observacion", titulo: "Observación", multilinea: true },
                            ]}
                            datos={observaciones}
                        />
                    </View>
                )}
            </Modal>
        );
    };

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View
                style={[
                    styles.contenedorFormulario,
                    esPantallaPequeña && { maxWidth: "95%" },
                ]}
            >
                <Text style={styles.titulo}>Reportes de Situación de Riesgo</Text>

                <View style={{ marginBottom: 15, alignItems: "flex-start" }}>
                    <Boton title="Agregar reporte" onPress={() => setModalAgregar(true)} />
                </View>

                <ScrollView horizontal={esPantallaPequeña}>
                    <Tabla
                        columnas={[
                            { key: "descripcion", titulo: "Descripción", ...(esPantallaPequeña && { ancho: 250 }) },
                            { key: "fechaRegistro", titulo: "Fecha", ancho: 150 },
                            {
                                key: "estatus",
                                titulo: "Estatus",
                                ancho: 150,
                                render: (valor) => (
                                    <Text
                                        style={[
                                            styles.texto,
                                            valor === "Finalizado" && { color: Colores.textoExito },
                                            valor === "En revisión" && { color: Colores.textoInfo },
                                            valor === "Pendiente" && { color: Colores.textoAdvertencia },
                                        ]}
                                    >
                                        {valor}
                                    </Text>
                                ),
                            },
                            { key: "observacion", titulo: "Observaciones", ...(esPantallaPequeña && { ancho: 250 }) },
                        ]}
                        datos={reportes.map((fila) => {
                            return {
                                ...fila,
                                //observaciones: fila.observaciones[0].observacion,
                                onPress: () => setReporteSeleccionado(fila),
                            };
                        })}
                    />
                </ScrollView>
            </View>
            {renderModalAgregar()}
            {renderModalDetalle()}
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
        marginBottom: 20,
    },
    estatusLabel: {
        marginBottom: 20,
        fontWeight: "600",
        fontSize: 15,
    },
    seccionTitulo: {
        fontWeight: "600",
        marginBottom: 10,
        fontSize: Fuentes.cuerpo,
        color: Colores.textoSecundario,
    },
    evidenciaFila: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    evidenciaTexto: {
        flex: 1,
        fontSize: Fuentes.cuerpo,
        color: Colores.textoPrincipal,
        marginRight: 20,
        flexShrink: 1,
    },
    evidenciaPeso: {
        fontSize: Fuentes.caption,
        color: Colores.textoClaro,
        marginRight: 10,
    },
    texto: {
        fontSize: Fuentes.cuerpo,
        paddingHorizontal: 15,
        paddingVertical: 8,
        fontWeight: "500",
    },
});
