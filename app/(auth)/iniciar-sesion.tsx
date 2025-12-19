import Encabezado from '@/componentes/layout/Encabezado';
import PiePagina from '@/componentes/layout/PiePagina';
import Boton from '@/componentes/ui/Boton';
import Entrada from '@/componentes/ui/Entrada';
import { useAuth } from '@/context/AuthProvider';
import { iniciarSesionEsquema, type IniciarSesionFormulario } from '@/lib/validacion';
import { Colores, Fuentes } from '@/temas/colores';
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

export default function IniciarSesion() {
  const { iniciarSesion, errorMessage } = useAuth();

  const esMovil = Platform.OS === "ios" || Platform.OS === "android";
  const { width } = useWindowDimensions();
  const esPantallaPequeña = width < 850;

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
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "web" ? undefined : "padding"} keyboardVerticalOffset={5} >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Encabezado />
        <View style={[styles.contenedorPrincipal, esPantallaPequeña ? { flexDirection: 'column', marginBottom: 15 } : { flexDirection: 'row' }]}>
          {!esMovil && (
            <>
              <View style={[styles.textoContainer, esPantallaPequeña ? { width: '70%', marginTop: 35, marginBottom: 10 } : { width: "30%" }]}>
                <Image
                  source={require('@/activos/imagenes/siseg.png')}
                  style={{ width: esPantallaPequeña ? 70 : 150, height: esPantallaPequeña ? 70 : 150, marginBottom: 15 }}
                  tintColor={Colores.primario}
                />

                <Text allowFontScaling={false} style={[styles.bienvenidaSubtitulo, { fontSize: esPantallaPequeña ? Fuentes.cuerpo : Fuentes.subtitulo }]}>
                  Sistema de Seguimiento del Servicio Social para la ENMyH
                </Text>
                {!esPantallaPequeña && (
                  <Text allowFontScaling={false} style={styles.bienvenidaDescripcion}>
                    <Text allowFontScaling={false} style={{ color: Colores.primario, fontWeight: '600' }}>SISEG</Text> es una herramienta informática diseñada para dar seguimiento al servicio social de la <Text style={{ fontWeight: '600' }}>Escuela Nacional de Medicina y Homeopatía</Text>.
                  </Text>
                )}
              </View>
            </>
          )}

          <View style={[styles.contenedorFormulario, { width: esPantallaPequeña ? '90%' : '70%' }]}>
            <Text allowFontScaling={false} style={styles.titulo}>Iniciar sesión</Text>
            <View style={{ marginBottom: errors.boleta ? 5 : 20 }}>
              <Controller
                control={control}
                name="boleta"
                render={({ field: { onChange, value } }) => (
                  <Entrada
                    label="Boleta"
                    id='Boleta'
                    value={value}
                    onChangeText={(text) => {
                      const digitos = text.replace(/[^0-9]/g, "");
                      onChange(digitos);
                    }}
                    autoCapitalize="none"
                    keyboardType="numeric"
                    maxLength={10}
                    error={errors.boleta?.message}
                  />
                )}
              />
            </View>

            <View style={{ marginBottom: errors.contraseña ? 0 : 15 }}>
              <Controller
                control={control}
                name="contraseña"
                render={({ field: { onChange, value } }) => (
                  <Entrada
                    label="Contraseña"
                    id='contraseña'
                    secureTextEntry
                    value={value}
                    maxLength={45}
                    onChangeText={onChange}
                    error={errors.contraseña?.message}
                  />
                )}
              />
            </View>

            {errorMessage ? (
              <Text allowFontScaling={false} style={styles.errorIniciarSesion}>{errorMessage}</Text>
            ) : null}

            <Link allowFontScaling={false} href="/(auth)/restablecer-contrasena" style={styles.olvidarContraseña}>¿Olvidaste tu contraseña?</Link>

            <Boton
              title={isSubmitting ? 'Iniciando sesión…' : 'Iniciar sesión'}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
            />

            <View style={styles.separador} />

            <View style={styles.iniciarSesionTexto}>
              <Text allowFontScaling={false} style={{ fontSize: Fuentes.cuerpo, color: Colores.textoSecundario }}>¿Aún no tienes una cuenta?</Text>
              <Link allowFontScaling={false} href="/(auth)/registrar-cuenta" style={styles.iniciarSesionLink}>
                Regístrate aquí
              </Link>
            </View>
            {!esMovil && (
              <>
                <View style={{ flexDirection: 'row', justifyContent: "center", marginTop: 10, gap: 10 }}>
                  <Text allowFontScaling={false} style={{ fontSize: 13, color: Colores.textoClaro }}>Disponible en Android</Text>
                  <Link allowFontScaling={false} href="https://expo.dev/artifacts/eas/83pCjUZFRmCofwgpmDLzox.apk" style={{ fontSize: 13, color: Colores.textoClaro }}>
                    <Ionicons name="logo-android"></Ionicons>
                  </Link>
                </View>
              </>
            )}
          </View>
        </View>
        <PiePagina />
      </ScrollView>
    </KeyboardAvoidingView >
  );
}

const styles = StyleSheet.create({
  contenedorPrincipal: {
    flex: 1,
    justifyContent: "space-evenly",
    alignItems: 'center',
  },
  textoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  bienvenidaSubtitulo: {
    fontWeight: '600',
    color: Colores.textoPrincipal,
    textAlign: 'center',
    marginBottom: 8,
  },
  bienvenidaDescripcion: {
    fontSize: Fuentes.cuerpo,
    color: Colores.textoSecundario,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  contenedorFormulario: {
    maxWidth: 500,
    padding: 24,
    marginVertical: "auto",
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
