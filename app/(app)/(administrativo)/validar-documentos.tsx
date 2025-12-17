import ModalAPI, { ModalAPIRef } from "@/componentes/layout/ModalAPI";
import PiePagina from "@/componentes/layout/PiePagina";
import Boton from "@/componentes/ui/Boton";
import Entrada from "@/componentes/ui/Entrada";
import Paginacion from "@/componentes/ui/Paginacion";
import Selector from "@/componentes/ui/Selector";
import Tabla from "@/componentes/ui/Tabla";
import { useAuth } from "@/context/AuthProvider";
import { fetchData } from "@/servicios/api";
import { Colores, Fuentes } from "@/temas/colores";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

export default function ValidarDocumentos() {
    const { sesion, verificarToken } = useAuth();
    const router = useRouter();

    const [cargando, setCargando] = useState(false);

    const modalAPI = useRef<ModalAPIRef>(null);
    const [alumnos, setAlumnos] = useState<any[]>([]);

    // Estados modales
    const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<any | null>(null);

    // --- Estados para búsqueda, filtros y paginación ---
    const [busqueda, setBusqueda] = useState("");
    const [filtroCarrera, setFiltroCarrera] = useState("Todos");
    const [filtroEstatus, setFiltroEstatus] = useState("Todos");
    const [paginaActual, setPaginaActual] = useState(1);
    const [filasPorPagina, setFilasPorPagina] = useState(5);

    const { width } = useWindowDimensions();
    const esPantallaPequeña = width < 790;

    const obtenerAlumnos = async () => {
        verificarToken();

        try {
            setCargando(true);

            const response = await fetchData(`users/obtenerTodosAlumnos?tk=${sesion.token}`);
            if (response.error === 0) {
                setAlumnos(response.data.filter((alumno) => alumno.estatus.DESCRIPCION !== "Baja"));
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
        obtenerAlumnos();
    }, []);

    // --- Filtrado y paginación de los datos ---
    const alumnosFiltrados = alumnos.filter(alumno => (
        `${alumno.nombre} ${alumno.apellido_paterno} ${alumno.apellido_materno}`
            .toLowerCase()
            .includes(busqueda.toLowerCase()) ||
        alumno.boleta.toLowerCase().includes(busqueda.toLowerCase())
    ) &&
        (filtroEstatus === "Todos" || alumno.estatus.DESCRIPCION === filtroEstatus) &&
        (filtroCarrera === "Todos" || alumno.carrera.NOMBRE === "Médico Cirujano y " + filtroCarrera)
    );

    const totalPaginas = Math.ceil(alumnosFiltrados.length / filasPorPagina);
    const alumnosMostrados = alumnosFiltrados.slice(
        (paginaActual - 1) * filasPorPagina,
        paginaActual * filasPorPagina
    );

    return (
        <>
            {cargando && (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white", position: "absolute", top: 60, left: 0, right: 0, bottom: 0, zIndex: 100 }}>
                    <ActivityIndicator size="large" color="#5a0839" />
                </View>
            )}
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "web" ? undefined : "padding"} keyboardVerticalOffset={5} >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <View style={{ flex: 1 }}>
                        <View style={[styles.contenedorFormulario, esPantallaPequeña && { maxWidth: "95%" }]}>
                            <Text allowFontScaling={false} style={styles.titulo}>Validar documentos</Text>
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
                                    <Text allowFontScaling={false} style={{ color: Colores.textoClaro, fontSize: Fuentes.caption }}>por página</Text>
                                </View>

                                <View style={[esPantallaPequeña ? { width: "100%" } : { flexDirection: "row", gap: 8, justifyContent: "space-between", width: "50%" }]}>
                                    <View style={[esPantallaPequeña ? { width: "100%", marginBottom: 15 } : { width: "50%" }]}>
                                        <Entrada
                                            label="Buscar"
                                            value={busqueda}
                                            maxLength={45}
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
                                                    { label: "Baja", value: "Baja" },
                                                    { label: "Aspirante", value: "Aspirante" },
                                                    { label: "Candidato", value: "Candidato" },
                                                    { label: "En proceso", value: "En proceso" },
                                                    { label: "Concluido", value: "Concluido" },
                                                ]}
                                            />
                                        </View>
                                    </View>
                                </View>
                            </View>

                            <ScrollView horizontal={esPantallaPequeña}>
                                <Tabla
                                    columnas={[
                                        { key: "boleta", titulo: "Boleta", ancho: 150 },
                                        { key: "nombre_completo", titulo: "Nombre", ...(esPantallaPequeña && { ancho: 210 }) },
                                        { key: "carrera", titulo: "Carrera", ...(esPantallaPequeña && { ancho: 210 }) },
                                        { key: "generacion", titulo: "Generación", ancho: 150 },
                                        {
                                            key: "estatus",
                                            titulo: "Estatus",
                                            ancho: 110,
                                            render: (valor) => (
                                                <Text
                                                    style={[
                                                        styles.texto,
                                                        valor === "Baja" && { color: Colores.textoError },
                                                        valor === "Candidato" && { color: Colores.textoAdvertencia },
                                                        valor === "Aspirante" && { color: Colores.textoAdvertencia },
                                                        valor === "En proceso" && { color: Colores.textoInfo },
                                                        valor === "Concluido" && { color: Colores.textoExito },
                                                    ]}
                                                    allowFontScaling={false}
                                                >
                                                    {valor}
                                                </Text>
                                            ),
                                        },
                                        {
                                            key: "acciones",
                                            titulo: "Expediente",
                                            ancho: 110,
                                            render: (_, fila) => (
                                                <View style={{ flexDirection: "row", gap: 10, justifyContent: "center", margin: "auto" }}>
                                                    <Boton
                                                        onPress={() => {
                                                            router.push({
                                                                pathname: "/validar-documentos/[boleta]",
                                                                params: { boleta: fila.boleta },
                                                            });
                                                        }}
                                                        icon={<Ionicons name="eye-outline" size={18} color={Colores.onPrimario} style={{ padding: 5 }} />}
                                                        color={Colores.textoInfo}
                                                    />
                                                </View>
                                            ),
                                        },
                                    ]}
                                    datos={alumnosMostrados.map((fila) => ({
                                        ...fila,
                                        nombre_completo: `${fila.nombre || ""} ${fila.apellido_paterno || ""} ${fila.apellido_materno || ""}`,
                                        carrera: fila.carrera.NOMBRE,
                                        estatus: fila.estatus.DESCRIPCION,
                                        // onPress: () => { setAlumnoSeleccionado(fila); },
                                    }))}
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
                                    allowFontScaling={false}
                                >
                                    {`Mostrando ${alumnosMostrados.length} de ${alumnosFiltrados.length} resultados`}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <ModalAPI ref={modalAPI} />
                    <PiePagina />
                </ScrollView >
            </KeyboardAvoidingView>
        </>
    );
}

const styles = StyleSheet.create({
    contenedorFormulario: {
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
    controlesSuperiores: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
        flexWrap: "wrap",
    }
});
