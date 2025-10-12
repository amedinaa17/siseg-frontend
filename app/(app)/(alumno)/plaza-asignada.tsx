import Entrada from "@/componentes/ui/Entrada";
import { Colores, Fuentes } from "@/temas/colores";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

export default function PlazaAsignada() {
    const { width } = useWindowDimensions();
    const esPantallaPequeña = width < 600;

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View
                style={[
                    styles.contenedorFormulario,
                    esPantallaPequeña && { maxWidth: "95%" },
                ]}
            >
                <Text style={styles.titulo}>
                    Plaza asignada
                </Text>

                <View style={{ marginBottom: 15, pointerEvents: "none" }} >
                    <Entrada label="Programa" value="DFIMS000266 UMF 3 LA JOYA GUSTAVO A. MADERO" editable={false} />
                </View>

                <View style={{ marginBottom: 15, pointerEvents: "none" }} >
                    <Entrada label="Sede" value="IMSS NORTE, CDMX" editable={false} />
                </View>

                <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                    <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                        <Entrada label="Tarjeta" value="1" editable={false} />
                    </View>
                    <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                        <Entrada label="Tipo de beca" value="A" editable={false} />
                    </View>
                </View>

                <View style={{ marginBottom: 15, pointerEvents: "none" }} >
                    <Entrada label="Ubicación" value="Ote 91, La Joya, Gustavo A. Madero, 07890 Ciudad de México, CDMX" editable={false} />
                </View>

            </View>
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
