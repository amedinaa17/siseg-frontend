import ModalAPI, { ModalAPIRef } from "@/componentes/layout/ModalAPI";
import Entrada from "@/componentes/ui/Entrada";
import { useAuth } from "@/context/AuthProvider";
import { fetchData } from "@/servicios/api";
import { Colores, Fuentes } from "@/temas/colores";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

export default function PlazaAsignada() {
    const { sesion, verificarToken } = useAuth();
    const router = useRouter();

    const [cargando, setCargando] = useState(false);

    const { width } = useWindowDimensions();
    const esPantallaPequeña = width < 790;

    const modalAPI = useRef<ModalAPIRef>(null);

    const [datosAlumno, setDatosAlumno] = useState<any>(null);

    const obtenerDatos = async () => {
        verificarToken();

        try {
            setCargando(true);

            const response = await fetchData(`users/obtenerPlazaAsignada?tk=${encodeURIComponent(sesion.token)}`);
            if (response?.error === 0) {
                if (response.plaza.sede) {
                    setDatosAlumno(response.plaza);
                } else {
                    modalAPI.current?.show(false, "Aún no tienes una plaza asignada.", () => { router.replace("/inicio-alumno"); });
                    setDatosAlumno(null);
                }
            } else {
                modalAPI.current?.show(false, "Hubo un problema al obtener los datos del servidor. Inténtalo de nuevo más tarde.", () => { router.replace("/inicio-alumno"); });
                setDatosAlumno(null);
            }
        } catch (error) {
            console.error(error);
            modalAPI.current?.show(false, "Error al conectar con el servidor. Inténtalo de nuevo más tarde.", () => { router.replace("/inicio-alumno"); });
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        obtenerDatos();
    }, []);


    return (
        <>
            {cargando && (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white", position: "absolute", top: 60, left: 0, right: 0, bottom: 0, zIndex: 100 }}>
                    <ActivityIndicator size="large" color="#5a0839" />
                </View>
            )}
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
                            <Entrada label="Tarjeta" value={String(datosAlumno?.tarjetaDisponible) ?? ""} editable={false} />
                        </View>
                        <View style={{ flex: 1, marginBottom: 0 }}>
                            <Entrada label="Tipo de Beca" value={datosAlumno?.tipoBeca ?? ""} editable={false} />
                        </View>
                    </View>

                    <View style={{ marginBottom: 15 }}>
                        <Entrada label="Ubicación" value={datosAlumno?.ubicacion ?? ""} editable={false} />
                    </View>
                </View>
                <ModalAPI ref={modalAPI} />
            </ScrollView>
        </>
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
