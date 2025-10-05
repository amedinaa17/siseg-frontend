import Encabezado from "@/componentes/layout/Encabezado";
import PiePagina from "@/componentes/layout/PiePagina";
import Boton from "@/componentes/ui/Boton";
import Entrada from "@/componentes/ui/Entrada";
import { cambiarContraseñaEsquema, CambiarContraseñaFormulario } from "@/lib/validacion";
import { Colores, Fuentes } from '@/temas/colores';
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";

export default function NuevaContraseña() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CambiarContraseñaFormulario>({
    resolver: zodResolver(cambiarContraseñaEsquema),
    defaultValues: { contraseña: "", confirmarContraseña: "" },
  });

  const onSubmit = async ({ contraseña }: CambiarContraseñaFormulario) => {
    Alert.alert("Contraseña actualizada", "Tu contraseña ha sido cambiada con éxito.");
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={80} >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Encabezado />
        <View style={styles.contenedorFormulario}>
          <Text style={styles.titulo}>Restablecer Contraseña</Text>

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
});
