import Modal from "@/componentes/layout/Modal";
import ModalAPI, { ModalAPIRef } from "@/componentes/layout/ModalAPI";
import Boton from "@/componentes/ui/Boton";
import Checkbox from "@/componentes/ui/Checkbox";
import Entrada from "@/componentes/ui/Entrada";
import EntradaMultilinea from "@/componentes/ui/EntradaMultilinea";
import Paginacion from "@/componentes/ui/Paginacion";
import Selector from "@/componentes/ui/Selector";
import Tabla from "@/componentes/ui/Tabla";
import { useAuth } from "@/context/AuthProvider";
import { observacionEsquema } from "@/lib/validacion";
import { fetchData, postData } from "@/servicios/api";
import { Colores, Fuentes } from "@/temas/colores";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";

export default function ReportesRiesgo() {
    const { sesion, verificarToken } = useAuth();
    const router = useRouter();

    const [cargando, setCargando] = useState(false);

    const { width } = useWindowDimensions();
    const esPantallaPequeña = width < 790;

    // Estados modales
    const modalAPI = useRef<ModalAPIRef>(null);
    const [modalDetalle, setModalDetalle] = useState(false);
    const [modalObservaciones, setModalObservaciones] = useState(false);
    const [modalAgregarObservacion, setModalAgregarObservacion] = useState(false);

    const [reportes, setReportes] = useState<any[]>([]);
    const [reporteSeleccionado, setReporteSeleccionado] = useState<any | null>(null);
    const [estatus, setEstatus] = useState<number>();
    const [observacionNueva, setObservacionNueva] = useState("");

    // --- Estados para búsqueda, filtros y paginación ---
    const [busqueda, setBusqueda] = useState("");
    const [filtroCarrera, setFiltroCarrera] = useState("Todos");
    const [filtroEstatus, setFiltroEstatus] = useState("Todos");
    const [paginaActual, setPaginaActual] = useState(1);
    const [filasPorPagina, setFilasPorPagina] = useState(5);

    const obtenerReportes = async () => {
        verificarToken();

        try {
            setCargando(true);

            const response = await fetchData(`reportes/obtenerTodosReportes?tk=${sesion.token}`);

            if (response.error === 0) {
                setReportes(response.fullreportes);
            } else {
                modalAPI.current?.show(false, "Hubo un problema al obtener los datos del servidor. Inténtalo de nuevo más tarde.", () => { router.replace("/inicio-administrativo"); });
            }
        } catch (error) {
            modalAPI.current?.show(false, "Error al conectar con el servidor. Inténtalo de nuevo más tarde.", () => { router.replace("/inicio-administrativo"); });
        } finally {
            setCargando(false);
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

    const { handleSubmit: handleSubmitEstatus, formState: { isSubmitting: isSubmittingEstatus } } = useForm<any>();

    const cambiarEstatusReporte = async () => {
        verificarToken();

        const datos = { idReporte: reporteSeleccionado.id, nuevoEstatus: estatus, tk: sesion.token };
        try {
            const response = await postData("reportes/cambiarEstatusReporte", datos);
            if (response.error === 0) {
                setModalDetalle(false);
                setEstatus(undefined);
                obtenerReportes();
                modalAPI.current?.show(true, "El estatus ha sido actualizado correctamente.");
            } else {
                modalAPI.current?.show(false, "Hubo un problema al cambiar el estatus del reporte. Inténtalo de nuevo más tarde.");
            }
        } catch (error) {
            modalAPI.current?.show(false, "Error al conectar con el servidor. Inténtalo de nuevo más tarde.");
        }
    };

    const { control, handleSubmit: handleSubmitObservacion, reset,
        formState: { errors, isSubmitting: isSubmittingObservacion } } = useForm({
            resolver: zodResolver(observacionEsquema),
        });

    const agregarObservacionReporte = async () => {
        verificarToken();

        const datos = { idReporte: reporteSeleccionado.id, descripcion: observacionNueva, tk: sesion.token };
        try {
            const response = await postData("reportes/agregarObservacionReporte", datos);
            if (response.error === 0) {
                setModalAgregarObservacion(false);
                reset();
                obtenerReportes();
                modalAPI.current?.show(true, "La observación ha sido agregada correctamente.");
            } else {
                modalAPI.current?.show(false, "Hubo un problema al agregar la observación. Inténtalo de nuevo más tarde.");
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

    // --- Render de modales ---
    const renderModalDetalle = () => {
        if (!reporteSeleccionado) return null;
        return (
            <Modal
                visible={modalDetalle} cancelar
                onClose={() => { setReporteSeleccionado(null); setModalDetalle(false); }}
                deshabilitado={isSubmittingEstatus} textoAceptar={isSubmittingEstatus ? "Actualizando…" : reporteSeleccionado.estatus != estatus ? "Guardar estatus" : undefined}
                onAceptar={reporteSeleccionado.estatus != estatus ? handleSubmitEstatus(cambiarEstatusReporte) : () => { setReporteSeleccionado(null); setModalDetalle(false); }}
                titulo={"Detalles del reporte"}
                maxWidth={700}
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <Text style={{ fontSize: Fuentes.subtitulo, marginBottom: 15, textAlign: "right" }}><Text style={{ fontWeight: "600" }}>Fecha de envío:</Text> {new Date(reporteSeleccionado.fechaRegistro).toLocaleDateString()}</Text>
                    <View style={{ marginBottom: 15 }}>
                        <View style={{ flexDirection: "row", gap: 16 }}>
                            <Text style={styles.seccionTitulo}>Estatus</Text>
                            <Checkbox
                                label="Pendiente"
                                value={estatus === 1}
                                onValueChange={() => setEstatus(1)}
                                labelColor="textoAdvertencia"
                            />
                            <Checkbox
                                label="En revisión"
                                value={estatus === 2}
                                onValueChange={() => setEstatus(2)}
                                labelColor="textoInfo"
                            />
                            <Checkbox
                                label="Finalizado"
                                value={estatus === 3}
                                onValueChange={() => setEstatus(3)}
                                labelColor="textoExito"
                            />
                        </View>
                    </View>

                    <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                        <View style={{ flex: 1, marginBottom: 0 }}>
                            <Entrada
                                label="Alumno"
                                value={`${reporteSeleccionado.alumnoNombre}`}
                                editable={false}
                            />
                        </View>
                        <View style={{ flex: 1, marginBottom: 0 }}>
                            <Entrada label="Boleta" value={reporteSeleccionado.alumnoBoleta} maxLength={10} editable={false} />
                        </View>
                    </View>

                    <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                        <View style={{ flex: 1, marginBottom: 0 }}>
                            <Entrada label="Carrera" value={reporteSeleccionado.alumnoCarrera} editable={false} />
                        </View>
                        <View style={{ flex: 1, marginBottom: 0 }}>
                            <Entrada label="Generación" value={reporteSeleccionado.alumnoGeneracion} editable={false} />
                        </View>
                    </View>

                    {/* <View style={{ marginBottom: 15 }}>
                        <Entrada label="Sede" value={reporteSeleccionado.alumnoSede} editable={false} />
                    </View> */}

                    {reporteSeleccionado.adminEncargado && reporteSeleccionado.estatus !== 1 && (
                        <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                            <View style={{ flex: 1, marginBottom: 0 }}>
                                {reporteSeleccionado.estatus === 2 ? (
                                    <Entrada label="Última actualización" value={new Date(reporteSeleccionado.fechaModificacion).toLocaleDateString()} editable={false} />
                                ) : reporteSeleccionado.estatus === 3 ? (
                                    <Entrada label="Fecha de finalización" value={new Date(reporteSeleccionado.fechaFinalizado).toLocaleDateString()} editable={false} />
                                ) : undefined
                            }
                            </View>
                            <View style={{ flex: 1, marginBottom: 0 }}>
                                <Entrada label="Revisado por" value={reporteSeleccionado.adminEncargado.nombre + " " + reporteSeleccionado.adminEncargado.APELLIDO_PATERNO + " " + reporteSeleccionado.adminEncargado.APELLIDO_MATERNO} editable={false} />
                            </View>
                        </View>
                    )}

                    <View style={{ marginBottom: 20 }}>
                        <EntradaMultilinea
                            label="Descripción"
                            value={reporteSeleccionado.descripcion}
                            editable={false}
                            multiline
                            style={{ minHeight: 80 }}
                        />
                    </View>
                    {reporteSeleccionado.evidencias && reporteSeleccionado.evidencias.length > 0 && (
                        <View style={{ marginTop: 15, marginBottom: 20 }}>
                            <Text style={styles.seccionTitulo}>Evidencias</Text>
                            {reporteSeleccionado.evidencias.map((evidencia: any, idx: number) => (
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

                    <View style={{ alignItems: "flex-start" }}>
                        <Boton title="Ver observaciones" onPress={() => { setModalDetalle(false); setModalObservaciones(true); }} />
                    </View>
                </ScrollView>
            </Modal>
        );
    };

    const renderModalObservaciones = () => {
        if (!reporteSeleccionado) return null;
        return (
            <Modal
                visible={modalObservaciones}
                onClose={() => { setModalDetalle(true); setModalObservaciones(false); reset(); }}
                titulo={"Observaciones"}
                maxWidth={700}
            >
                <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "web" ? undefined : "padding"} keyboardVerticalOffset={80}>
                    <Text style={{ fontSize: Fuentes.subtitulo, marginBottom: 5, textAlign: "right" }}><Text style={{ fontWeight: "600" }}>Fecha de envío:</Text> {new Date(reporteSeleccionado.fechaRegistro).toLocaleDateString()}</Text>
                    <Text style={{ fontSize: 15, color: Colores.textoSecundario, fontWeight: "600", marginBottom: 10 }}>{reporteSeleccionado.alumnoNombre}</Text>
                    <View>
                        <Text style={{ marginBottom: 20, fontWeight: "600", fontSize: Fuentes.cuerpo, color: Colores.textoSecundario }}>Estatus:
                            <Text
                                style={[
                                    styles.texto,
                                    reporteSeleccionado.estatus === 2 && { color: Colores.textoInfo },
                                    reporteSeleccionado.estatus === 1 && { color: Colores.textoAdvertencia },
                                    reporteSeleccionado.estatus === 3 && { color: Colores.textoExito },
                                ]}
                            >
                                {" " + (reporteSeleccionado.estatus === 1 ? "Pendiente" : reporteSeleccionado.estatus === 2 ? "En revisión" : "Finalizado")}
                            </Text>
                        </Text>
                    </View>

                    {reporteSeleccionado.observaciones && reporteSeleccionado.observaciones.length > 0 && (
                        <View>
                            <Text style={styles.seccionTitulo}>Observaciones</Text>
                            <ScrollView horizontal={esPantallaPequeña}>
                                <Tabla
                                    columnas={[
                                        { key: "fecha", titulo: "Fecha", ancho: 105 },
                                        { key: "admin", titulo: "Revisado por", ancho: 250, multilinea: true },
                                        { key: "descripcion", titulo: "Observación", ...(esPantallaPequeña && { ancho: 350 }), multilinea: true },
                                    ]}
                                    datos={reporteSeleccionado.observaciones.map((observacion: any) => ({
                                        fecha: new Date(observacion.FECHA_DATETIME).toLocaleDateString(),
                                        admin: observacion.AUTOR_ADMIN.nombre + " " + observacion.AUTOR_ADMIN.APELLIDO_PATERNO + " " + observacion.AUTOR_ADMIN.APELLIDO_MATERNO,
                                        descripcion: observacion.DESCRIPCION,
                                    }))}
                                />
                            </ScrollView>
                        </View>
                    )}
                    {reporteSeleccionado.estatus != 3 && (
                        <View style={{ alignItems: "flex-start", marginTop: 20 }}>
                            <Boton title="Agregar observación" onPress={() => { setModalObservaciones(false); setModalAgregarObservacion(true); }} />
                        </View>
                    )}
                </KeyboardAvoidingView>
            </Modal>
        );
    };

    const renderModalAgregarObservacion = () => {
        if (!reporteSeleccionado) return null;
        return (
            <Modal
                visible={modalAgregarObservacion}
                onClose={() => { setModalObservaciones(true); setModalAgregarObservacion(false); setObservacionNueva(""); reset(); }}
                titulo={"Observaciones"} cancelar
                deshabilitado={isSubmittingObservacion} textoAceptar={isSubmittingObservacion ? "Agregando…" : "Agregar observación"}
                onAceptar={handleSubmitObservacion(agregarObservacionReporte)}
                maxWidth={700}
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <Text style={{ fontSize: Fuentes.subtitulo, marginBottom: 5, textAlign: "right" }}><Text style={{ fontWeight: "600" }}>Fecha de envío:</Text> {new Date(reporteSeleccionado.fechaRegistro).toLocaleDateString()}</Text>
                    <Text style={{ fontSize: 15, color: Colores.textoSecundario, fontWeight: "600", marginBottom: 10 }}>{reporteSeleccionado.alumnoNombre}</Text>
                    <View>
                        <Text style={{ marginBottom: 20, fontWeight: "600", fontSize: Fuentes.cuerpo, color: Colores.textoSecundario }}>Estatus:
                            <Text
                                style={[
                                    styles.texto,
                                    reporteSeleccionado.estatus === 2 && { color: Colores.textoInfo },
                                    reporteSeleccionado.estatus === 1 && { color: Colores.textoAdvertencia },
                                    reporteSeleccionado.estatus === 3 && { color: Colores.textoExito },
                                ]}
                            >
                                {" " + (reporteSeleccionado.estatus === 1 ? "Pendiente" : reporteSeleccionado.estatus === 2 ? "En revisión" : "Finalizado")}
                            </Text>
                        </Text>
                    </View>
                    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "web" ? undefined : "padding"} keyboardVerticalOffset={80} >
                        <View style={{ marginTop: 5, marginBottom: 20 }}>
                            <Controller
                                control={control}
                                name="observacion"
                                defaultValue=""
                                render={({ field: { onChange, value } }) => (
                                    <EntradaMultilinea
                                        label="Observación"
                                        value={value}
                                        onChangeText={(text) => {
                                            onChange(text);
                                            setObservacionNueva(text);
                                        }}
                                        error={errors.observacion?.message}
                                    />
                                )}
                            />
                        </View>
                    </KeyboardAvoidingView>
                </ScrollView>
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
                <View style={[styles.container, esPantallaPequeña && { maxWidth: "95%" }]}>
                    <Text style={styles.titulo}>Reportes de situación de riesgo</Text>

                    <View style={styles.controlesSuperiores}>
                        <View style={[{ flexDirection: "row", alignItems: "center", gap: 8 }, esPantallaPequeña && { width: "100%", marginBottom: 15 }]}>
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

                        <View style={[esPantallaPequeña ? { width: "100%" } : { flexDirection: "row", gap: 8, justifyContent: "space-between", width: "50%" }]}>
                            <View style={[esPantallaPequeña ? { width: "100%", marginBottom: 15 } : { width: "50%" }]}>
                                <Entrada
                                    label="Buscar"
                                    value={busqueda}
                                    onChangeText={setBusqueda}
                                />
                            </View>

                            <View style={{ flexDirection: "row", gap: 8, width: "100%" }}>
                                <View style={[esPantallaPequeña ? { width: "50%" } : { width: "30%" }]}>
                                    <Selector
                                        label="Carrera"
                                        selectedValue={filtroCarrera}
                                        onValueChange={setFiltroCarrera}
                                        items={[
                                            { label: "Todos", value: "Todos" },
                                            { label: "Médico Cirujano y Partero", value: "Partero" },
                                            { label: "Médico Cirujano y Homeópata", value: "Homeópata" },
                                        ]}
                                    />
                                </View>

                                <View style={[esPantallaPequeña ? { width: "50%" } : { width: "20%" }]}>
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
                    </View>

                    <ScrollView horizontal={esPantallaPequeña}>
                        <Tabla
                            columnas={[
                                { key: "fecha", titulo: "Fecha", ancho: 120 },
                                { key: "alumnoBoleta", titulo: "Boleta", ancho: 150 },
                                { key: "alumnoNombre", titulo: "Alumno", ...(esPantallaPequeña && { ancho: 250 }) },
                                { key: "alumnoCarrera", titulo: "Carrera", ...(esPantallaPequeña && { ancho: 250 }) },
                                { key: "alumnoGeneracion", titulo: "Generación", ancho: 150 },
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
                            ]}
                            datos={reportesMostrados.map((fila) => {
                                return {
                                    ...fila,
                                    fecha: new Date(fila.fechaRegistro).toLocaleDateString(),
                                    onPress: () => { setReporteSeleccionado(fila); setEstatus(fila.estatus); setModalDetalle(true); },
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
                {renderModalDetalle()}
                {renderModalObservaciones()}
                {renderModalAgregarObservacion()}
                <ModalAPI ref={modalAPI} />
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "90%",
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
        marginBottom: 20,
        flexWrap: "wrap",
    },
    texto: {
        fontSize: Fuentes.cuerpoPrincipal,
        paddingHorizontal: 15,
        paddingVertical: 8,
        fontWeight: "500",
    },
    row: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 15,
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
});
