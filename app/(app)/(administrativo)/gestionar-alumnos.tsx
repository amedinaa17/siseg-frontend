import Modal from "@/componentes/layout/Modal";
import ModalAPI, { ModalAPIRef } from "@/componentes/layout/ModalAPI";
import PiePagina from "@/componentes/layout/PiePagina";
import Boton from "@/componentes/ui/Boton";
import Entrada from "@/componentes/ui/Entrada";
import Paginacion from "@/componentes/ui/Paginacion";
import Selector from "@/componentes/ui/Selector";
import SelectorArchivo from "@/componentes/ui/SelectorArchivo";
import Tabla from "@/componentes/ui/Tabla";
import { useAuth } from "@/context/AuthProvider";
import { alumnoEsquema, type AlumnoFormulario } from "@/lib/validacion";
import { fetchData, postData } from "@/servicios/api";
import { Colores, Fuentes } from "@/temas/colores";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";

export default function GestionAlumnos() {
    const { sesion, verificarToken } = useAuth();
    const router = useRouter();

    const [cargando, setCargando] = useState(false);

    const modalAPI = useRef<ModalAPIRef>(null);
    const [alumnos, setAlumnos] = useState<any[]>([]);

    // Estados modales
    const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<any | null>(null);
    const [modalDetalle, setModalDetalle] = useState(false);
    const [modalAgregar, setModalAgregar] = useState(false);
    const [modalEditar, setModalEditar] = useState(false);
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

    // --- Estados para detalle de carga de alumnos masiva ---
    const [detalleVisible, setDetalleVisible] = useState(false);
    const [detalleTotales, setDetalleTotales] = useState({ total: 0, exitos: 0, errores: 0 });
    const [detalleFilas, setDetalleFilas] = useState<Array<{ boleta: string; error?: string }>>([]);

    const { width } = useWindowDimensions();
    const esPantallaPequeña = width < 790;

    const obtenerAlumnos = async () => {
        verificarToken();

        try {
            setCargando(true);

            const response = await fetchData(`users/obtenerTodosAlumnos?tk=${sesion.token}`);
            if (response.error === 0) {
                setAlumnos(response.data);
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

    const {
        control: controlAgregar,
        handleSubmit: handleSubmitAgregar,
        reset: resetAgregar,
        formState: { errors: errorsAgregar, isSubmitting: isSubmittingAgregar } } = useForm<AlumnoFormulario>({
            resolver: zodResolver(alumnoEsquema),
        });

    const onSubmitAgregar = async (data: AlumnoFormulario) => {
        verificarToken();

        try {
            const alumnoData = {
                ...data,
                carrera: data.carrera === "Médico Cirujano y Homeópata" ? 1 : 2,
                estatus: data.estatus === "Candidato" ? 1 :
                    data.estatus === "Aspirante" ? 2 :
                        data.estatus === "En proceso" ? 3 :
                            data.estatus === "Concluido" ? 4 : 0,
                tk: sesion.token,
            };
            const response = await postData("users/agregarAlumno", alumnoData);

            if (response.error === 0) {
                resetAgregar();
                setModalAgregar(false);
                obtenerAlumnos();
                modalAPI.current?.show(true, "El alumno se ha registrado correctamente.");
            } else {
                if (response.message.includes("La boleta ya está registrada"))
                    modalAPI.current?.show(false, "El número de boleta o CURP ya está registrado. Verifica los datos e inténtalo de nuevo.");
                else
                    modalAPI.current?.show(false, "Hubo un problema al registrar al alumno. Inténtalo de nuevo más tarde.");
            }
        } catch (error) {
            modalAPI.current?.show(false, "Error al conectar con el servidor. Inténtalo de nuevo más tarde.");
        }
    };

    const {
        control: controlEditar,
        handleSubmit: handleSubmitEditar,
        reset: resetEditar,
        formState: { errors: errorsEditar, isSubmitting: isSubmittingEditar } } = useForm<AlumnoFormulario>({
            resolver: zodResolver(alumnoEsquema),
        });

    const onSubmitEditar = async (data: AlumnoFormulario) => {
        verificarToken();

        try {
            const alumnoData = {
                ...data,
                carrera: data.carrera === "Médico Cirujano y Homeópata" ? 1 : 2,
                estatus: data.estatus === "Candidato" ? 1 :
                    data.estatus === "Aspirante" ? 2 :
                        data.estatus === "En proceso" ? 3 :
                            data.estatus === "Concluido" ? 4 : 0,
                tk: sesion.token,
            };
            const response = await postData("users/editarAlumno", alumnoData);

            if (response.error === 0) {
                resetEditar();
                setModalEditar(false);
                obtenerAlumnos();
                modalAPI.current?.show(true, "Los datos del alumno se han actualizado correctamente.");
            } else {
                modalAPI.current?.show(false, "Hubo un problema al actualizar los datos del alumno. Inténtalo de nuevo más tarde.");
            }
        } catch (error) {
            modalAPI.current?.show(false, "Error al conectar con el servidor. Inténtalo de nuevo más tarde.");
        }
    };

    const {
        handleSubmit: handleSubmitDarBaja,
        formState: { isSubmitting: isSubmittingDarBaja } } = useForm<any>();

    const darBajaAlumno = async (boleta: String) => {
        verificarToken();

        try {
            const response = await postData("users/desactivarAlumno", {
                boleta: boleta,
                tk: sesion.token,
            });
            setModalDarBaja(false);

            if (response.error === 0) {
                modalAPI.current?.show(true, "El alumno se ha dado de baja correctamente.");
                obtenerAlumnos();
            } else {
                modalAPI.current?.show(false, "Hubo un problema al dar de baja al alumno. Inténtalo de nuevo más tarde.");
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
                obtenerAlumnos();

                // Construir totales
                const total = Number(response.totalAlumnos ?? 0);
                const erroresArr = Array.isArray(response.errores) ? response.errores : [];
                const errores = erroresArr.length;
                const exitos = Math.max(total - errores - 1, 0);

                // Construir filas
                const filas = erroresArr.map((e: any) => {
                    const match = typeof e.error === "string" ? e.error.match(/(\d+)$/) : null;
                    const boleta = match ? match[1] : (e.boleta || "Desconocido");

                    const error =
                        typeof e.error === "string"
                            ? e.error.includes("ya está registrada")
                                ? "Boleta duplicada"
                                : e.error.includes("inválida")
                                    ? "Boleta inválida"
                                    : e.error
                            : "Error desconocido";

                    return { boleta, error };
                });

                setDetalleTotales({ total, exitos, errores });
                setDetalleFilas(filas);

                const resumen = `${exitos} alumno(s) registrados correctamente · ${errores} errores.`;
                modalAPI.current?.show(
                    true,
                    resumen,
                    undefined,
                    () => { modalAPI.current?.close(); setDetalleVisible(true) }
                );
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

    useEffect(() => {
        if (Object.keys(errorsAgregar).length > 0) {
            modalAPI.current?.show(false, "Algunos campos contienen errores. Revísalos y vuelve a intentarlo.");
        }
    }, [errorsAgregar]);

    useEffect(() => {
        if (Object.keys(errorsEditar).length > 0) {
            modalAPI.current?.show(false, "Algunos campos contienen errores. Revísalos y vuelve a intentarlo.");
        }
    }, [errorsEditar]);

    // --- Render de modales ---
    const renderModalDetalle = () => {
        if (!alumnoSeleccionado) return null;
        const { nombre, apellido_paterno, apellido_materno, boleta, carrera, generacion, estatus, correo,
            promedio, curp, rfc, telcelular, tellocal, sexo, calle_y_numero, colonia, delegacion,
            estado, cp } = alumnoSeleccionado;

        return (
            <Modal visible={modalDetalle} onClose={() => { setAlumnoSeleccionado(null); setModalDetalle(false); }} titulo="Datos del alumno" maxWidth={750}>
                <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "web" ? undefined : "padding"} keyboardVerticalOffset={80} >
                    <View style={{ marginTop: 5, marginBottom: 15 }} >
                        <Entrada label="Nombre" value={nombre || ""} editable={false} />
                    </View>

                    <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                        <View style={{ flex: 1, marginBottom: 15 }}>
                            <Entrada label="Apellido paterno" value={apellido_paterno || ""} editable={false} />
                        </View>
                        <View style={{ flex: 1, marginBottom: 15 }}>
                            <Entrada label="Apellido materno" value={apellido_materno || ""} editable={false} />
                        </View>
                    </View>

                    <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                        <View style={{ flex: 1, marginBottom: 15 }}>
                            <Entrada label="CURP" value={curp || ""} maxLength={18} editable={false} />
                        </View>
                        <View style={{ flex: 1, marginBottom: 15 }}>
                            <Entrada label="RFC" value={rfc || ""} editable={false} />
                        </View>
                    </View>

                    <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                        <View style={{ flex: 1, marginBottom: 15 }}>
                            <Entrada label="Boleta" value={boleta || ""} keyboardType="numeric" maxLength={10} editable={false} />
                        </View>
                        <View style={{ flex: 1, marginBottom: 15 }}>
                            <Entrada label="Carrera" value={carrera.NOMBRE || ""} editable={false} />
                        </View>
                    </View>

                    <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                        <View style={{ flex: 1, marginBottom: 15 }}>
                            <Entrada label="Generación" value={generacion || ""} editable={false} />
                        </View>
                        <View style={{ flex: 1, marginBottom: 15 }}>
                            <Entrada label="Promedio" value={promedio || ""} keyboardType="decimal-pad" editable={false} />
                        </View>
                    </View>

                    <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                        <View style={{ flex: 1, marginBottom: 15 }}>
                            <Entrada
                                label="Correo electrónico institucional"
                                value={correo || ""}
                                keyboardType="email-address"
                                editable={false}
                            />
                        </View>
                        <View style={{ flex: 1, marginBottom: 15 }}>
                            <Entrada label="Estatus" value={estatus.DESCRIPCION || ""} editable={false} />
                        </View>
                    </View>

                    <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                        <View style={{ flex: 1, marginBottom: 15 }}>
                            <Entrada label="Calle y número" value={calle_y_numero || ""} editable={false} />
                        </View>
                        <View style={{ flex: 1, marginBottom: 15 }}>
                            <Entrada label="Colonia" value={colonia || ""} editable={false} />
                        </View>
                    </View>

                    <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                        <View style={{ flex: 1, marginBottom: 15 }}>
                            <Entrada label="Delegación / municipio" value={delegacion || ""} editable={false} />
                        </View>
                        <View style={{ flex: 1, marginBottom: 15 }}>
                            <Entrada label="Estado de procedencia" value={estado || ""} editable={false} />
                        </View>
                    </View>

                    <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                        <View style={{ flex: 1, marginBottom: 15 }}>
                            <Entrada label="Código postal" value={cp || ""} keyboardType="numeric" editable={false} />
                        </View>
                        <View style={{ flex: 1, marginBottom: 15 }}>
                            <Selector
                                label="Sexo"
                                selectedValue={sexo === "F" ? "Femenino" : sexo === "M" ? "Masculino" : ""}
                                items={[
                                    { label: "Masculino", value: "M" },
                                    { label: "Femenino", value: "F" },
                                ]}
                                onValueChange={() => { }}
                                editable={false}
                            />
                        </View>
                    </View>

                    <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                        <View style={{ flex: 1, marginBottom: 15 }}>
                            <Entrada label="Celular" value={telcelular || ""} keyboardType="phone-pad" maxLength={10} editable={false} />
                        </View>
                        <View style={{ flex: 1, marginBottom: 15 }}>
                            <Entrada label="Teléfono local" value={tellocal || ""} keyboardType="phone-pad" maxLength={10} editable={false} />
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        );
    };

    const renderModalAgregar = () => {
        return (
            <Modal
                visible={modalAgregar} onClose={() => { setModalAgregar(false); resetAgregar(); }}
                titulo="Agregar alumno" maxWidth={700} cancelar deshabilitado={isSubmittingAgregar}
                textoAceptar={isSubmittingAgregar ? "Agregando…" : "Agregar alumno"} onAceptar={handleSubmitAgregar(onSubmitAgregar)}>
                <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "web" ? undefined : "padding"} keyboardVerticalOffset={80}>
                    <View style={{ marginBottom: 15 }}>
                        <Controller
                            control={controlAgregar}
                            name="nombre"
                            defaultValue=""
                            render={({ field: { onChange, value } }) => (
                                <Entrada
                                    label="Nombre"
                                    value={value}
                                    maxLength={45}
                                    onChangeText={(text) => {
                                        const alfabetico = text.replace(/[^a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s]/g, "");
                                        onChange(alfabetico);
                                    }}
                                    error={errorsAgregar.nombre?.message} />
                            )}
                        />
                    </View>

                    <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                        <View style={{ flex: 1, marginBottom: esPantallaPequeña && errorsEditar.apellido_paterno && !errorsEditar.apellido_materno ? 30 : 15 }}>
                            <Controller
                                control={controlAgregar}
                                name="apellido_paterno"
                                defaultValue=""
                                render={({ field: { onChange, value } }) => (
                                    <Entrada
                                        label="Apellido paterno"
                                        value={value}
                                        maxLength={45}
                                        onChangeText={(text) => {
                                            const alfabetico = text.replace(/[^a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s]/g, "");
                                            onChange(alfabetico);
                                        }}
                                        error={errorsAgregar.apellido_paterno?.message} />
                                )}
                            />
                        </View>
                        <View style={{ flex: 1, marginBottom: esPantallaPequeña && errorsAgregar.apellido_materno && !errorsAgregar.apellido_paterno ? 30 : 15 }}>
                            <Controller
                                control={controlAgregar}
                                name="apellido_materno"
                                defaultValue=""
                                render={({ field: { onChange, value } }) => (
                                    <Entrada label="Apellido materno"
                                        value={value}
                                        maxLength={45}
                                        onChangeText={(text) => {
                                            const alfabetico = text.replace(/[^a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s]/g, "");
                                            onChange(alfabetico);
                                        }}
                                        error={errorsAgregar.apellido_materno?.message} />
                                )}
                            />
                        </View>
                    </View>
                    <View style={{ marginBottom: 15 }}>
                        <Controller
                            control={controlAgregar}
                            name="curp"
                            defaultValue=""
                            render={({ field: { onChange, onBlur, value } }) => (
                                <Entrada
                                    label="CURP"
                                    value={value}
                                    maxLength={18}
                                    onBlur={onBlur}
                                    onChangeText={(text) => {
                                        const alfabetico = text.replace(/[^0-9a-zA-Z]/g, "");
                                        onChange(alfabetico.toUpperCase());
                                    }}
                                    error={errorsAgregar.curp?.message}
                                    autoCapitalize="characters"
                                />
                            )}
                        />
                    </View>

                    <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                        <View style={{ flex: 1, marginBottom: esPantallaPequeña && errorsAgregar.boleta && errorsAgregar.estatus ? 20 : 15 }}>
                            <Controller
                                control={controlAgregar}
                                name="boleta"
                                defaultValue=""
                                render={({ field: { onChange, value } }) => (
                                    <Entrada
                                        label="Boleta"
                                        keyboardType="numeric"
                                        value={value}
                                        maxLength={10}
                                        onChangeText={(text) => {
                                            const digitos = text.replace(/[^0-9]/g, "");
                                            onChange(digitos);
                                        }}
                                        error={errorsAgregar.boleta?.message} />
                                )}
                            />
                        </View>
                        <View style={{ flex: 1, marginBottom: esPantallaPequeña && errorsAgregar.carrera && !errorsAgregar.generacion ? 30 : 15 }}>
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
                    </View>

                    <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                        <View style={{ flex: 1, marginBottom: esPantallaPequeña && errorsAgregar.generacion && !errorsAgregar.promedio ? 30 : 15 }}>
                            <Controller
                                control={controlAgregar}
                                name="generacion"
                                defaultValue=""
                                render={({ field: { onChange, value } }) => (
                                    <Entrada
                                        label="Generación"
                                        value={value}
                                        maxLength={45}
                                        onChangeText={onChange}
                                        error={errorsAgregar.generacion?.message} />
                                )}
                            />
                        </View>
                        <View style={{ flex: 1, marginBottom: esPantallaPequeña && errorsAgregar.promedio && !errorsAgregar.estatus ? 30 : 15 }}>
                            <Controller
                                control={controlAgregar}
                                name="promedio"
                                defaultValue=""
                                render={({ field: { onChange, value } }) => (
                                    <Entrada
                                        label="Promedio"
                                        keyboardType="decimal-pad"
                                        value={value}
                                        maxLength={5}
                                        onChangeText={(text) => {
                                            const digitos = text.replace(/[^.0-9]/g, "");
                                            onChange(digitos);
                                        }}
                                        error={errorsAgregar.promedio?.message} />
                                )}
                            />
                        </View>
                    </View>

                    <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                        <View style={{ flex: 1, marginBottom: esPantallaPequeña && errorsAgregar.estatus && !errorsAgregar.correo ? 30 : 15 }}>
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
                                            { label: "Candidato", value: "Candidato" },
                                            { label: "Aspirante", value: "Aspirante" },
                                            { label: "En proceso", value: "En proceso" },
                                            { label: "Concluido", value: "Concluido" },
                                        ]}
                                        error={errorsAgregar.estatus?.message}
                                    />
                                )}
                            />
                        </View>
                        <View style={{ flex: 1, marginBottom: esPantallaPequeña && errorsAgregar.correo ? 30 : 15 }}>
                            <Controller
                                control={controlAgregar}
                                name="correo"
                                defaultValue=""
                                render={({ field: { onChange, value } }) => (
                                    <Entrada
                                        label="Correo electrónico institucional"
                                        keyboardType="email-address"
                                        maxLength={100}
                                        value={value} onChangeText={onChange}
                                        error={errorsAgregar.correo?.message}
                                    />
                                )}
                            />
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        );
    };

    const renderModalEditar = () => {
        if (!alumnoSeleccionado) return null;
        const { nombre, apellido_paterno, apellido_materno, boleta, carrera, generacion, estatus, correo,
            promedio, curp } = alumnoSeleccionado;

        return (
            <Modal visible={modalEditar} titulo="Editar alumno" maxWidth={750}
                onClose={() => { setAlumnoSeleccionado(null); setModalEditar(false); resetEditar(); }}
                cancelar deshabilitado={isSubmittingEditar}
                textoAceptar={isSubmittingEditar ? "Guardando…" : "Guardar cambios"} onAceptar={handleSubmitEditar(onSubmitEditar)}
            >
                <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "web" ? undefined : "padding"} keyboardVerticalOffset={80}>
                    <View style={{ marginTop: 10, marginBottom: 15 }} >
                        <Controller
                            control={controlEditar}
                            name="nombre"
                            defaultValue={nombre || ""}
                            render={({ field: { onChange, value } }) => (
                                <Entrada
                                    label="Nombre"
                                    value={value}
                                    maxLength={45}
                                    onChangeText={(text) => {
                                        const alfabetico = text.replace(/[^a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s]/g, "");
                                        onChange(alfabetico);
                                    }}
                                    error={errorsEditar.nombre?.message} />
                            )}
                        />
                    </View>

                    <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                        <View style={{ flex: 1, marginBottom: esPantallaPequeña && errorsEditar.apellido_paterno && !errorsEditar.apellido_materno ? 30 : 15 }}>
                            <Controller
                                control={controlEditar}
                                name="apellido_paterno"
                                defaultValue={apellido_paterno || ""}
                                render={({ field: { onChange, value } }) => (
                                    <Entrada
                                        label="Apellido paterno"
                                        value={value}
                                        maxLength={45}
                                        onChangeText={(text) => {
                                            const alfabetico = text.replace(/[^a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s]/g, "");
                                            onChange(alfabetico);
                                        }}
                                        error={errorsEditar.apellido_paterno?.message}
                                    />
                                )}
                            />
                        </View>
                        <View style={{ flex: 1, marginBottom: esPantallaPequeña && errorsEditar.apellido_materno && !errorsEditar.apellido_paterno ? 30 : 15 }}>
                            <Controller
                                control={controlEditar}
                                name="apellido_materno"
                                defaultValue={apellido_materno || ""}
                                render={({ field: { onChange, value } }) => (
                                    <Entrada label="Apellido materno"
                                        value={value}
                                        maxLength={45}
                                        onChangeText={(text) => {
                                            const alfabetico = text.replace(/[^a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s]/g, "");
                                            onChange(alfabetico);
                                        }}
                                        error={errorsEditar.apellido_materno?.message}
                                    />
                                )}
                            />
                        </View>
                    </View>

                    <View style={{ flex: 1, marginBottom: 15 }}>
                        <Controller
                            control={controlEditar}
                            name="curp"
                            defaultValue={curp || ""}
                            render={({ field: { onChange, value } }) => (
                                <Entrada
                                    label="CURP"
                                    maxLength={18}
                                    value={value} onChangeText={onChange}
                                    error={errorsEditar.curp?.message}
                                    editable={false}
                                />
                            )}
                        />
                    </View>

                    <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                        <View style={{ flex: 1, marginBottom: esPantallaPequeña && errorsEditar.carrera ? 5 : 15 }}>
                            <Controller
                                control={controlEditar}
                                name="boleta"
                                defaultValue={boleta || ""}
                                render={({ field: { onChange, value } }) => (
                                    <Entrada
                                        label="Boleta"
                                        keyboardType="numeric"
                                        maxLength={10}
                                        value={value} onChangeText={onChange}
                                        error={errorsEditar.boleta?.message}
                                        editable={false}
                                    />
                                )}
                            />
                        </View>
                        <View style={{ flex: 1, marginBottom: esPantallaPequeña && errorsEditar.carrera ? 30 : 15 }}>
                            <Controller
                                control={controlEditar}
                                name="carrera"
                                defaultValue={carrera || ""}
                                render={({ field: { onChange, value } }) => (
                                    <Selector
                                        label="Carrera"
                                        selectedValue={value}
                                        onValueChange={onChange}
                                        items={[
                                            { label: "Médico Cirujano y Homeópata", value: "Médico Cirujano y Homeópata" },
                                            { label: "Médico Cirujano y Partero", value: "Médico Cirujano y Partero" },
                                        ]}
                                        error={errorsEditar.carrera?.message}
                                    />
                                )}
                            />
                        </View>
                    </View>

                    <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                        <View style={{ flex: 1, marginBottom: esPantallaPequeña && errorsEditar.generacion && !errorsEditar.promedio ? 30 : 15 }}>
                            <Controller
                                control={controlEditar}
                                name="generacion"
                                defaultValue={generacion || ""}
                                render={({ field: { onChange, value } }) => (
                                    <Entrada
                                        label="Generación"
                                        value={value}
                                        maxLength={45}
                                        onChangeText={onChange}
                                        error={errorsEditar.generacion?.message}
                                        style={{ flex: 1 }}
                                    />
                                )}
                            />
                        </View>
                        <View style={{ flex: 1, marginBottom: esPantallaPequeña && errorsEditar.promedio && !errorsEditar.correo ? 30 : 15 }}>
                            <Controller
                                control={controlEditar}
                                name="promedio"
                                defaultValue={promedio || ""}
                                render={({ field: { onChange, value } }) => (
                                    <Entrada
                                        label="Promedio"
                                        keyboardType="decimal-pad"
                                        value={value}
                                        maxLength={5}
                                        onChangeText={(text) => {
                                            const digitos = text.replace(/[^.0-9]/g, "");
                                            onChange(digitos);
                                        }}
                                        error={errorsEditar.promedio?.message}
                                        style={{ flex: 1 }}
                                    />
                                )}
                            />
                        </View>
                    </View>

                    <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                        <View style={{ flex: 1, marginBottom: esPantallaPequeña && errorsEditar.correo && !errorsEditar.estatus ? 30 : 15 }}>
                            <Controller
                                control={controlEditar}
                                name="correo"
                                defaultValue={correo || ""}
                                render={({ field: { onChange, value } }) => (
                                    <Entrada
                                        label="Correo electrónico institucional"
                                        keyboardType="email-address"
                                        maxLength={100}
                                        value={value} onChangeText={onChange}
                                        error={errorsEditar.correo?.message}
                                        editable={false}
                                    />
                                )}
                            />
                        </View>
                        <View style={{ flex: 1, marginBottom: 15 }}>
                            <Controller
                                control={controlEditar}
                                name="estatus"
                                defaultValue={estatus || ""}
                                render={({ field: { onChange, value } }) => (
                                    <Selector
                                        label="Estatus"
                                        selectedValue={value}
                                        onValueChange={onChange}
                                        items={[
                                            { label: "Baja", value: "Baja" },
                                            { label: "Candidato", value: "Candidato" },
                                            { label: "Aspirante", value: "Aspirante" },
                                            { label: "En proceso", value: "En proceso" },
                                            { label: "Concluido", value: "Concluido" },
                                        ]}
                                        error={errorsEditar.estatus?.message}
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
            <Modal visible={!!modalDarBaja} onClose={() => setModalDarBaja(false)} titulo="Dar de baja alumno" maxWidth={500}
                cancelar deshabilitado={isSubmittingDarBaja}
                textoAceptar={isSubmittingDarBaja ? "Enviando…" : "Dar de baja"} onAceptar={() => { handleSubmitDarBaja(() => darBajaAlumno(modalDarBaja.boleta))(); }}>
                <Text allowFontScaling={false} style={{ marginBottom: 20 }}>
                    ¿Estás seguro de que deseas dar de baja al alumno con número de boleta{" "}
                    <Text style={{ fontWeight: "700" }}>{modalDarBaja.boleta}</Text>?
                </Text>
            </Modal>
        );
    };

    const renderModalCargarAlumnos = () => {
        return (
            <Modal visible={modalCargar} titulo="Cargar alumnos" maxWidth={600}
                onClose={() => { setModalCargar(false); setArchivoSeleccionado(null); }}
                textoAceptar={isSubmittingCargar ? "Cargando…" : "Cargar archivo"}
                cancelar onAceptar={handleSubirArchivo} deshabilitado={isSubmittingCargar}>
                <Text allowFontScaling={false}>
                    El archivo para la carga de alumnos debe cumplir con el formato establecido en Excel (.xls, .xlsx) y no exceder un tamaño máximo de 2MB.
                </Text>
                <Text allowFontScaling={false} style={{ color: Colores.textoClaro, fontSize: Fuentes.caption, marginVertical: 10 }}>
                    Descargue el archivo de ejemplo con el formato correcto para la carga de alumnos{" "}
                    <TouchableOpacity onPress={() => { }}>
                        <Text allowFontScaling={false} style={{ color: Colores.textoInfo }}>aquí</Text>
                    </TouchableOpacity>.
                </Text>
                <View style={{ marginTop: 10, marginBottom: 5 }}>
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

    const renderModalDetallesCargarAlumnos = () => {
        return (
            <Modal
                visible={detalleVisible} maxWidth={520}
                titulo="Detalle de la carga"
                onClose={() => setDetalleVisible(false)}
                onAceptar={() => setDetalleVisible(false)}
            >
                <View style={{ marginBottom: 12 }}>
                    <View style={{ marginBottom: 6, flexDirection: "row", justifyContent: "space-between" }}>
                        <Text allowFontScaling={false}>Alumnos procesados: <Text style={{ fontWeight: "700" }}>{detalleTotales.total}</Text></Text>
                        <Text allowFontScaling={false}>Alumnos registrados: <Text style={{ fontWeight: "700", color: Colores.textoExito }}>{detalleTotales.exitos}</Text></Text>
                        <Text allowFontScaling={false}>Errores: <Text style={{ fontWeight: "700", color: Colores.textoError }}>{detalleTotales.errores}</Text></Text>
                    </View>
                </View>

                <Tabla
                    columnas={[
                        { key: "boleta", titulo: "Boleta", ancho: 150 },
                        { key: "error", titulo: "Error" },
                    ]}
                    datos={detalleFilas.map((f) => ({
                        ...f,
                    }))}
                />
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
                <View style={{ flex: 1 }}>
                    <View style={[styles.contenedorFormulario, esPantallaPequeña && { maxWidth: "95%" }]}>
                        <Text allowFontScaling={false} style={styles.titulo}>Gestionar alumnos</Text>
                        {sesion?.perfil === 2 && (
                            <View style={{ marginBottom: 15, flexDirection: "row", gap: 10 }}>
                                <View>
                                    <Boton title="Agregar alumno" onPress={() => { setModalAgregar(true) }} />
                                </View>
                                <View>
                                    <Boton title="Cargar alumnos" onPress={() => setModalCargar(true)} />
                                </View>
                            </View>
                        )}

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
                                    { key: "boleta", titulo: "Boleta", ancho: 120 },
                                    { key: "nombre_completo", titulo: "Nombre", ...(esPantallaPequeña && { ancho: sesion?.perfil === 2 ? 155 : 205 }) },
                                    { key: "carrera", titulo: "Carrera", ...(esPantallaPequeña && { ancho: sesion?.perfil === 2 ? 155 : 205 }) },
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
                                    ...(sesion?.perfil === 2
                                        ? [
                                            {
                                                key: "acciones",
                                                titulo: "Acciones",
                                                ancho: 100,
                                                render: (_, fila) => (
                                                    <View style={{ flexDirection: "row", gap: 10, justifyContent: "center", marginVertical: "auto" }}>
                                                        <Boton
                                                            onPress={() => { setAlumnoSeleccionado(fila); setModalEditar(true); }}
                                                            icon={<Ionicons name="pencil" size={18} color={Colores.onPrimario} style={{ padding: 5 }} />}
                                                            color={Colores.textoInfo}
                                                        />
                                                        <Boton
                                                            onPress={() => { setModalDarBaja(fila) }}
                                                            icon={<Ionicons name="trash" size={18} color={Colores.onPrimario} style={{ padding: 5 }} />}
                                                            color={Colores.textoError}
                                                            disabled={fila.estatus === "Baja" ? true : false}
                                                        />
                                                    </View>
                                                ),
                                            },
                                        ]
                                        : []),
                                ]}
                                datos={alumnosMostrados.map((fila) => ({
                                    ...fila,
                                    nombre_completo: `${fila.nombre} ${fila.apellido_paterno} ${fila.apellido_materno}`,
                                    carrera: fila.carrera.NOMBRE,
                                    estatus: fila.estatus.DESCRIPCION,
                                    onPress: () => { setAlumnoSeleccionado(fila); setModalDetalle(true); },
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
                {renderModalDetalle()}
                {renderModalAgregar()}
                {renderModalEditar()}
                {renderModalDarBaja()}
                {renderModalCargarAlumnos()}
                {renderModalDetallesCargarAlumnos()}
                <ModalAPI ref={modalAPI} />
                <PiePagina />
            </ScrollView >
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
