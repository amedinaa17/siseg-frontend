import PiePagina from "@/componentes/layout/PiePagina";
import Button from "@/componentes/ui/Boton";
import EntradaEtiquetaFlotante from "@/componentes/ui/EntradaEtiquetaFlotante";
import SelectorEtiquetaFlotante from "@/componentes/ui/SelectorEtiquetaFlotante";
import {
    cambiarContraseñaEsquema,
    modificarPerfilEsquema,
    type CambiarContraseñaFormulario,
    type ModificarPerfilFormulario,
} from "@/lib/validacion";
import { Colores, Fuentes } from '@/temas/colores';
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

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
            sexo: "Mujer",
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
        <View style={{ flex: 1, backgroundColor: Colores.background }}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={[styles.contenedorFormulario, esPantallaPequeña && { maxWidth: "95%" }, vista === "contraseña" && { marginTop: 100 } ]}>
                    {vista === "perfil" && (
                        <>
                            <Text style={styles.titulo}>Mi Perfil</Text>

                            <View style={{ marginBottom: 15 }} pointerEvents="none">
                                <EntradaEtiquetaFlotante label="Nombre" value="Ana" editable={false} />
                            </View>

                            <View style={[styles.row, esPantallaPequeña && styles.column]}>
                                <View style={styles.col} pointerEvents="none">
                                    <EntradaEtiquetaFlotante label="Apellido Paterno" value="Medina" editable={false} />
                                </View>
                                <View style={styles.col} pointerEvents="none">
                                    <EntradaEtiquetaFlotante label="Apellido Materno" value="Angeles" editable={false} />
                                </View>
                            </View>

                            <View style={[styles.row, esPantallaPequeña && styles.column]}>
                                <View style={styles.col} pointerEvents="none">
                                    <EntradaEtiquetaFlotante label="CURP" value="MEAA010203AACDNNA1" editable={false} />
                                </View>
                                <View style={styles.col} pointerEvents="none">
                                    <EntradaEtiquetaFlotante label="RFC" value="MEAA010203ABC" editable={false} />
                                </View>
                            </View>

                            <View style={[styles.row, esPantallaPequeña && styles.column]}>
                                <View style={styles.col} pointerEvents="none">
                                    <EntradaEtiquetaFlotante label="Boleta" value="2022630301" keyboardType="numeric" editable={false} />
                                </View>
                                <View style={styles.col} pointerEvents="none">
                                    <EntradaEtiquetaFlotante label="Carrera" value="Médico Cirujano y Homeópata" editable={false} />
                                </View>
                            </View>

                            <View style={[styles.row, esPantallaPequeña && styles.column]}>
                                <View style={styles.col} pointerEvents="none">
                                    <EntradaEtiquetaFlotante label="Generación" value="Febrero 2025" editable={false} />
                                </View>
                                <View style={styles.col} pointerEvents="none">
                                    <EntradaEtiquetaFlotante label="Promedio" value="9.0" keyboardType="decimal-pad" editable={false} />
                                </View>
                            </View>

                            <View style={{ marginBottom: 15 }} pointerEvents="none">
                                <EntradaEtiquetaFlotante
                                    label="Correo Electrónico Institucional"
                                    value="amedina1416@alumno.ipn.mx"
                                    keyboardType="email-address"
                                    editable={false}
                                />
                            </View>

                            <View style={[styles.row, esPantallaPequeña && styles.column]}>
                                <View style={styles.col} pointerEvents="none">
                                    <EntradaEtiquetaFlotante label="Calle y Número" value="Av. Politécnico 123" editable={false} />
                                </View>
                                <View style={styles.col} pointerEvents="none">
                                    <EntradaEtiquetaFlotante label="Colonia" value="Lindavista" editable={false} />
                                </View>
                            </View>

                            <View style={[styles.row, esPantallaPequeña && styles.column]}>
                                <View style={styles.col} pointerEvents="none">
                                    <EntradaEtiquetaFlotante label="Delegación / Municipio" value="Gustavo A. Madero" editable={false} />
                                </View>
                                <View style={styles.col} pointerEvents="none">
                                    <EntradaEtiquetaFlotante label="Estado de Procedencia" value="Ciudad de México" editable={false} />
                                </View>
                            </View>

                            <View style={[styles.row, esPantallaPequeña && styles.column]}>
                                <View style={styles.col} pointerEvents="none">
                                    <EntradaEtiquetaFlotante label="Código Postal" value="07300" keyboardType="numeric" editable={false} />
                                </View>
                                <View style={styles.col} pointerEvents="none">
                                    <SelectorEtiquetaFlotante
                                        label="Sexo"
                                        selectedValue="Mujer"
                                        items={[
                                            { label: "Hombre", value: "Hombre" },
                                            { label: "Mujer", value: "Mujer" },
                                        ]}
                                        onValueChange={() => { }}
                                    />
                                </View>
                            </View>

                            <View style={[styles.row, esPantallaPequeña && styles.column]}>
                                <View style={styles.col} pointerEvents="none">
                                    <EntradaEtiquetaFlotante label="Teléfono Celular" value="5512345678" keyboardType="phone-pad" editable={false} />
                                </View>
                                <View style={styles.col} pointerEvents="none">
                                    <EntradaEtiquetaFlotante label="Teléfono Local" value="5554321987" keyboardType="phone-pad" editable={false} />
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
                                        name="calle"
                                        render={({ field }) => (
                                            <EntradaEtiquetaFlotante
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
                                            <EntradaEtiquetaFlotante
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
                                            <EntradaEtiquetaFlotante
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
                                            <EntradaEtiquetaFlotante
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
                                            <EntradaEtiquetaFlotante
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
                                        render={({ field: { onChange, value } }) => (
                                            <SelectorEtiquetaFlotante
                                                label="Sexo"
                                                selectedValue={value}
                                                onValueChange={onChange}
                                                items={[
                                                    { label: "Hombre", value: "Hombre" },
                                                    { label: "Mujer", value: "Mujer" },
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
                                            <EntradaEtiquetaFlotante
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
                                            <EntradaEtiquetaFlotante
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
                                    <Button title="Regresar"  onPress={() => {resetPerfil(); setVista("perfil")}} />
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
                                        <EntradaEtiquetaFlotante
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
                                        <EntradaEtiquetaFlotante
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
                                    <Button title="Regresar" onPress={() => {resetContraseña(); setVista("perfil")}} />
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
                <PiePagina />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    scroll: {
        flexGrow: 1,
        justifyContent: "space-between",
        alignItems: "center",
    },
    contenedorFormulario: {
        width: "90%",
        maxWidth: 800,
        margin: "auto",
        padding: 24,
        borderWidth: 1,
        borderRadius: 12,
        borderColor: Colores.bordes,
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
        color: Colores.texto,
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
