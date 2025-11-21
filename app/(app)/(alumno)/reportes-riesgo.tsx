import Modal from "@/componentes/layout/Modal";
import ModalAPI, { ModalAPIRef } from "@/componentes/layout/ModalAPI";
import Boton from "@/componentes/ui/Boton";
import Entrada from "@/componentes/ui/Entrada";
import EntradaMultilinea from "@/componentes/ui/EntradaMultilinea";
import Paginacion from "@/componentes/ui/Paginacion";
import Selector from "@/componentes/ui/Selector";
import Tabla from "@/componentes/ui/Tabla";
import { useAuth } from "@/context/AuthProvider";
import { reporteEsquema } from "@/lib/validacion";
import { fetchData, postData } from "@/servicios/api";
import { Colores, Fuentes } from "@/temas/colores";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import * as DocumentPicker from "expo-document-picker";
import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

type ArchivoInfo = {
    name: string;
    uri: string;
    type: string;
    size: number;
    file?: any;
};

export default function ReportesRiesgo() {
    const { sesion, verificarToken } = useAuth();

    const { width } = useWindowDimensions();
    const esPantallaPequeña = width < 790;

    const [reportes, setReportes] = useState<any[]>([]);
    const [reporteSeleccionado, setReporteSeleccionado] = useState<any | null>(null);

    const modalAPI = useRef<ModalAPIRef>(null);
    const [modalAgregar, setModalAgregar] = useState(false);

    const [busqueda, setBusqueda] = useState("");
    const [filtroEstatus, setFiltroEstatus] = useState("Todos");
    const [paginaActual, setPaginaActual] = useState(1);
    const [filasPorPagina, setFilasPorPagina] = useState(5);


    const [descripcionNueva, setDescripcionNueva] = useState("");
    const [evidenciasNueva, setEvidenciasNueva] = useState<any[]>([]);
    const [errorEvidenciaNueva, setErrorEvidenciaNueva] = useState<string>("");

    const obtenerReportes = async () => {
        verificarToken();

        try {
            const response = await fetchData(`reportes/obtenerReportesAlumno?tk=${sesion.token}`);

            if (response.error === 0) {
                setReportes(response.fullreportes);
            } else {
                modalAPI.current?.show(false, "Hubo un problema al obtener tus datos del servidor. Inténtalo de nuevo más tarde.");
            }
        } catch (error) {
            modalAPI.current?.show(false, "Error al conectar con el servidor. Inténtalo de nuevo más tarde.");
        }
    };

    useEffect(() => {
        obtenerReportes();
    }, []);

    const reportesFiltrados = reportes
        .filter(r =>
            r.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
            && (filtroEstatus === "Todos" || (r.estatus === 1 && filtroEstatus === "Pendiente")
                || (r.estatus === 2 && filtroEstatus === "En revisión")
                || (r.estatus === 3 && filtroEstatus === "Finalizado"))
        )

    const totalPaginas = Math.ceil(reportesFiltrados.length / filasPorPagina);
    const reportesMostrados = reportesFiltrados.slice(
        (paginaActual - 1) * filasPorPagina,
        paginaActual * filasPorPagina
    );

    const handleAgregarEvidencia = async () => {
        setErrorEvidenciaNueva("");

        try {
            if (Platform.OS === "web") {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*,application/pdf,audio/*";

                input.onchange = async (e: any) => {
                    const file = e.target.files[0];
                    if (file) {
                        const archivoInfo: ArchivoInfo = {
                            uri: URL.createObjectURL(file),
                            name: file.name,
                            type: file.type,
                            size: file.size,
                            file: file,
                        };

                        const sizeKB = (file.size ?? 0) / 1024;

                        if ((sizeKB / 1024) > 2) {
                            setErrorEvidenciaNueva("El archivo no puede exceder los 2MB.");
                            return;
                        }

                        if (evidenciasNueva.length >= 5) {
                            setErrorEvidenciaNueva("No puedes agregar más de 5 evidencias.");
                            return;
                        }

                        setEvidenciasNueva((prev) => [...prev, archivoInfo]);
                    }
                };
                input.click();
            } else {
                const result = await DocumentPicker.getDocumentAsync({
                    type: ["image/*", "application/pdf", "audio/*"],
                    copyToCacheDirectory: true,
                });

                if (!result.canceled && result.assets.length > 0) {
                    const file = result.assets[0];
                    if (file) {
                        const archivoInfo: ArchivoInfo = {
                            uri: file.uri,
                            name: file.name,
                            type: file.mimeType || 'application/octet-stream',
                            size: file.size || 0,
                            file: file,
                        };

                        const sizeKB = (file.size ?? 0) / 1024;

                        if ((sizeKB / 1024) > 2) {
                            setErrorEvidenciaNueva("El archivo no puede exceder los 2MB.");
                            return;
                        }

                        if (evidenciasNueva.length >= 5) {
                            setErrorEvidenciaNueva("No puedes agregar más de 5 evidencias.");
                            return;
                        }

                        setEvidenciasNueva((prev) => [...prev, archivoInfo]);
                    }
                }
            }


        } catch (err: any) {
            setErrorEvidenciaNueva(err.message || "No se pudo seleccionar el archivo.");
        }
    };

    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(reporteEsquema),
        defaultValues: { descripcion: "", evidencias: [] },
    });

    const onSubmit = async (data: any) => {
        verificarToken();

        try {
            const formData = new FormData();
            formData.append("descripcion", data.descripcion);
            formData.append("tk", sesion.token);
            for (const evidencia of evidenciasNueva) {
                formData.append("evidencias", evidencia.file, evidencia.name);
            }

            const response = await postData(`reportes/agregarReporte`, formData,);
            if (response.error === 0) {
                handleCancelar();
                obtenerReportes();
                modalAPI.current?.show(true, "El reporte se ha enviado correctamente.");
            } else {
                modalAPI.current?.show(false, "Hubo un problema al enviar el reporte. Inténtalo de nuevo más tarde.");
            }
        } catch (error) {
            modalAPI.current?.show(false, "Error al conectar con el servidor. Inténtalo de nuevo más tarde.");
        }
    };

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            modalAPI.current?.show(false, "Algunos campos contienen errores. Revísalos y vuelve a intentarlo.");
        }
    }, [errors]);

    const handleCancelar = () => {
        reset();
        setErrorEvidenciaNueva("");
        setEvidenciasNueva([]);
        setModalAgregar(false);
    };

    const renderModalAgregar = () => {
        return (
            <Modal
                visible={modalAgregar} titulo="Agregar Reporte" maxWidth={600}
                onClose={handleCancelar}
                textoAceptar={isSubmitting ? "Enviando…" : "Enviar reporte"} onAceptar={handleSubmit(onSubmit)}
                cancelar deshabilitado={isSubmitting}
            >
                <ScrollView>
                    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "web" ? undefined : "padding"} keyboardVerticalOffset={80} >
                        <View style={{ marginTop: 5, marginBottom: 20 }}>
                            <Controller
                                control={control}
                                name="descripcion"
                                render={({ field: { onChange, value } }) => (
                                    <EntradaMultilinea
                                        label="Descripción"
                                        value={value}
                                        onChangeText={(text) => {
                                            onChange(text);
                                            setDescripcionNueva(text);
                                        }}
                                        error={errors.descripcion?.message}
                                    />
                                )}
                            />
                        </View>
                    </KeyboardAvoidingView>

                    <View style={{ marginBottom: 15, flexDirection: "row", justifyContent: "flex-end" }}>
                        <Boton title="+ Agregar evidencia" onPress={handleAgregarEvidencia} disabled={isSubmitting} />
                    </View>

                    {evidenciasNueva.length > 0 &&
                        <>
                            <Text style={styles.seccionTitulo}>Evidencias</Text>
                            <View style={{ marginBottom: 5 }}>
                                {evidenciasNueva.map((evi, idx) => (
                                    <View key={idx} style={styles.evidenciaFila}>
                                        <Ionicons
                                            name={
                                                evi.type.includes("image")
                                                    ? "image-outline"
                                                    : evi.type.includes("audio")
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
                                            {evi.name}
                                        </Text>
                                        <Text style={styles.evidenciaPeso}>{(evi.size / 1024).toFixed(0)} KB</Text>
                                        <Pressable
                                            onPress={() => {
                                                setEvidenciasNueva((prev) =>
                                                    prev.filter((_, i) => i !== idx)
                                                );
                                                setErrorEvidenciaNueva("");
                                            }}
                                        >
                                            <Ionicons name="trash-outline" size={20} color={Colores.textoError} />
                                        </Pressable>
                                    </View>
                                ))}</View>
                        </>
                    }
                    <Text style={{ fontSize: Fuentes.caption, color: Colores.textoError }}>{errorEvidenciaNueva}</Text>
                </ScrollView>
            </Modal>
        );
    };

    const renderModalDetalle = () => {
        if (!reporteSeleccionado) return null;
        const { adminEncargado, fechaRegistro, fechaModificacion, fechaFinalizado, descripcion, estatus, evidencias, observaciones } = reporteSeleccionado;

        return (
            <Modal
                visible={!!reporteSeleccionado}
                onClose={() => { setReporteSeleccionado(null) }}
                titulo="Detalle del Reporte"
                maxWidth={750}
            >
                <View>
                    <Text style={{ marginBottom: 20, fontWeight: "600", fontSize: 15 }}>Estatus:
                        <Text
                            style={[
                                estatus === 1 && { color: Colores.textoAdvertencia },
                                estatus === 2 && { color: Colores.textoInfo },
                                estatus === 3 && { color: Colores.textoExito },
                            ]}
                        >
                            {estatus === 1 ? " Pendiente" : estatus === 2 ? " En revisión" : " Finalizado"}
                        </Text>
                    </Text>
                </View>
                <View style={{ marginBottom: 15 }} >
                    <Entrada label="Fecha de envío" value={new Date(fechaRegistro).toLocaleDateString()} editable={false} />
                </View>
                {estatus != 1 && (
                    <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                        <View style={{ flex: 1, marginBottom: 0 }}>
                            {estatus === 2 ? (
                                <Entrada label="Última actualización" value={new Date(fechaModificacion).toLocaleDateString()} editable={false} />
                            ) : (
                                <Entrada label="Fecha de finalización" value={new Date(fechaFinalizado).toLocaleDateString()} editable={false} />
                            )}
                        </View>
                        <View style={{ flex: 1, marginBottom: 0 }}>

                            <Entrada label="Revisado por" value={adminEncargado} editable={false} />
                        </View>
                    </View>
                )}
                <View style={{}}>
                    <EntradaMultilinea
                        label="Descripción"
                        value={descripcion}
                    />
                </View>

                {evidencias && evidencias.length > 0 && (
                    <View style={{ marginTop: 15, marginBottom: 20 }}>
                        <Text style={styles.seccionTitulo}>Evidencias</Text>
                        {evidencias.map((evidencia: any, idx: number) => (
                            <View key={idx} style={styles.evidenciaFila} >
                                <Ionicons
                                    name={
                                        evidencia.URL_ARCHIVO.includes(".mp3") ? "musical-notes-outline" : evidencia.URL_ARCHIVO.includes(".pdf") ? "document-outline" : "image-outline"
                                    }
                                    size={18}
                                    color={Colores.textoClaro}
                                    style={{ marginRight: 8 }}
                                />
                                <Pressable onPress={() => Linking.openURL(evidencia.URL_ARCHIVO)}>
                                    <Text
                                        style={[
                                            styles.evidenciaTexto,
                                            { textDecorationLine: "none" }
                                        ]}
                                        numberOfLines={1}
                                        ellipsizeMode="middle"
                                    >
                                        {evidencia.URL_ARCHIVO.split('/').pop()}
                                    </Text>
                                </Pressable>
                            </View>
                        ))}
                    </View>
                )}
                {observaciones && observaciones.length > 0 && (
                    <View>
                        <Text style={styles.seccionTitulo}>Observaciones</Text>
                        <ScrollView horizontal={esPantallaPequeña}>
                            <Tabla
                                columnas={[
                                    { key: "fecha", titulo: "Fecha", ancho: 105 },
                                    { key: "admin", titulo: "Revisado por", ancho: 250, multilinea: true },
                                    { key: "descripcion", titulo: "Observación", ...(esPantallaPequeña && { ancho: 350 }), multilinea: true },
                                ]}
                                datos={observaciones.map((observacion: any) => ({
                                    fecha: new Date(observacion.FECHA_DATETIME).toLocaleDateString(),
                                    admin: observacion.AUTOR_ADMIN.nombre + " " + observacion.AUTOR_ADMIN.APELLIDO_PATERNO + " " + observacion.AUTOR_ADMIN.APELLIDO_MATERNO,
                                    descripcion: observacion.DESCRIPCION,
                                }))}
                            />
                        </ScrollView>
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
                <Text style={styles.titulo}>Reportes de situación de riesgo</Text>

                <View style={{ marginBottom: 15, alignItems: "flex-start" }}>
                    <Boton title="Agregar reporte" onPress={() => setModalAgregar(true)} />
                </View>
                <View style={styles.controlesSuperiores}>
                    <View style={[{ flexDirection: "row", alignItems: "center", gap: 8 }, esPantallaPequeña && { marginBottom: 15, width: "100%" }]}>
                        <View style={[esPantallaPequeña && [filasPorPagina === 5 ? { minWidth: 35.8 } : filasPorPagina === 10 ? { width: 42.8 } : { minWidth: 44.8 }]]}>
                            <Selector
                                label=""
                                selectedValue={String(filasPorPagina)}
                                onValueChange={(valor) => setFilasPorPagina(Number(valor))}
                                items={[
                                    { label: "5", value: "5" },
                                    { label: "10", value: "10" },
                                    { label: "20", value: "20" },
                                ]}
                            />
                        </View>
                        <Text style={{ color: Colores.textoClaro, fontSize: Fuentes.caption }}>por página</Text>
                    </View>

                    <View style={[{ flexDirection: "row", gap: 8, justifyContent: "space-between" }, esPantallaPequeña ? { width: "100%" } : { width: "40%" }]}>
                        <View style={[esPantallaPequeña ? { width: "60%", marginBottom: 15 } : { width: "60%" }]}>
                            <Entrada
                                label="Buscar"
                                value={busqueda}
                                onChangeText={(text) => { setBusqueda(text); setPaginaActual(1); }}
                            />
                        </View>
                        <View style={[esPantallaPequeña ? { width: "40%" } : { width: "40%" }]}>
                            <Selector
                                label="Estatus"
                                selectedValue={filtroEstatus}
                                onValueChange={setFiltroEstatus}
                                items={[
                                    { label: "Todos", value: "Todos" },
                                    { label: "Pendiente", value: "Pendiente" },
                                    { label: "En revisión", value: "En revisión" },
                                    { label: "Finalizado", value: "Finalizado" },
                                ]}
                            />
                        </View>
                    </View>
                </View>

                <ScrollView horizontal={esPantallaPequeña}>
                    <Tabla
                        columnas={[
                            { key: "descripcion", titulo: "Descripción", ...(esPantallaPequeña && { ancho: 250 }) },
                            { key: "fecha", titulo: "Fecha de envío", ancho: 150 },
                            {
                                key: "estatus",
                                titulo: "Estatus",
                                ancho: 150,
                                render: (valor) => (
                                    <Text
                                        style={[
                                            styles.texto,
                                            valor === 2 && { color: Colores.textoInfo },
                                            valor === 1 && { color: Colores.textoAdvertencia },
                                            valor === 3 && { color: Colores.textoExito },
                                        ]}
                                    >
                                        {valor === 1 ? "Pendiente" : valor === 2 ? "En revisión" : "Finalizado"}
                                    </Text>
                                ),
                            },
                            {
                                key: "observacion",
                                titulo: "Observaciones",
                                ...(esPantallaPequeña && { ancho: 250 }),
                            }
                        ]}
                        datos={reportesMostrados.map((fila) => {
                            const observacion = Array.isArray(fila.observaciones) && fila.observaciones.length > 0 ? fila.observaciones.sort((a: any, b: any) => new Date(b.FECHA_DATETIME).getTime() - new Date(a.FECHA_DATETIME).getTime())[0] : null
                            return {
                                ...fila,
                                fecha: new Date(fila.fechaRegistro).toLocaleDateString(),
                                observacion: observacion?.DESCRIPCION ? observacion.DESCRIPCION : "En espera de revisión.",
                                onPress: () => setReporteSeleccionado(fila),
                            };
                        })}
                    />
                </ScrollView>
                <View style={{ flexDirection: esPantallaPequeña ? "column" : "row", justifyContent: "space-between" }}>
                    <View style={{ flexDirection: "row", marginTop: 15, gap: 6 }}>
                        <Paginacion
                            paginaActual={paginaActual}
                            totalPaginas={totalPaginas}
                            setPaginaActual={setPaginaActual}
                        />
                    </View>

                    <Text
                        style={{
                            color: Colores.textoClaro,
                            fontSize: Fuentes.caption,
                            marginTop: 15,
                        }}
                    >
                        {`Mostrando ${reportesMostrados.length} de ${reportesFiltrados.length} resultados`}
                    </Text>
                </View>
            </View>
            {renderModalAgregar()}
            {renderModalDetalle()}
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
        marginBottom: 20,
    },
    controlesSuperiores: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 15,
        flexWrap: "wrap",
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
    row: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 15,
    },
});
