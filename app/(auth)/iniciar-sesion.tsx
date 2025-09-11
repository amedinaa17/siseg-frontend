import Encabezado from '@/componentes/layout/Encabezado';
import PiePagina from '@/componentes/layout/PiePagina';
import Boton from '@/componentes/ui/Boton';
import EntradaEtiquetaFlotante from '@/componentes/ui/EntradaEtiquetaFlotante';
import { useAuth } from '@/context/AuthProvider';
import { iniciarSesionEsquema, type IniciarSesionFormulario } from '@/lib/validacion';
import { Colores, Fuentes } from '@/temas/colores';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function IniciarSesion() {
  const { iniciarSesion } = useAuth();
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
    <View style={{ flex: 1, backgroundColor: Colores.fondo }}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Encabezado />
        <View style={styles.contenedorFormulario}>
          <Text style={styles.titulo}>Inicio de Sesión</Text>

          <View style={{ marginBottom: 15 }}>
            <Controller
              control={control}
              name="boleta"
              render={({ field: { onChange, value } }) => (
                <EntradaEtiquetaFlotante
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
              name="contraseña"
              render={({ field: { onChange, value } }) => (
                <EntradaEtiquetaFlotante
                  label="Contraseña"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  error={errors.contraseña?.message}
                />
              )}
            />
          </View>

          <Link href="/(auth)/restablecer-contrasena" style={styles.olvidarContraseña}>¿Olvidaste tu contraseña?</Link>

          <Boton
            title={isSubmitting ? 'Iniciando sesión…' : 'Iniciar sesión'}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          />

          <View style={styles.separador} />

          <Text style={styles.iniciarSesionTexto}>
            ¿Aún no tienes una cuenta?{' '}
            <Link href="/(auth)/registro" style={styles.iniciarSesionLink}>
              Regístrate aquí
            </Link>
          </Text>
            <Link href="/(auth)/completar-registro" style={styles.iniciarSesionLink}>
              prueba
            </Link>
        </View>
        <PiePagina />
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
  contenedorFormulario: {
    width: "90%",
    maxWidth: 500,
    margin: "auto",
    padding: 24,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: Colores.bordes,
    backgroundColor: Colores.fondo,
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
  titulo: {
    fontSize: Fuentes.titulo,
    color: Colores.texto,
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
    borderColor: Colores.bordes,
    borderBottomWidth: 1,
    marginVertical: 25,
  },
  iniciarSesionTexto: {
    fontSize: Fuentes.texto,
    color: Colores.textoOscuro,
    textAlign: 'center',
  },
  iniciarSesionLink: {
    color: Colores.link,
    fontWeight: '500',
  },
});
