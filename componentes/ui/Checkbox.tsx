import { Colores, Fuentes } from '@/temas/colores'
import { Ionicons } from "@expo/vector-icons"
import React from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"

type Propiedades = {
    label: string
    labelColor?: keyof typeof Colores
    value: boolean
    onValueChange: (val: boolean) => void
    error?: string
}

export default function Checkbox({ label, labelColor, value, onValueChange, error }: Propiedades) {
    return (
        <View style={{ marginBottom: 10 }}>
            <Pressable
                style={styles.contenedor}
                onPress={() => onValueChange(!value)}
            >
                <View
                    style={[
                        styles.checkbox,
                        { borderColor: error ? Colores.textoError : Colores.borde },
                        value && { backgroundColor: Colores.textoSecundario, borderColor: Colores.textoSecundario }
                    ]}
                >
                    {value && <Ionicons name="checkmark" size={16} color={Colores.onPrimario} />}
                </View>
                <Text allowFontScaling={false} style={[styles.label, labelColor && { color: Colores[labelColor], fontWeight: "600" }, error && { color: Colores.textoError }]}>
                    {label}
                </Text>
            </Pressable>
            {error && <Text allowFontScaling={false} style={styles.errorTexto}>{error}</Text>}
        </View>
    )
}

const styles = StyleSheet.create({
    contenedor: {
        flexDirection: "row",
        alignItems: "center",
        paddingEnd: 12,
    },
    label: {
        fontSize: Fuentes.cuerpo,
        paddingStart: 10,
        color: Colores.textoPrincipal,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderWidth: 1.5,
        borderRadius: 6,
        justifyContent: "center",
        alignItems: "center",
    },
    errorTexto: {
        color: Colores.textoError,
        marginTop: 5,
        fontSize: Fuentes.caption,
    },
})
