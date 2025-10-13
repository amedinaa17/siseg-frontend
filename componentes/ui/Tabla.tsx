import { Colores, Fuentes } from "@/temas/colores";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Columna = {
    key: string;
    titulo: string;
    ancho?: number;
    render?: (valor: any, fila?: any) => React.ReactNode;
    multilinea?: boolean;
};

type Props = {
    columnas: Columna[];
    datos: {
        [key: string]: any;
        onPress?: () => void;
    }[];
};

export default function Tabla({ columnas, datos }: Props) {
    return (
        <View style={{ overflow: "hidden" }}>
            {/* Encabezados */}
            <View style={{ flexDirection: "row" }}>
                {columnas.map((col) => (
                    <Text
                        key={col.key}
                        style={[
                            styles.encabezado,
                            col.ancho ? { width: col.ancho } : { flex: 1 },
                        ]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {col.titulo}
                    </Text>
                ))}
            </View>

            {/* Filas */}
            {datos.map((fila, idx) => {
                const RowComponent = fila.onPress ? TouchableOpacity : View;
                return (
                    <RowComponent
                        key={idx}
                        onPress={fila.onPress}
                        activeOpacity={fila.onPress ? 0.7 : 1}
                        style={[
                            styles.fila,
                            idx % 2 === 0 && { backgroundColor: Colores.fondo },
                        ]}
                    >
                        {columnas.map((col) => (
                            <View key={col.key} style={[
                                styles.celda,
                                col.ancho ? { width: col.ancho } : { flex: 1 },
                            ]}>
                                {col.render ? (
                                    col.render(fila[col.key], fila)
                                ) : (
                                    <Text
                                        style={styles.texto}
                                        numberOfLines={col.multilinea ? undefined : 1}
                                        ellipsizeMode={col.multilinea ? undefined : "tail"}
                                    >
                                        {fila[col.key]}
                                    </Text>
                                )}
                            </View>
                        ))}
                    </RowComponent>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    encabezado: {
        fontSize: Fuentes.cuerpo,
        color: Colores.textoPrincipal,
        fontWeight: "700",
        borderColor: Colores.borde,
        borderWidth: 1,
        paddingVertical: 8,
        paddingHorizontal: 15,
    },
    fila: {
        flexDirection: "row",
    },
    celda: {
        borderBottomWidth: 1,
        borderStartWidth: 1,
        borderEndWidth: 1,
        borderColor: Colores.borde,
    },
    texto: {
        fontSize: Fuentes.cuerpo,
        color: Colores.textoPrincipal,
        paddingVertical: 8,
        paddingHorizontal: 15,
    },
});
