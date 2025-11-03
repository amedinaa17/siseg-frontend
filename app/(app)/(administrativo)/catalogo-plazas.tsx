import Modal from "@/componentes/layout/Modal";
import ModalAPI, { ModalAPIRef } from "@/componentes/layout/ModalAPI";
import Boton from "@/componentes/ui/Boton";
import Entrada from "@/componentes/ui/Entrada";
import Paginacion from "@/componentes/ui/Paginacion";
import Selector from "@/componentes/ui/Selector";
import SelectorArchivo from "@/componentes/ui/SelectorArchivo";
import Tabla from "@/componentes/ui/Tabla";
import { useAuth } from "@/context/AuthProvider";
import { CARRERAS_PLAZA, plazaEsquema, type PlazaFormulario } from "@/lib/validacion";
import { fetchData, postData } from "@/servicios/api";
import { Colores, Fuentes } from "@/temas/colores";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useRef, useState, } from "react";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

export default function GestionPlazas() {
    const { sesion, verificarToken } = useAuth();

    const modalAPI = useRef<ModalAPIRef>(null);
    const [plazas, setPlazas] = useState<any[]>([]);

    // Estados modales
    const [plazaSeleccion, setPlazaSeleccion] = useState<any | null>(null);
    const [modalDetalle, setModalDetalle] = useState(false);
    const [modalAgregar, setModalAgregar] = useState(false);
    const [modalDarBaja, setModalDarBaja] = useState<any | null>(null);
    const [modalCargar, setModalCargar] = useState(false);
    const [archivoSeleccionado, setArchivoSeleccionado] = useState<any>();
    const [errorArchivo, setErrorArchivo] = useState<string>("");

    // --- Estados para búsqueda, filtros y paginación ---
    const [busqueda, setBusqueda] = useState("");
    const [filtroCarrera, setFiltroCarrera] = useState("Todos");
    const [filtroEstatus, setFiltroEstatus] = useState("Todos");
    const [paginaActual, setPaginaActual] = useState(1);
    const [filasPorPagina, setFilasPorPagina] = useState(5);

    const { width } = useWindowDimensions();
    const esPantallaPequeña = width < 790;

    const obtenerPlazas = async () => {
        verificarToken();

        try {
            const response = await fetchData(`plaza/obtenerPlazas?tk=${sesion.token}`);
            if (response.error === 0) {
                setPlazas(response.plazas ?? []);
            } else {
                modalAPI.current?.show(false, "Hubo un problema al obtener los datos del servidor. Inténtalo de nuevo más tarde.");
            }
        } catch (error) {
            modalAPI.current?.show(false, "Error al conectar con el servidor. Inténtalo de nuevo más tarde.");
        }
    };

    useEffect(() => {
        obtenerPlazas();
    }, []);

    const carreraLabel = (c: any) => {
        if (typeof c === "number") return c === 1 ? "Médico Cirujano y Homeópata" : c === 2 ? "Médico Cirujano y Partero" : String(c);
        const s = String(c || "").toLowerCase();
        if (s.includes("homeó") || s.includes("homeop")) return "Médico Cirujano y Homeópata";
        if (s.includes("parter")) return "Médico Cirujano y Partero";
        return String(c || "");
    };

    const plazasFiltradas = (plazas ?? []).filter(p => {
        const txt = `${p.sede} ${p.promocion} ${carreraLabel(p.carrera)}`.toLowerCase();
        const matchQ = !busqueda || txt.includes(busqueda.toLowerCase());
        const matchCarrera =
            filtroCarrera === "Todos" ||
            carreraLabel(p.carrera).toLowerCase().includes(filtroCarrera.toLowerCase());
        const matchEstatus =
            filtroEstatus === "Todos" ||
            String(p.estatus) === (filtroEstatus === "Baja" ? "0" : filtroEstatus === "Alta" ? "1" : filtroEstatus);
        return matchQ && matchCarrera && matchEstatus;
    });

    const totalPaginas = Math.max(1, Math.ceil(plazasFiltradas.length / filasPorPagina));
    const plazasMostradas = plazasFiltradas.slice(
        (paginaActual - 1) * filasPorPagina,
        paginaActual * filasPorPagina
    );

    const {
        control: controlAgregar,
        handleSubmit: handleSubmitAgregar,
        reset: resetAgregar,
        formState: { errors: errorsAgregar, isSubmitting: isSubmittingAgregar },
    } = useForm<PlazaFormulario>({
        resolver: zodResolver(plazaEsquema),
        defaultValues: {
            carrera: "Médico Cirujano y Homeópata",
            promocion: "",
            programa: "",
            sede: "",
            estatus: 1,
            beca: "",
            tarjeta: 1,
            ubicacion: "",
        },
    });

    const carreraToId = (c: PlazaFormulario["carrera"]) =>
        c === "Médico Cirujano y Homeópata" ? 1 : 2;

    const onSubmitAgregar = async (data: PlazaFormulario) => {
        verificarToken();

        try {
            const payload = {
                ...data,
                carrera: carreraToId(data.carrera), 
                tk: sesion.token,
            };

            const response = await postData("plaza/agregarPlaza", payload);

            if (response.error === 0) {
                resetAgregar();
                setModalAgregar(false);
                obtenerPlazas();
                modalAPI.current?.show(true, "La plaza se ha registrado correctamente.");
            } else {
                modalAPI.current?.show(false, response.message || "Hubo un problema al registrar la plaza.");
            }
        } catch {
            modalAPI.current?.show(false, "Error al conectar con el servidor. Inténtalo de nuevo más tarde.");
        }
    };

    const {
        handleSubmit: handleSubmitDarBaja,
        formState: { isSubmitting: isSubmittingDarBaja } } = useForm<any>();

    const eliminarPlaza = async (ID: String) => {
        verificarToken();

        try {
            const response = await postData("plaza/eliminarPlaza", {
                idPlaza: ID,
                tk: sesion.token,
            });
            setModalDarBaja(false);

            if (response.error === 0) {
                modalAPI.current?.show(true, "La plaza se ha eliminado de forma correctamente.");
                obtenerPlazas();
            } else {
                modalAPI.current?.show(false, "Hubo un problema al eliminar la plaza. Inténtalo de nuevo más tarde.");
            }
        } catch (error) {
            setModalDarBaja(false);
            modalAPI.current?.show(false, "Error al conectar con el servidor. Inténtalo de nuevo más tarde.");
        }
    };

    const {
        handleSubmit: handleSubmitCargar,
        formState: { isSubmitting: isSubmittingCargar } } = useForm<any>();

    const subirArchivo = async (formData: FormData) => {
        verificarToken();

        try {
            const response = await postData(
                `users/cargarAlumnos?tk=${sesion?.token}&nombre=excel`,
                formData
            );

            if (response.error === 0) {
                setModalCargar(false);
                setArchivoSeleccionado(null);
                obtenerPlazas();

                const totalErrores = response.errores.length;
                const totalCorrectos = response.totalAlumnos - totalErrores - 1;
                const resumen =
                    `${totalCorrectos} alumno(s) se han registrado correctamente.\n` +
                    `${totalErrores} errores encontrados.\n\nDetalles:\n` +
                    (totalErrores > 0
                        ? response.errores
                            .map((e, i) => {
                                const match = e.error.match(/(\d+)$/);
                                const boleta = match ? match[1] : "Desconocido";

                                const mensaje = e.error.includes("ya está registrada")
                                    ? "Boleta duplicada"
                                    : e.error.includes("inválida")
                                        ? "Matrícula inválida"
                                        : e.error;

                                return `${i + 1}. [${boleta}] ${mensaje}.`;
                            })
                            .join('\n')
                        : ""
                    );
                modalAPI.current?.show(true, resumen);
            } else {
                modalAPI.current?.show(false, "Hubo un problema al subir el archivo. Verifica el formato e inténtalo de nuevo.");
            }
        } catch (error) {
            modalAPI.current?.show(false, "Error al conectar con el servidor. Inténtalo de nuevo más tarde.");
        }
    };

    const handleSubirArchivo = () => {
        if (!archivoSeleccionado) {
            setErrorArchivo("Selecciona un archivo para cargar.");
            return;
        } else if ((archivoSeleccionado.get("file").size / (1024 * 1024)) > 2) {
            return;
        }

        setErrorArchivo("");
        handleSubmitCargar(() => subirArchivo(archivoSeleccionado))();
    };

    const estatusLabel = (e: any) =>
        typeof e === "object"
            ? e?.DESCRIPCION ?? ""
            : Number(e) === 1
                ? "ALTA"
                : Number(e) === 0
                    ? "BAJA"
                    : String(e ?? "");

    const safeStr = (v: any) => (v === null || v === undefined ? "" : String(v));

    const renderModalDetalle = () => {
        if (!plazaSeleccion) return null;

        const { carrera, promocion, PROGRAMA, sede, estatus, tarjetaDisponible, ubicacion, tipoBeca } = plazaSeleccion;
        const carreraTxt = typeof carreraLabel === "function" ? carreraLabel(carrera) : safeStr(carrera);
        const estatusTxt = estatusLabel(estatus);

        return (
            <Modal
                visible={modalDetalle}
                onClose={() => { setPlazaSeleccion(null); setModalDetalle(false); }}
                titulo="Datos de la plaza"
                maxWidth={750}
            >
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "web" ? undefined : "padding"}
                    keyboardVerticalOffset={80}
                >

                    <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                        <View style={{ flex: 1, marginBottom: 15, pointerEvents: "none" }}>
                            <Entrada label="Carrera" value={safeStr(carreraTxt)} editable={false} />
                        </View>
                        <View style={{ flex: 1, marginBottom: 15, pointerEvents: "none" }}>
                            <Entrada label="Promoción" value={safeStr(promocion)} editable={false} />
                        </View>
                    </View>

                    <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                        <View style={{ flex: 1, marginBottom: 15, pointerEvents: "none" }}>
                            <Entrada label="Programa" value={safeStr(PROGRAMA)} editable={false} />
                        </View>
                        <View style={{ flex: 1, marginBottom: 15, pointerEvents: "none" }}>
                            <Entrada label="Número de tarjeta" value={safeStr(tarjetaDisponible)} editable={false} />
                        </View>
                    </View>

                    <View style={{ marginBottom: 15, pointerEvents: "none" }}>
                        <Entrada label="Sede" value={safeStr(sede)} editable={false} />
                    </View>

                    <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                        <View style={{ flex: 1, marginBottom: 15, pointerEvents: "none" }}>
                            <Entrada label="Estatus" value={estatusTxt} editable={false} />
                        </View>
                        <View style={{ flex: 1, marginBottom: 15, pointerEvents: "none" }}>
                            <Entrada label="Tipo de beca" value={safeStr(tipoBeca)} editable={false} />
                        </View>
                    </View>

                    <View style={{ marginBottom: 5, pointerEvents: "none" }}>
                        <Entrada label="Ubicación" value={safeStr(ubicacion)} editable={false} />
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        );
    };

    const renderModalAgregar = () => {
        return (
            <Modal
                visible={modalAgregar}
                onClose={() => { setModalAgregar(false); resetAgregar(); }}
                titulo="Agregar plaza"
                maxWidth={700}
                cancelar
                deshabilitado={isSubmittingAgregar}
                textoAceptar={isSubmittingAgregar ? "Agregando…" : "Agregar plaza"}
                onAceptar={handleSubmitAgregar(onSubmitAgregar)}
            >
                <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "web" ? undefined : "padding"} keyboardVerticalOffset={80}>

                    <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                        <View style={{ flex: 1, marginBottom: 15 }}>
                            <Controller
                                control={controlAgregar}
                                name="carrera"
                                render={({ field: { onChange, value } }) => (
                                    <Selector
                                        label="Carrera"
                                        selectedValue={value}
                                        onValueChange={onChange}
                                        items={CARRERAS_PLAZA.map(c => ({ label: c, value: c }))}
                                        error={errorsAgregar.carrera?.message}
                                    />
                                )}
                            />
                        </View>
                        <View style={{ flex: 1, marginBottom: 15 }}>
                            <Controller
                                control={controlAgregar}
                                name="promocion"
                                render={({ field }) => (
                                    <Entrada label="Promoción" {...field} error={errorsAgregar.promocion?.message} />
                                )}
                            />
                        </View>
                    </View>

                    <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                        <View style={{ flex: 1, marginBottom: 15 }}>
                            <Controller
                                control={controlAgregar}
                                name="programa"
                                render={({ field }) => (
                                    <Entrada label="Programa" {...field} error={errorsAgregar.programa?.message} />
                                )}
                            />
                        </View>
                        <View style={{ flex: 1, marginBottom: 15 }}>
                            <Controller
                                control={controlAgregar}
                                name="tarjeta"
                                render={({ field: { onChange, value } }) => (
                                    <Entrada
                                        label="Número de tarjeta"
                                        keyboardType="numeric"
                                        value={value === null ? "" : String(value ?? "")}
                                        onChangeText={(txt) => onChange(txt.replace(/[^\d]/g, ""))} 
                                        error={errorsAgregar.tarjeta?.message}
                                    />
                                )}
                            />

                        </View>
                    </View>

                    <View style={{ marginBottom: 15 }}>
                        <Controller
                            control={controlAgregar}
                            name="sede"
                            render={({ field }) => (
                                <Entrada label="Sede" {...field} error={errorsAgregar.sede?.message} />
                            )}
                        />
                    </View>

                    <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                        <View style={{ flex: 1, marginBottom: 15 }}>
                            <Controller
                                control={controlAgregar}
                                name="estatus"
                                render={({ field: { onChange, value } }) => (
                                    <Selector
                                        label="Estatus"
                                        selectedValue={String(value)}
                                        onValueChange={(v) => onChange(Number(v) as 0 | 1)}
                                        items={[
                                            { label: "Baja", value: "0" },
                                            { label: "Alta", value: "1" },
                                        ]}
                                        error={errorsAgregar.estatus?.message as string | undefined}
                                    />
                                )}
                            />
                        </View>
                        <View style={{ flex: 1, marginBottom: 15 }}>
                            <Controller
                                control={controlAgregar}
                                name="beca"
                                render={({ field }) => (
                                    <Entrada label="Tipo de beca" {...field} error={errorsAgregar.beca?.message} />
                                )}
                            />
                        </View>
                    </View>

                    {/* 5) Ubicación */}
                    <View style={{ marginBottom: 5 }}>
                        <Controller
                            control={controlAgregar}
                            name="ubicacion"
                            render={({ field }) => (
                                <Entrada label="Ubicación" {...field} error={errorsAgregar.ubicacion?.message} />
                            )}
                        />
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        );
    };

    const renderModalDarBaja = () => {
        if (!modalDarBaja) return null;

        return (
            <Modal visible={modalDarBaja} onClose={() => setModalDarBaja(false)} titulo="Dar de Baja Alumno" maxWidth={500}
                cancelar deshabilitado={isSubmittingDarBaja}
                textoAceptar={isSubmittingDarBaja ? "Enviando…" : "Dar de baja"} onAceptar={() => { handleSubmitDarBaja(() => eliminarPlaza(modalDarBaja.ID))(); }}>
                <Text style={{ marginBottom: 20 }}>
                    ¿Estás seguro de que deseas eliminar la plaza {" "}
                    <Text style={{ fontWeight: "700" }}>{modalDarBaja.sede}</Text>?
                </Text>
            </Modal>
        );
    };

    const renderModalCargarAlumnos = () => {
        return (
            <Modal visible={modalCargar} titulo="Cargar Alumnos" maxWidth={600}
                onClose={() => { setModalCargar(false); setArchivoSeleccionado(null); }}
                textoAceptar={isSubmittingCargar ? "Cargando…" : "Cargar archivo"}
                cancelar onAceptar={handleSubirArchivo} deshabilitado={isSubmittingCargar}>
                <Text>
                    Para cargar alumnos al sistema, el archivo debe estar en formato Excel (.xls, .xlsx) y no puede exceder un tamaño de 2MB.
                </Text>
                <View style={{ marginTop: 20, marginBottom: 5 }}>
                    <SelectorArchivo
                        label="Archivo"
                        allowedTypes={[".xls", ".xlsx", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]}
                        onArchivoSeleccionado={(file) => {
                            setArchivoSeleccionado(file);
                            setErrorArchivo("");
                        }}
                        error={errorArchivo}
                    />
                </View>
            </Modal>
        );
    };

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={[styles.contenedorFormulario, esPantallaPequeña && { maxWidth: "95%" }]}>
                <Text style={styles.titulo}>Gestionar plazas</Text>
                <View style={{ marginBottom: 15, flexDirection: "row", gap: 10 }}>
                    <View>
                        <Boton title="Agregar plaza" onPress={() => { setModalAgregar(true) }} />
                    </View>
                    <View>
                        <Boton title="Cargar plazas" onPress={() => setModalCargar(true)} disabled />
                    </View>
                </View>

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

                    <View
                        style={[
                            esPantallaPequeña
                                ? { width: "100%" }
                                : {
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    gap: 8,
                                    width: "70%",
                                },
                        ]}
                    >
                        <View style={[esPantallaPequeña ? { width: "100%", marginBottom: 15 } : { flexGrow: 1, marginRight: 8 }]}>
                            <Entrada label="Buscar" value={busqueda} onChangeText={setBusqueda} />
                        </View>

                        <View style={esPantallaPequeña ? { width: "100%" } : { width: 260, marginRight: 0 }}>
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


                <ScrollView horizontal={esPantallaPequeña}>
                    <Tabla
                        columnas={[
                            { key: "carrera", titulo: "Carrera", ancho: 250 },
                            { key: "sede", titulo: "Sede", ...(esPantallaPequeña && { ancho: 250 }) },
                            { key: "promocion", titulo: "Promoción", ancho: 150 },
                            {
                                key: "acciones",
                                titulo: "Acciones",
                                ancho: 110,
                                render: (_: any, fila: any) => (
                                    <View style={{ flexDirection: "row", gap: 10, justifyContent: "center", marginVertical: "auto" }}>
                                        <Boton
                                            onPress={() => { setModalDarBaja(fila) }}
                                            icon={<Ionicons name="trash" size={18} color={Colores.onPrimario} style={{ padding: 5 }} />}
                                            color={Colores.textoError}
                                            disabled={Number(fila.estatus) === 0} 
                                        />
                                    </View>
                                ),
                            },
                        ]}
                        datos={plazasMostradas.map((p) => ({
                            ...p,
                            carrera: carreraLabel(p.carrera), 
                            onPress: () => { setPlazaSeleccion(p); setModalDetalle(true); },
                        }))}
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
            {renderModalDetalle()}
            {renderModalAgregar()}
            {renderModalDarBaja()}
            {renderModalCargarAlumnos()}
            <ModalAPI ref={modalAPI} />
        </ScrollView >
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
    }
});