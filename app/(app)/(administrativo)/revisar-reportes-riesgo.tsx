import Modal from "@/componentes/layout/Modal";
import Boton from "@/componentes/ui/Boton";
import Checkbox from "@/componentes/ui/Checkbox";
import Entrada from "@/componentes/ui/Entrada";
import EntradaMultilinea from "@/componentes/ui/EntradaMultilinea";
import Paginacion from "@/componentes/ui/Paginacion";
import Selector from "@/componentes/ui/Selector";
import Tabla from "@/componentes/ui/Tabla";
import { Colores, Fuentes } from "@/temas/colores";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

const datosReportes = [
    {
        fecha: "10/12/2024",
        nombre: "Alejandro",
        apellidoPaterno: "Vega",
        apellidoMaterno: "Domínguez",
        carrera: "Médico Cirujano y Homeópata",
        generacion: "2024",
        estatus: "Finalizado",
        boleta: "2022630312",
        reporte: "Finalizado",
        sede: "DFIMS000266 UMF 03 LA JOYA GUSTAVO A MADERO",
        descripcion: "La zona donde realizo el servicio es insegura.",
        evidencias: [
            { name: "foto1.jpg", size: "211 KB" },
            { name: "audio1.mp3", size: "23 MB" },
            { name: "archivo1.pdf", size: "90 KB" }
        ],
        observaciones: [
            { fecha: "24/12/2024", observacion: "Se aprobó cambio de plaza a zona segura." },
            { fecha: "20/12/2024", observacion: "Se envió la solicitud de cambio de plaza a secretaría de salud." },
            { fecha: "14/12/2024", observacion: "Se evaluará la situación Jefe del Departamento de Extensión y Apoyos Educativos." },
            { fecha: "10/12/2024", observacion: "Reporte enviado, en espera de revisión" }
        ],
    },
    {
        fecha: "06/03/2025",
        nombre: "Mariana",
        apellidoPaterno: "Torres",
        apellidoMaterno: "López",
        carrera: "Médico Cirujano y Partero",
        generacion: "2025",
        estatus: "En revisión",
        boleta: "2022630320",
        reporte: "En revisión",
        sede: "DFIMS000266 UMF 03 LA JOYA GUSTAVO A MADERO",
        descripcion: "No me permiten salir a tiempo.",
        evidencias: [
            { name: "foto1.jpg", size: "211 KB" },
            { name: "audio1.mp3", size: "23 MB" },
            { name: "archivo1.pdf", size: "90 KB" }
        ],
        observaciones: [
            { fecha: "07/03/2025", observacion: "Se contactó a la institución." },
            { fecha: "06/03/2025", observacion: "Reporte enviado, en espera de revisión" }
        ],
    },
    {
        fecha: "13/11/2025",
        nombre: "Andrea",
        apellidoPaterno: "Salgado",
        apellidoMaterno: "Ramírez",
        carrera: "Médico Cirujano y Partero",
        generacion: "2025",
        estatus: "Pendiente",
        boleta: "2022630301",
        reporte: "Pendiente",
        sede: "DFIMS000266 UMF 03 LA JOYA GUSTAVO A MADERO",
        descripcion: "Me siento vigilado por un personal de la institución.",
        evidencias: [],
        observaciones: [{ fecha: "13/11/2025", observacion: "Reporte enviado, en espera de revisión" }],
    },
];

const defaultValues = {
    estatus: "Pendiente",
    observacion: "",
};

export default function ReportesRiesgo() {
    const { width } = useWindowDimensions();
    const esPantallaPequeña = width < 790;

    // Estados modales
    const [modalDetalle, setModalDetalle] = useState(false);
    const [modalObservaciones, setModalObservaciones] = useState(false);
    const [modalAgregarObservacion, setModalAgregarObservacion] = useState(false);

    const [reporteSeleccionado, setReporteSeleccionado] = useState<any | null>(null);
    const [estatus, setEstatus] = useState<string>("");
    const [observacionNueva, setObservacionNueva] = useState("");

    // --- Estados para búsqueda, filtros y paginación ---
    const [busqueda, setBusqueda] = useState("");
    const [filtroCarrera, setFiltroCarrera] = useState("Todos");
    const [filtroEstatus, setFiltroEstatus] = useState("Todos");
    const [paginaActual, setPaginaActual] = useState(1);
    const [filasPorPagina, setFilasPorPagina] = useState(5);

    const abrirModalDetalle = (reporte) => {
        setReporteSeleccionado(reporte);
        setEstatus(reporte.estatus)
        setModalDetalle(true);
    };

    const cerrarModalDetalle = () => {
        setReporteSeleccionado(null);
        setModalDetalle(false);
    };

    const abrirModalObservaciones = () => {
        setModalDetalle(false);
        setModalObservaciones(true);
    };

    const cerrarModalObservaciones = () => {
        setModalDetalle(true);
        setModalObservaciones(false);
    };

    const abrirModalAgregarObservacion = () => {
        setModalObservaciones(false);
        setModalAgregarObservacion(true);
    };

    const cerrarModalAgregarObservacion = () => {
        setModalObservaciones(true);
        setModalAgregarObservacion(false);
        setObservacionNueva("");
    };

    const onSubmit = (data) => {
        console.log(data);
        setModalDetalle(false);
    };

    // --- Filtrado y paginación de los datos ---
    const obtenerDatosFiltrados = () => {
        let datos = [...datosReportes];

        // Búsqueda por nombre completo o boleta del alumno
        if (busqueda) {
            datos = datos.filter(alumno =>
                `${alumno.nombre} ${alumno.apellidoPaterno} ${alumno.apellidoMaterno}`
                    .toLowerCase()
                    .includes(busqueda.toLowerCase()) ||
                alumno.boleta.includes(busqueda.toLowerCase())
            );
        }

        // Filtros por carrera y estatus
        if (filtroCarrera && filtroCarrera != "Todos") datos = datos.filter(a => a.carrera === "Médico Cirujano y " + filtroCarrera);
        if (filtroEstatus && filtroEstatus != "Todos") datos = datos.filter(a => a.estatus === filtroEstatus);

        // Paginación
        const inicio = (paginaActual - 1) * filasPorPagina;
        const fin = inicio + filasPorPagina;

        return datos.slice(inicio, fin);
    };

    const totalRegistros = (() => {
        let datos = [...datosReportes];
        if (busqueda) {
            datos = datos.filter(alumno =>
                `${alumno.nombre} ${alumno.apellidoPaterno} ${alumno.apellidoMaterno}`
                    .toLowerCase()
                    .includes(busqueda.toLowerCase())
            );
        }
        if (filtroCarrera && filtroCarrera != "Todos") datos = datos.filter(a => a.carrera === "Médico Cirujano y " + filtroCarrera);
        if (filtroEstatus && filtroEstatus != "Todos") datos = datos.filter(a => a.estatus === filtroEstatus);
        return datos.length;
    })();
    const totalPaginas = Math.ceil(totalRegistros / filasPorPagina);

    // --- Render de modales ---
    const renderModalDetalle = () => {
        if (!reporteSeleccionado) return null;
        return (
            <Modal
                visible={modalDetalle} cancelar
                onClose={() => cerrarModalDetalle()}
                titulo={"Detalles del Reporte"}
                maxWidth={700}
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <Text style={{ fontSize: Fuentes.subtitulo, marginBottom: 15, textAlign: "right" }}><Text style={{ fontWeight: "600" }}>Fecha:</Text> {reporteSeleccionado.fecha}</Text>
                    <View style={{ marginBottom: 15 }}>
                        <View style={{ flexDirection: "row", gap: 16 }}>
                            <Text style={styles.seccionTitulo}>Estatus</Text>
                            <Checkbox
                                label="Pendiente"
                                value={estatus === "Pendiente"}
                                onValueChange={() => setEstatus("Pendiente")}
                                labelColor="textoAdvertencia"
                            />
                            <Checkbox
                                label="En revisión"
                                value={estatus === "En revisión"}
                                onValueChange={() => setEstatus("En revisión")}
                                labelColor="textoInfo"
                            />
                            <Checkbox
                                label="Finalizado"
                                value={estatus === "Finalizado"}
                                onValueChange={() => setEstatus("Finalizado")}
                                labelColor="textoExito"
                            />
                        </View>
                    </View>

                    <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                        <View style={{ flex: 1, marginBottom: 0 }}>
                            <Entrada
                                label="Alumno"
                                value={`${reporteSeleccionado.nombre} ${reporteSeleccionado.apellidoPaterno} ${reporteSeleccionado.apellidoMaterno}`}
                                editable={false}
                            />
                        </View>
                        <View style={{ flex: 1, marginBottom: 0 }}>
                            <Entrada label="Boleta" value={reporteSeleccionado.boleta} editable={false} />
                        </View>
                    </View>

                    <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                        <View style={{ flex: 1, marginBottom: 0 }}>
                            <Entrada label="Carrera" value={reporteSeleccionado.carrera} editable={false} />
                        </View>
                        <View style={{ flex: 1, marginBottom: 0 }}>
                            <Entrada label="Generación" value={reporteSeleccionado.generacion} editable={false} />
                        </View>
                    </View>

                    <View style={{ marginBottom: 15 }}>
                        <Entrada label="Sede" value={reporteSeleccionado.sede} editable={false} />
                    </View>

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
                        <View style={{ marginBottom: 20 }}>
                            <Text style={styles.seccionTitulo}>Evidencias</Text>
                            {reporteSeleccionado.evidencias.map((file, index) => (
                                <View key={index} style={styles.evidenciaFila}>
                                    <Ionicons
                                        name={
                                            file.name.endsWith(".jpg") || file.name.endsWith(".png")
                                                ? "image-outline"
                                                : file.name.endsWith(".mp3")
                                                    ? "musical-notes-outline"
                                                    : "document-outline"
                                        }
                                        size={18}
                                        color={Colores.textoClaro}
                                        style={{ marginRight: 8 }}
                                    />
                                    <Text style={styles.evidenciaTexto} numberOfLines={1} ellipsizeMode="middle">{file.name}</Text>
                                    <Text style={styles.evidenciaPeso}>{file.size}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    <View style={{ alignItems: "flex-start" }}>
                        <Boton title="Ver observaciones" onPress={() => abrirModalObservaciones()} />
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
                onClose={() => cerrarModalObservaciones()}
                titulo={"Observaciones"}
                maxWidth={700}
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <Text style={{ fontSize: Fuentes.subtitulo, marginBottom: 5, textAlign: "right" }}><Text style={{ fontWeight: "600" }}>Fecha:</Text> {reporteSeleccionado.fecha}</Text>
                    <Text style={{ fontSize: 15, color: Colores.textoSecundario, fontWeight: "600", marginBottom: 10 }}>{reporteSeleccionado.nombre} {reporteSeleccionado.apellidoPaterno} {reporteSeleccionado.apellidoMaterno}</Text>
                    <View>
                        <Text style={{ marginBottom: 20, fontWeight: "600", fontSize: Fuentes.cuerpo, color: Colores.textoSecundario }}>Estatus:
                            <Text
                                style={[
                                    reporteSeleccionado.estatus === "Finalizado" && { color: Colores.textoExito },
                                    reporteSeleccionado.estatus === "En revisión" && { color: Colores.textoInfo },
                                    reporteSeleccionado.estatus === "Pendiente" && { color: Colores.textoAdvertencia },
                                ]}
                            >
                                {" " + reporteSeleccionado.estatus}
                            </Text>
                        </Text>
                    </View>

                    {reporteSeleccionado.observaciones && reporteSeleccionado.observaciones.length > 0 && (
                        <View>
                            <Text style={styles.seccionTitulo}>Observaciones</Text>
                            <Tabla
                                columnas={[
                                    { key: "fecha", titulo: "Fecha" },
                                    { key: "observacion", titulo: "Observación", multilinea: true },
                                ]}
                                datos={reporteSeleccionado.observaciones}
                            />
                        </View>
                    )}
                    {reporteSeleccionado.estatus != "Finalizado" && (
                        <View style={{ alignItems: "flex-start", marginTop: 20 }}>
                            <Boton title="Agregar Observación" onPress={() => abrirModalAgregarObservacion()} />
                        </View>
                    )}
                </ScrollView>
            </Modal>
        );
    };

    const renderModalAgregarObservacion = () => {
        if (!reporteSeleccionado) return null;
        return (
            <Modal
                visible={modalAgregarObservacion}
                onClose={() => cerrarModalAgregarObservacion()}
                titulo={"Observaciones"}
                textoAceptar="Agregar observación" cancelar
                maxWidth={700}
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <Text style={{ fontSize: Fuentes.subtitulo, marginBottom: 5, textAlign: "right" }}><Text style={{ fontWeight: "600" }}>Fecha:</Text> {reporteSeleccionado.fecha}</Text>
                    <Text style={{ fontSize: 15, color: Colores.textoSecundario, fontWeight: "600", marginBottom: 10 }}>{reporteSeleccionado.nombre} {reporteSeleccionado.apellidoPaterno} {reporteSeleccionado.apellidoMaterno}</Text>
                    <View>
                        <Text style={{ marginBottom: 20, fontWeight: "600", fontSize: Fuentes.cuerpo, color: Colores.textoSecundario }}>Estatus:
                            <Text
                                style={[
                                    reporteSeleccionado.estatus === "Finalizado" && { color: Colores.textoExito },
                                    reporteSeleccionado.estatus === "En revisión" && { color: Colores.textoInfo },
                                    reporteSeleccionado.estatus === "Pendiente" && { color: Colores.textoAdvertencia },
                                ]}
                            >
                                {" " + reporteSeleccionado.estatus}
                            </Text>
                        </Text>
                    </View>
                    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "web" ? undefined : "padding"} keyboardVerticalOffset={80} >
                        <View style={{ marginTop: 5, marginBottom: 20 }}>
                            <EntradaMultilinea
                                label="Observación"
                                value={observacionNueva}
                                onChangeText={setObservacionNueva}
                            />
                        </View>
                    </KeyboardAvoidingView>
                </ScrollView>
            </Modal>
        );
    };

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={[styles.container, esPantallaPequeña && { maxWidth: "95%" }]}>
                <Text style={styles.titulo}>Reportes de Situación de Riesgo</Text>

                <View style={styles.controlesSuperiores}>
                    <View style={[{ flexDirection: "row", alignItems: "center", gap: 8 }, esPantallaPequeña && { width: "100%", marginBottom: 15 }]}>
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
                            { key: "boleta", titulo: "Boleta", ancho: 150 },
                            { key: "nombre_completo", titulo: "Alumno", ...(esPantallaPequeña && { ancho: 250 }) },
                            { key: "carrera", titulo: "Carrera", ...(esPantallaPequeña && { ancho: 250 }) },
                            { key: "generacion", titulo: "Generación", ancho: 150 },
                            {
                                key: "estatus",
                                titulo: "Estatus",
                                ancho: 150,
                                render: (valor) => (
                                    <Text
                                        style={[
                                            styles.texto,
                                            valor === "En revisión" && { color: Colores.textoInfo },
                                            valor === "Finalizado" && { color: Colores.textoExito },
                                            valor === "Pendiente" && { color: Colores.textoAdvertencia },
                                        ]}
                                    >
                                        {valor}
                                    </Text>
                                ),
                            },
                        ]}
                        datos={obtenerDatosFiltrados().map((fila) => ({
                            ...fila,
                            nombre_completo: `${fila.nombre} ${fila.apellidoPaterno} ${fila.apellidoMaterno}`,
                            onPress: () => abrirModalDetalle(fila),
                        }))}
                    />
                </ScrollView>

                <View style={{ marginTop: 15 }}>
                    <Paginacion
                        paginaActual={paginaActual}
                        totalPaginas={totalPaginas}
                        setPaginaActual={setPaginaActual}
                    />
                </View>
            </View>
            {renderModalDetalle()}
            {renderModalObservaciones()}
            {renderModalAgregarObservacion()}
        </ScrollView>
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
