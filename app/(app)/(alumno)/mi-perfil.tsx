import Boton from "@/componentes/ui/Boton";
import Entrada from "@/componentes/ui/Entrada";
import Selector from "@/componentes/ui/Selector";
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
            calle: "Av. Politécnico 123",
            colonia: "Lindavista",
            municipio: "Gustavo A. Madero",
            estado: "Ciudad de México",
            codigoPostal: "07300",
            sexo: "F",
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
                                <Entrada label="Nombre" value="Ana" editable={false} />
                            </View>

                            <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                                <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                    <Entrada label="Apellido Paterno" value="Medina" editable={false} />
                                </View>
                                <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                    <Entrada label="Apellido Materno" value="Angeles" editable={false} />
                                </View>
                            </View>

                            <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                                <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                    <Entrada label="CURP" value="MEAA010203AACDNNA1" editable={false} />
                                </View>
                                <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                    <Entrada label="RFC" value="MEAA010203ABC" editable={false} />
                                </View>
                            </View>

                            <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                                <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                    <Entrada label="Boleta" value="2022630301" keyboardType="numeric" editable={false} />
                                </View>
                                <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                    <Entrada label="Carrera" value="Médico Cirujano y Homeópata" editable={false} />
                                </View>
                            </View>

                            <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                                <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                    <Entrada label="Generación" value="Febrero 2025" editable={false} />
                                </View>
                                <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                    <Entrada label="Promedio" value="9.0" keyboardType="decimal-pad" editable={false} />
                                </View>
                            </View>

                            <View style={{ marginBottom: 15, pointerEvents: "none" }}>
                                <Entrada
                                    label="Correo Electrónico Institucional"
                                    value="amedina1416@alumno.ipn.mx"
                                    keyboardType="email-address"
                                    editable={false}
                                />
                            </View>

                            <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                                <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                    <Entrada label="Calle y Número" value="Av. Politécnico 123" editable={false} />
                                </View>
                                <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                    <Entrada label="Colonia" value="Lindavista" editable={false} />
                                </View>
                            </View>

                            <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                                <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                    <Entrada label="Delegación / Municipio" value="Gustavo A. Madero" editable={false} />
                                </View>
                                <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                    <Entrada label="Estado de Procedencia" value="Ciudad de México" editable={false} />
                                </View>
                            </View>

                            <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                                <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                    <Entrada label="Código Postal" value="07300" keyboardType="numeric" editable={false} />
                                </View>
                                <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                    <Selector
                                        label="Sexo"
                                        selectedValue="Femenino"
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
                                    <Entrada label="Teléfono Celular" value="5512345678" keyboardType="phone-pad" editable={false} />
                                </View>
                                <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                    <Entrada label="Teléfono Local" value="5554321987" keyboardType="phone-pad" editable={false} />
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
                                    <Boton title="Regresar" onPress={() => { resetPerfil(); setVista("perfil") }} />
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
                                    <Boton title="Regresar" onPress={() => { resetContraseña(); setVista("perfil") }} />
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
