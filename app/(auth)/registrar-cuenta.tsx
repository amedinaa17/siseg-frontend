import Encabezado from "@/componentes/layout/Encabezado";
import ModalAPI, { ModalAPIRef } from "@/componentes/layout/ModalAPI";
import PiePagina from "@/componentes/layout/PiePagina";
import Boton from "@/componentes/ui/Boton";
import Entrada from "@/componentes/ui/Entrada";
import { postData } from "@/servicios/api";
import { Colores, Fuentes } from '@/temas/colores';
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";

import { correoEsquema, type CorreoFormulario } from "@/lib/validacion";

export default function Register() {
  const router = useRouter();

  const modalAPI = useRef<ModalAPIRef>(null);
  const [error, setError] = useState<string>("");

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CorreoFormulario>({
    resolver: zodResolver(correoEsquema),
    defaultValues: { correo: "" },
  });

  const onSubmit = async ({ correo }: CorreoFormulario) => {
    setError("");
    try {
      const response = await postData('users/verificarCandidato', { email: correo });

      if (response.error === 0) {
        modalAPI.current?.show(true, `Para completar tu registro, hemos enviado un correo electrónico a ${correo}. Revisa tu bandeja de entrada y sigue las instrucciones.`,
          () => { router.replace("/"); });
        reset();
      } else {
        modalAPI.current?.show(false, `El correo ${correo} no está registrado para realizar servicio social. Comunícate con el Departamento de Extensión y Apoyos Educativos para obtener más información.`);
      }
    } catch (error) {
      setError("Error al conectar con el servidor. Inténtalo de nuevo más tarde.");
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "web" ? undefined : "padding"} keyboardVerticalOffset={80} >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Encabezado />
        <View style={styles.contenedorFormulario}>
          <Text style={styles.titulo}>Registrar cuenta</Text>

          <View style={{ marginBottom: error == '' || !error.includes("Error") ? 25 : 10 }}>
            <Controller
              control={control}
              name="correo"
              render={({ field: { onChange, value } }) => (
                <Entrada
                  label="Correo Electrónico Institucional"
                  value={value}
                  onChangeText={(text) => {
                    setError("");
                    onChange(text);
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  error={errors.correo?.message}
                />
              )}
            />
          </View>

          {error.includes("Error") && (
            <Text style={styles.errorRegistrarCuenta}>{error}</Text>
          )}

          <Boton
            title={isSubmitting ? "Registrando…" : "Registrar"}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          />

          <View style={styles.separador} />

          <View style={styles.registroTexto}>
            <Text style={{ fontSize: Fuentes.cuerpo, color: Colores.textoSecundario }}>¿Ya tienes una cuenta?</Text>
            <Link href="/(auth)/iniciar-sesion" style={styles.registroLink}>
              Inicia sesión aquí
            </Link>
          </View>
        </View>
        <PiePagina />
        <ModalAPI ref={modalAPI} />
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
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 6 },
      android: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 6 },
      web: { boxShadow: "0px 4px 6px rgba(0,0,0,0.05)" },
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
    ...Platform.select({
      ios: {
        gap: 10,
      },
      android: {
        gap: 10,
      },
      web: {
        gap: 50,
      },
    }),
    flexDirection: 'row',
    justifyContent: "center",
    fontSize: Fuentes.cuerpo,
    color: Colores.textoSecundario,
  },
  registroLink: {
    color: Colores.textoInfo,
    fontWeight: "500",
  },
  errorRegistrarCuenta: {
    fontSize: Fuentes.caption,
    color: Colores.textoError,
    marginBottom: 25,
  },
});
