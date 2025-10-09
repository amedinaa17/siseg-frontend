import Button from "@/componentes/ui/Boton";
import { Colores, Fuentes } from "@/temas/colores";
import React from "react";
import { Image, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

export default function CursoInduccion() {
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
                    Curso de inducción
                </Text>

                <Text style={styles.texto}>
                    Este código QR es único y personal para cada alumno. Se utilizará para registrar su asistencia al curso de inducción del servicio social.
                </Text>

                <Text style={styles.textoRojo}>
                    Importante: Presenta este código en el momento de ingresar al curso. No debe ser compartido ni reutilizado.
                </Text>

                <Image
                    source={require('@/activos/imagenes/codigo-qr.jpg')}
                    style={styles.logo}
                />

                
                <View style={{ marginTop: 15, alignItems: "center" }}>
                    <Button title="Descargar QR" onPress={() => { }} />
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
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.05,
                shadowRadius: 6,
            },
            android: { elevation: 2 },
            web: { boxShadow: "0px 4px 6px rgba(0,0,0,0.05)" },
        }),
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
    textoRojo: {
        fontSize: Fuentes.cuerpo,
        color: "red",
        textAlign: "justify",
        paddingHorizontal: 15,
        paddingVertical: 8,
    },
    logo: {
        alignSelf: 'center',
        width: 350,
        height: 350,
    },
});
