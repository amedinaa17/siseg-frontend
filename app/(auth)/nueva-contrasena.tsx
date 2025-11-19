import Encabezado from "@/componentes/layout/Encabezado";
import ModalAPI, { ModalAPIRef } from "@/componentes/layout/ModalAPI";
import PiePagina from "@/componentes/layout/PiePagina";
import Boton from "@/componentes/ui/Boton";
import Entrada from "@/componentes/ui/Entrada";
import { cambiarContraseñaEsquema, CambiarContraseñaFormulario } from "@/lib/validacion";
import { postData } from "@/servicios/api";
import { Colores, Fuentes } from '@/temas/colores';
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";

export default function NuevaContraseña() {
  const router = useRouter();
  const modalAPI = useRef<ModalAPIRef>(null);

  const [token, setToken] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const obtenerToken = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("tk");
      setToken(token)

      if (!token) {
        setError("El enlace no contiene un token válido. Verifica que el enlace sea el correcto o solicita restablecer tu contraseña nuevamente.");
      }
    };

    obtenerToken();
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CambiarContraseñaFormulario>({
    resolver: zodResolver(cambiarContraseñaEsquema),
    defaultValues: { contraseña: "", confirmarContraseña: "" },
  });

  const onSubmit = async (contraseña: CambiarContraseñaFormulario) => {
    console.log(token)
    try {
      const datos = {
        password: contraseña.contraseña,
        tk: token
      };
      const response = await postData("users/restablecerPassword", datos);

      if (response.error === 0) {
        modalAPI.current?.show(true, "Tu contraseña se ha actualizado correctamente.",
          () => { router.replace("/"); });
      } else {
        if (response.message.includes("expirado"))
          setError("El enlace ha caducado. Solicita nuevamente el restablecimiento de tu contraseña.");
        else if (response.message.includes("inválido"))
          setError("El enlace no es válido. Verifica que el enlace sea el correcto o solicita nuevamente el restablecimiento de tu contraseña.");
        else
          modalAPI.current?.show(false, "Hubo un problema al cambiar tu contraseña. Inténtalo de nuevo más tarde.",
            () => { router.replace("/"); });
      }
    } catch (error) {
      modalAPI.current?.show(false, "Error al conectar con el servidor. Inténtalo de nuevo más tarde.",
        () => { router.replace("/"); });
    }
  };

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      modalAPI.current?.show(false, "Algunos campos contienen errores. Revísalos y vuelve a intentarlo.");
    }
  }, [errors]);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "web" ? undefined : "padding"} keyboardVerticalOffset={80} >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Encabezado />
        {error ? (
          <View style={[styles.contenedorError]}>
            <Ionicons name="sad-outline" size={65} color={Colores.textoClaro} />
            <Text style={styles.error}>¡Oops! Algo salió mal</Text>
            <Text style={styles.mensaje}>{error}</Text>
            <Boton title="Volver a intentarlo" onPress={() => router.replace("/restablecer-contrasena")} />
          </View>
        ) : (
          <>
            <View style={styles.contenedorFormulario}>
              <Text style={styles.titulo}>Restablecer contraseña</Text>

              <View style={{ marginBottom: 15 }}>
                <Controller
                  control={control}
                  name="contraseña"
                  render={({ field: { onChange, value } }) => (
                    <Entrada
                      label="Nueva Contraseña"
                      secureTextEntry
                      value={value}
                      onChangeText={onChange}
                      error={errors.contraseña?.message}
                    />
                  )}
                />
              </View>

              <View style={{ marginBottom: 25 }}>
                <Controller
                  control={control}
                  name="confirmarContraseña"
                  render={({ field: { onChange, value } }) => (
                    <Entrada
                      label="Confirmar Contraseña"
                      secureTextEntry
                      value={value}
                      onChangeText={onChange}
                      error={errors.confirmarContraseña?.message}
                    />
                  )}
                />
              </View>

              <Boton
                title={isSubmitting ? "Guardando…" : "Guardar contraseña"}
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting}
              />
            </View>
          </>
        )}
        <ModalAPI ref={modalAPI} />
        <PiePagina />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contenedorError: {
    flex: 1,
    width: 450,
    alignItems: "center",
    margin: "auto",
    justifyContent: "center",
  },
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
  error: {
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
