import Encabezado from "@/componentes/layout/Encabezado";
import PiePagina from "@/componentes/layout/PiePagina";
import Boton from "@/componentes/ui/Boton";
import EntradaEtiquetaFlotante from "@/componentes/ui/EntradaEtiquetaFlotante";
import { Colores, Fuentes } from '@/temas/colores';
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/context/AuthProvider";
import { correoEsquema, type CorreoFormulario } from "@/lib/validacion";

export default function Register() {
  const { registro } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CorreoFormulario>({
    resolver: zodResolver(correoEsquema),
    defaultValues: { correo: "" },
  });

  const onSubmit = async ({ correo }: CorreoFormulario) => {
    await registro(correo);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colores.background }}>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Encabezado />
        <View style={styles.contenedorFormulario}>
          <Text style={styles.titulo}>Registro</Text>

          <View style={{ marginBottom: 25 }}>
            <Controller
              control={control}
              name="correo"
              render={({ field: { onChange, value } }) => (
                <EntradaEtiquetaFlotante
                  label="Correo Electrónico Institucional"
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  error={errors.correo?.message}
                />
              )}
            />
          </View>

          <Boton
            title={isSubmitting ? "Registrando…" : "Registrar"}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          />

          <View style={styles.separador} />

          <Text style={styles.registroTexto}>
            ¿Ya tienes una cuenta?{" "}
            <Link href="/(auth)/iniciar-sesion" style={styles.registroLink}>
              Inicia sesión aquí
            </Link>
          </Text>
        </View>
        <PiePagina />
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
  contenedorFormulario: {
    width: "90%",
    maxWidth: 500,
    margin: "auto",
    padding: 24,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: Colores.bordes,
    backgroundColor: Colores.fondo,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 4px 6px rgba(0,0,0,0.05)',
      },
    }),
    elevation: 2,
  },
  titulo: {
    fontSize: Fuentes.titulo,
    color: Colores.texto,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 24,
  },
  separador: {
    borderColor: Colores.bordes,
    borderBottomWidth: 1,
    marginVertical: 25,
  },
  registroTexto: {
    color: Colores.textoOscuro,
    fontSize: Fuentes.texto,
    textAlign: "center",
  },
  registroLink: {
    color: Colores.link,
    fontWeight: "500",
  },
});
