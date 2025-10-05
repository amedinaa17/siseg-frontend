import Encabezado from "@/componentes/layout/Encabezado";
import Modal from "@/componentes/layout/Modal";
import PiePagina from "@/componentes/layout/PiePagina";
import Boton from "@/componentes/ui/Boton";
import Entrada from "@/componentes/ui/Entrada";
import { correoEsquema, type CorreoFormulario } from "@/lib/validacion";
import { postData } from "@/servicios/api";
import { Colores, Fuentes } from '@/temas/colores';
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";

export default function ResetPassword() {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMensaje, setModalMensaje] = useState('');
  const [modalTipo, setModalTipo] = useState(true);

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
    try {
      const response = await postData('users/restablecerPasswordEmail', { email: correo });

      if (response.error === 0) {
        setModalTipo(true);
        setModalMensaje(correo);
        setModalVisible(true);
        reset();
      } else {
        setModalMensaje("No existe una cuenta registrada con ese correo.");
      }
    } catch (error) {
      setModalMensaje("Error al conectar con el servidor. Intentalo de nuevo más tarde.");
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={80} >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Encabezado />
        <View style={styles.contenedorFormulario}>
          <Text style={styles.titulo}>Restablecer Contraseña</Text>

          <View style={{marginBottom: modalMensaje.includes("@") || modalMensaje === "" ?  25 : 15 }}>
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

          {!modalMensaje.includes("@") && modalMensaje != '' && (
            <Text style={styles.errorRestablecerContrasena}>{modalMensaje}</Text>
          )}

          <Boton
            title={isSubmitting ? "Enviando…" : "Recuperar contraseña"}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          />

          <View style={styles.separador} />

          <View style={styles.restrablecerTexto}>
            <Text>¿Ya recordaste tu contraseña?</Text>
            <Link href="/(auth)/iniciar-sesion" style={styles.restablecerLink}>
              Inicia sesión aquí
            </Link>
          </View>
        </View>
        <PiePagina />
        <Modal visible={modalVisible} titulo={modalTipo ? "" : ""} cerrar={false} onClose={() => setModalVisible(false)} >
          <View style={{ alignItems: "center" }}>
            <Ionicons
              name={modalTipo ? "checkmark-circle-outline" : "close-circle-outline"}
              size={80}
              color={modalTipo ? Colores.textoExito : Colores.textoError}
            />
            <Text style={{ fontSize: Fuentes.cuerpo, color: Colores.textoClaro, marginBottom: 8 }}>
              {modalTipo ? "¡Todo Listo!" : "¡Algo Salió Mal!"}
            </Text>
            <Text style={{ fontSize: Fuentes.cuerpo, color: Colores.textoPrincipal, marginBottom: 8, textAlign: "center" }}>
              {modalTipo ? (
                <>
                  Para continuar, hemos enviado un correo electrónico a{" "}
                  <Text style={{ color: Colores.textoInfo }}>
                    {modalMensaje}
                  </Text>
                  . Revisa tu bandeja de entrada y sigue las instrucciones.
                </>
              ) : modalMensaje}
            </Text>
          </View>
        </Modal>
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
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
