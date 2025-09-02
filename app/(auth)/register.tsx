import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import ErrorText from "@/components/ui/ErrorText";
import FloatingLabelInput from "@/components/ui/FloatingLabelInput";

import { useAuth } from "@/context/AuthProvider";
import { registerSchema, type RegisterForm } from "@/lib/validation";

export default function Register() {
  const { signUp } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { correo: "" },
  });

  const onSubmit = async ({ correo }: RegisterForm) => {
    await signUp(correo);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header />

      <View style={styles.formWrapper}>
        <Text style={styles.title}>Registro</Text>

        <View style={{ marginBottom: 25 }}>
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
          title={isSubmitting ? "Registrando…" : "Registrar"}
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
    borderColor: '#d1d5db',
    marginVertical: 25,
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
