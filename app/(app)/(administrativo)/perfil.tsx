import ModalAPI, { ModalAPIRef } from "@/componentes/layout/ModalAPI";
import PiePagina from "@/componentes/layout/PiePagina";
import Boton from "@/componentes/ui/Boton";
import Entrada from "@/componentes/ui/Entrada";
import Selector from "@/componentes/ui/Selector";
import { useAuth } from "@/context/AuthProvider";
import {
    cambiarContraseñaEsquema, modificarPerfilAdminEsquema,
    type CambiarContraseñaFormulario, type ModificarPerfilAdminFormulario
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

    const modalAPI = useRef<ModalAPIRef>(null);

    const [datosAdministrativo, setDatosAdministrativo] = useState<any>(null);
    const [vista, setVista] = useState<1 | 2 | 3>(1);

    const { width } = useWindowDimensions();
    const esPantallaPequeña = width < 600;

    useEffect(() => {
        const obtenerDatos = async () => {
            verificarToken();

            if (sesion?.token) {
                try {
                    setCargando(true);

                    const response = await fetchData(`users/obtenerTodosDatosAdmin?tk=${sesion.token}`);
                    if (response.error === 0) {
                        setDatosAdministrativo(response.data);
                    } else {
                        modalAPI.current?.show(false, "Hubo un problema al obtener tus datos del servidor. Inténtalo de nuevo más tarde.", () => { router.replace("/inicio-administrativo"); });
                    }
                } catch (error) {
                    modalAPI.current?.show(false, "Error al conectar con el servidor. Inténtalo de nuevo más tarde.", () => { router.replace("/inicio-administrativo"); });
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
    } = useForm<ModificarPerfilAdminFormulario>({
        resolver: zodResolver(modificarPerfilAdminEsquema),
    });

    const onSubmitPerfil = async (data: ModificarPerfilAdminFormulario) => {
        verificarToken();

        try {
            const payload = {
                data,
                tk: sesion.token
            };
            const response = await postData('users/modificarDatos', payload);

            if (response.error === 0) {
                modalAPI.current?.show(true, "Tus datos se han actualizado correctamente.");
                setVista(1);
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
                tk: sesion.token,
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
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "web" ? undefined : "padding"} keyboardVerticalOffset={80} >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <View style={{ flex: 1 }}>
                        <View style={[styles.contenedorFormulario, esPantallaPequeña && { maxWidth: "95%" }, vista != 1 && { marginTop: 100 }]}>
                            {vista === 1 && (
                                <>
                                    <Text allowFontScaling={false} style={styles.titulo}>Mi perfil</Text>

                                    <View style={{ marginBottom: 15 }}>
                                        <Entrada label="Nombre" value={datosAdministrativo?.nombre || ""} editable={false} />
                                    </View>

                                    <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                                        <View style={{ flex: 1, marginBottom: 0 }}>
                                            <Entrada label="Apellido paterno" value={datosAdministrativo?.apellido_paterno || ""} editable={false} />
                                        </View>
                                        <View style={{ flex: 1, marginBottom: 0 }}>
                                            <Entrada label="Apellido materno" value={datosAdministrativo?.apellido_materno || ""} editable={false} />
                                        </View>
                                    </View>

                                    <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                                        <View style={{ flex: 1, marginBottom: 0 }}>
                                            <Entrada label="CURP" value={datosAdministrativo?.curp || ""} maxLength={18} editable={false} />
                                        </View>
                                        <View style={{ flex: 1, marginBottom: 0 }}>
                                            <Selector
                                                label="Sexo"
                                                selectedValue={datosAdministrativo ? (datosAdministrativo.sexo === "F" ? "Femenino" : "Masculino") : ""}
                                                items={[
                                                    { label: "Masculino", value: "M" },
                                                    { label: "Femenino", value: "F" },
                                                ]}
                                                onValueChange={() => { }}
                                                editable={false}
                                            />
                                        </View>
                                    </View>

                                    <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                                        <View style={{ flex: 1, marginBottom: 0 }}>
                                            <Entrada label="Número de empleado" value={datosAdministrativo?.numempleado || ""} keyboardType="numeric" editable={false} />
                                        </View>
                                        <View style={{ flex: 1, marginBottom: 0 }}>
                                            <Entrada label="Perfil" value={datosAdministrativo ? (datosAdministrativo.perfil === "1" ? "Administrador de seguimiento" : "Administrador general") : ""} editable={false} />
                                        </View>
                                    </View>

                                    <View style={{ marginBottom: 15 }}>
                                        <Entrada
                                            label="Correo electrónico institucional"
                                            value={datosAdministrativo?.correo || ""}
                                            keyboardType="email-address"
                                            editable={false}
                                        />
                                    </View>

                                    <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                                        <View style={{ flex: 1, marginBottom: 0 }}>
                                            <Entrada label="Celular" value={datosAdministrativo?.telcelular || ""} keyboardType="phone-pad" maxLength={10} editable={false} />
                                        </View>
                                        <View style={{ flex: 1, marginBottom: 25 }}>
                                            <Entrada label="Teléfono local" value={datosAdministrativo?.tellocal || ""} keyboardType="phone-pad" maxLength={10} editable={false} />
                                        </View>
                                    </View>

                                    {datosAdministrativo &&
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
                                    <View style={{ marginBottom: 15 }}>
                                        <Controller
                                            control={controlPerfil}
                                            name="sexo"
                                            defaultValue={datosAdministrativo?.sexo || ""}
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
                                    <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                                        <View style={{ flex: 1, marginBottom: errorsPerfil.telcelular && !errorsPerfil.tellocal ? 15 : 5 }}>
                                            <Controller
                                                control={controlPerfil}
                                                name="telcelular"
                                                defaultValue={datosAdministrativo?.telcelular || ""}
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
                                        <View style={{ flex: 1, marginBottom: 25 }}>
                                            <Controller
                                                control={controlPerfil}
                                                name="tellocal"
                                                defaultValue={datosAdministrativo?.tellocal}
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
                                    <Text allowFontScaling={false} style={{ fontSize: Fuentes.cuerpo, color: Colores.textoPrincipal, marginBottom: 20 }}>
                                        Ingresa una nueva contraseña de 8 a 12 caracteres, que incluya al menos una letra mayúscula, una letra minúscula y un número.
                                    </Text>
                                    <View style={{ marginBottom: 15 }}>
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

                                    <View style={{ marginBottom: 25 }}>
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
    row: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 15,
    },
});
