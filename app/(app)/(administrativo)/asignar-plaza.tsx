import Modal from "@/componentes/layout/Modal";
import ModalAPI, { ModalAPIRef } from "@/componentes/layout/ModalAPI";
import Boton from "@/componentes/ui/Boton";
import Entrada from "@/componentes/ui/Entrada";
import Paginacion from "@/componentes/ui/Paginacion";
import Selector from "@/componentes/ui/Selector";
import Tabla from "@/componentes/ui/Tabla";
import { useAuth } from "@/context/AuthProvider";
import { fetchData, postData } from "@/servicios/api";
import { Colores, Fuentes } from "@/temas/colores";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

export default function AsignarPlaza() {
    const { sesion, verificarToken } = useAuth();
    const modalAPI = useRef<ModalAPIRef>(null);
    const [alumnos, setAlumnos] = useState<any[]>([]);
    const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<any | null>(null);
    const [modalEditar, setModalEditar] = useState(false);
    const [plazas, setPlazas] = useState<any[]>([]);
    const [programaSeleccionado, setProgramaSeleccionado] = useState<string>("");
    const [plazaSeleccionadaId, setPlazaSeleccionadaId] = useState<string>("");
    const [plazaSeleccionadaLabel, setPlazaSeleccionadaLabel] = useState<string>("");
    const [isSubmittingAsignar, setIsSubmittingAsignar] = useState(false);
    const [busqueda, setBusqueda] = useState("");
    const [filtroCarrera, setFiltroCarrera] = useState("Todos");
    const [paginaActual, setPaginaActual] = useState(1);
    const [filasPorPagina, setFilasPorPagina] = useState(5);
    const { width } = useWindowDimensions();
    const esPantallaPequeña = width < 790;

    const getPlazaId = (p: any) => String(p.ID);
    const getPlazaSede = (p: any) => String(p.sede);
    const getPlazaPrograma = (p: any) => String(p.PROGRAMA);
    const getPlazaTarjeta = (p: any) => String(p.tarjetaDisponible ?? "");

    const usedPlazaIds = useMemo(() => {
        const s = new Set<string>();
        for (const a of alumnos) {
            if (a?.sede) s.add(String(a.sede));
        }
        return s;
    }, [alumnos]);

    const programasOpts = useMemo(() => {
        const uniques = new Map<string, string>();
        for (const p of plazas) {
            const prog = getPlazaPrograma(p);
            if (prog) uniques.set(prog, prog);
        }
        return Array.from(uniques.values()).map((prog) => ({ label: prog, value: prog }));
    }, [plazas]);

    const plazasDisponibles = useMemo(() => {
        return plazas.filter((p) => {
            const id = getPlazaId(p);
            if (!id || usedPlazaIds.has(id)) return false; 
            if (programaSeleccionado) return getPlazaPrograma(p) === programaSeleccionado;
            return true;
        });
    }, [plazas, usedPlazaIds, programaSeleccionado]);

    const plazaOptions = useMemo(
        () =>
            plazasDisponibles.map((p) => ({
                value: getPlazaId(p),
                label: getPlazaSede(p),
            })),
        [plazasDisponibles]
    );

    const labelToId = useMemo(() => {
        const m = new Map<string, string>();
        plazaOptions.forEach((o) => m.set(o.label, o.value));
        return m;
    }, [plazaOptions]);

    const plazaSeleccionada = useMemo(() => {
        const id = Platform.OS === "web"
            ? plazaSeleccionadaId
            : (plazaSeleccionadaId || (plazaSeleccionadaLabel ? labelToId.get(plazaSeleccionadaLabel) || "" : ""));
        return plazas.find((p) => getPlazaId(p) === id);
    }, [plazas, plazaSeleccionadaId, plazaSeleccionadaLabel, labelToId]);

    const obtenerAlumnos = async () => {
        verificarToken();
        try {
            const response = await fetchData(`users/obtenerTodosAlumnos?tk=${sesion.token}`);
            if (response.error === 0) setAlumnos(response.data);
            else modalAPI.current?.show(false, "Hubo un problema al obtener los datos del servidor.");
        } catch {
            modalAPI.current?.show(false, "Error al conectar con el servidor.");
        }
    };

    const obtenerPlazas = async () => {
        verificarToken();
        try {
            const response = await fetchData(`plaza/obtenerPlazas?tk=${sesion.token}`);
            if (response.error === 0) setPlazas(response.plazas ?? response.data ?? []);
            else modalAPI.current?.show(false, "Hubo un problema al obtener las plazas.");
        } catch {
            modalAPI.current?.show(false, "Error al conectar con el servidor.");
        }
    };

    useEffect(() => {
        obtenerAlumnos();
        obtenerPlazas();
    }, []);

    const alumnosFiltrados = alumnos
        .filter(
            (alumno) =>
                `${alumno.nombre} ${alumno.apellido_paterno} ${alumno.apellido_materno}`
                    .toLowerCase()
                    .includes(busqueda.toLowerCase()) ||
                alumno.boleta.toLowerCase().includes(busqueda.toLowerCase())
        )
        .filter(
            (alumno) =>
                filtroCarrera === "Todos" ||
                alumno.carrera.NOMBRE === "Médico Cirujano y " + filtroCarrera
        );

    const totalPaginas = Math.ceil(alumnosFiltrados.length / filasPorPagina);

    const alumnosMostrados = alumnosFiltrados.slice(
        (paginaActual - 1) * filasPorPagina,
        paginaActual * filasPorPagina
    );

    const datosTabla = alumnosMostrados.map((fila) => {
        const asignado = !!Number(fila.sede);
        const plazaObj = plazas.find((p) => getPlazaId(p) === String(fila.sede));
        const sedeNombre = asignado ? (plazaObj ? getPlazaSede(plazaObj) : String(fila.sede)) : "";
        return {
            ...fila,
            nombre_completo: `${fila.nombre} ${fila.apellido_paterno} ${fila.apellido_materno}`,
            carrera: fila.carrera?.NOMBRE ?? "",
            sedeNombre,
            estatusAsignacion: asignado ? "Asignado" : "Sin asignar",
        };
    });

    const asignarPlaza = async () => {
        if (!alumnoSeleccionado) return;

        const idReal =
            Platform.OS === "web"
                ? plazaSeleccionadaId
                : (plazaSeleccionadaId ||
                    (plazaSeleccionadaLabel ? labelToId.get(plazaSeleccionadaLabel) || "" : ""));

        if (!idReal) {
            return modalAPI.current?.show(false, "Selecciona una plaza.");
        }

        try {
            setIsSubmittingAsignar(true);
            const payload = {
                idPlaza: idReal,
                idUsuario: alumnoSeleccionado.boleta,
                tk: sesion.token,
            };
            const resp = await postData(`plaza/asignarPlaza`, payload);
            if (resp.error === 0) {
                modalAPI.current?.show(true, "Plaza asignada correctamente.");
                setModalEditar(false);
                setProgramaSeleccionado("");
                setPlazaSeleccionadaId("");
                setPlazaSeleccionadaLabel(""); 
                await obtenerAlumnos();
            } else {
                modalAPI.current?.show(false, resp.message || "No se pudo asignar la plaza.");
            }
        } catch {
            modalAPI.current?.show(false, "Error al conectar con el servidor.");
        } finally {
            setIsSubmittingAsignar(false);
        }
    };
    const sedeSel = plazaSeleccionada ? getPlazaSede(plazaSeleccionada) : "";

    const abrirModalEditar = async (fila: any) => {
        setAlumnoSeleccionado(fila);
        setProgramaSeleccionado("");
        setPlazaSeleccionadaId("");
        setPlazaSeleccionadaLabel("");
        await obtenerPlazas();
        setModalEditar(true);
    };

    const renderModalEditar = () => {
        if (!alumnoSeleccionado) return null;

        const tarjetaSel = plazaSeleccionada ? getPlazaTarjeta(plazaSeleccionada) : "";
        const ModalBody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
            Platform.OS === "web" ? (
                <View style={{ maxHeight: 520, overflow: "auto" as any }}>{children}</View>
            ) : (
                <ScrollView style={{ maxHeight: 520 }}>{children}</ScrollView>
            )
        );

        return (
            <Modal
                visible={modalEditar}
                onClose={() => setModalEditar(false)}
                titulo={`Asignar plaza a ${alumnoSeleccionado.nombre} ${alumnoSeleccionado.apellido_materno} ${alumnoSeleccionado.apellido_paterno}`}
                maxWidth={700}
                cancelar
                textoAceptar="Asignar"
                onAceptar={asignarPlaza}
                deshabilitarAceptar={isSubmittingAsignar || (!plazaSeleccionadaId && !plazaSeleccionadaLabel)}
            >
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "web" ? undefined : "padding"}
                    keyboardVerticalOffset={80}
                >
                    <ModalBody>
                        <View style={{ marginBottom: 10, pointerEvents: "none" }}>
                            <Entrada label="Boleta" value={`${alumnoSeleccionado.boleta}`} editable={false} />
                        </View>

                        {Platform.OS === "web" ? (
                            <View style={{ marginTop: 5, marginBottom: 12 }}>
                                <Text style={{ marginBottom: 6, color: Colores.textoClaro }}>Programa</Text>
                                <select
                                    value={programaSeleccionado}
                                    onChange={(e) => {
                                        setProgramaSeleccionado(e.target.value);
                                        setPlazaSeleccionadaId("");
                                        setPlazaSeleccionadaLabel("");
                                    }}
                                    style={{
                                        width: "100%",
                                        padding: 10,
                                        borderRadius: 8,
                                        border: `1px solid ${Colores.borde}`,
                                    }}
                                >
                                    <option value="" disabled>Selecciona un programa…</option>
                                    {programasOpts.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </View>
                        ) : (
                            <View style={{ marginTop: 5, marginBottom: 12 }}>
                                <Selector
                                    label="Programa"
                                    items={[{ label: "Selecciona un programa…", value: "" }, ...programasOpts]}
                                    selectedValue={programaSeleccionado}
                                    onValueChange={(v) => {
                                        setProgramaSeleccionado(v as string);
                                        setPlazaSeleccionadaId("");
                                        setPlazaSeleccionadaLabel("");
                                    }}
                                />
                            </View>
                        )}

                        {Platform.OS === "web" ? (
                            <View style={{ marginTop: 5, marginBottom: 12 }}>
                                <Text style={{ marginBottom: 6, color: Colores.textoClaro }}>Plaza</Text>
                                <select
                                    value={plazaSeleccionadaId}
                                    onChange={(e) => setPlazaSeleccionadaId(e.target.value)}
                                    disabled={!programaSeleccionado}
                                    style={{
                                        width: "100%",
                                        padding: 10,
                                        borderRadius: 8,
                                        border: `1px solid ${Colores.borde}`,
                                        ...(programaSeleccionado ? {} : { backgroundColor: "#f3f4f6" }),
                                    }}
                                >
                                    <option value="" disabled>Selecciona una plaza…</option>
                                    {plazaOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </View>
                        ) : (
                            <View style={{ marginTop: 5, marginBottom: 12, ...(programaSeleccionado ? {} : { opacity: 0.5, pointerEvents: "none" as const }) }}>
                                <Selector
                                    label="Plaza"
                                    items={[{ label: "Selecciona una plaza…", value: "" }, ...plazaOptions.map(o => ({ label: o.label, value: o.label }))]}
                                    selectedValue={plazaSeleccionadaLabel}
                                    onValueChange={(lbl) => {
                                        const label = String(lbl || "");
                                        setPlazaSeleccionadaLabel(label);
                                        setPlazaSeleccionadaId(label ? (labelToId.get(label) || "") : "");
                                    }}
                                />
                            </View>
                        )}

                        <View style={{ marginTop: 2, marginBottom: 10 }}>
                            <Text style={{ marginBottom: 6, color: Colores.textoClaro }}>Sede seleccionada</Text>
                            <View
                                style={{
                                    borderWidth: 1,
                                    borderColor: Colores.borde,
                                    borderRadius: 8,
                                    padding: 12,
                                    backgroundColor: Colores.fondo,
                                }}
                            >
                                <Text
                                    style={[
                                        { fontSize: Fuentes.cuerpoPrincipal, color: Colores.textoPrincipal },
                                        Platform.OS === "web"
                                            ? ({ whiteSpace: "pre-wrap", wordBreak: "break-word" } as any)
                                            : {},
                                    ]}
                                    numberOfLines={0}
                                >
                                    {sedeSel || "—"}
                                </Text>
                            </View>
                        </View>

                        <View style={{ marginTop: 2, marginBottom: 10, pointerEvents: "none" }}>
                            <Entrada label="Número de tarjeta" value={tarjetaSel} editable={false} />
                        </View>
                    </ModalBody>
                </KeyboardAvoidingView>
            </Modal>
        );
    };

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={[styles.contenedorFormulario, esPantallaPequeña && { maxWidth: "95%" }]}>
                <Text style={styles.titulo}>Asignar plaza</Text>

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

                    <View style={[esPantallaPequeña ? { width: "100%" } : { flexDirection: "row", gap: 8, justifyContent: "space-between", width: "70%" }]}>
                        <View style={[esPantallaPequeña ? { width: "100%", marginBottom: 15 } : { width: "50%" }]}>
                            <Entrada label="Buscar" value={busqueda} onChangeText={setBusqueda} />
                        </View>

                        <View style={{ flexDirection: "row", gap: 8, width: "100%" }}>
                            <View style={[esPantallaPequeña ? { width: "50%" } : { width: "50%" }]}>
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
                        </View>
                    </View>
                </View>

                <ScrollView horizontal={esPantallaPequeña}>
                    <Tabla
                        columnas={[
                            { key: "boleta", titulo: "Boleta", ancho: 130 },
                            { key: "nombre_completo", titulo: "Nombre", ancho: esPantallaPequeña ? 250 : 400 },
                            { key: "carrera", titulo: "Carrera", ancho: esPantallaPequeña ? 200 : 230 },
                            { key: "sedeNombre", titulo: "Sede", ...(esPantallaPequeña && { ancho: 200 }) },
                            {
                                key: "estatusAsignacion",
                                titulo: "Estatus",
                                ancho: 150,
                                render: (valor) => (
                                    <Text
                                        style={[
                                            styles.texto,
                                            valor === "Asignado" ? { color: Colores.textoExito } : { color: Colores.textoError },
                                        ]}
                                    >
                                        {valor}
                                    </Text>
                                ),
                            },
                            {
                                key: "acciones",
                                titulo: "Acciones",
                                ancho: 110,
                                render: (_valor, fila) => {
                                    const asignado = !!Number(fila.sede);
                                    return (
                                        <View style={{ flexDirection: "row", gap: 10, justifyContent: "center", marginVertical: "auto" }}>
                                            <Boton
                                                onPress={async () => {
                                                    await abrirModalEditar(fila);
                                                }}
                                                icon={<Ionicons name="pencil" size={18} color={Colores.onPrimario} style={{ padding: 5 }} />}
                                                color={Colores.textoInfo}
                                                disabled={asignado}
                                            />
                                        </View>
                                    );
                                },
                            },
                        ]}
                        datos={datosTabla}
                    />
                </ScrollView>

                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <View style={{ flexDirection: "row", marginVertical: 15, gap: 6 }}>
                        <Paginacion
                            paginaActual={paginaActual}
                            totalPaginas={totalPaginas}
                            setPaginaActual={setPaginaActual}
                        />
                    </View>
                </View>
            </View>

            {renderModalEditar()}
            <ModalAPI ref={modalAPI} />
        </ScrollView>
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
