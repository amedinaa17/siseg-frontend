import Encabezado from "@/componentes/layout/Encabezado";
import PiePagina from "@/componentes/layout/PiePagina";
import Boton from "@/componentes/ui/Boton";
import Entrada from "@/componentes/ui/Entrada";
import { Colores, Fuentes } from '@/temas/colores';
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";

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
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={80} > >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Encabezado />
        <View style={styles.contenedorFormulario}>
          <Text style={styles.titulo}>Registro</Text>

          <View style={{ marginBottom: 25 }}>
            <Controller
              control={control}
              name="correo"
              render={({ field: { onChange, value } }) => (
                <Entrada
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contenedorFormulario: {
    width: "90%",
    maxWidth: 500,
    margin: "auto",
    padding: 24,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: Colores.borde,
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
    color: Colores.textoPrincipal,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 24,
  },
  separador: {
    borderColor: Colores.borde,
    borderBottomWidth: 1,
    marginVertical: 25,
  },
  registroTexto: {
    color: Colores.textoSecundario,
    fontSize: Fuentes.cuerpoPrincipal,
    textAlign: "center",
  },
  registroLink: {
    color: Colores.textoInfo,
    fontWeight: "500",
  },
});
