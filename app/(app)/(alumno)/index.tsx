import { Colors, Fonts } from '@/theme/colors';
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  const isMobile = Platform.OS === "ios" || Platform.OS === "android";

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.formWrapper}>
          <View style={styles.header}>
            <Text style={styles.sisegText}>SISEG</Text>
            {!isMobile && (
              <Text style={styles.sisegDescription}>
                Sistema de Seguimiento del Servicio Social para la Escuela Nacional de Medicina y Homeopatía
              </Text>
            )}
          </View>

          <Text style={styles.title}>Bienvenido</Text>
          <Text style={styles.nameText}>Medina Angeles Ana Cristina</Text>
          <Text style={styles.idText}>2022630301</Text>

          <View style={styles.footer}>
            <View style={styles.avisoContainer}>
              <Text style={styles.avisoText}>AVISO</Text>
              <View style={styles.separator} />
              <Text style={styles.footerText}>
                Tus datos personales son protegidos conforme a lo establecido por la Ley General de Protección de Datos Personales en Posesión de los Particulares.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  formWrapper: {
    width: "90%",
    maxWidth: 1000,
    height: "80%",
    margin: "auto",
    padding: 24,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: Colors.borderColor,
    backgroundColor: Colors.background,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
      },
    }),
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    flexWrap: "nowrap",
    alignItems: "center",
    marginBottom: 24,
  },
  sisegText: {
    fontSize: Fonts.big,
    color: Colors.primary,
    fontWeight: "700",
    marginRight: 12,
  },
  sisegDescription: {
    fontSize: Fonts.text,
    color: Colors.darkText,
    flexWrap: "nowrap",
  },
  title: {
    fontSize: Fonts.title,
    color: Colors.primary,
    fontWeight: "700",
    marginTop: 25,
    marginBottom: 5,
  },
  nameText: {
    fontSize: Fonts.medium,
    color: Colors.secondary,
  },
  idText: {
    fontSize: Fonts.medium,
    color: Colors.darkText,
  },
  footer: {
    marginTop: 50,
    paddingVertical: 10,
    flex: 1,
    justifyContent: 'flex-end',
  },
  avisoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  avisoText: {
    fontSize: Fonts.title,
    color: Colors.primary,
    fontWeight: "700",
    marginRight: 10,
  },
  separator: {
    backgroundColor: Colors.primary,
    width: 1.5,
    height: 35,
    marginRight: 10,
  },
  footerText: {
    fontSize: Fonts.small,
    color: Colors.darkText,
    flex: 1,
    textAlign: 'right',
  },
});
