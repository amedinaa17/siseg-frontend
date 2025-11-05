import React from "react";
import { Text, View } from "react-native";

export default function WebMap() {
  return (
    <View
      style={{
        height: 520,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#ccc",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: "#888", fontSize: 14 }}>
        Mapa no disponible en móvil (usa la versión nativa)
      </Text>
    </View>
  );
}
