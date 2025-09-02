import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import ErrorText from '@/components/ui/ErrorText';
import FloatingLabelInput from '@/components/ui/FloatingLabelInput';
import { useAuth } from '@/context/AuthProvider';
import { authSchema, type AuthForm } from '@/lib/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';

export default function Login() {
  const { signIn } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthForm>({
    resolver: zodResolver(authSchema),
    defaultValues: { boleta: '', password: '' },
  });

  const onSubmit = async ({ boleta, password }: AuthForm) => {
    await signIn(boleta, password);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Header />
      <View style={styles.formWrapper}>
        <Text style={styles.title}>Inicio de Sesión</Text>

        <View style={{ marginBottom: 10 }}>
          <Controller
            control={control}
            name="boleta"
            render={({ field: { onChange, value } }) => (
              <FloatingLabelInput
                label="Boleta"
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
                error={!!errors.boleta}
              />
            )}
          />
          <ErrorText>{errors.boleta?.message}</ErrorText>
        </View>

        <View style={{ marginBottom: 10 }}>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <FloatingLabelInput
                label="Contraseña"
                secureTextEntry
                value={value}
                onChangeText={onChange}
                error={!!errors.password}
              />
            )}
          />
          <ErrorText>{errors.password?.message}</ErrorText>
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
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
    color: '#111827',
  },
  forgot: {
    textAlign: 'right',
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 25,
  },
  divider: {
    borderBottomWidth: 1,
    borderColor: '#d1d5db',
    marginVertical: 25,
  },
  registerText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#374151',
  },
  registerLink: {
    color: '#2563eb',
    fontWeight: '500',
  },
});
