import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import FloatingLabelInput from '@/components/ui/FloatingLabelInput';
import { useAuth } from '@/context/AuthProvider';
import { authSchema, type AuthForm } from '@/lib/validation';
import { Colors, Fonts } from '@/theme/colors';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function Login() {
  const { signIn } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthForm>({
    resolver: zodResolver(authSchema),
    defaultValues: { boleta: "", password: "" },
  });

  const onSubmit = async ({ boleta, password }: AuthForm) => {
    await signIn(boleta, password);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Header />
        <View style={styles.formWrapper}>
          <Text style={styles.title}>Inicio de Sesión</Text>

          <View style={{ marginBottom: 15 }}>
            <Controller
              control={control}
              name="boleta"
              render={({ field: { onChange, value } }) => (
                <FloatingLabelInput
                  label="Boleta"
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="none"
                  error={errors.boleta?.message}
                />
              )}
            />
          </View>

          <View style={{ marginBottom: 15 }}>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <FloatingLabelInput
                  label="Contraseña"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  error={errors.password?.message}
                />
              )}
            />
          </View>

          <Link href="/(auth)/reset-password" style={styles.forgot}>¿Olvidaste tu contraseña?</Link>

          <Button
            title={isSubmitting ? 'Iniciando sesión…' : 'Iniciar sesión'}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          />

          <View style={styles.divider} />

          <Text style={styles.registerText}>
            ¿Aún no tienes una cuenta?{' '}
            <Link href="/(auth)/register" style={styles.registerLink}>
              Regístrate aquí
            </Link>
          </Text>
            <Link href="/(auth)/complete-register" style={styles.registerLink}>
              prueba
            </Link>
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
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  forgot: {
    fontSize: Fonts.small,
    color: Colors.lightText,
    textAlign: 'right',
    marginBottom: 25,
  },
  divider: {
    borderColor: Colors.borderColor,
    borderBottomWidth: 1,
    marginVertical: 25,
  },
  registerText: {
    fontSize: Fonts.text,
    color: Colors.darkText,
    textAlign: 'center',
  },
  registerLink: {
    color: Colors.link,
    fontWeight: '500',
  },
});
