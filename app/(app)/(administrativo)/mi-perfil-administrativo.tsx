import Button from "@/componentes/ui/Boton";
import Entrada from "@/componentes/ui/Entrada";
import {
    cambiarContraseñaEsquema, modificarPerfilEsquema,
    type CambiarContraseñaFormulario, type ModificarPerfilFormulario
} from "@/lib/validacion";
import { Colores, Fuentes } from '@/temas/colores';
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

export default function MiPerfil() {
    const { width } = useWindowDimensions();
    const esPantallaPequeña = width < 600;
    const [vista, setVista] = useState<"perfil" | "modificar" | "contraseña">("perfil");

    const {
        control: controlPerfil,
        handleSubmit: handlePerfil,
        reset: resetPerfil,
        formState: { errors: errorsPerfil, isSubmitting: enviandoPerfil },
    } = useForm<ModificarPerfilFormulario>({
        resolver: zodResolver(modificarPerfilEsquema),
        defaultValues: {
            telefonoCelular: "5512345678",
            telefonoLocal: "5554321987",
        },
    });

    const onSubmitPerfil = (data: ModificarPerfilFormulario) => {
        console.log(data);
        setVista("perfil");
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
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={80} > >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={[styles.contenedorFormulario, esPantallaPequeña && { maxWidth: "95%" }, vista != "perfil" && { marginTop: 100 }]}>
                    {vista === "perfil" && (
                        <>
                            <Text style={styles.titulo}>Mi Perfil</Text>

                            <View style={{ marginBottom: 15, pointerEvents: "none" }}>
                                <Entrada label="Nombre" value="Ana" editable={false} />
                            </View>

                            <View style={[styles.row, esPantallaPequeña && styles.column]}>
                                <View style={[styles.col, { pointerEvents: "none" }]}>
                                    <Entrada label="Apellido Paterno" value="Medina" editable={false} />
                                </View>
                                <View style={[styles.col, { pointerEvents: "none" }]}>
                                    <Entrada label="Apellido Materno" value="Angeles" editable={false} />
                                </View>
                            </View>

                            <View style={{ marginBottom: 15, pointerEvents: "none" }}>
                                <Entrada label="CURP" value="MEAA010203AACDNNA1" editable={false} />
                            </View>

                            <View style={{ marginBottom: 15, pointerEvents: "none" }}>
                                <Entrada label="Número de Empleado" value="2022630301" keyboardType="numeric" editable={false} />
                            </View>

                            <View style={{ marginBottom: 15, pointerEvents: "none" }}>
                                <Entrada
                                    label="Correo Electrónico Institucional"
                                    value="amedina1416@alumno.ipn.mx"
                                    keyboardType="email-address"
                                    editable={false}
                                />
                            </View>

                            <View style={[styles.row, esPantallaPequeña && styles.column]}>
                                <View style={[styles.col, { pointerEvents: "none" }]}>
                                    <Entrada label="Teléfono Celular" value="5512345678" keyboardType="phone-pad" editable={false} />
                                </View>
                                <View style={[styles.col, { pointerEvents: "none" }]}>
                                    <Entrada label="Teléfono Local" value="5554321987" keyboardType="phone-pad" editable={false} />
                                </View>
                            </View>

                            <View style={{ flexDirection: "row", gap: 12 }}>
                                <View style={{ flex: 1 }}>
                                    <Button title="Modificar Datos" onPress={() => setVista("modificar")} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Button title="Cambiar Contraseña" onPress={() => setVista("contraseña")} />
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
                                        name="telefonoCelular"
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
                                    <Button title="Regresar" onPress={() => { resetPerfil(); setVista("perfil") }} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Button
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
                                    <Button title="Regresar" onPress={() => { resetContraseña(); setVista("perfil") }} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Button
                                        title={enviandoContraseña ? "Guardando…" : "Guardar Contraseña"}
                                        onPress={handleContraseña(onSubmitContraseña)}
                                    />
                                </View>
                            </View>
                        </>
                    )}
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
    column: {
        flexDirection: "column",
    },
    col: {
        flex: 1,
        marginBottom: 0,
    },
});
