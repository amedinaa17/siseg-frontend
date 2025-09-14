import Encabezado from "@/componentes/layout/Encabezado";
import PiePagina from "@/componentes/layout/PiePagina";
import Boton from "@/componentes/ui/Boton";
import Entrada from "@/componentes/ui/Entrada";
import { correoEsquema, type CorreoFormulario } from "@/lib/validacion";
import { Colores, Fuentes } from '@/temas/colores';
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";

export default function ResetPassword() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CorreoFormulario>({
    resolver: zodResolver(correoEsquema),
    defaultValues: { correo: "" },
  });

  const onSubmit = async ({ correo }: CorreoFormulario) => {
    Alert.alert(
      "Recuperación enviada",
      `Se ha enviado un correo a ${correo} con instrucciones para restablecer tu contraseña.`
    );
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={80} > >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Encabezado />
        <View style={styles.contenedorFormulario}>
          <Text style={styles.titulo}>Restablecer Contraseña</Text>

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
            title={isSubmitting ? "Enviando…" : "Recuperar contraseña"}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          />

          <View style={styles.separador} />

          <Text style={styles.restrablecerTexto}>
            ¿Ya tienes una cuenta?{" "}
            <Link href="/(auth)/iniciar-sesion" style={styles.restablecerLink}>
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
    marginVertical: 16,
  },
  restrablecerTexto: {
    fontSize: Fuentes.cuerpoPrincipal,
    color: Colores.textoSecundario,
    textAlign: "center",
  },
  restablecerLink: {
    color: Colores.textoInfo,
    fontWeight: "500",
  },
});
