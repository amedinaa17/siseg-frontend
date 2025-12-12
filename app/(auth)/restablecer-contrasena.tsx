import Encabezado from "@/componentes/layout/Encabezado";
import ModalAPI, { ModalAPIRef } from "@/componentes/layout/ModalAPI";
import PiePagina from "@/componentes/layout/PiePagina";
import Boton from "@/componentes/ui/Boton";
import Entrada from "@/componentes/ui/Entrada";
import { correoEsquema, type CorreoFormulario } from "@/lib/validacion";
import { postData } from "@/servicios/api";
import { Colores, Fuentes } from '@/temas/colores';
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";

export default function ResetPassword() {
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
      const response = await postData('users/restablecerPasswordEmail', { email: correo });

      if (response.error === 0) {
        modalAPI.current?.show(true, `Para continuar, hemos enviado un correo electrónico a ${correo}. Revisa tu bandeja de entrada y sigue las instrucciones.`,
          () => { router.replace("/"); });
        reset();
      } else {
        setError("No existe una cuenta registrada con este correo electrónico.");
      }
    } catch (error) {
      console.log(error)
      setError("Error al conectar con el servidor. Inténtalo de nuevo más tarde");
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "web" ? undefined : "padding"} keyboardVerticalOffset={80} >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Encabezado />
        <View style={styles.contenedorFormulario}>
          <Text allowFontScaling={false} style={styles.titulo}>Restablecer contraseña</Text>
          <Text allowFontScaling={false} style={{ fontSize: Fuentes.cuerpo, color: Colores.textoPrincipal, marginBottom: 20 }}>Ingrese su correo electrónico institucional para recuperar su contraseña.</Text>
          <View style={{ marginBottom: error.includes("@") || error === "" ? 25 : 10 }}>
            <Controller
              control={control}
              name="correo"
              render={({ field: { onChange, value } }) => (
                <Entrada
                  label="Correo electrónico institucional"
                  value={value}
                  maxLength={100}
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

          {!error.includes("@") && error != '' && (
            <Text allowFontScaling={false} style={styles.errorRestablecerContrasena}>{error}</Text>
          )}

          <Boton
            title={isSubmitting ? "Enviando…" : "Restablecer contraseña"}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          />

          <View style={styles.separador} />

          <View style={styles.restrablecerTexto}>
            <Text allowFontScaling={false} style={{ fontSize: Fuentes.cuerpo, color: Colores.textoSecundario }}>¿Ya recordaste tu contraseña?</Text>
            <Link allowFontScaling={false} href="/(auth)/iniciar-sesion" style={styles.restablecerLink}>
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
    marginVertical: 16,
  },
  restrablecerTexto: {
    flexDirection: 'row',
    justifyContent: "center",
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
    fontSize: Fuentes.cuerpo,
    color: Colores.textoSecundario,
  },
  restablecerLink: {
    color: Colores.textoInfo,
    fontWeight: "500",
  },
  errorRestablecerContrasena: {
    fontSize: Fuentes.caption,
    color: Colores.textoError,
    marginBottom: 25,
  },
});
