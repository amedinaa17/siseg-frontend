import ModalAPI, { ModalAPIRef } from "@/componentes/layout/ModalAPI";
import Boton from "@/componentes/ui/Boton";
import Entrada from "@/componentes/ui/Entrada";
import Selector from "@/componentes/ui/Selector";
import { useAuth } from "@/context/AuthProvider";
import {
    cambiarContraseñaEsquema, modificarPerfilEsquema,
    type CambiarContraseñaFormulario, type ModificarPerfilFormulario
} from "@/lib/validacion";
import { fetchData, postData } from "@/servicios/api";
import { Colores, Fuentes } from '@/temas/colores';
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

export default function MiPerfil() {
    const { sesion, verificarToken } = useAuth();
    const [datosAlumno, setDatosAlumno] = useState<any>(null);

    const modalAPI = useRef<ModalAPIRef>(null);
    const [vista, setVista] = useState<1 | 2 | 3>(1);

    const { width } = useWindowDimensions();
    const esPantallaPequeña = width < 790;

    useEffect(() => {
        const obtenerDatos = async () => {
            verificarToken();

            if (sesion?.token) {
                try {
                    const response = await fetchData(`users/obtenerTodosDatosAlumno?tk=${sesion.token}`);
                    if (response.error === 0) {
                        setDatosAlumno(response.data);
                    } else {
                        modalAPI.current?.show(false, "Hubo un problema al obtener tus datos del servidor. Inténtalo de nuevo más tarde.");
                    }
                } catch (error) {
                    modalAPI.current?.show(false, "Error al conectar con el servidor. Inténtalo de nuevo más tarde.");
                }
            }
        };

        obtenerDatos();
    }, [vista]);

    const {
        control: controlPerfil,
        handleSubmit: handlePerfil,
        reset: resetPerfil,
        formState: { errors: errorsPerfil, isSubmitting: enviandoPerfil },
    } = useForm<ModificarPerfilFormulario>({
        resolver: zodResolver(modificarPerfilEsquema),
    });

    const onSubmitPerfil = async (datos: ModificarPerfilFormulario) => {
        verificarToken();

        try {
            const datosActualizar = {
                calle: datos.calle,
                colonia: datos.colonia,
                delegacion: datos.delegacion,
                estado: datos.estado,
                cp: datos.cp,
                sexo: datos.sexo,
                telcelular: datos.telcelular,
                tellocal: datos.tellocal,
                tk: sesion?.token
            };
            const response = await postData('users/modificarDatos', datosActualizar);

            if (response.error === 0) {
                setVista(1);
                modalAPI.current?.show(true, "Tus datos se han actualizado correctamente.");
            } else {
                modalAPI.current?.show(false, "Hubo un problema al actualizar tus datos. Inténtalo de nuevo más tarde.");
            }
        } catch (error) {
            modalAPI.current?.show(false, "Error al conectar con el servidor. Inténtalo de nuevo más tarde.");
        }
    };

    const {
        control: controlContraseña,
        handleSubmit: handleContraseña,
        reset: resetContraseña,
        formState: { errors: errorsContraseña, isSubmitting: enviandoContraseña },
    } = useForm<CambiarContraseñaFormulario>({
        resolver: zodResolver(cambiarContraseñaEsquema),
    });

    const onSubmitContraseña = async (datos: CambiarContraseñaFormulario) => {
        verificarToken();

        try {
            const response = await postData('users/restablecerPassword', {
                password: datos.contraseña,
                tk: sesion?.token,
            });

            if (response.error === 0) {
                setVista(1);
                modalAPI.current?.show(true, "Tu contraseña se ha cambiado correctamente.");
            } else {
                modalAPI.current?.show(false, "Hubo un problema al actualizar tu contraseña. Inténtalo de nuevo más tarde.");
            }
        } catch (error) {
            modalAPI.current?.show(false, "Error al conectar con el servidor. Inténtalo de nuevo más tarde.");
        }
    };

    useEffect(() => {
        if (Object.keys(errorsPerfil).length > 0) {
            modalAPI.current?.show(false, "Algunos campos contienen errores. Revísalos y vuelve a intentarlo.");
        }
    }, [errorsPerfil]);

    useEffect(() => {
        if (Object.keys(errorsContraseña).length > 0) {
            modalAPI.current?.show(false, "Algunos campos contienen errores. Revísalos y vuelve a intentarlo.");
        }
    }, [errorsContraseña]);

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "web" ? undefined : "padding"} keyboardVerticalOffset={80} >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View
                    style={[
                        styles.contenedorFormulario,
                        esPantallaPequeña && { maxWidth: "95%" },
                        vista === 3 && { marginTop: 100 }
                    ]}
                >
                    {vista === 1 && (
                        <>
                            <Text style={styles.titulo}>Perfil</Text>

                            <View style={{ marginBottom: 15 }} >
                                <Entrada label="Nombre" value={datosAlumno?.nombre || ""} editable={false} />
                            </View>

                            <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                                <View style={{ flex: 1, marginBottom: 15 }}>
                                    <Entrada label="Apellido Paterno" value={datosAlumno?.apellido_paterno || ""} editable={false} />
                                </View>
                                <View style={{ flex: 1, marginBottom: 15 }}>
                                    <Entrada label="Apellido Materno" value={datosAlumno?.apellido_materno || ""} editable={false} />
                                </View>
                            </View>

                            <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                                <View style={{ flex: 1, marginBottom: 15 }}>
                                    <Entrada label="CURP" value={datosAlumno?.curp || ""} editable={false} />
                                </View>
                                <View style={{ flex: 1, marginBottom: 15 }}>
                                    <Entrada label="RFC" value={datosAlumno?.rfc || ""} editable={false} />
                                </View>
                            </View>

                            <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                                <View style={{ flex: 1, marginBottom: 15 }}>
                                    <Entrada label="Boleta" value={datosAlumno?.boleta || ""} keyboardType="numeric" editable={false} />
                                </View>
                                <View style={{ flex: 1, marginBottom: 15 }}>
                                    <Entrada label="Carrera" value={datosAlumno?.carrera || ""} editable={false} />
                                </View>
                            </View>

                            <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                                <View style={{ flex: 1, marginBottom: 15 }}>
                                    <Entrada label="Generación" value={datosAlumno?.generacion || ""} editable={false} />
                                </View>
                                <View style={{ flex: 1, marginBottom: 15 }}>
                                    <Entrada label="Promedio" value={datosAlumno?.promedio || ""} keyboardType="decimal-pad" editable={false} />
                                </View>
                            </View>

                            <View style={{ marginBottom: 15 }}>
                                <Entrada
                                    label="Correo Electrónico Institucional"
                                    value={datosAlumno?.correo || ""}
                                    keyboardType="email-address"
                                    editable={false}
                                />
                            </View>

                            <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                                <View style={{ flex: 1, marginBottom: 15 }}>
                                    <Entrada label="Calle y Número" value={datosAlumno?.calle_y_numero || ""} editable={false} />
                                </View>
                                <View style={{ flex: 1, marginBottom: 15 }}>
                                    <Entrada label="Colonia" value={datosAlumno?.colonia || ""} editable={false} />
                                </View>
                            </View>

                            <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                                <View style={{ flex: 1, marginBottom: 15 }}>
                                    <Entrada label="Delegación / Municipio" value={datosAlumno?.delegacion || ""} editable={false} />
                                </View>
                                <View style={{ flex: 1, marginBottom: 15 }}>
                                    <Entrada label="Estado de Procedencia" value={datosAlumno?.estado || ""} editable={false} />
                                </View>
                            </View>

                            <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                                <View style={{ flex: 1, marginBottom: 15 }}>
                                    <Entrada label="Código Postal" value={datosAlumno?.cp || ""} keyboardType="numeric" editable={false} />
                                </View>
                                <View style={{ flex: 1, marginBottom: 15 }}>
                                    <Selector
                                        label="Sexo"
                                        selectedValue={datosAlumno ? (datosAlumno.sexo === "F" ? "Femenino" : "Masculino") : ""}
                                        items={[
                                            { label: "Masculino", value: "M" },
                                            { label: "Femenino", value: "F" },
                                        ]}
                                        onValueChange={() => { }}
                                    />
                                </View>
                            </View>

                            <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                                <View style={{ flex: 1, marginBottom: 15 }}>
                                    <Entrada label="Teléfono Celular" value={datosAlumno?.telcelular || ""} keyboardType="phone-pad" editable={false} />
                                </View>
                                <View style={{ flex: 1, marginBottom: 25 }}>
                                    <Entrada label="Teléfono Local" value={datosAlumno?.tellocal || ""} keyboardType="phone-pad" editable={false} />
                                </View>
                            </View>
                            {datosAlumno &&
                                <View style={{ flexDirection: "row", gap: 12 }}>
                                    <View style={{ flex: 1 }}>
                                        <Boton title="Modificar datos" onPress={() => setVista(2)} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Boton title="Cambiar contraseña" onPress={() => setVista(3)} />
                                    </View>
                                </View>
                            }
                        </>
                    )}
                    {vista === 2 && (
                        <>
                            <Text style={styles.titulo}>Modificar datos</Text>

                            <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                                <View style={{ flex: 1, marginBottom: esPantallaPequeña && errorsPerfil.calle && !errorsPerfil.colonia ? 30 : 15 }}>
                                    <Controller
                                        control={controlPerfil}
                                        name="calle"
                                        defaultValue={datosAlumno?.calle_y_numero || ""}
                                        render={({ field }) => (
                                            <Entrada
                                                label="Calle y Número"
                                                {...field}
                                                error={errorsPerfil.calle?.message}
                                            />
                                        )}
                                    />
                                </View>
                                <View style={{ flex: 1, marginBottom: esPantallaPequeña && errorsPerfil.colonia && !errorsPerfil.delegacion ? 30 : 15 }}>
                                    <Controller
                                        control={controlPerfil}
                                        name="colonia"
                                        defaultValue={datosAlumno?.colonia || ""}
                                        render={({ field }) => (
                                            <Entrada
                                                label="Colonia"
                                                {...field}
                                                error={errorsPerfil.colonia?.message}
                                            />
                                        )}
                                    />
                                </View>
                            </View>
                            <View
                                style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}
                            >
                                <View style={{ flex: 1, marginBottom: esPantallaPequeña && errorsPerfil.delegacion && !errorsPerfil.estado ? 30 : 15 }}>
                                    <Controller
                                        control={controlPerfil}
                                        name="delegacion"
                                        defaultValue={datosAlumno?.delegacion || ""}
                                        render={({ field }) => (
                                            <Entrada
                                                label="Delegación / Municipio"
                                                {...field}
                                                error={errorsPerfil.delegacion?.message}
                                            />
                                        )}
                                    />
                                </View>
                                <View style={{ flex: 1, marginBottom: esPantallaPequeña && errorsPerfil.estado && !errorsPerfil.cp ? 30 : 15 }}>
                                    <Controller
                                        control={controlPerfil}
                                        name="estado"
                                        defaultValue={datosAlumno?.estado || ""}
                                        render={({ field }) => (
                                            <Entrada
                                                label="Estado de Procedencia"
                                                {...field}
                                                error={errorsPerfil.estado?.message}
                                            />
                                        )}
                                    />
                                </View>
                            </View>
                            <View
                                style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}
                            >
                                <View style={{ flex: 1, marginBottom: esPantallaPequeña && errorsPerfil.cp ? 30 : 15 }}>
                                    <Controller
                                        control={controlPerfil}
                                        name="cp"
                                        defaultValue={datosAlumno?.cp || ""}
                                        render={({ field }) => (
                                            <Entrada
                                                label="Código Postal"
                                                keyboardType="numeric"
                                                {...field}
                                                error={errorsPerfil.cp?.message}
                                            />
                                        )}
                                    />
                                </View>
                                <View style={{ flex: 1, marginBottom: esPantallaPequeña && !errorsPerfil.telcelular ? 15 : 20 }}>
                                    <Controller
                                        control={controlPerfil}
                                        name="sexo"
                                        defaultValue={datosAlumno?.sexo || ""}
                                        render={({ field: { onChange, value } }) => (
                                            <Selector
                                                label="Sexo"
                                                selectedValue={value === "F" ? "Femenino" : value === "M" ? "Masculino" : ""}
                                                onValueChange={(val) => onChange(val)}
                                                items={[
                                                    { label: "Masculino", value: "M" },
                                                    { label: "Femenino", value: "F" },
                                                ]}
                                                error={errorsPerfil.sexo?.message}
                                            />
                                        )}
                                    />
                                </View>
                            </View>
                            <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                                <View style={{ flex: 1, marginBottom: esPantallaPequeña && errorsPerfil.telcelular && !errorsPerfil.tellocal ? 30 : 15  }}>
                                    <Controller
                                        control={controlPerfil}
                                        name="telcelular"
                                        defaultValue={datosAlumno?.telcelular || ""}
                                        render={({ field }) => (
                                            <Entrada
                                                label="Teléfono Celular"
                                                keyboardType="phone-pad"
                                                {...field}
                                                error={errorsPerfil.telcelular?.message}
                                            />
                                        )}
                                    />
                                </View>
                                <View style={{ flex: 1, marginBottom: 30 }}>
                                    <Controller
                                        control={controlPerfil}
                                        name="tellocal"
                                        defaultValue={datosAlumno?.tellocal || ""}
                                        render={({ field }) => (
                                            <Entrada
                                                label="Teléfono Local"
                                                keyboardType="phone-pad"
                                                {...field}
                                                error={errorsPerfil.tellocal?.message}
                                            />
                                        )}
                                    />
                                </View>
                            </View>

                            <View style={{ flexDirection: "row", gap: 12 }}>
                                <View style={{ flex: 1 }}>
                                    <Boton title="Regresar" onPress={() => { resetPerfil(); setVista(1) }} disabled={enviandoPerfil} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Boton
                                        title={enviandoPerfil ? "Guardando…" : "Guardar cambios"}
                                        onPress={handlePerfil(onSubmitPerfil)}
                                        disabled={enviandoPerfil}
                                    />
                                </View>
                            </View>
                        </>
                    )}

                    {vista === 3 && (
                        <>
                            <Text style={styles.titulo}>Cambiar contraseña</Text>

                            <View style={{ marginBottom: 15 }}>
                                <Controller
                                    control={controlContraseña}
                                    name="contraseña"
                                    defaultValue=""
                                    render={({ field: { onChange, value } }) => (
                                        <Entrada
                                            label="Nueva Contraseña"
                                            secureTextEntry
                                            value={value}
                                            onChangeText={onChange}
                                            error={errorsContraseña.contraseña?.message}
                                        />
                                    )}
                                />
                            </View>

                            <View style={{ marginBottom: 25 }}>
                                <Controller
                                    control={controlContraseña}
                                    name="confirmarContraseña"
                                    defaultValue=""
                                    render={({ field: { onChange, value } }) => (
                                        <Entrada
                                            label="Confirmar Contraseña"
                                            secureTextEntry
                                            value={value}
                                            onChangeText={onChange}
                                            error={errorsContraseña.confirmarContraseña?.message}
                                        />
                                    )}
                                />
                            </View>

                            <View style={{ flexDirection: "row", gap: 12 }}>
                                <View style={{ flex: 1 }}>
                                    <Boton title="Regresar" onPress={() => { resetContraseña(); setVista(1) }} disabled={enviandoContraseña} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Boton
                                        title={enviandoContraseña ? "Guardando…" : "Guardar contraseña"}
                                        onPress={handleContraseña(onSubmitContraseña)}
                                        disabled={enviandoContraseña}
                                    />
                                </View>
                            </View>
                        </>
                    )}
                    <ModalAPI ref={modalAPI} />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    contenedorFormulario: {
        width: "90%",
        maxWidth: 800,
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
        textAlign: "center",
        marginBottom: 24,
        color: Colores.textoPrincipal,
    },
});
