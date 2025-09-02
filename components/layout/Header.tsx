import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Header() {
  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
    <View style={styles.header}>
      <Text style={styles.inlineText}>
        <Text style={styles.title}>SISEG </Text>
        <Text style={styles.subtitle}>
          Sistema de Seguimiento del Servicio Social para la Escuela Nacional de Medicina y Homeopatía
        </Text>
      </Text>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: "#682444",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#682444",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  logo: {
    width: 40,
    height: 40,
  },
  inlineText: {
    flex: 1,
    flexWrap: "wrap",
    color: "#fff",
  },
  title: {
    fontSize: 17.6,
    fontWeight: "700",
    color: "#fff",
    marginLeft: 12,
    marginRight: 12,
  },
  subtitle: {
    fontSize: 14,
    color: "#f3f4f6",
  },
});
