import { Colors, Fonts } from '@/theme/colors';
import React from "react";
import { Image, Platform, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Header() {
  const isMobile = Platform.OS === "ios" || Platform.OS === "android";

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.header}>
        <Image
          source={require('@/assets/images/enmyh.png')}
          style={styles.logo}
        />
        <Text style={styles.inlineText}>
          <Text style={styles.title}>SISEG </Text>
          {!isMobile && (
            <Text style={styles.subtitle}>
              Sistema de Seguimiento del Servicio Social para la Escuela Nacional de Medicina y Homeopatía
            </Text>
          )}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: Colors.backgroundIPN,
    width: "100%",
  },
  header: {
    backgroundColor: Colors.backgroundIPN,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  logo: {
    width: 60,
    height: 60,
    marginLeft: "5%",
  },
  inlineText: {
    flex: 1,
    flexWrap: "wrap",
    color: Colors.lightSecondary,
  },
  title: {
    fontSize: Fonts.medium,
    fontWeight: "700",
    color: Colors.lightSecondary,
    marginLeft: 12,
    marginRight: 12,
  },
  subtitle: {
    fontSize: Fonts.text
  },
});
