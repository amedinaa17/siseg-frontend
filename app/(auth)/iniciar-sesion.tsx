import Encabezado from '@/componentes/layout/Encabezado';
import PiePagina from '@/componentes/layout/PiePagina';
import Boton from '@/componentes/ui/Boton';
import Entrada from '@/componentes/ui/Entrada';
import { useAuth } from '@/context/AuthProvider';
import { iniciarSesionEsquema, type IniciarSesionFormulario } from '@/lib/validacion';
import { Colores, Fuentes } from '@/temas/colores';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function IniciarSesion() {
  const { iniciarSesion, errorMessage } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IniciarSesionFormulario>({
    resolver: zodResolver(iniciarSesionEsquema),
    defaultValues: { boleta: "", contraseña: "" },
  });

  const onSubmit = async ({ boleta, contraseña }: IniciarSesionFormulario) => {
    await iniciarSesion(boleta, contraseña);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "web" ? undefined : "padding"} keyboardVerticalOffset={80} >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Encabezado />
        <View style={styles.contenedorFormulario}>
          <Text style={styles.titulo}>Inicio de Sesión</Text>

          <View style={{ marginBottom: 15 }}>
            <Controller
              control={control}
              name="boleta"
              render={({ field: { onChange, value } }) => (
                <Entrada
                  label="Boleta"
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="none"
                  keyboardType="numeric"
                  error={errors.boleta?.message}
                />
              )}
            />
          </View>

          <View style={{ marginBottom: 15 }}>
            <Controller
              control={control}
              name="contraseña"
              render={({ field: { onChange, value } }) => (
                <Entrada
                  label="Contraseña"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  error={errors.contraseña?.message}
                />
              )}
            />
          </View>

          {errorMessage ? (
            <Text style={styles.errorIniciarSesion}>{errorMessage}</Text>
          ) : null}

          <Link href="/(auth)/restablecer-contrasena" style={styles.olvidarContraseña}>¿Olvidaste tu contraseña?</Link>

          <Boton
            title={isSubmitting ? 'Iniciando sesión…' : 'Iniciar sesión'}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          />

          <View style={styles.separador} />

          <View style={styles.iniciarSesionTexto}>
            <Text>¿Aún no tienes una cuenta?</Text>
            <Link href="/(auth)/registrar-cuenta" style={styles.iniciarSesionLink}>
              Regístrate aquí
            </Link>
          </View>
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
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 6 },
      android: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 6 },
      web: { boxShadow: "0px 4px 6px rgba(0,0,0,0.05)" },
    }),
    elevation: 2,
  },
  titulo: {
    fontSize: Fuentes.titulo,
    color: Colores.textoPrincipal,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  olvidarContraseña: {
    fontSize: Fuentes.small,
    color: Colores.textoClaro,
    textAlign: 'right',
    marginBottom: 25,
  },
  separador: {
    borderColor: Colores.borde,
    borderBottomWidth: 1,
    marginVertical: 25,
  },
  iniciarSesionTexto: {
    flexDirection: 'row',
    justifyContent: "center",
    ...Platform.select({
      ios: {
        gap: 10,
      },
      android: {
        gap: 10,
      },
      web: {
        gap: 50,
      },
    }),
    fontSize: Fuentes.cuerpo,
    color: Colores.textoSecundario,
  },
  iniciarSesionLink: {
    color: Colores.textoInfo,
    fontWeight: '500',
  },
  errorIniciarSesion: {
    fontSize: Fuentes.caption,
    color: Colores.textoError,
    marginBottom: 10,
  },
});
