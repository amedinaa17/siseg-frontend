import Modal from "@/componentes/layout/Modal";
import ModalAPI, { ModalAPIRef } from "@/componentes/layout/ModalAPI";
import Boton from "@/componentes/ui/Boton";
import Entrada from "@/componentes/ui/Entrada";
import Paginacion from "@/componentes/ui/Paginacion";
import Selector from "@/componentes/ui/Selector";
import Tabla from "@/componentes/ui/Tabla";
import { useAuth } from "@/context/AuthProvider";
import { personalEsquema, type PersonalFormulario } from "@/lib/validacion";
import { fetchData, postData } from "@/servicios/api";
import { Colores, Fuentes } from "@/temas/colores";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

export default function GestionPersonalAdministrativo() {
    const { sesion, verificarToken } = useAuth();
    const router = useRouter();

    const [cargando, setCargando] = useState(false);

    const modalAPI = useRef<ModalAPIRef>(null);
    const [personal, setPersonal] = useState<any[]>([]);

    // Estados modales
    const [personalSeleccionado, setPersonalSeleccionado] = useState<any | null>(null);
    const [modalDetalle, setModalDetalle] = useState(false);
    const [modalAgregar, setModalAgregar] = useState(false);
    const [modalEditar, setModalEditar] = useState(false);
    const [modalDarBaja, setModalDarBaja] = useState<any | null>(null);

    // --- Estados para búsqueda, filtros y paginación ---
    const [busqueda, setBusqueda] = useState("");
    const [filtroPerfil, setFiltroPerfil] = useState("Todos");
    const [filtroEstatus, setFiltroEstatus] = useState("Todos");
    const [paginaActual, setPaginaActual] = useState(1);
    const [filasPorPagina, setFilasPorPagina] = useState(5);

    const { width } = useWindowDimensions();
    const esPantallaPequeña = width < 790;

    const obtenerPersonal = async () => {
        verificarToken();

        try {
            setCargando(true);

            const response = await fetchData(`users/obtenerTodosAdmins?tk=${sesion.token}`);
            if (response.error === 0) {
                setPersonal(response.admins);
            } else {
                modalAPI.current?.show(false, "Hubo un problema al obtener los datos del servidor. Inténtalo de nuevo más tarde.", () => { router.replace("/"); });
            }
        } catch (error) {
            modalAPI.current?.show(false, "Error al conectar con el servidor. Inténtalo de nuevo más tarde.", () => { router.replace("/"); });
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        obtenerPersonal();
    }, []);

    // --- Filtrado y paginación de los datos ---
    const personalFiltrados = personal.filter(personal => (
        `${personal.persona.nombre} ${personal.persona.APELLIDO_PATERNO} ${personal.persona.APELLIDO_MATERNO}`
            .toLowerCase()
            .includes(busqueda.toLowerCase()) ||
        personal.persona.boleta.toLowerCase().includes(busqueda.toLowerCase())
    ) &&
        (filtroEstatus === "Todos" || personal.estatus.DESCRIPCION === filtroEstatus) &&
        (filtroPerfil === "Todos" || personal.perfil === "Administrador " + filtroPerfil)
    );

    const totalPaginas = Math.ceil(personalFiltrados.length / filasPorPagina);
    const personalMostrados = personalFiltrados.slice(
        (paginaActual - 1) * filasPorPagina,
        paginaActual * filasPorPagina
    );

    const {
        control: controlAgregar,
        handleSubmit: handleSubmitAgregar,
        reset: resetAgregar,
        formState: { errors: errorsAgregar, isSubmitting: isSubmittingAgregar } } = useForm<PersonalFormulario>({
            resolver: zodResolver(personalEsquema),
        });

    const onSubmitAgregar = async (data: PersonalFormulario) => {
        verificarToken();

        try {
            const personalData = {
                ...data,
                estatus: data.estatus === "Activo" ? 1 : 0,
                perfil: data.perfil === "Administrador de seguimiento" ? 1 : 2,
                tk: sesion.token,
            };
            const response = await postData("users/agregarAdmin", personalData);

            if (response.error === 0) {
                resetAgregar();
                setModalAgregar(false);
                obtenerPersonal();
                modalAPI.current?.show(true, "El personal administrativo se ha registrado correctamente.");
            } else {
                if (response.message.includes("El número de empleado ya está registrado"))
                    modalAPI.current?.show(false, "El número de empleado o CURP ya está registrado. Verifica los datos e inténtalo de nuevo.");
                else
                    modalAPI.current?.show(false, "Hubo un problema al registrar al personal administrativo. Inténtalo de nuevo más tarde.");
            }
        } catch (error) {
            modalAPI.current?.show(false, "Error al conectar con el servidor. Inténtalo de nuevo más tarde.");
        }
    };

    const {
        control: controlEditar,
        handleSubmit: handleSubmitEditar,
        reset: resetEditar,
        formState: { errors: errorsEditar, isSubmitting: isSubmittingEditar } } = useForm<PersonalFormulario>({
            resolver: zodResolver(personalEsquema),
        });

    const onSubmitEditar = async (data: PersonalFormulario) => {
        verificarToken();

        try {
            const personalData = {
                ...data,
                estatus: data.estatus === "Activo" ? 1 : 0,
                perfil: data.perfil === "Administrador de seguimiento" ? 1 : 2,
                tk: sesion.token,
            };
            const response = await postData("users/editarAdmin", personalData);

            if (response.error === 0) {
                resetEditar();
                setModalEditar(false);
                setPersonalSeleccionado(null);
                obtenerPersonal();
                modalAPI.current?.show(true, "Los datos del personal administrativo se han actualizado correctamente.");
            } else {
                modalAPI.current?.show(false, "Hubo un problema al actualizar los datos del personal dministrativo. Inténtalo de nuevo más tarde.");
            }
        } catch (error) {
            modalAPI.current?.show(false, "Error al conectar con el servidor. Inténtalo de nuevo más tarde.");
        }
    };

    const {
        handleSubmit: handleSubmitDarBaja,
        formState: { isSubmitting: isSubmittingDarBaja } } = useForm<any>();

    const darBajaPersonal = async (numempleado: String) => {
        verificarToken();

        try {
            const response = await postData("users/desactivarAdmin", {
                numempleado: numempleado,
                tk: sesion.token,
            });
            setModalDarBaja(false);

            if (response.error === 0) {
                modalAPI.current?.show(true, "El personal administrativo se ha dado de baja correctamente.");
                obtenerPersonal();
            } else {
                modalAPI.current?.show(false, "Hubo un problema al dar de baja al personal administrativo. Inténtalo de nuevo más tarde.");
            }
        } catch (error) {
            setModalDarBaja(false);
            modalAPI.current?.show(false, "Error al conectar con el servidor. Inténtalo de nuevo más tarde.");
        }
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
        if (!personalSeleccionado) return null;
        const { estatus, perfil, persona } = personalSeleccionado;

        return (
            <Modal visible={modalDetalle} onClose={() => { setPersonalSeleccionado(null); setModalDetalle(false); }} titulo="Datos del personal administrativo" maxWidth={750}>
                <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "web" ? undefined : "padding"} keyboardVerticalOffset={80} >
                    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                        <View style={{ marginTop: 5, marginBottom: 15 }} >
                            <Entrada label="Nombre" value={persona.nombre || ""} editable={false} />
                        </View>

                        <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                            <View style={{ flex: 1, marginBottom: 15 }}>
                                <Entrada label="Apellido Paterno" value={persona.APELLIDO_PATERNO || ""} editable={false} />
                            </View>
                            <View style={{ flex: 1, marginBottom: 15 }}>
                                <Entrada label="Apellido Materno" value={persona.APELLIDO_MATERNO || ""} editable={false} />
                            </View>
                        </View>

                        <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                            <View style={{ flex: 1, marginBottom: 15 }}>
                                <Entrada label="CURP" value={persona.curp || ""} maxLength={18} editable={false} />
                            </View>
                            <View style={{ flex: 1, marginBottom: 15 }}>
                                <Selector
                                    label="Sexo"
                                    selectedValue={persona.sexo === "F" ? "Femenino" : persona.sexo === "M" ? "Masculino" : ""}
                                    items={[
                                        { label: "Masculino", value: "M" },
                                        { label: "Femenino", value: "F" },
                                    ]}
                                    onValueChange={() => { }}
                                    editable={false}
                                />
                            </View>
                        </View>

                        <View style={{ marginBottom: 15 }} >
                            <Entrada label="No. Empleado" value={persona.boleta || ""} keyboardType="numeric" editable={false} />
                        </View>

                        <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                            <View style={{ flex: 1, marginBottom: 15 }}>
                                <Entrada label="Estatus" value={estatus.DESCRIPCION || ""} editable={false} />
                            </View>
                            <View style={{ flex: 1, marginBottom: 15 }}>
                                <Entrada label="Perfil" value={perfil || ""} editable={false} />
                            </View>
                        </View>

                        <View style={{ marginBottom: 15 }} >
                            <Entrada label="Correo Electrónico Institucional" value={persona.correo || ""} editable={false} />
                        </View>

                        <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                            <View style={{ flex: 1, marginBottom: 15 }}>
                                <Entrada label="Teléfono Celular" value={persona.telefonoMovil || ""} keyboardType="phone-pad" maxLength={10} editable={false} />
                            </View>
                            <View style={{ flex: 1, marginBottom: 25 }}>
                                <Entrada label="Teléfono Local" value={persona.telefonoFijo || ""} keyboardType="phone-pad" maxLength={10} editable={false} />
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </Modal>
        );
    };

    const renderModalAgregar = () => {
        return (
            <Modal visible={modalAgregar} onClose={() => { setModalAgregar(false); resetAgregar(); }} titulo="Agregar personal administrativo" maxWidth={700}
                cancelar deshabilitado={isSubmittingAgregar} textoAceptar={isSubmittingAgregar ? "Agregando…" : "Agregar personal"} onAceptar={handleSubmitAgregar(onSubmitAgregar)}>
                <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "web" ? undefined : "padding"} keyboardVerticalOffset={80}>
                    <View style={{ marginTop: 10, marginBottom: 15 }}>
                        <Controller
                            control={controlAgregar}
                            name="nombre"
                            defaultValue=""
                            render={({ field }) => (
                                <Entrada label="Nombre" {...field} error={errorsAgregar.nombre?.message} />
                            )}
                        />
                    </View>

                    <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                        <View style={{ flex: 1, marginBottom: esPantallaPequeña && errorsEditar.apellido_paterno && !errorsEditar.apellido_materno ? 30 : 15 }}>
                            <Controller
                                control={controlAgregar}
                                name="apellido_paterno"
                                defaultValue=""
                                render={({ field }) => (
                                    <Entrada label="Apellido Paterno" {...field} error={errorsAgregar.apellido_paterno?.message} />
                                )}
                            />
                        </View>
                        <View style={{ flex: 1, marginBottom: esPantallaPequeña && errorsAgregar.apellido_materno && !errorsAgregar.apellido_paterno ? 30 : 15 }}>
                            <Controller
                                control={controlAgregar}
                                name="apellido_materno"
                                defaultValue=""
                                render={({ field }) => (
                                    <Entrada label="Apellido Materno" {...field} error={errorsAgregar.apellido_materno?.message} />
                                )}
                            />
                        </View>
                    </View>

                    <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                        <View style={{ flex: 1, marginBottom: esPantallaPequeña && errorsAgregar.curp && !errorsAgregar.sexo ? 25 : 15 }}>
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
                                        onChangeText={(text) => onChange(text.toUpperCase())}
                                        error={errorsAgregar.curp?.message}
                                        autoCapitalize="characters"
                                    />
                                )}
                            />
                        </View>
                        <View style={{ flex: 1, marginBottom: 15 }}>
                            <Controller
                                control={controlAgregar}
                                name="sexo"
                                defaultValue={""}
                                render={({ field: { onChange, value } }) => (
                                    <Selector
                                        label="Sexo"
                                        selectedValue={value === "F" ? "Femenino" : value === "M" ? "Masculino" : ""}
                                        onValueChange={(val) => onChange(val)}
                                        items={[
                                            { label: "Masculino", value: "M" },
                                            { label: "Femenino", value: "F" },
                                        ]}
                                        error={errorsAgregar.sexo?.message}
                                    />
                                )}
                            />
                        </View>
                    </View>

                    <View style={{ flex: 1, marginBottom: esPantallaPequeña && errorsAgregar.numempleado && errorsAgregar.estatus ? 20 : 15 }}>
                        <Controller
                            control={controlAgregar}
                            name="numempleado"
                            defaultValue=""
                            render={({ field }) => (
                                <Entrada label="No. Empleado" keyboardType="numeric" {...field} error={errorsAgregar.numempleado?.message} />
                            )}
                        />
                    </View>
                    <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                        <View style={{ flex: 1, marginBottom: esPantallaPequeña && errorsAgregar.estatus && !errorsAgregar.perfil ? 25 : 15 }}>
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
                                            { label: "Activo", value: "Activo" },
                                            { label: "Inactivo", value: "Inactivo" },
                                        ]}
                                        error={errorsAgregar.estatus?.message}
                                    />)}
                            />
                        </View>

                        <View style={{ flex: 1, marginBottom: 15 }}>
                            <Controller
                                control={controlAgregar}
                                name="perfil"
                                defaultValue=""
                                render={({ field: { onChange, value } }) => (
                                    <Selector
                                        label="Perfil"
                                        selectedValue={value}
                                        onValueChange={onChange}
                                        items={[
                                            { label: "Administrador general", value: "Administrador general" },
                                            { label: "Administrador de seguimiento", value: "Administrador de seguimiento" },
                                        ]}
                                        error={errorsAgregar.perfil?.message}
                                    />
                                )}
                            />
                        </View>
                    </View>

                    <View style={{ flex: 1, marginBottom: esPantallaPequeña && errorsAgregar.correo && !errorsAgregar.telcelular ? 20 : 15 }}>
                        <Controller
                            control={controlAgregar}
                            name="correo"
                            defaultValue=""
                            render={({ field }) => (
                                <Entrada label="Correo Electrónico" keyboardType="email-address" {...field} error={errorsAgregar.correo?.message} />
                            )}
                        />
                    </View>

                    <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                        <View style={{ flex: 1, marginBottom: esPantallaPequeña && errorsAgregar.telcelular && !errorsAgregar.tellocal ? 30 : 15 }}>
                            <Controller
                                control={controlAgregar}
                                name="telcelular"
                                defaultValue=""
                                render={({ field }) => (
                                    <Entrada label="Teléfono Celular" keyboardType="phone-pad" maxLength={10} {...field} error={errorsAgregar.telcelular?.message} />
                                )}
                            />
                        </View>
                        <View style={{ flex: 1, marginBottom: esPantallaPequeña && errorsAgregar.tellocal ? 30 : 15 }}>
                            <Controller
                                control={controlAgregar}
                                name="tellocal"
                                defaultValue=""
                                render={({ field }) => (
                                    <Entrada label="Teléfono Local" keyboardType="phone-pad" maxLength={10} {...field} error={errorsAgregar.tellocal?.message} />
                                )}
                            />
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        );
    };

    const renderModalEditar = () => {
        if (!personalSeleccionado) return null;
        const { estatus, perfil, persona } = personalSeleccionado;

        return (
            <Modal visible={modalEditar} titulo="Editar personal administrativo" maxWidth={750}
                onClose={() => { setPersonalSeleccionado(null); setModalEditar(false); resetEditar(); }}
                cancelar deshabilitado={isSubmittingEditar}
                textoAceptar={isSubmittingEditar ? "Guardando…" : "Guardar cambios"} onAceptar={handleSubmitEditar(onSubmitEditar)}
            >
                <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "web" ? undefined : "padding"} keyboardVerticalOffset={80}>
                    <View style={{ marginTop: 10, marginBottom: 15 }} >
                        <Controller
                            control={controlEditar}
                            name="nombre"
                            defaultValue={persona.nombre || ""}
                            render={({ field }) => (
                                <Entrada label="Nombre" {...field} error={errorsEditar.nombre?.message} />
                            )}
                        />
                    </View>

                    <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                        <View style={{ flex: 1, marginBottom: esPantallaPequeña && errorsEditar.apellido_paterno && !errorsEditar.apellido_materno ? 30 : 15 }}>
                            <Controller
                                control={controlEditar}
                                name="apellido_paterno"
                                defaultValue={persona.APELLIDO_PATERNO || ""}
                                render={({ field }) => (
                                    <Entrada
                                        label="Apellido Paterno"
                                        {...field}
                                        error={errorsEditar.apellido_paterno?.message}
                                    />
                                )}
                            />
                        </View>
                        <View style={{ flex: 1, marginBottom: esPantallaPequeña && errorsEditar.apellido_materno && !errorsEditar.apellido_paterno ? 30 : 15 }}>
                            <Controller
                                control={controlEditar}
                                name="apellido_materno"
                                defaultValue={persona.APELLIDO_MATERNO || ""}
                                render={({ field }) => (
                                    <Entrada
                                        label="Apellido Materno"
                                        {...field}
                                        error={errorsEditar.apellido_materno?.message}
                                    />
                                )}
                            />
                        </View>
                    </View>

                    <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                        <View style={{ flex: 1, marginBottom: esPantallaPequeña && errorsEditar.sexo ? 5 : 15 }}>
                            <Controller
                                control={controlEditar}
                                name="curp"
                                defaultValue={persona.curp || ""}
                                render={({ field }) => (
                                    <Entrada
                                        label="CURP"
                                        maxLength={18}
                                        {...field}
                                        error={errorsEditar.curp?.message}
                                        editable={false}
                                    />
                                )}
                            />
                        </View>
                        <View style={{ flex: 1, marginBottom: esPantallaPequeña && errorsEditar.sexo ? 25 : 15 }}>
                            <Controller
                                control={controlEditar}
                                name="sexo"
                                defaultValue={persona.sexo || ""}
                                render={({ field: { onChange, value } }) => (
                                    <Selector
                                        label="Sexo"
                                        selectedValue={value === "F" ? "Femenino" : value === "M" ? "Masculino" : ""}
                                        onValueChange={(val) => onChange(val)}
                                        items={[
                                            { label: "Masculino", value: "M" },
                                            { label: "Femenino", value: "F" },
                                        ]}
                                        error={errorsEditar.sexo?.message}
                                    />
                                )}
                            />
                        </View>
                    </View>

                    <View style={{ flex: 1, marginBottom: esPantallaPequeña && errorsEditar.sexo ? 5 : 15 }}>
                        <Controller
                            control={controlEditar}
                            name="numempleado"
                            defaultValue={persona.boleta || ""}
                            render={({ field }) => (
                                <Entrada
                                    label="No. Empleado"
                                    keyboardType="numeric"
                                    {...field}
                                    editable={false}
                                    error={errorsEditar.numempleado?.message}
                                />
                            )}
                        />
                    </View>

                    <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                        <View style={{ flex: 1, marginBottom: esPantallaPequeña && errorsEditar.numempleado && !errorsEditar.perfil ? 30 : 15 }}>
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
                                            { label: "Activo", value: "Activo" },
                                            { label: "Inactivo", value: "Inactivo" },
                                        ]}
                                        error={errorsEditar.estatus?.message}
                                    />)}
                            />
                        </View>
                        <View style={{ flex: 1, marginBottom: esPantallaPequeña && errorsEditar.perfil ? 30 : 15 }}>
                            <Controller
                                control={controlEditar}
                                name="perfil"
                                defaultValue={perfil || ""}
                                render={({ field: { onChange, value } }) => (
                                    <Selector
                                        label="Perfil"
                                        selectedValue={value}
                                        onValueChange={onChange}
                                        items={[
                                            { label: "Administrador general", value: "Administrador general" },
                                            { label: "Administrador de seguimiento", value: "Administrador de seguimiento" },
                                        ]}
                                        error={errorsEditar.perfil?.message}
                                    />
                                )}
                            />
                        </View>
                    </View>

                    <View style={{ flex: 1, marginBottom: esPantallaPequeña && errorsEditar.correo && !errorsEditar.telcelular ? 25 : 15 }}>
                        <Controller
                            control={controlEditar}
                            name="correo"
                            defaultValue={persona.correo || ""}
                            render={({ field }) => (
                                <Entrada
                                    label="Correo Electrónico"
                                    keyboardType="email-address"
                                    {...field}
                                    error={errorsEditar.correo?.message}
                                />
                            )}
                        />
                    </View>

                    <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                        <View style={{ flex: 1, marginBottom: esPantallaPequeña && errorsEditar.telcelular && !errorsEditar.tellocal ? 15 : 15 }}>
                            <Controller
                                control={controlEditar}
                                name="telcelular"
                                defaultValue={persona.telefonoMovil || ""}
                                render={({ field }) => (
                                    <Entrada
                                        label="Teléfono Celular"
                                        keyboardType="phone-pad"
                                        maxLength={10}
                                        {...field}
                                        error={errorsEditar.telcelular?.message}
                                        style={{ flex: 1 }}
                                    />
                                )}
                            />
                        </View>
                        <View style={{ flex: 1, marginBottom: esPantallaPequeña && errorsEditar.tellocal ? 30 : 15 }}>
                            <Controller
                                control={controlEditar}
                                name="tellocal"
                                defaultValue={persona.telefonoFijo || ""}
                                render={({ field }) => (
                                    <Entrada
                                        label="Teléfono Local"
                                        keyboardType="phone-pad"
                                        maxLength={10}
                                        {...field}
                                        error={errorsEditar.tellocal?.message}
                                        style={{ flex: 1 }}
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
            <Modal visible={modalDarBaja} onClose={() => setModalDarBaja(false)} titulo="Dar de baja personal" maxWidth={500}
                cancelar deshabilitado={isSubmittingDarBaja}
                textoAceptar={isSubmittingDarBaja ? "Enviando…" : "Dar de baja"} onAceptar={() => { handleSubmitDarBaja(() => darBajaPersonal(modalDarBaja.boleta))(); }}>
                <Text style={{ marginBottom: 20 }}>
                    ¿Estás seguro de que deseas dar de baja al personal administrativo con número de empleado{" "}
                    <Text style={{ fontWeight: "700" }}>{modalDarBaja.boleta}</Text>?
                </Text>
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
                <View style={[styles.contenedorFormulario, esPantallaPequeña && { maxWidth: "95%" }]}>
                    <Text style={styles.titulo}>Gestionar personal administrativo</Text>
                    {sesion?.perfil === 2 && (
                        <View style={{ marginBottom: 15, flexDirection: "row", gap: 10 }}>
                            <View>
                                <Boton title="Agregar personal" onPress={() => { setModalAgregar(true) }} />
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
                            <Text style={{ color: Colores.textoClaro, fontSize: Fuentes.caption }}>por página</Text>
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
                                        label="Perfil"
                                        selectedValue={filtroPerfil}
                                        onValueChange={setFiltroPerfil}
                                        items={[
                                            { label: "Todos", value: "Todos" },
                                            { label: "Administrador general", value: "general" },
                                            { label: "Administrador de seguimiento", value: "de seguimiento" },
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
                                            { label: "Activo", value: "Activo" },
                                            { label: "Inactivo", value: "Inactivo" },
                                        ]}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>

                    <ScrollView horizontal={esPantallaPequeña}>
                        <Tabla
                            columnas={[
                                { key: "boleta", titulo: "No. Empleado", ancho: 150 },
                                { key: "nombre_completo", titulo: "Nombre", ...(esPantallaPequeña && { ancho: 250 }) },
                                { key: "perfil", titulo: "Perfil", ...(esPantallaPequeña && { ancho: 250 }) },
                                {
                                    key: "estatus", titulo: "Estatus",
                                    render: (valor) => (
                                        <Text
                                            style={[
                                                styles.texto,
                                                valor === "Inactivo" && { color: Colores.textoError },
                                                valor === "Activo" && { color: Colores.textoInfo },
                                            ]}
                                        >
                                            {valor}
                                        </Text>
                                    ), ...(esPantallaPequeña && { ancho: 150 })
                                },
                                ...(sesion?.perfil === 2
                                    ? [
                                        {
                                            key: "acciones",
                                            titulo: "Acciones",
                                            ancho: 110,
                                            render: (_, fila) => (
                                                <View style={{ flexDirection: "row", gap: 10, justifyContent: "center", marginVertical: "auto" }}>
                                                    <Boton
                                                        onPress={() => { setPersonalSeleccionado(fila); setModalEditar(true); }}
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
                            datos={personalMostrados.map((fila) => ({
                                ...fila,
                                boleta: fila.persona.boleta,
                                nombre_completo: `${fila.persona.nombre} ${fila.persona.APELLIDO_PATERNO} ${fila.persona.APELLIDO_MATERNO}`,
                                estatus: fila.estatus.DESCRIPCION,
                                onPress: () => { setPersonalSeleccionado(fila); setModalDetalle(true); },
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
                        >
                            {`Mostrando ${personalMostrados.length} de ${personalFiltrados.length} resultados`}
                        </Text>
                    </View>
                </View>
                {renderModalDetalle()}
                {renderModalAgregar()}
                {renderModalEditar()}
                {renderModalDarBaja()}
                <ModalAPI ref={modalAPI} />
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
