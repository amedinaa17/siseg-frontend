import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, StyleSheet, Text, View } from "react-native";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import ErrorText from "@/components/ui/ErrorText";
import FloatingLabelInput from "@/components/ui/FloatingLabelInput";

import { emailSchema, type EmailForm } from "@/lib/validation";

export default function ResetPassword() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
    defaultValues: { correo: "" },
  });

  const onSubmit = async ({ correo }: EmailForm) => {
    Alert.alert(
      "Recuperación enviada",
      `Se ha enviado un correo a ${correo} con instrucciones para restablecer tu contraseña.`
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header />

      <View style={styles.formWrapper}>
        <Text style={styles.title}>Restablecer Contraseña</Text>

        <View style={{ marginBottom: 10 }}>
          <Controller
            control={control}
            name="correo"
            render={({ field: { onChange, value } }) => (
              <FloatingLabelInput
                label="Correo Electrónico Institucional"
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
                keyboardType="email-address"
                error={!!errors.correo}
              />
            )}
          />
          <ErrorText>{errors.correo?.message}</ErrorText>
        </View>

        <Button
          title={isSubmitting ? "Enviando…" : "Recuperar contraseña"}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        />

        <View style={styles.divider} />

        <Text style={styles.registerText}>
          ¿Ya tienes una cuenta?{" "}
          <Link href="/(auth)/login" style={styles.registerLink}>
            Inicia sesión aquí
          </Link>
        </Text>
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
