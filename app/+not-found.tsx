import Encabezado from '@/componentes/layout/Encabezado';
import PiePagina from '@/componentes/layout/PiePagina';
import Boton from '@/componentes/ui/Boton';
import { Colores, Fuentes } from '@/temas/colores';
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

const NotFound = () => {
  const router = useRouter();

  const handleRedirect = () => {
    router.replace("/");  // Redirige a la página de inicio
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={80}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Encabezado />
        <View style={styles.contenido}>
          <Ionicons
            name="sad-outline"
            size={65}
            color={Colores.textoClaro}
          />
          <Text style={styles.titulo}>¡Oops! Error 404</Text>
          <Text style={styles.mensaje}>Lo sentimos, la página que estás buscando no existe.</Text>
          <Boton title="Volver al inicio" onPress={handleRedirect} />
        </View>
        <PiePagina />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colores.fondo,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: "center",
  },
  contenido: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    padding: 20,
    paddingBottom: 40,
  },
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colores.primario,
    marginBottom: 15,
  },
  mensaje: {
    fontSize: Fuentes.cuerpo,
    color: Colores.textoClaro,
    textAlign: "center",
    marginBottom: 15,
  },
});

export default NotFound;
