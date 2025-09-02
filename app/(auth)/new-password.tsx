import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, StyleSheet, Text, View } from "react-native";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import ErrorText from "@/components/ui/ErrorText";
import FloatingLabelInput from "@/components/ui/FloatingLabelInput";

import { z } from "zod";

const newPasswordSchema = z
  .object({
    password: z
      .string()
      .nonempty("La contraseña es obligatoria")
      .min(8, "Debe tener al menos 8 caracteres"),
    confirmPassword: z.string().nonempty("Debes confirmar la contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type NewPasswordForm = z.infer<typeof newPasswordSchema>;

export default function NewPassword() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewPasswordForm>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async ({ password }: NewPasswordForm) => {
    Alert.alert("Contraseña actualizada", "Tu contraseña ha sido cambiada con éxito.");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header />

      <View style={styles.formWrapper}>
        <Text style={styles.title}>Restablecer Contraseña</Text>

        <View style={{ marginBottom: 10 }}>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <FloatingLabelInput
                label="Nueva Contraseña"
                secureTextEntry
                value={value}
                onChangeText={onChange}
                error={!!errors.password}
              />
            )}
          />
          <ErrorText>{errors.password?.message}</ErrorText>
        </View>

        <View style={{ marginBottom: 10 }}>
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <FloatingLabelInput
                label="Confirmar Contraseña"
                secureTextEntry
                value={value}
                onChangeText={onChange}
                error={!!errors.confirmPassword}
              />
            )}
          />
          <ErrorText>{errors.confirmPassword?.message}</ErrorText>
        </View>

        <Button
          title={isSubmitting ? "Guardando…" : "Guardar contraseña"}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        />
      </View>

      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  formWrapper: {
    width: "90%",
    maxWidth: 500,
    margin: "auto",
    padding: 24,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 24,
    color: "#111827",
  },
  divider: {
    borderBottomWidth: 1,
    borderColor: "#d1d5db",
    marginVertical: 16,
  },
  registerText: {
    textAlign: "center",
    fontSize: 14,
    color: "#374151",
  },
  registerLink: {
    color: "#2563eb",
    fontWeight: "500",
  },
});
