import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import FloatingLabelInput from "@/components/ui/FloatingLabelInput";
import { emailSchema, type EmailForm } from "@/lib/validation";
import { Colors, Fonts } from '@/theme/colors';
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Platform, ScrollView, StyleSheet, Text, View } from "react-native";

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
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Header />
        <View style={styles.formWrapper}>
          <Text style={styles.title}>Restablecer Contraseña</Text>

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
                  error={errors.correo?.message}
                />
              )}
            />
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  formWrapper: {
    width: "90%",
    maxWidth: 500,
    margin: "auto",
    padding: 24,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: Colors.borderColor,
    backgroundColor: Colors.background,
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
  title: {
    fontSize: Fonts.title,
    color: Colors.secondary,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 24,
  },
  divider: {
    borderColor: Colors.borderColor,
    borderBottomWidth: 1,
    marginVertical: 16,
  },
  registerText: {
    fontSize: Fonts.text,
    color: Colors.darkText,
    textAlign: "center",
  },
  registerLink: {
    color: Colors.link,
    fontWeight: "500",
  },
});
