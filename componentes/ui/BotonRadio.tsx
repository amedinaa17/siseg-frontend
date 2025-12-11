import { Colores, Fuentes } from "@/temas/colores";
import React from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

type ScaleValue = 1 | 2 | 3 | 4 | 5;

type LikertProps = {
    valor?: number;
    onChange: (v: ScaleValue) => void;
    etiquetas: string[];
};

const Likert = ({ valor, onChange, etiquetas }: LikertProps) => {
    const { width } = useWindowDimensions();

    const isSmallScreen = width < 790;

    return (
        <View style={[styles.contenedor, isSmallScreen && { flexDirection: 'column' }]}>
            {etiquetas.map((etiqueta, index) => {
                const scaleValue = (index + 1) as ScaleValue;

                return (
                    <Pressable
                        key={index}
                        onPress={() => onChange(scaleValue)}
                        style={[styles.opcion]}
                    >
                        <View style={[styles.circulo, valor === index + 1 && styles.circuloActivo]} />
                        <Text allowFontScaling={false} style={styles.etiqueta}>
                            {etiqueta}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    contenedor: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    opcion: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 6,
        marginBottom: 10,
    },
    circulo: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: Colores.borde,
        marginRight: 8,
    },
    circuloActivo: {
        backgroundColor: Colores.textoSecundario,
        borderColor: Colores.borde,
        borderWidth: 2,
    },
    etiqueta: {
        fontSize: Fuentes.cuerpo,
        color: '#555',
    },
});

export default Likert;
