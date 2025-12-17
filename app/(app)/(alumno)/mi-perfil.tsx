import ModalAPI, { ModalAPIRef } from "@/componentes/layout/ModalAPI";
import PiePagina from "@/componentes/layout/PiePagina";
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
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

export default function MiPerfil() {
    const { sesion, verificarToken } = useAuth();
    const router = useRouter();

    const [cargando, setCargando] = useState(false);

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
                    setCargando(true);

                    const response = await fetchData(`users/obtenerTodosDatosAlumno?tk=${sesion.token}`);
                    if (response.error === 0) {
                        setDatosAlumno(response.data);
                    } else {
                        modalAPI.current?.show(false, "Hubo un problema al obtener tus datos del servidor. Inténtalo de nuevo más tarde.", () => { router.replace("/inicio-alumno"); });
                    }
                } catch (error) {
                    modalAPI.current?.show(false, "Error al conectar con el servidor. Inténtalo de nuevo más tarde.", () => { router.replace("/inicio-alumno"); });
                } finally {
                    setCargando(false);
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
            const response = await postData('users/restablecerPasswordLogin', {
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
        <>
            {cargando && (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white", position: "absolute", top: 60, left: 0, right: 0, bottom: 0, zIndex: 100 }}>
                    <ActivityIndicator size="large" color="#5a0839" />
                </View>
            )}
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "web" ? undefined : "padding"} keyboardVerticalOffset={5} >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <View style={{ flex: 1 }}>
                        <View
                            style={[
                                styles.contenedorFormulario,
                                esPantallaPequeña && { maxWidth: "95%" },
                                vista === 3 && { marginTop: 100 }
                            ]}
                        >
                            {vista === 1 && (
                                <>
                                    <Text allowFontScaling={false} style={styles.titulo}>Mi perfil</Text>

                                    <View style={{ marginBottom: 20 }} >
                                        <Entrada label="Nombre" value={datosAlumno?.nombre || ""} editable={false} />
                                    </View>

                                    <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                                        <View style={{ flex: 1, marginBottom: 20 }}>
                                            <Entrada label="Apellido paterno" value={datosAlumno?.apellido_paterno || ""} editable={false} />
                                        </View>
                                        <View style={{ flex: 1, marginBottom: 20 }}>
                                            <Entrada label="Apellido materno" value={datosAlumno?.apellido_materno || ""} editable={false} />
                                        </View>
                                    </View>

                                    <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                                        <View style={{ flex: 1, marginBottom: 20 }}>
                                            <Entrada label="CURP" maxLength={18} value={datosAlumno?.curp || ""} editable={false} />
                                        </View>
                                        <View style={{ flex: 1, marginBottom: 20 }}>
                                            <Entrada label="RFC" value={datosAlumno?.rfc || ""} editable={false} />
                                        </View>
                                    </View>

                                    <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                                        <View style={{ flex: 1, marginBottom: 20 }}>
                                            <Entrada label="Boleta" value={datosAlumno?.boleta || ""} keyboardType="numeric" maxLength={10} editable={false} />
                                        </View>
                                        <View style={{ flex: 1, marginBottom: 20 }}>
                                            <Entrada label="Carrera" value={datosAlumno?.carrera || ""} editable={false} />
                                        </View>
                                    </View>

                                    <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                                        <View style={{ flex: 1, marginBottom: 20 }}>
                                            <Entrada label="Generación" value={datosAlumno?.generacion || ""} editable={false} />
                                        </View>
                                        <View style={{ flex: 1, marginBottom: 20 }}>
                                            <Entrada label="Promedio" value={datosAlumno?.promedio || ""} keyboardType="decimal-pad" editable={false} />
                                        </View>
                                    </View>

                                    <View style={{ marginBottom: 20 }}>
                                        <Entrada
                                            label="Correo electrónico institucional"
                                            value={datosAlumno?.correo || ""}
                                            keyboardType="email-address"
                                            editable={false}
                                        />
                                    </View>

                                    <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                                        <View style={{ flex: 1, marginBottom: 20 }}>
                                            <Entrada label="Calle y número" value={datosAlumno?.calle_y_numero || ""} editable={false} />
                                        </View>
                                        <View style={{ flex: 1, marginBottom: 20 }}>
                                            <Entrada label="Colonia" value={datosAlumno?.colonia || ""} editable={false} />
                                        </View>
                                    </View>

                                    <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                                        <View style={{ flex: 1, marginBottom: 20 }}>
                                            <Entrada label="Delegación / municipio" value={datosAlumno?.delegacion || ""} editable={false} />
                                        </View>
                                        <View style={{ flex: 1, marginBottom: 20 }}>
                                            <Entrada label="Estado de procedencia" value={datosAlumno?.estado || ""} editable={false} />
                                        </View>
                                    </View>

                                    <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                                        <View style={{ flex: 1, marginBottom: 20 }}>
                                            <Entrada label="Código postal" value={datosAlumno?.cp || ""} keyboardType="numeric" editable={false} />
                                        </View>
                                        <View style={{ flex: 1, marginBottom: 20 }}>
                                            <Selector
                                                label="Sexo"
                                                selectedValue={datosAlumno ? (datosAlumno.sexo === "F" ? "Femenino" : "Masculino") : ""}
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
                                        <View style={{ flex: 1, marginBottom: 20 }}>
                                            <Entrada label="Celular" value={datosAlumno?.telcelular || ""} keyboardType="phone-pad" maxLength={10} editable={false} />
                                        </View>
                                        <View style={{ flex: 1, marginBottom: 25 }}>
                                            <Entrada label="Teléfono local" value={datosAlumno?.tellocal || ""} keyboardType="phone-pad" maxLength={10} editable={false} />
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
                                    <Text allowFontScaling={false} style={styles.titulo}>Modificar datos</Text>
                                    <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                                        <View style={[!esPantallaPequeña && { flex: 1 }, { marginBottom: errorsPerfil.calle ? 5 : 20 }]}>
                                            <Controller
                                                control={controlPerfil}
                                                name="calle"
                                                defaultValue={datosAlumno?.calle_y_numero || ""}
                                                render={({ field: { onChange, value } }) => (
                                                    <Entrada
                                                        label="Calle y número"
                                                        value={value}
                                                        onChangeText={onChange}
                                                        maxLength={45}
                                                        error={errorsPerfil.calle?.message}
                                                    />
                                                )}
                                            />
                                        </View>
                                        <View style={[!esPantallaPequeña && { flex: 1 }, { marginBottom: errorsPerfil.colonia ? 5 : 20 }]}>
                                            <Controller
                                                control={controlPerfil}
                                                name="colonia"
                                                defaultValue={datosAlumno?.colonia || ""}
                                                render={({ field: { onChange, value } }) => (
                                                    <Entrada
                                                        label="Colonia"
                                                        value={value}
                                                        onChangeText={onChange}
                                                        maxLength={45}
                                                        error={errorsPerfil.colonia?.message}
                                                    />
                                                )}
                                            />
                                        </View>
                                    </View>
                                    <View
                                        style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}
                                    >
                                        <View style={[!esPantallaPequeña && { flex: 1 }, { marginBottom: errorsPerfil.delegacion ? 5 : 20 }]}>
                                            <Controller
                                                control={controlPerfil}
                                                name="delegacion"
                                                defaultValue={datosAlumno?.delegacion || ""}
                                                render={({ field: { onChange, value } }) => (
                                                    <Entrada
                                                        label="Delegación / municipio"
                                                        value={value}
                                                        onChangeText={onChange}
                                                        maxLength={45}
                                                        error={errorsPerfil.delegacion?.message}
                                                    />
                                                )}
                                            />
                                        </View>
                                        <View style={[!esPantallaPequeña && { flex: 1 }, { marginBottom: errorsPerfil.estado ? 5 : 20 }]}>
                                            <Controller
                                                control={controlPerfil}
                                                name="estado"
                                                defaultValue={datosAlumno?.estado || ""}
                                                render={({ field: { onChange, value } }) => (
                                                    <Entrada
                                                        label="Estado de procedencia"
                                                        value={value}
                                                        onChangeText={onChange}
                                                        maxLength={45}
                                                        error={errorsPerfil.estado?.message}
                                                    />
                                                )}
                                            />
                                        </View>
                                    </View>
                                    <View
                                        style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}
                                    >
                                        <View style={[!esPantallaPequeña && { flex: 1 }, { marginBottom: errorsPerfil.cp ? 5 : 20 }]}>
                                            <Controller
                                                control={controlPerfil}
                                                name="cp"
                                                defaultValue={datosAlumno?.cp || ""}
                                                render={({ field: { onChange, value } }) => (
                                                    <Entrada
                                                        label="Código postal"
                                                        keyboardType="numeric"
                                                        maxLength={5}
                                                        value={value}
                                                        onChangeText={(text) => {
                                                            const digitos = text.replace(/[^0-9]/g, "");
                                                            onChange(digitos);
                                                        }}
                                                        error={errorsPerfil.cp?.message}
                                                    />
                                                )}
                                            />
                                        </View>
                                        <View style={[!esPantallaPequeña && { flex: 1 }, { marginBottom: errorsPerfil.sexo ? 5 : 20 }]}>
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
                                        <View style={[!esPantallaPequeña && { flex: 1 }, { marginBottom: errorsPerfil.telcelular ? 5 : 20 }]}>
                                            <Controller
                                                control={controlPerfil}
                                                name="telcelular"
                                                defaultValue={datosAlumno?.telcelular || ""}
                                                render={({ field: { onChange, value } }) => (
                                                    <Entrada
                                                        label="Celular"
                                                        keyboardType="phone-pad"
                                                        maxLength={10}
                                                        value={value}
                                                        onChangeText={(text) => {
                                                            const digitos = text.replace(/[^0-9]/g, "");
                                                            onChange(digitos);
                                                        }}
                                                        error={errorsPerfil.telcelular?.message}
                                                    />
                                                )}
                                            />
                                        </View>
                                        <View style={[!esPantallaPequeña && { flex: 1 }, { marginBottom: errorsPerfil.tellocal ? 5 : 25 }]}>
                                            <Controller
                                                control={controlPerfil}
                                                name="tellocal"
                                                defaultValue={datosAlumno?.tellocal || ""}
                                                render={({ field: { onChange, value } }) => (
                                                    <Entrada
                                                        label="Teléfono local"
                                                        keyboardType="phone-pad"
                                                        maxLength={10}
                                                        value={value}
                                                        onChangeText={(text) => {
                                                            const digitos = text.replace(/[^0-9]/g, "");
                                                            onChange(digitos);
                                                        }}
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
                                    <Text allowFontScaling={false} style={styles.titulo}>Cambiar contraseña</Text>
                                    <Text allowFontScaling={false} style={{ fontSize: Fuentes.cuerpo, color: Colores.textoPrincipal, textAlign: "center", marginBottom: 20 }}>
                                        Ingresa una nueva contraseña de 8 a 12 caracteres, que incluya al menos una letra mayúscula, una letra minúscula y un número.
                                    </Text>
                                    <View style={{ marginBottom: errorsContraseña.contraseña ? 5 : 20 }}>
                                        <Controller
                                            control={controlContraseña}
                                            name="contraseña"
                                            defaultValue=""
                                            render={({ field: { onChange, value } }) => (
                                                <Entrada
                                                    label="Nueva contraseña"
                                                    secureTextEntry
                                                    value={value}
                                                    maxLength={12}
                                                    onChangeText={onChange}
                                                    error={errorsContraseña.contraseña?.message}
                                                />
                                            )}
                                        />
                                    </View>

                                    <View style={{ marginBottom: errorsContraseña.confirmarContraseña ? 10 : 25 }}>
                                        <Controller
                                            control={controlContraseña}
                                            name="confirmarContraseña"
                                            defaultValue=""
                                            render={({ field: { onChange, value } }) => (
                                                <Entrada
                                                    label="Confirmar contraseña"
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
                        </View>
                    </View>
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
