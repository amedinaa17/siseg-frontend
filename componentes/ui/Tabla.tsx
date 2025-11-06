import { Colores, Fuentes } from "@/temas/colores";
import React from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
    <View >
      <View style={{ flexDirection: "row" }}>
        {columnas.map((col) => (
          <Text
            key={col.key}
            style={[
              styles.encabezado,
              col.ancho ? { width: col.ancho } : { flex: 1 }, 
              Platform.OS === "web"
                ? ({ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } as any)
                : null,
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {col.titulo}
          </Text>
        ))}
      </View>

      {datos.map((fila, idx) => {
        const RowComponent: any = fila.onPress ? TouchableOpacity : View;
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
            {columnas.map((col) => {
              const isMultiline = col.multilinea; 
              return (
                <View
                  key={col.key}
                  style={[
                    styles.celda,
                    col.ancho ? { width: col.ancho } : { flex: 1 },
                  ]}
                >
                  {col.render ? (
                    col.render(fila[col.key], fila)
                  ) : (
                    <Text
                      style={[
                        styles.texto,
                        isMultiline ? { flexWrap: "wrap" as any } : null,
                        Platform.OS === "web"
                          ? (isMultiline
                              ? ({
                                  whiteSpace: "normal",
                                  wordBreak: "break-word",
                                  overflow: "visible",
                                } as any)
                              : ({
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                } as any))
                          : null,
                      ]}
                      numberOfLines={isMultiline ? undefined : 1}
                      ellipsizeMode={isMultiline ? undefined : "tail"}
                    >
                      {fila[col.key] ?? ""}
                    </Text>
                  )}
                </View>
              );
            })}
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
    flexShrink: 1,
    minWidth: 0,  
  },
  texto: {
    fontSize: Fuentes.cuerpo,
    color: Colores.textoPrincipal,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
});
