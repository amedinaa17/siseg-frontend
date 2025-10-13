import Modal from "@/componentes/layout/Modal";
import Boton from "@/componentes/ui/Boton";
import Entrada from "@/componentes/ui/Entrada";
import { useAuth } from "@/context/AuthProvider";
import {
    cambiarContraseñaEsquema, modificarPerfilAdminEsquema,
    type CambiarContraseñaFormulario, type ModificarPerfilAdminFormulario
} from "@/lib/validacion";
import { fetchData, postData } from "@/servicios/api";
import { Colores, Fuentes } from '@/temas/colores';
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

export default function MiPerfil() {
    const { sesion, verificarToken } = useAuth();
    const [datosAdministrativo, setDatosAdministrativo] = useState<any>(null);

    const [modalVisible, setModalVisible] = useState(false);
    const [modalMensaje, setModalMensaje] = useState('');
    const [modalTipo, setModalTipo] = useState(false);
    const [vista, setVista] = useState<"perfil" | "modificar" | "contraseña">("perfil");

    const { width } = useWindowDimensions();
    const esPantallaPequeña = width < 600;

    useEffect(() => {
        const obtenerDatos = async () => {
            if (sesion?.token) {
                try {
                    const response = await fetchData(`users/obtenerTodosDatosAdmin?tk=${sesion.token}`);
                    if (response.error === 0) {
                        setDatosAdministrativo(response.data);
                    } else {
                        setModalTipo(false);
                        setModalMensaje("Hubo un error al obtener tus datos del servidor. Intentalo de nuevo más tarde.")
                        setModalVisible(true)
                    }
                } catch (error) {
                    setModalTipo(false);
                    setModalMensaje("Hubo un error al conectar con el servidor. Intentalo de nuevo más tarde.")
                    setModalVisible(true)
                }
            }
        };

        obtenerDatos();
    }, [sesion, vista]);

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
                telcelular: data.telefonoCelular,
                tellocal: data.telefonoLocal,
                tk: sesion?.token
            };
            const response = await postData('users/modificarDatos', payload);

            if (response.error === 0) {
                setVista("perfil");
                setModalTipo(true)
                setModalMensaje('Tus datos se han actualizado correctamente.');
                setModalVisible(true);
            } else {
                setModalTipo(false)
                setModalMensaje('Hubo un problema al intentar actualizar tus datos.');
                setModalVisible(true);
            }
        } catch (error) {
            setModalTipo(false)
            setModalMensaje('Error al conectar con el servidor. Intentalo de nuevo más tarde.');
            setModalVisible(true);
        }
    };

    const {
        control: controlContraseña,
        handleSubmit: handleContraseña,
        reset: resetContraseña,
        formState: { errors: errorsContraseña, isSubmitting: enviandoContraseña },
    } = useForm<CambiarContraseñaFormulario>({
        resolver: zodResolver(cambiarContraseñaEsquema),
        defaultValues: { contraseña: "", confirmarContraseña: "" },
    });

    const onSubmitContraseña = async (datos: CambiarContraseñaFormulario) => {
        verificarToken();

        try {
            const response = await postData('users/restablecerPassword', {
                password: datos.contraseña,
                tk: sesion?.token,
            });

            if (response.error === 0) {
                setVista("perfil");
                setModalTipo(true)
                setModalMensaje('Tu contraseña se ha cambiado correctamente.');
                setModalVisible(true);
            } else {
                setModalTipo(false)
                setModalMensaje('Hubo un problema al intentar actualizar tu contraseña.');
                setModalVisible(true);
            }
        } catch (error) {
            setModalTipo(false)
            setModalMensaje('Error al conectar con el servidor. Intentalo de nuevo más tarde.');
            setModalVisible(true);
        }
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "web" ? undefined : "padding"} keyboardVerticalOffset={80} >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={[styles.contenedorFormulario, esPantallaPequeña && { maxWidth: "95%" }, vista != "perfil" && { marginTop: 100 }]}>
                    {vista === "perfil" && (
                        <>
                            <Text style={styles.titulo}>Mi Perfil</Text>

                            <View style={{ marginBottom: 15, pointerEvents: "none" }}>
                                <Entrada label="Nombre" value={datosAdministrativo?.nombre} editable={false} />
                            </View>

                            <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                                <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                    <Entrada label="Apellido Paterno" value={datosAdministrativo?.apellido_paterno} editable={false} />
                                </View>
                                <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                    <Entrada label="Apellido Materno" value={datosAdministrativo?.apellido_materno} editable={false} />
                                </View>
                            </View>

                            <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                                <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                    <Entrada label="CURP" value={datosAdministrativo?.curp} editable={false} />
                                </View>
                                <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                    <Entrada label="Perfil" value={datosAdministrativo?.perfil} editable={false} />
                                </View>
                            </View>

                            <View style={{ marginBottom: 15, pointerEvents: "none" }}>
                                <Entrada label="Número de Empleado" value={datosAdministrativo?.numempleado} keyboardType="numeric" editable={false} />
                            </View>

                            <View style={{ marginBottom: 15, pointerEvents: "none" }}>
                                <Entrada
                                    label="Correo Electrónico Institucional"
                                    value={datosAdministrativo?.correo}
                                    keyboardType="email-address"
                                    editable={false}
                                />
                            </View>

                            <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                                <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                    <Entrada label="Teléfono Celular" value={datosAdministrativo?.telcelular} keyboardType="phone-pad" editable={false} />
                                </View>
                                <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                    <Entrada label="Teléfono Local" value={datosAdministrativo?.tellocal} keyboardType="phone-pad" editable={false} />
                                </View>
                            </View>

                            {datosAdministrativo &&
                                <View style={{ flexDirection: "row", gap: 12 }}>
                                    <View style={{ flex: 1 }}>
                                        <Boton title="Modificar Datos" onPress={() => setVista("modificar")} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Boton title="Cambiar Contraseña" onPress={() => setVista("contraseña")} />
                                    </View>
                                </View>
                            }
                        </>
                    )}
                    {vista === "modificar" && (
                        <>
                            <Text style={styles.titulo}>Modificar Datos</Text>
                            <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                                <View style={{ flex: 1, marginBottom: 5 }}>
                                    <Controller
                                        control={controlPerfil}
                                        name="telefonoCelular"
                                        defaultValue={datosAdministrativo?.telcelular}
                                        render={({ field }) => (
                                            <Entrada
                                                label="Teléfono Celular"
                                                keyboardType="phone-pad"
                                                {...field}
                                                error={errorsPerfil.telefonoCelular?.message}
                                            />
                                        )}
                                    />
                                </View>
                                <View style={{ flex: 1, marginBottom: 25 }}>
                                    <Controller
                                        control={controlPerfil}
                                        name="telefonoLocal"
                                        defaultValue={datosAdministrativo?.tellocal}
                                        render={({ field }) => (
                                            <Entrada
                                                label="Teléfono Local"
                                                keyboardType="phone-pad"
                                                {...field}
                                                error={errorsPerfil.telefonoLocal?.message}
                                            />
                                        )}
                                    />
                                </View>
                            </View>

                            <View style={{ flexDirection: "row", gap: 12 }}>
                                <View style={{ flex: 1 }}>
                                    <Boton title="Regresar" onPress={() => { resetPerfil(); setVista("perfil") }} disabled={enviandoPerfil} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Boton
                                        title={enviandoPerfil ? "Guardando…" : "Guardar Cambios"}
                                        onPress={handlePerfil(onSubmitPerfil)}
                                    />
                                </View>
                            </View>
                        </>
                    )}

                    {vista === "contraseña" && (
                        <>
                            <Text style={styles.titulo}>Cambiar Contraseña</Text>

                            <View style={{ marginBottom: 15 }}>
                                <Controller
                                    control={controlContraseña}
                                    name="contraseña"
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
                                    <Boton title="Regresar" onPress={() => { resetContraseña(); setVista("perfil") }} disabled={enviandoContraseña} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Boton
                                        title={enviandoContraseña ? "Guardando…" : "Guardar Contraseña"}
                                        onPress={handleContraseña(onSubmitContraseña)}
                                    />
                                </View>
                            </View>
                        </>
                    )}
                    <Modal
                        visible={modalVisible}
                        titulo={modalTipo ? "" : ""}
                        cerrar={false}
                        onClose={() => setModalVisible(false)}
                    >
                        <View style={{ alignItems: "center" }}>
                            <Ionicons
                                name={modalTipo ? "checkmark-circle-outline" : "close-circle-outline"}
                                size={80}
                                color={modalTipo ? Colores.textoExito : Colores.textoError}
                            />
                            <Text style={{ fontSize: Fuentes.cuerpo, color: Colores.textoClaro, marginBottom: 8 }}>
                                {modalTipo ? "¡Todo Listo!" : "¡Algo Salió Mal!"}
                            </Text>
                            <Text style={{ fontSize: Fuentes.cuerpo, color: Colores.textoPrincipal, marginBottom: 8, textAlign: "center" }}>{modalMensaje}</Text>
                        </View>
                    </Modal>
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
    row: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 15,
    },
});
