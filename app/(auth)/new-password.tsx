import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import FloatingLabelInput from "@/components/ui/FloatingLabelInput";
import { ChangePasswordForm, changePasswordSchema } from "@/lib/validation";
import { Colors, Fonts } from '@/theme/colors';
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Platform, ScrollView, StyleSheet, Text, View } from "react-native";

export default function NewPassword() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async ({ password }: ChangePasswordForm) => {
    Alert.alert("Contraseña actualizada", "Tu contraseña ha sido cambiada con éxito.");
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Header />
        <View style={styles.formWrapper}>
          <Text style={styles.title}>Restablecer Contraseña</Text>

          <View style={{ marginBottom: 15 }}>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <FloatingLabelInput
                  label="Nueva Contraseña"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  error={errors.password?.message}
                />
              )}
            />
          </View>

          <View style={{ marginBottom: 25 }}>
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <FloatingLabelInput
                  label="Confirmar Contraseña"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  error={errors.confirmPassword?.message}
                />
              )}
            />
          </View>

          <Button
            title={isSubmitting ? "Guardando…" : "Guardar contraseña"}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          />
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
