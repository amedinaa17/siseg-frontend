import ModalAPI, { ModalAPIRef } from "@/componentes/layout/ModalAPI";
import Entrada from "@/componentes/ui/Entrada";
import { useAuth } from "@/context/AuthProvider";
import { fetchData } from "@/servicios/api";
import { Colores, Fuentes } from "@/temas/colores";
import React, { useEffect, useRef, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

export default function PlazaAsignada() {
    const { width } = useWindowDimensions();
    const esPantallaPequeña = width < 790;

    const modalAPI = useRef<ModalAPIRef>(null);
    const { sesion } = useAuth();

    const [datosAlumno, setDatosAlumno] = useState<any>(null);
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        const obtenerDatos = async () => {
            if (!sesion?.token) return;

            try {
                setCargando(true);
                const response = await fetchData(`users/obtenerPlazaAsignada?tk=${encodeURIComponent(sesion.token)}`);
                
                if (response?.error === 0) {
                    if (response?.plaza) {
                        setDatosAlumno(response.plaza);
                    } else {
                        modalAPI.current?.show(false, "No tienes plaza asignada todavía.");
                        setDatosAlumno(null);
                    }
                } else {
                    modalAPI.current?.show(false, response?.message ?? "No se pudo obtener tu plaza.");
                    setDatosAlumno(null);
                }
            } catch (error) {
                console.error(error);
                modalAPI.current?.show(false, "Error al conectar con el servidor. Inténtalo de nuevo más tarde.");
            } finally {
                setCargando(false);
            }
        };

        obtenerDatos();
    }, [sesion]);


    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={[styles.contenedorFormulario, esPantallaPequeña && { maxWidth: "95%" }]}>
                <Text style={styles.titulo}>Plaza asignada</Text>

                <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                    <View style={{ flex: 1 }}>
                        <Entrada label="Programa" value={datosAlumno?.PROGRAMA ?? ""} editable={false} />
                    </View>

                    <View style={{ flex: 1 }}>
                        <Entrada label="Promoción" value={datosAlumno?.promocion ?? ""} editable={false} />
                    </View>
                </View>

                <View style={{ marginBottom: 15 }}>
                    <Entrada label="Sede" value={datosAlumno?.sede ?? ""} editable={false} />
                </View>

                <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                    <View style={{ flex: 1, marginBottom: 0 }}>
                        <Entrada label="Tarjeta" value={datosAlumno?.tarjetaDisponible ?? ""} editable={false} />
                    </View>
                    <View style={{ flex: 1, marginBottom: 0 }}>
                        <Entrada label="Tipo de Beca" value={datosAlumno?.tipoBeca ?? ""} editable={false} />
                    </View>
                </View>

                <View style={{ marginBottom: 15 }}>
                    <Entrada label="Ubicación" value={datosAlumno?.ubicacion ?? ""} editable={false} />
                </View>

                {cargando && (
                    <Text style={{ textAlign: "center", marginTop: 8 }}>
                        Cargando información...
                    </Text>
                )}
            </View>

            {/* Monta el modal para poder usar modalAPI.current?.show(...) */}
            <ModalAPI ref={modalAPI} />
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
        fontSize: Fuentes.cuerpo,
        textAlign: "justify",
        paddingHorizontal: 15,
        paddingVertical: 8,
    },
    row: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 15,
    },
});
