import Modal from "@/componentes/layout/Modal";
import ModalAPI, { ModalAPIRef } from "@/componentes/layout/ModalAPI";
import PiePagina from "@/componentes/layout/PiePagina";
import Boton from "@/componentes/ui/Boton";
import Entrada from "@/componentes/ui/Entrada";
import Paginacion from "@/componentes/ui/Paginacion";
import Selector from "@/componentes/ui/Selector";
import Tabla from "@/componentes/ui/Tabla";
import { useAuth } from "@/context/AuthProvider";
import { asignarPlazaEsquema, AsignarPlazaFormulario } from "@/lib/validacion";
import { fetchData, postData } from "@/servicios/api";
import { Colores, Fuentes } from "@/temas/colores";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";

export default function AsignarPlaza() {
    const { sesion, verificarToken } = useAuth();
    const router = useRouter();

    const [cargando, setCargando] = useState(false);

    const modalAPI = useRef<ModalAPIRef>(null);
    const [alumnos, setAlumnos] = useState<any[]>([]);
    const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<any | null>(null);
    const [plazas, setPlazas] = useState<any[]>([]);

    const [modalAsignar, setModalAsignar] = useState(false);
    const [plazaSeleccionada, setPlazaSeleccionada] = useState<any | null>(null);

    const { width } = useWindowDimensions();
    const esPantallaPequeña = width < 790;

    const [busqueda, setBusqueda] = useState("");
    const [filtroCarrera, setFiltroCarrera] = useState("Todos");
    const [filtroEstatus, setFiltroEstatus] = useState("Sin asignar");
    const [paginaActual, setPaginaActual] = useState(1);
    const [filasPorPagina, setFilasPorPagina] = useState(5);

    const obtenerAlumnos = async () => {
        verificarToken();

        try {
            setCargando(true);

            const response = await fetchData(`users/obtenerTodosAlumnos?tk=${sesion.token}`);
            if (response.error === 0) {
                setAlumnos(response.data);
            }
            else {
                modalAPI.current?.show(false, "Hubo un problema al obtener los datos del servidor. Inténtalo de nuevo más tarde.", () => { modalAPI.current?.close(); router.replace("/inicio-administrativo"); });
            }
        } catch {
            modalAPI.current?.show(false, "Error al conectar con el servidor. Inténtalo de nuevo más tarde.", () => { modalAPI.current?.close(); router.replace("/inicio-administrativo"); });
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        obtenerAlumnos();
    }, []);

    const obtenerPlazas = async () => {
        verificarToken();

        try {
            const response = await fetchData(`plaza/obtenerPlazas?tk=${sesion.token}`);
            if (response.error === 0) {
                setPlazas(response.plazas.filter((plaza) => plaza.estatus == 1 && plaza.tarjetaDisponible > 0));
            }
            else {
                modalAPI.current?.show(false, "Hubo un problema al obtener las plazas del servidor. Inténtalo de nuevo más tarde.", () => { modalAPI.current?.close(); router.replace("/inicio-administrativo"); });
            }
        } catch {
            modalAPI.current?.show(false, "Error al conectar con el servidor. Inténtalo de nuevo más tarde.", () => { modalAPI.current?.close(); router.replace("/inicio-administrativo"); });
        }
    };

    useEffect(() => {
        obtenerPlazas();
    }, []);

    const {
        control, watch, handleSubmit, reset, formState: { errors, isSubmitting },
    } = useForm<AsignarPlazaFormulario>({
        resolver: zodResolver(asignarPlazaEsquema),
        defaultValues: {
            programa: "",
            plaza: "",
        }
    });

    const programaValue = watch("programa");

    const asignarPlaza = async () => {
        verificarToken();

        try {
            const payload = {
                idPlaza: plazaSeleccionada.ID,
                idUsuario: alumnoSeleccionado.boleta,
                tk: sesion.token,
            };
            const resp = await postData(`plaza/asignarPlaza`, payload);
            if (resp.error === 0) {
                modalAPI.current?.show(true, "La plaza ha sido asignada correctamente.");
                cerrarModalAsignar();
                await obtenerAlumnos();
            } else if (resp.message.includes("No hay tarjeta")) {
                modalAPI.current?.show(false, "La plaza seleccionada ya no tiene tarjetas disponibles.");
            } else {
                modalAPI.current?.show(false, "Hubo un problema al asignar la plaza. Inténtalo de nuevo más tarde.");
            }
        } catch {
            modalAPI.current?.show(false, "Error al conectar con el servidor. Inténtalo de nuevo más tarde.");
        }
    };

    const programasOpts = React.useMemo(() => {
        if (alumnoSeleccionado && plazas) {
            return plazas
                .filter((plaza) => plaza.carrera === (alumnoSeleccionado.carrera === "Médico Cirujano y Homeópata" ? 1 : 2))
                .map((plaza) => ({ label: plaza.PROGRAMA, value: plaza.PROGRAMA }))
                .filter((value, index, self) => self.findIndex(t => t.value === value.value) === index);
        }
        return [];
    }, [alumnoSeleccionado, plazas]);

    const plazasDisponibles = React.useMemo(() => {
        if (programaValue && alumnoSeleccionado && plazas && plazas.length > 0) {
            return plazas
                .filter((plaza) => plaza.PROGRAMA === programaValue && plaza.carrera === (alumnoSeleccionado.carrera === "Médico Cirujano y Homeópata" ? 1 : 2))
                .map((plaza) => ({
                    value: plaza.ID,
                    label: plaza.sede
                }));
        }
        return [];
    }, [programaValue, alumnoSeleccionado, plazas]);

    const alumnosFiltrados = alumnos.filter(alumno => (
        `${alumno.nombre} ${alumno.apellido_paterno} ${alumno.apellido_materno}`
            .toLowerCase()
            .includes(busqueda.toLowerCase()) ||
        alumno.boleta.toLowerCase().includes(busqueda.toLowerCase())
    ) &&
        (filtroEstatus === "Todos" || (alumno.sede ? "Asignado" : "Sin asignar") === filtroEstatus) &&
        (filtroCarrera === "Todos" || alumno.carrera.NOMBRE === "Médico Cirujano y " + filtroCarrera)
    );

    const totalPaginas = Math.ceil(alumnosFiltrados.length / filasPorPagina);
    const alumnosMostrados = alumnosFiltrados.slice(
        (paginaActual - 1) * filasPorPagina,
        paginaActual * filasPorPagina
    );

    const abrirModalAsignar = (fila: any) => {
        setAlumnoSeleccionado(fila);
        setPlazaSeleccionada(null);
        setModalAsignar(true);
        reset({ programa: "", plaza: "" });
    };

    const cerrarModalAsignar = () => {
        setAlumnoSeleccionado(null);
        setPlazaSeleccionada(null);
        setModalAsignar(false);
        reset({ programa: "", plaza: "" });
    };

    const renderModalAsignar = () => {
        if (!alumnoSeleccionado) return null;

        return (
            <Modal
                visible={modalAsignar}
                onClose={() => cerrarModalAsignar()}
                titulo={`Asignar plaza`}
                maxWidth={700}
                cancelar
                textoAceptar={isSubmitting ? "Asignando…" : "Asignar plaza"}
                onAceptar={handleSubmit(asignarPlaza)}
                deshabilitado={isSubmitting}
            >
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "web" ? undefined : "padding"}
                    keyboardVerticalOffset={5}
                >
                    <View style={{ marginBottom: 20 }}>
                        <Entrada label="Nombre" value={`${alumnoSeleccionado?.nombre + " " + alumnoSeleccionado?.apellido_materno + " " + alumnoSeleccionado?.apellido_paterno}` || " "} keyboardType="numeric" maxLength={10} editable={false} />
                    </View>

                    <View style={{ marginBottom: 20 }}>
                        <Entrada label="Boleta" value={`${alumnoSeleccionado?.boleta || ""}`} keyboardType="numeric" maxLength={10} editable={false} />
                    </View>

                    <View style={{ marginBottom: errors.programa ? 5 : 20 }}>
                        <Controller
                            control={control}
                            name="programa"
                            render={({ field: { onChange, value } }) => (
                                <Selector
                                    label="Programa"
                                    items={programasOpts}
                                    selectedValue={value}
                                    onValueChange={(val) => {
                                        onChange(val)
                                        setPlazaSeleccionada(null);
                                        reset({ programa: val, plaza: "" });
                                    }}
                                    error={errors.programa?.message}
                                />
                            )}
                        />
                    </View>
                    {
                        !!programaValue && (
                            <View style={{ marginBottom: errors.plaza ? 5 : 20 }}>
                                <Controller
                                    control={control}
                                    name="plaza"
                                    render={({ field: { onChange, value } }) => (
                                        <Selector
                                            label="Plaza"
                                            items={plazasDisponibles}
                                            selectedValue={plazaSeleccionada?.sede ?? ""}
                                            onValueChange={(val) => {
                                                onChange(String(val));
                                                setPlazaSeleccionada(
                                                    plazas.find(p => String(p.ID) === String(val))
                                                );
                                            }}
                                            error={errors.plaza?.message}
                                        />
                                    )}
                                />
                            </View>
                        )
                    }
                    {
                        plazaSeleccionada && (
                            <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                                <View style={[!esPantallaPequeña && { flex: 1 }, { marginBottom: plazaSeleccionada.tarjetaDisponible ? 5 : 20 }]}>
                                    <Entrada label="Tarjeta" value={String(plazaSeleccionada?.tarjetaDisponible) || ""} editable={false} />
                                </View>
                                <View style={[!esPantallaPequeña && { flex: 1 }, { marginBottom: plazaSeleccionada.tipoBeca ? 5 : 20 }]}>
                                    <Entrada label="Beca" value={plazaSeleccionada?.tipoBeca || ""} editable={false} />
                                </View>
                            </View>
                        )
                    }
                </KeyboardAvoidingView>
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
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "web" ? undefined : "padding"} keyboardVerticalOffset={5} >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <View style={{ flex: 1 }}>
                        <View style={[styles.contenedorFormulario, esPantallaPequeña && { maxWidth: "95%" }]}>
                            <Text allowFontScaling={false} style={styles.titulo}>Asignar plaza</Text>

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

                                <View style={[esPantallaPequeña ? { width: "100%" } : { flexDirection: "row", gap: 8, justifyContent: "space-between", width: "70%" }]}>
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
                                                    { label: "Asignado", value: "Asignado" },
                                                    { label: "Sin asignar", value: "Sin asignar" },
                                                ]}
                                            />
                                        </View>
                                    </View>
                                </View>
                            </View>

                            <ScrollView horizontal={esPantallaPequeña}>
                                <Tabla
                                    columnas={[
                                        { key: "boleta", titulo: "Boleta", ancho: 120 },
                                        { key: "nombre_completo", titulo: "Nombre", ...(esPantallaPequeña && { ancho: 200 }) },
                                        { key: "carrera", titulo: "Carrera", ...(esPantallaPequeña && { ancho: 130 }) },
                                        { key: "sede", titulo: "Sede", ...(esPantallaPequeña && { ancho: 130 }) },
                                        {
                                            key: "estatusAsignacion",
                                            titulo: "Estatus",
                                            ancho: 110,
                                            render: (valor) => (
                                                <Text
                                                    style={[
                                                        styles.texto,
                                                        valor === "Asignado" ? { color: Colores.textoExito } : { color: Colores.textoError },
                                                    ]}
                                                    allowFontScaling={false}
                                                >
                                                    {valor}
                                                </Text>
                                            ),
                                        },
                                        {
                                            key: "acciones",
                                            titulo: "Acciones",
                                            ancho: 100,
                                            render: (_valor, fila) => {
                                                const asignado = !!Number(fila.sede);
                                                return (
                                                    <View style={{ flexDirection: "row", gap: 10, justifyContent: "center", marginVertical: "auto" }}>
                                                        <Boton
                                                            onPress={async () => {
                                                                await abrirModalAsignar(fila);
                                                            }}
                                                            icon={<Ionicons name="add-outline" size={18} color={Colores.onPrimario} style={{ padding: 5 }} />}
                                                            color={Colores.textoInfo}
                                                            disabled={asignado}
                                                        />
                                                    </View>
                                                );
                                            },
                                        },
                                    ]}
                                    datos={alumnosMostrados.map(fila => ({
                                        ...fila,
                                        nombre_completo: `${fila.nombre || ""} ${fila.apellido_paterno || ""} ${fila.apellido_materno || ""}`,
                                        carrera: fila.carrera?.NOMBRE ?? "",
                                        sede: plazas?.find((p) => p.ID === fila.sede)?.sede || "-",
                                        estatusAsignacion: fila.sede ? "Asignado" : "Sin asignar"

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
                    {renderModalAsignar()}
                    <ModalAPI ref={modalAPI} />
                    <PiePagina />
                </ScrollView>
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
    controlesSuperiores: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
        flexWrap: "wrap",
    },
});
