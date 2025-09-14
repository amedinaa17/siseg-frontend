import Modal from "@/componentes/layout/Modal";
import Button from "@/componentes/ui/Boton";
import Entrada from "@/componentes/ui/Entrada";
import SelectorArchivo from "@/componentes/ui/SelectorArchivo";
import Tabla from "@/componentes/ui/Tabla";
import { Colores, Fuentes } from "@/temas/colores";
import React, { useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

const datosRegistro = [
    { documento: "Preregistro SISS", estatus: "Aprobado", observaciones: "Sin observaciones" },
    { documento: "Preregistro SIASS", estatus: "Aprobado", observaciones: "Sin observaciones" },
    { documento: "Preregistro SIRSS", estatus: "Aprobado", observaciones: "Sin observaciones" },
    { documento: "Constancia de derechos del IMSS", estatus: "Rechazado", observaciones: "Archivo no legible" },
    { documento: "Constancia de término del internado", estatus: "Aprobado", observaciones: "Sin observaciones" },
    { documento: "Certificado original de salud", estatus: "Rechazado", observaciones: "Debe ser reciente no mayor a 3 meses" },
    { documento: "Acta de calificaciones del internado", estatus: "Cargado", observaciones: "Documento enviado, en espera de revisión" },
    { documento: "Acuse de solicitud de registro al servicio social", estatus: "Cargado", observaciones: "Documento enviado, en espera de revisión" },
    { documento: "Carta compromiso", estatus: "Sin cargar", observaciones: "Sin observaciones" },
    { documento: "CURP", estatus: "Sin cargar", observaciones: "Sin observaciones" },
    { documento: "Comprobante de estudios", estatus: "Sin cargar", observaciones: "Sin observaciones" },
    { documento: "Constancia de adscripción y aceptación", estatus: "Sin cargar", observaciones: "Sin observaciones" },
];

const datosTermino = [
    { documento: "Constancia de término", estatus: "Sin cargar", observaciones: "Sin observaciones" },
];

export default function ExpedienteDigital() {
    const { width } = useWindowDimensions();
    const esPantallaPequeña = width < 600;

    const [docSeleccionado, setDocSeleccionado] = useState<any | null>(null);
    const cerrarModal = () => setDocSeleccionado(null);
    const renderModal = () => {
        if (!docSeleccionado) return null;
        const { documento, estatus, observaciones, archivo } = docSeleccionado;

        return (
            <Modal visible={!!docSeleccionado} onClose={cerrarModal} titulo={documento} 
                aceptar={estatus === "Rechazado" ? false : true} textoAceptar={ estatus === "Sin cargar" ? "Cargar" : undefined }
                cancelar={estatus === "Sin cargar" ? true : false} >
                <Text
                    style={[
                        { fontSize: 15, fontWeight: "600", marginBottom: 25 },
                        estatus === "Aprobado" && { color: Colores.textoExito },
                        estatus === "Rechazado" && { color: Colores.textoError },
                        estatus === "Sin cargar" && { color: Colores.textoAdvertencia },
                        estatus === "Cargado" && { color: Colores.textoInfo },
                    ]}
                >
                    {estatus}
                </Text>

                {estatus === "Aprobado" && (
                    <>
                        <View style={{ pointerEvents: "none", marginBottom: 15 }} >
                            <Entrada label="Archivo" value="documento.pdf" editable={false} />
                        </View>
                        <View style={{ pointerEvents: "none" }}>
                            <Entrada style={{ height: 150, marginTop: -50 }} label="Observaciones" value={observaciones} editable={false} />
                        </View>
                    </>
                )}

                {estatus === "Rechazado" && (
                    <>
                        <View style={{ pointerEvents: "none" }}>
                            <Entrada style={{ height: 150, marginTop: -50 }} label="Observaciones" value={observaciones} editable={false} />
                        </View>
                        <View style={{ marginTop: 15, flexDirection: "row", justifyContent: "flex-end" }}>
                            <Button
                                title="Cargar Documento"
                                onPress={() => {
                                    setDocSeleccionado({
                                        ...docSeleccionado,
                                        estatus: "Sin cargar",
                                    });
                                }}
                            />
                        </View>
                    </>
                )}

                {estatus === "Sin cargar" && (
                    <>
                        <Text style={{ color: Colores.textoSecundario, marginBottom: 25 }}>Selecciona un archivo PDF no mayor a 2 MB</Text>
                        <SelectorArchivo
                            label="Archivo"
                            onArchivoSeleccionado={(file) => {
                                console.log("Archivo seleccionado:", file);
                            }}
                        />
                    </>
                )}

                {estatus === "Cargado" && (
                    <>
                        <View style={{ pointerEvents: "none", marginBottom: 15 }} >
                            <Entrada label="Archivo" value="documento.pdf" editable={false} />
                        </View>
                        <View style={{ pointerEvents: "none" }}>
                            <Entrada style={{ height: 150, marginTop: -50 }} label="Observaciones" value={observaciones} editable={false} />
                        </View>
                    </>
                )}
            </Modal>
        );
    };

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={[styles.contenedorFormulario, esPantallaPequeña && { maxWidth: "95%" }]}>
                <Text style={styles.titulo}>Expediente Digital</Text>
                <Text style={styles.subtitulo}>Registro al servicio social</Text>
                <Tabla
                    columnas={[
                        { key: "documento", titulo: "Documento" },
                        {
                            key: "estatus",
                            titulo: "Estatus",
                            render: (valor) => (
                                <Text
                                    style={[
                                        styles.texto,
                                        valor === "Aprobado" && { color: Colores.textoExito },
                                        valor === "Rechazado" && { color: Colores.textoError },
                                        valor === "Cargado" && { color: Colores.textoInfo },
                                        valor === "Sin cargar" && { color: Colores.textoAdvertencia },
                                    ]}
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >
                                    {valor}
                                </Text>
                            ),
                        },
                        { key: "observaciones", titulo: "Observaciones" },
                    ]}
                    datos={datosRegistro.map((fila) => ({
                        ...fila,
                        onPress: () => setDocSeleccionado(fila),
                    }))}
                />

                <Text style={styles.subtitulo}>Término del servicio social</Text>
                <Tabla
                    columnas={[
                        { key: "documento", titulo: "Documento" },
                        {
                            key: "estatus",
                            titulo: "Estatus",
                            render: (valor) => (
                                <Text
                                    style={[
                                        styles.texto,
                                        valor === "Sin cargar" && { color: Colores.textoAdvertencia },
                                    ]}
                                >
                                    {valor}
                                </Text>
                            ),
                        },
                        { key: "observaciones", titulo: "Observaciones" },
                    ]}
                    datos={datosTermino.map((fila) => ({
                        ...fila,
                        onPress: () => setDocSeleccionado(fila),
                    }))}
                />
            </View>
            {renderModal()}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    contenedorFormulario: {
        width: "90%",
        maxWidth: 1050,
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
        color: Colores.textoPrincipal,
        textAlign: "center",
        marginBottom: 20,
    },
    subtitulo: {
        fontSize: Fuentes.cuerpoPrincipal,
        fontWeight: "500",
        color: Colores.textoClaro,
        marginTop: 20,
        marginBottom: 10,
    },
    texto: {
        fontSize: Fuentes.cuerpoPrincipal,
        paddingHorizontal: 15,
        paddingVertical: 8,
        fontWeight: "500"
    },

    boton: {
        fontSize: Fuentes.cuerpo,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 6,
        fontWeight: "700",
    },
    inputFake: {
        borderWidth: 1,
        borderColor: Colores.bordes,
        padding: 10,
        borderRadius: 6,
    },
});
