import Encabezado from "@/componentes/layout/Encabezado";
import ModalAPI, { ModalAPIRef } from "@/componentes/layout/ModalAPI";
import PiePagina from "@/componentes/layout/PiePagina";
import Boton from "@/componentes/ui/Boton";
import Entrada from "@/componentes/ui/Entrada";
import { useAuth } from "@/context/AuthProvider";
import { login } from "@/lib/auth/authServicio";
import { CambiarContraseñaFormulario, cambiarContraseñaEsquema } from "@/lib/validacion";
import { postData } from "@/servicios/api";
import { Colores, Fuentes } from '@/temas/colores';
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";

export default function CambiarContraseña() {
  const router = useRouter();
  const { sesion, verificarToken, cerrarSesion } = useAuth();
  const modalAPI = useRef<ModalAPIRef>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CambiarContraseñaFormulario>({
    resolver: zodResolver(cambiarContraseñaEsquema),
    defaultValues: { contraseña: "", confirmarContraseña: "" },
  });

  const onSubmit = async (contraseña: CambiarContraseñaFormulario) => {
    verificarToken();

    try {
      const datos = {
        password: contraseña.contraseña,
        tk: sesion.token
      };
      const response = await postData("users/restablecerPassword", datos);

      if (response.error === 0) {
        await login(sesion.boleta, contraseña.contraseña);
        verificarToken();
        modalAPI.current?.show(true, "Tu contraseña se ha actualizado correctamente.",
          () => { router.replace("/"); });
      } else {
        modalAPI.current?.show(false, "Hubo un problema al cambiar tu contraseña. Inténtalo de nuevo más tarde.",
          () => { cerrarSesion(); });
      }
    } catch (error) {
      modalAPI.current?.show(false, "Error al conectar con el servidor. Inténtalo de nuevo más tarde.",
        () => { cerrarSesion(); });
    }
  };

  const handleLogout = async () => {
    await cerrarSesion();
  };

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      modalAPI.current?.show(false, "Algunos campos contienen errores. Revísalos y vuelve a intentarlo.");
    }
  }, [errors]);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "web" ? undefined : "padding"} keyboardVerticalOffset={5} >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Encabezado />
        <View style={styles.contenedorFormulario}>
          <Text allowFontScaling={false} style={styles.titulo}>Cambiar contraseña</Text>
          <Text allowFontScaling={false} style={{ fontSize: Fuentes.cuerpo, color: Colores.textoPrincipal, textAlign: "center", marginBottom: 20 }}>
            Ingresa una nueva contraseña de 8 a 12 caracteres, que incluya al menos una letra mayúscula, una letra minúscula y un número.
          </Text>
          <View style={{ marginBottom: errors.contraseña ? 5 : 20 }}>
            <Controller
              control={control}
              name="contraseña"
              render={({ field: { onChange, value } }) => (
                <Entrada
                  label="Nueva contraseña"
                  secureTextEntry
                  value={value}
                  maxLength={12}
                  onChangeText={onChange}
                  error={errors.contraseña?.message}
                />
              )}
            />
          </View>

          <View style={{ marginBottom: errors.confirmarContraseña ? 15 : 25 }}>
            <Controller
              control={control}
              name="confirmarContraseña"
              render={({ field: { onChange, value } }) => (
                <Entrada
                  label="Confirmar contraseña"
                  secureTextEntry
                  value={value}
                  maxLength={12}
                  onChangeText={onChange}
                  error={errors.confirmarContraseña?.message}
                />
              )}
            />
          </View>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Boton title="Regresar" onPress={handleLogout} disabled={isSubmitting} />
            </View>
            <View style={{ flex: 1 }}>
              <Boton
                title={isSubmitting ? "Guardando…" : "Guardar contraseña"}
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting}
              />
            </View>
          </View>
        </View>
        <ModalAPI ref={modalAPI} />
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
  }
});
