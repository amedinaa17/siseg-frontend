import Encabezado from '@/componentes/layout/Encabezado';
import PiePagina from '@/componentes/layout/PiePagina';
import Boton from '@/componentes/ui/Boton';
import { Colores, Fuentes } from '@/temas/colores';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View
} from 'react-native';

export default function Inicio() {
  const router = useRouter();

  const { width } = useWindowDimensions();
  const esPantallaPequeña = width < 600;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Encabezado />

        <View style={[styles.contenedorPrincipal, { flexDirection: esPantallaPequeña ? "column" : "row" }]}>
          <View style={[styles.textoContainer, { width: esPantallaPequeña ? "100%" : "50%" }]}>
            <Text style={styles.titulo}>SISEG</Text>

            <Text style={styles.subtitulo}>
              Sistema de Seguimiento del Servicio Social para la ENMyH
            </Text>

            <Text style={styles.slogan}>
              Control, comunicación y seguimiento en un solo lugar.
            </Text>

            <Text style={styles.descripcion}>
              <Text style={{ color: Colores.primario, fontWeight: "600" }}>SISEG</Text> es una herramienta informática diseñada 
              para apoyar en la gestión, control y comunicación del servicio social de los estudiantes de la 
              <Text style={{ fontWeight: "600" }}> Escuela Nacional de Medicina y Homeopatía </Text>.
            </Text>

            <Boton
              title={'Iniciar sesión'}
              onPress={() => router.push('/iniciar-sesion')}
            />
          </View>
        </View>
        <PiePagina />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contenedorPrincipal: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  imagen: {
    height: 280,
    borderRadius: 16,
  },
  textoContainer: {
    paddingHorizontal: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  titulo: {
    fontSize: 40,
    color: Colores.primario,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitulo: {
    fontSize: Fuentes.subtitulo,
    fontWeight: "600",
    color: Colores.textoPrincipal,
    textAlign: "center",
    marginBottom: 8,
  },
  slogan: {
    fontSize: Fuentes.cuerpo,
    color: Colores.textoClaro,
    textAlign: "center",
    marginBottom: 35,
  },
  descripcion: {
    fontSize: Fuentes.cuerpo,
    color: Colores.textoSecundario,
    textAlign: "center",
    marginBottom: 24,
  },
});
