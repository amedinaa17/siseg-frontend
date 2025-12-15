import Modal from "@/componentes/layout/Modal";
import ModalAPI, { ModalAPIRef } from "@/componentes/layout/ModalAPI";
import PiePagina from "@/componentes/layout/PiePagina";
import Boton from "@/componentes/ui/Boton";
import Entrada from "@/componentes/ui/Entrada";
import Paginacion from "@/componentes/ui/Paginacion";
import Selector from "@/componentes/ui/Selector";
import Tabla from "@/componentes/ui/Tabla";
import { useAuth } from "@/context/AuthProvider";
import { plazaEditarEsquema, plazaEsquema, type PlazaEditarFormulario, type PlazaFormulario } from "@/lib/validacion";
import { fetchData, postData } from "@/servicios/api";
import { Colores, Fuentes } from "@/temas/colores";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState, } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

export default function GestionPlazas() {
    const { sesion, verificarToken } = useAuth();
    const router = useRouter();

    const [cargando, setCargando] = useState(false);

    const modalAPI = useRef<ModalAPIRef>(null);
    const [plazas, setPlazas] = useState<any[]>([]);

    // Estados modales
    const [plazaSeleccion, setPlazaSeleccion] = useState<any | null>(null);
    const [modalDetalle, setModalDetalle] = useState(false);
    const [modalAgregar, setModalAgregar] = useState(false);
    const [modalDarBaja, setModalDarBaja] = useState<any | null>(null);
    const [modalEditar, setModalEditar] = useState(false);

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
            setCargando(true);

            const response = await fetchData(`plaza/obtenerPlazas?tk=${sesion.token}`);
            if (response.error === 0) {
                setPlazas(response.plazas ?? []);
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
        obtenerPlazas();
    }, []);

    const plazasFiltradas = plazas.filter(plaza => (
        plaza.sede.toLowerCase().includes(busqueda.toLowerCase()) ||
        plaza.promocion.toLowerCase().includes(busqueda.toLowerCase())
    ) &&
        (filtroEstatus === "Todos" || plaza.estatus === (filtroEstatus === "Baja" ? 0 : 1)) &&
        (filtroCarrera === "Todos" || plaza.carrera === (filtroCarrera === "Partero" ? 2 : 1))
    );

    const totalPaginas = Math.max(1, Math.ceil(plazasFiltradas.length / filasPorPagina));
    const plazasMostradas = plazasFiltradas.slice(
        (paginaActual - 1) * filasPorPagina,
        paginaActual * filasPorPagina
    );

    const {
        control: controlAgregar,
        handleSubmit: handleSubmitAgregar,
        reset: resetAgregar,
        formState: { errors: errorsAgregar, isSubmitting: isSubmittingAgregar } } = useForm<PlazaFormulario>({
            resolver: zodResolver(plazaEsquema),
        });

    const onSubmitAgregar = async (data: PlazaFormulario) => {
        verificarToken();

        try {
            const payload = {
                ...data,
                tarjeta: Number(data.tarjeta),
                carrera: data.carrera === "Médico Cirujano y Homeópata" ? 1 : 2,
                estatus: data.estatus === "Baja" ? 0 : 1,
                tk: sesion.token,
            };

            const response = await postData("plaza/agregarPlaza", payload);

            if (response.error === 0) {
                resetAgregar();
                setModalAgregar(false);
                obtenerPlazas();
                modalAPI.current?.show(true, "La plaza se ha registrado correctamente.");
            } else {
                setModalAgregar(false);
                modalAPI.current?.show(false, "Hubo un problema al registrar la plaza. Inténtalo de nuevo más tarde.", () => { modalAPI.current?.close(); setModalAgregar(true); });
            }
        } catch {
            setModalAgregar(false);
            modalAPI.current?.show(false, "Error al conectar con el servidor. Inténtalo de nuevo más tarde.", () => { modalAPI.current?.close(); setModalAgregar(true); });
        }
    };

    const {
        control: controlEditar,
        handleSubmit: handleSubmitEditar,
        reset: resetEditar,
        formState: { errors: errorsEditar, isSubmitting: isSubmittingEditar } } = useForm<PlazaEditarFormulario>({
            resolver: zodResolver(plazaEditarEsquema),
        });

    const onSubmitEditar = async (data: PlazaEditarFormulario) => {
        verificarToken();

        try {
            const payload = {
                idPlaza: plazaSeleccion.ID,
                ...data,
                tarjeta: Number(data.tarjeta),
                carrera: data.carrera === "Médico Cirujano y Homeópata" ? 1 : 2,
                tk: sesion.token,
            };

            const response = await postData("plaza/editarPlaza", payload);

            if (response.error === 0) {
                resetEditar();
                setModalEditar(false);
                setPlazaSeleccion(null);
                obtenerPlazas();
                modalAPI.current?.show(true, "Los datos de la plaza se han actualizado correctamente.");
            } else {
                setModalEditar(false);
                modalAPI.current?.show(false, "Hubo un problema al actualizar los datos de la plaza. Inténtalo de nuevo más tarde.", () => { modalAPI.current?.close(); setModalEditar(true); });
            }
        } catch (error) {
            setModalEditar(false);
            modalAPI.current?.show(false, "Error al conectar con el servidor. Inténtalo de nuevo más tarde.", () => { modalAPI.current?.close(); setModalEditar(true); });
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
                modalAPI.current?.show(true, "La plaza se ha dado de baja correctamente.");
                obtenerPlazas();
            } else {
                modalAPI.current?.show(false, "Hubo un problema al dar de baja la plaza. Inténtalo de nuevo más tarde.");
            }
        } catch (error) {
            setModalDarBaja(false);
            modalAPI.current?.show(false, "Error al conectar con el servidor. Inténtalo de nuevo más tarde.");
        }
    };

    const renderModalDetalle = () => {
        if (!plazaSeleccion) return null;

        const { carrera, promocion, PROGRAMA, sede, estatus, tarjetaDisponible, ubicacion, tipoBeca } = plazaSeleccion;

        return (
            <Modal
                visible={modalDetalle}
                onClose={() => { setPlazaSeleccion(null); setModalDetalle(false); }}
                titulo="Datos de la plaza"
                maxWidth={750}
            >
                <View style={{ marginTop: 5, marginBottom: 15 }}>
                    <Entrada label="Sede" value={sede || ""} editable={false} />
                </View>

                <View style={{ marginBottom: 15 }}>
                    <Entrada label="Ubicación" value={ubicacion || ""} editable={false} />
                </View>

                <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                    <View style={{ flex: 1, marginBottom: 15 }}>
                        <Entrada label="Programa" value={PROGRAMA || ""} editable={false} />
                    </View>
                    <View style={{ flex: 1, marginBottom: 15 }}>
                        <Entrada label="Tarjeta" value={tarjetaDisponible || ""} editable={false} />
                    </View>
                </View>

                <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                    <View style={{ flex: 1, marginBottom: 15 }}>
                        <Entrada label="Beca" value={tipoBeca || ""} editable={false} />
                    </View>
                    <View style={{ flex: 1, marginBottom: 15 }}>
                        <Entrada label="Estatus" value={estatus === 0 ? "Baja" : "Alta"} editable={false} />
                    </View>
                </View>

                <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                    <View style={{ flex: 1, marginBottom: 15 }}>
                        <Entrada label="Carrera" value={carrera === 1 ? "Médico Cirujano y Homeópata" : "Médico Cirujano y Partero"} editable={false} />
                    </View>
                    <View style={{ flex: 1, marginBottom: 15 }}>
                        <Entrada label="Promoción" value={promocion || ""} editable={false} />
                    </View>
                </View>

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
                <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "web" ? undefined : "padding"} keyboardVerticalOffset={5}>
                    <View style={{ marginBottom: 15 }}>
                        <Controller
                            control={controlAgregar}
                            name="sede"
                            defaultValue=""
                            render={({ field: { onChange, value } }) => (
                                <Entrada
                                    label="Sede"
                                    value={value}
                                    maxLength={100}
                                    onChangeText={onChange}
                                    error={errorsAgregar.sede?.message} />
                            )}
                        />
                    </View>

                    <View style={{ marginBottom: 15 }}>
                        <Controller
                            control={controlAgregar}
                            name="ubicacion"
                            defaultValue=""
                            render={({ field: { onChange, value } }) => (
                                <Entrada
                                    label="Ubicación"
                                    value={value}
                                    maxLength={100}
                                    onChangeText={onChange}
                                    error={errorsAgregar.ubicacion?.message} />
                            )}
                        />
                    </View>

                    <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                        <View style={{ flex: 1, marginBottom: esPantallaPequeña && errorsAgregar.programa && !errorsAgregar.tarjeta ? 30 : 15 }}>
                            <Controller
                                control={controlAgregar}
                                name="programa"
                                defaultValue=""
                                render={({ field: { onChange, value } }) => (
                                    <Entrada
                                        label="Programa"
                                        value={value}
                                        maxLength={45}
                                        onChangeText={onChange}
                                        error={errorsAgregar.programa?.message} />
                                )}
                            />
                        </View>
                        <View style={{ flex: 1, marginBottom: esPantallaPequeña && errorsAgregar.tarjeta && !errorsAgregar.beca ? 30 : 15 }}>
                            <Controller
                                control={controlAgregar}
                                name="tarjeta"
                                defaultValue=""
                                render={({ field: { onChange, value } }) => (
                                    <Entrada
                                        label="Tarjeta"
                                        keyboardType="numeric"
                                        value={value}
                                        maxLength={2}
                                        onChangeText={(text) => {
                                            const digitos = text.replace(/[^0-9]/g, "");
                                            onChange(digitos);
                                        }}
                                        error={errorsAgregar.tarjeta?.message}
                                    />
                                )}
                            />
                        </View>
                    </View>

                    <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                        <View style={{ flex: 1, marginBottom: esPantallaPequeña && errorsAgregar.beca && !errorsAgregar.estatus ? 30 : 15 }}>
                            <Controller
                                control={controlAgregar}
                                name="beca"
                                defaultValue=""
                                render={({ field: { onChange, value } }) => (
                                    <Entrada
                                        label="Beca"
                                        value={value}
                                        maxLength={1}
                                        onChangeText={(text) => {
                                            const alfabetico = text.replace(/[^a-zA-Z]/g, "");
                                            onChange(alfabetico.toUpperCase());
                                        }}
                                        error={errorsAgregar.beca?.message} />
                                )}
                            />
                        </View>
                        <View style={{ flex: 1, marginBottom: esPantallaPequeña && errorsAgregar.estatus && !errorsAgregar.carrera ? 30 : 15 }}>
                            <Controller
                                control={controlAgregar}
                                name="estatus"
                                defaultValue=""
                                render={({ field: { onChange, value } }) => (
                                    <Selector
                                        label="Estatus"
                                        selectedValue={value}
                                        onValueChange={onChange}
                                        items={[
                                            { label: "Baja", value: "Baja" },
                                            { label: "Alta", value: "Alta" },
                                        ]}
                                        error={errorsAgregar.estatus?.message as string | undefined}
                                    />
                                )}
                            />
                        </View>
                    </View>

                    <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                        <View style={{ flex: 1, marginBottom: esPantallaPequeña && errorsAgregar.carrera && !errorsAgregar.promocion ? 30 : 15 }}>
                            <Controller
                                control={controlAgregar}
                                name="carrera"
                                defaultValue=""
                                render={({ field: { onChange, value } }) => (
                                    <Selector
                                        label="Carrera"
                                        selectedValue={value}
                                        onValueChange={onChange}
                                        items={[
                                            { label: "Médico Cirujano y Homeópata", value: "Médico Cirujano y Homeópata" },
                                            { label: "Médico Cirujano y Partero", value: "Médico Cirujano y Partero" },
                                        ]}
                                        error={errorsAgregar.carrera?.message}
                                    />
                                )}
                            />
                        </View>

                        <View style={{ flex: 1, marginBottom: 15 }}>
                            <Controller
                                control={controlAgregar}
                                name="promocion"
                                defaultValue=""
                                render={({ field: { onChange, value } }) => (
                                    <Entrada
                                        label="Promoción"
                                        value={value}
                                        maxLength={45}
                                        onChangeText={onChange}
                                        error={errorsAgregar.promocion?.message} />
                                )}
                            />
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        );
    };

    const renderModalEditar = () => {
        if (!plazaSeleccion) return null;

        return (
            <Modal
                visible={modalEditar}
                titulo="Editar plaza"
                maxWidth={700}
                onClose={() => {
                    setPlazaSeleccion(null);
                    setModalEditar(false);
                    resetEditar();
                }}
                cancelar
                deshabilitado={isSubmittingEditar}
                textoAceptar={isSubmittingEditar ? "Guardando…" : "Guardar cambios"} onAceptar={handleSubmitEditar(onSubmitEditar)}
            >
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "web" ? undefined : "padding"}
                    keyboardVerticalOffset={5}
                >
                    <View style={{ marginBottom: 15 }}>
                        <Controller
                            control={controlEditar}
                            name="sede"
                            defaultValue={plazaSeleccion.sede || ""}
                            render={({ field: { onChange, value } }) => (
                                <Entrada
                                    label="Sede"
                                    value={value}
                                    maxLength={100}
                                    onChangeText={onChange}
                                    error={errorsEditar.sede?.message}
                                />
                            )}
                        />
                    </View>

                    <View style={{ marginBottom: 15 }}>
                        <Controller
                            control={controlEditar}
                            name="ubicacion"
                            defaultValue={plazaSeleccion.ubicacion || ""}
                            render={({ field: { onChange, value } }) => (
                                <Entrada
                                    label="Ubicación"
                                    value={value}
                                    maxLength={100}
                                    onChangeText={onChange}
                                    error={errorsEditar.ubicacion?.message}
                                />
                            )}
                        />
                    </View>

                    <View
                        style={
                            esPantallaPequeña
                                ? { flexDirection: "column" }
                                : { flexDirection: "row", gap: 12 }
                        }
                    >
                        <View style={{ flex: 1, marginBottom: 15 }}>
                            <Controller
                                control={controlEditar}
                                name="programa"
                                defaultValue={plazaSeleccion.PROGRAMA || ""}
                                render={({ field: { onChange, value } }) => (
                                    <Entrada
                                        label="Programa"
                                        value={value}
                                        maxLength={45}
                                        onChangeText={onChange}
                                        error={errorsEditar.programa?.message}
                                    />
                                )}
                            />
                        </View>

                        <View style={{ flex: 1, marginBottom: 15 }}>
                            <Controller
                                control={controlEditar}
                                name="tarjeta"
                                defaultValue={
                                    plazaSeleccion.tarjetaDisponible
                                        ? plazaSeleccion.tarjetaDisponible.toString()
                                        : ""
                                }
                                render={({ field: { onChange, value } }) => (
                                    <Entrada
                                        label="Tarjeta"
                                        keyboardType="numeric"
                                        value={value}
                                        maxLength={2}
                                        onChangeText={(text) => {
                                            const digitos = text.replace(/[^0-9]/g, "");
                                            onChange(digitos);
                                        }}
                                        error={errorsEditar.tarjeta?.message}
                                    />
                                )}
                            />
                        </View>
                    </View>

                    <View style={{ marginBottom: 15 }}>
                        <Controller
                            control={controlEditar}
                            name="beca"
                            defaultValue={plazaSeleccion.tipoBeca || ""}
                            render={({ field: { onChange, value } }) => (
                                <Entrada
                                    label="Beca"
                                    value={value}
                                    maxLength={1}
                                    onChangeText={(text) => {
                                        const alfabetico = text.replace(/[^a-zA-Z]/g, "");
                                        onChange(alfabetico.toUpperCase());
                                    }}
                                    error={errorsEditar.beca?.message}
                                />
                            )}
                        />
                    </View>

                    <View
                        style={
                            esPantallaPequeña
                                ? { flexDirection: "column" }
                                : { flexDirection: "row", gap: 12 }
                        }
                    >
                        <View style={{ flex: 1, marginBottom: 15 }}>
                            <Controller
                                control={controlEditar}
                                name="carrera"
                                defaultValue={
                                    plazaSeleccion.carrera === 1
                                        ? "Médico Cirujano y Homeópata"
                                        : "Médico Cirujano y Partero"
                                }
                                render={({ field: { onChange, value } }) => (
                                    <Selector
                                        label="Carrera"
                                        selectedValue={value}
                                        onValueChange={onChange}
                                        items={[
                                            {
                                                label: "Médico Cirujano y Homeópata",
                                                value: "Médico Cirujano y Homeópata",
                                            },
                                            {
                                                label: "Médico Cirujano y Partero",
                                                value: "Médico Cirujano y Partero",
                                            },
                                        ]}
                                        error={errorsEditar.carrera?.message}
                                    />
                                )}
                            />
                        </View>

                        <View style={{ flex: 1, marginBottom: 15 }}>
                            <Controller
                                control={controlEditar}
                                name="promocion"
                                defaultValue={plazaSeleccion.promocion || ""}
                                render={({ field: { onChange, value } }) => (
                                    <Entrada
                                        label="Promoción"
                                        value={value}
                                        maxLength={45}
                                        onChangeText={onChange}
                                        error={errorsEditar.promocion?.message}
                                    />
                                )}
                            />
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        );
    };

    const renderModalDarBaja = () => {
        if (!modalDarBaja) return null;

        return (
            <Modal visible={!!modalDarBaja} onClose={() => setModalDarBaja(false)} titulo="Dar de baja plaza" maxWidth={500}
                cancelar deshabilitado={isSubmittingDarBaja}
                textoAceptar={isSubmittingDarBaja ? "Enviando…" : "Dar de baja"} onAceptar={() => { handleSubmitDarBaja(() => eliminarPlaza(modalDarBaja.ID))(); }}>
                <Text allowFontScaling={false} style={{ marginBottom: 20 }}>
                    ¿Estás seguro de que deseas dar de baja la plaza {" "}
                    <Text style={{ fontWeight: "700" }}>{modalDarBaja.sede}</Text>?
                </Text>
            </Modal>
        );
    };

    useEffect(() => {
        if (Object.keys(errorsAgregar).length > 0) {
            setModalAgregar(false);
            modalAPI.current?.show(false, "Algunos campos contienen errores. Revísalos y vuelve a intentarlo.", () => { modalAPI.current?.close(); setModalAgregar(true); });
        }
    }, [errorsAgregar]);

    useEffect(() => {
        if (Object.keys(errorsEditar).length > 0) {
            setModalEditar(false);
            modalAPI.current?.show(false, "Algunos campos contienen errores. Revísalos y vuelve a intentarlo.", () => { modalAPI.current?.close(); setModalEditar(true); });
        }
    }, [errorsEditar]);

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
                            <Text allowFontScaling={false} style={styles.titulo}>Gestionar plazas</Text>
                            <View style={{ marginBottom: 15, flexDirection: "row", gap: 10 }}>
                                <View>
                                    <Boton title="Agregar plaza" onPress={() => { setModalAgregar(true) }} />
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
                                    <Text allowFontScaling={false} style={{ color: Colores.textoClaro, fontSize: Fuentes.caption }}>por página</Text>
                                </View>

                                <View style={[esPantallaPequeña ? { width: "100%" } : { flexDirection: "row", gap: 8, justifyContent: "space-between", width: "70%" }]}>
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
                                                    { label: "Baja", value: "Baja" },
                                                    { label: "Alta", value: "Alta" },
                                                ]}
                                            />
                                        </View>
                                    </View>
                                </View>
                            </View>

                            <ScrollView horizontal={esPantallaPequeña}>
                                <Tabla
                                    columnas={[
                                        { key: "sede", titulo: "Sede", ...(esPantallaPequeña && { ancho: 250 }) },
                                        { key: "carrera", titulo: "Carrera", ancho: 230 },
                                        { key: "promocion", titulo: "Promoción", ancho: 110 },
                                        {
                                            key: "estatus",
                                            titulo: "Estatus",
                                            ancho: 100,
                                            render: (valor) => (
                                                <Text
                                                    style={[
                                                        styles.texto,
                                                        valor === 0 && { color: Colores.textoError },
                                                        valor === 1 && { color: Colores.textoInfo },
                                                    ]}
                                                    allowFontScaling={false}
                                                >
                                                    {valor === 0 ? "Baja" : "Alta"}
                                                </Text>
                                            ),
                                        },
                                        {
                                            key: "acciones",
                                            titulo: "Acciones",
                                            ancho: 100,
                                            render: (_: any, fila: any) => (
                                                <View style={{ flexDirection: "row", gap: 10, justifyContent: "center", marginVertical: "auto" }}>
                                                    <Boton
                                                        onPress={() => { setPlazaSeleccion(fila); setModalEditar(true); }}
                                                        icon={<Ionicons name="pencil" size={18} color={Colores.onPrimario} style={{ padding: 5 }} />}
                                                        color={Colores.textoInfo}
                                                    />
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
                                        carrera: p.carrera === 1 ? "Médico Cirujano y Homeópata" : "Médico Cirujano y Partero",
                                        onPress: () => { setPlazaSeleccion(p); setModalDetalle(true); },
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
                                    {`Mostrando ${plazasMostradas.length} de ${plazasFiltradas.length} resultados`}
                                </Text>
                            </View>

                        </View>
                    </View>
                    {renderModalDetalle()}
                    {renderModalEditar()}
                    {renderModalAgregar()}
                    {renderModalDarBaja()}
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
    controlesSuperiores: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
        flexWrap: "wrap",
    }
});