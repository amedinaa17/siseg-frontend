import Modal from "@/componentes/layout/Modal";
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
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

export default function MiPerfil() {
    const { sesion, verificarToken } = useAuth();
    const [datosAlumno, setDatosAlumno] = useState<any>(null);

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
                    const response = await fetchData(`users/obtenerTodosDatosAlumno?tk=${sesion.token}`);
                    if (response.error === 0) {
                        setDatosAlumno(response.data);
                    } else {
                        console.error(response.message);
                    }
                } catch (error) {
                    setModalTipo(false);
                    setModalMensaje("Error al obtener los datos del alumno.")
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
    } = useForm<ModificarPerfilFormulario>({
        resolver: zodResolver(modificarPerfilEsquema),
    });

    const onSubmitPerfil = async (data: ModificarPerfilFormulario) => {
        verificarToken();

        try {
            const payload = {
                tk: sesion?.token,
                calle: data.calle,
                colonia: data.colonia,
                delegacion: data.municipio,
                estado: data.estado,
                cp: data.codigoPostal,
                sexo: data.sexo,
                telcelular: data.telefonoCelular,
                tellocal: data.telefonoLocal
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
            setModalMensaje('Error al conectar con el servidor. Intenta de nuevo.');
            setModalVisible(true);
        }
    };


    // Formulario Cambiar Contraseña
    const {
        control: controlContraseña,
        handleSubmit: handleContraseña,
        reset: resetContraseña,
        formState: { errors: errorsContraseña, isSubmitting: enviandoContraseña },
    } = useForm<CambiarContraseñaFormulario>({
        resolver: zodResolver(cambiarContraseñaEsquema),
        defaultValues: { contraseña: "", confirmarContraseña: "" },
    });

    const onSubmitContraseña = (data: CambiarContraseñaFormulario) => {
        console.log(data);
        setVista("perfil");
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={80} >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View
                    style={[
                        styles.contenedorFormulario,
                        esPantallaPequeña && { maxWidth: "95%" },
                        vista === "contraseña" && { marginTop: 100 }
                    ]}
                >
                    {vista === "perfil" && (
                        <>
                            <Text style={styles.titulo}>Mi Perfil</Text>

                            <View style={{ marginBottom: 15, pointerEvents: "none" }} >
                                <Entrada label="Nombre" value={datosAlumno?.nombre || "Cargando..."} editable={false} />
                            </View>

                            <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                                <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                    <Entrada label="Apellido Paterno" value={datosAlumno?.apellido_paterno || "Cargando..."} editable={false} />
                                </View>
                                <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                    <Entrada label="Apellido Materno" value={datosAlumno?.apellido_materno || "Cargando..."} editable={false} />
                                </View>
                            </View>

                            <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                                <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                    <Entrada label="CURP" value={datosAlumno?.curp || "Cargando..."} editable={false} />
                                </View>
                                <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                    <Entrada label="RFC" value={datosAlumno?.rfc || "Cargando..."} editable={false} />
                                </View>
                            </View>

                            <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                                <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                    <Entrada label="Boleta" value={datosAlumno?.boleta || "Cargando..."} keyboardType="numeric" editable={false} />
                                </View>
                                <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                    <Entrada label="Carrera" value={"Médico Cirujano y " + (datosAlumno?.carrera === "Homeopatia" ? "Homeópata" : "Partero")} editable={false} />
                                </View>
                            </View>

                            <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                                <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                    <Entrada label="Generación" value={datosAlumno?.generacion || "Cargando..."} editable={false} />
                                </View>
                                <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                    <Entrada label="Promedio" value={datosAlumno?.promedio || "Cargando..."} keyboardType="decimal-pad" editable={false} />
                                </View>
                            </View>

                            <View style={{ marginBottom: 15, pointerEvents: "none" }}>
                                <Entrada
                                    label="Correo Electrónico Institucional"
                                    value={datosAlumno?.correo || "Cargando..."}
                                    keyboardType="email-address"
                                    editable={false}
                                />
                            </View>

                            <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                                <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                    <Entrada label="Calle y Número" value={datosAlumno?.calle_y_numero || "Cargando..."} editable={false} />
                                </View>
                                <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                    <Entrada label="Colonia" value={datosAlumno?.colonia || "Cargando..."} editable={false} />
                                </View>
                            </View>

                            <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                                <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                    <Entrada label="Delegación / Municipio" value={datosAlumno?.delegacion || "Cargando..."} editable={false} />
                                </View>
                                <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                    <Entrada label="Estado de Procedencia" value={datosAlumno?.estado || "Cargando..."} editable={false} />
                                </View>
                            </View>

                            <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                                <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                    <Entrada label="Código Postal" value={datosAlumno?.cp || "Cargando..."} keyboardType="numeric" editable={false} />
                                </View>
                                <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                    <Selector
                                        label="Sexo"
                                        selectedValue={datosAlumno?.sexo === "F" ? "Femenino" : "Masculino"}
                                        items={[
                                            { label: "Masculino", value: "M" },
                                            { label: "Femenino", value: "F" },
                                        ]}
                                        onValueChange={() => { }}
                                    />
                                </View>
                            </View>

                            <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                                <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                    <Entrada label="Teléfono Celular" value={datosAlumno?.telcelular || "Cargando..."} keyboardType="phone-pad" editable={false} />
                                </View>
                                <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                    <Entrada label="Teléfono Local" value={datosAlumno?.tellocal || "Cargando..."} keyboardType="phone-pad" editable={false} />
                                </View>
                            </View>

                            <View style={{ flexDirection: "row", gap: 12 }}>
                                <View style={{ flex: 1 }}>
                                    <Boton title="Modificar Datos" onPress={() => setVista("modificar")} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Boton title="Cambiar Contraseña" onPress={() => setVista("contraseña")} />
                                </View>
                            </View>
                        </>
                    )}
                    {vista === "modificar" && (
                        <>
                            <Text style={styles.titulo}>Modificar Datos</Text>

                            <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                                <View style={{ flex: 1, marginBottom: 5 }}>
                                    <Controller
                                        control={controlPerfil}
                                        name="calle"
                                        defaultValue={datosAlumno?.calle_y_numero}
                                        render={({ field }) => (
                                            <Entrada
                                                label="Calle y Número"
                                                {...field}
                                                error={errorsPerfil.calle?.message}
                                            />
                                        )}
                                    />
                                </View>
                                <View style={{ flex: 1, marginBottom: 15 }}>
                                    <Controller
                                        control={controlPerfil}
                                        name="colonia"
                                        defaultValue={datosAlumno?.colonia}
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
                                style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}
                            >
                                <View style={{ flex: 1, marginBottom: 5 }}>
                                    <Controller
                                        control={controlPerfil}
                                        name="municipio"
                                        defaultValue={datosAlumno?.delegacion}
                                        render={({ field }) => (
                                            <Entrada
                                                label="Delegación / Municipio"
                                                {...field}
                                                error={errorsPerfil.municipio?.message}
                                            />
                                        )}
                                    />
                                </View>
                                <View style={{ flex: 1, marginBottom: 15 }}>
                                    <Controller
                                        control={controlPerfil}
                                        name="estado"
                                        defaultValue={datosAlumno?.estado}
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
                                style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}
                            >
                                <View style={{ flex: 1, marginBottom: errorsPerfil.sexo ? 0 : 5 }}>
                                    <Controller
                                        control={controlPerfil}
                                        name="codigoPostal"
                                        defaultValue={datosAlumno?.cp}
                                        render={({ field }) => (
                                            <Entrada
                                                label="Código Postal"
                                                keyboardType="numeric"
                                                {...field}
                                                error={errorsPerfil.codigoPostal?.message}
                                            />
                                        )}
                                    />
                                </View>
                                <View style={{ flex: 1, marginBottom: 15, marginTop: errorsPerfil.codigoPostal && esPantallaPequeña && !errorsPerfil.sexo ? 15 : 0 }}>
                                    <Controller
                                        control={controlPerfil}
                                        name="sexo"
                                        defaultValue={datosAlumno?.sexo}
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
                            <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                                <View style={{ flex: 1, marginBottom: 5 }}>
                                    <Controller
                                        control={controlPerfil}
                                        name="telefonoCelular"
                                        defaultValue={datosAlumno?.telcelular}
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
                                        defaultValue={datosAlumno?.tellocal}
                                        name="telefonoLocal"
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
            android: { elevation: 2 },
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
