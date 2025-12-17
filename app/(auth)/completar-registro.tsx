import Encabezado from "@/componentes/layout/Encabezado";
import ModalAPI, { ModalAPIRef } from "@/componentes/layout/ModalAPI";
import PiePagina from "@/componentes/layout/PiePagina";
import Boton from "@/componentes/ui/Boton";
import Entrada from "@/componentes/ui/Entrada";
import Selector from "@/componentes/ui/Selector";
import { fetchData, postData } from "@/servicios/api";
import { Colores, Fuentes } from '@/temas/colores';
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import {
  registroEsquema,
  type RegistroFormulario,
} from "@/lib/validacion";

export default function CompletarRegistro() {
  const router = useRouter();

  const [cargando, setCargando] = useState(false);

  const modalAPI = useRef<ModalAPIRef>(null);

  const { width } = useWindowDimensions();
  const esPantallaPequeña = width < 790;

  const [alumno, setAlumno] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegistroFormulario>({
    resolver: zodResolver(registroEsquema)
  });

  useEffect(() => {
    const obtenerDatos = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("tk");
      setAlumno({ "tk": token })

      if (token) {
        try {
          setCargando(true);

          const response = await fetchData(`users/getValidarDatos?tk=${token}`);
          if (response.error === 0) {
            setAlumno(prevState => ({
              ...prevState,
              ...response.data,
            }));
          } else {
            if (response.message.includes("expirado"))
              setError("El enlace ha caducado. Registra tu correo electrónico institucional nuevamente para recibir otro.");
            else if (response.message.includes("inválido"))
              setError("El enlace no es válido. Verifica que el enlace sea el correcto o registra tu correo electrónico institucional nuevamente para recibir otro.");
            else
              setError("Hubo un problema al obtener tus datos del servidor. Inténtalo de nuevo más tarde.");
          }
        } catch (error) {
          setError("Error al conectar con el servidor. Inténtalo de nuevo más tarde.");
        } finally {
          setCargando(false);
        }
      } else {
        setError("El enlace no contiene un token válido. Verifica que el enlace sea el correcto o registra tu correo electrónico institucional nuevamente para recibir otro.");
      }
    };

    obtenerDatos();
  }, []);

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const onSubmit = async (datos: RegistroFormulario) => {
    try {
      const datosAlumno = {
        ...datos,
        tk: alumno.tk
      };
      const response = await postData("users/completarRegistro", datosAlumno);

      if (response.error === 0) {
        modalAPI.current?.show(true, "Tu registro se ha completado correctamente. Hemos enviado a tu correo electrónico tu usuario y contraseña para iniciar sesión en el sistema.",
          () => { router.replace("/"); });
      } else {
        modalAPI.current?.show(false, "Hubo un problema al completar tu registro. Inténtalo de nuevo más tarde.", () => { router.replace("/"); });
      }
    } catch (error) {
      modalAPI.current?.show(false, "Error al conectar con el servidor. Inténtalo de nuevo más tarde.", () => { router.replace("/"); });
    }
  };

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      modalAPI.current?.show(false, "Algunos campos contienen errores. Revísalos y vuelve a intentarlo.");
    }
  }, [errors]);

  return (
    <>
      {cargando && (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white", position: "absolute", top: 60, left: 0, right: 0, bottom: 0, zIndex: 100 }}>
          <ActivityIndicator size="large" color="#5a0839" />
        </View>
      )}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "web" ? undefined : "padding"} keyboardVerticalOffset={5} >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <Encabezado />
          <View style={{ flex: 1 }}>
            {error ? (
              <View style={[styles.contenedorError]}>
                <Ionicons name="sad-outline" size={65} color={Colores.textoClaro} />
                <Text allowFontScaling={false} style={styles.error}>¡Oops! Algo salió mal</Text>
                <Text allowFontScaling={false} style={styles.mensaje}>{error}</Text>
                <Boton title="Volver a intentarlo" onPress={() => router.replace("/registrar-cuenta")} />
              </View>
            ) : (
              <>
                <View style={[styles.contenedorFormulario, esPantallaPequeña && { maxWidth: "95%" }]}>
                  <Text allowFontScaling={false} style={styles.titulo}>
                    {step === 1 ? "Validar datos" : "Completar registro"}
                  </Text>

                  {step === 1 && (
                    <>
                      <Text allowFontScaling={false} style={{ fontSize: Fuentes.cuerpo, color: Colores.textoPrincipal, marginBottom: 20 }}>
                        Verifica que tus datos sean correctos. Si hay un error, acude al Departamento de Extensión y Apoyos Educativos.
                      </Text>
                      <View style={{ marginBottom: 20 }} >
                        <Entrada label="Nombre" value={alumno?.nombre || ""} editable={false} />
                      </View>

                      <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                        <View style={{ flex: 1, marginBottom: 20 }}>
                          <Entrada
                            label="Apellido paterno"
                            value={alumno?.apellido_paterno || ""}
                            editable={false}
                          />
                        </View>
                        <View style={{ flex: 1, marginBottom: 20 }}>
                          <Entrada
                            label="Apellido materno"
                            value={alumno?.apellido_materno || ""}
                            editable={false}
                          />
                        </View>
                      </View>

                      <View style={{ marginBottom: 20 }} >
                        <Entrada
                          label="CURP"
                          maxLength={18}
                          value={alumno?.curp || ""}
                          editable={false}
                        />
                      </View>

                      <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                        <View style={{ flex: 1, marginBottom: 20 }}>
                          <Entrada
                            label="Boleta"
                            keyboardType="numeric"
                            maxLength={10}
                            value={alumno?.boleta || ""}
                            editable={false}
                          />
                        </View>
                        <View style={{ flex: 1, marginBottom: 20 }}>
                          <Entrada
                            label="Carrera"
                            value={alumno?.carrera || ""}
                            editable={false}
                          />
                        </View>
                      </View>

                      <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                        <View style={{ flex: 1, marginBottom: 20 }}>
                          <Entrada
                            label="Generación"
                            value={alumno?.generacion || ""}
                            editable={false}
                          />
                        </View>
                        <View style={{ flex: 1, marginBottom: 20 }}>
                          <Entrada
                            label="Promedio"
                            value={alumno?.promedio || ""}
                            editable={false}
                          />
                        </View>
                      </View>

                      <View style={{ marginBottom: 25 }} >
                        <Entrada
                          label="Correo electrónico institucional"
                          value={alumno?.correo || ""}
                          editable={false}
                        />
                      </View>

                      <View style={{ flexDirection: "row", gap: 12 }}>
                        <View style={{ flex: 1 }} />
                        <View style={{ flex: 1 }}>
                          <Boton title="Siguiente" onPress={handleNext} />
                        </View>
                      </View>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <Text allowFontScaling={false} style={{ fontSize: Fuentes.cuerpo, color: Colores.textoPrincipal, marginBottom: 20 }}>
                        Para completar tu registro, ingresa los siguientes datos:
                      </Text>
                      <View style={{ marginBottom: errors.rfc ? 5 : 20 }}>
                        <Controller
                          control={control}
                          name="rfc"
                          defaultValue=""
                          render={({ field: { onChange, value } }) => (
                            <Entrada
                              label="RFC"
                              value={value}
                              maxLength={13}
                              onChangeText={(text) => {
                                const alfanumerico = text.replace(/[^a-zA-Z0-9]/g, '');
                                onChange(alfanumerico.toUpperCase());
                              }}
                              error={errors.rfc?.message}
                            />
                          )}
                        />
                      </View>

                      <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                        <View style={[!esPantallaPequeña && { flex: 1 }, { marginBottom: errors.calle ? 5 : 20 }]}>
                          <Controller
                            control={control}
                            name="calle"
                            defaultValue=""
                            render={({ field: { onChange, value } }) => (
                              <Entrada
                                label="Calle y número"
                                value={value} onChangeText={onChange}
                                maxLength={45}
                                error={errors.calle?.message}
                              />
                            )}
                          />
                        </View>
                        <View style={[!esPantallaPequeña && { flex: 1 }, { marginBottom: errors.colonia ? 5 : 20 }]}>
                          <Controller
                            control={control}
                            name="colonia"
                            defaultValue=""
                            render={({ field: { onChange, value } }) => (
                              <Entrada
                                label="Colonia"
                                value={value} onChangeText={onChange}
                                maxLength={45}
                                error={errors.colonia?.message}
                              />
                            )}
                          />
                        </View>
                      </View>
                      <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]} >
                        <View style={[!esPantallaPequeña && { flex: 1 }, { marginBottom: errors.delegacion ? 5 : 20 }]}>
                          <Controller
                            control={control}
                            name="delegacion"
                            defaultValue=""
                            render={({ field: { onChange, value } }) => (
                              <Entrada
                                label="Delegación / municipio"
                                value={value} onChangeText={onChange}
                                maxLength={45}
                                error={errors.delegacion?.message}
                              />
                            )}
                          />
                        </View>
                        <View style={[!esPantallaPequeña && { flex: 1 }, { marginBottom: errors.estado ? 5 : 20 }]}>
                          <Controller
                            control={control}
                            name="estado"
                            defaultValue=""
                            render={({ field: { onChange, value } }) => (
                              <Entrada
                                label="Estado de procedencia"
                                value={value} onChangeText={onChange}
                                maxLength={45}
                                error={errors.estado?.message}
                              />
                            )}
                          />
                        </View>
                      </View>

                      <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]} >
                        <View style={[!esPantallaPequeña && { flex: 1 }, { marginBottom: errors.cp ? 5 : 20 }]}>
                          <Controller
                            control={control}
                            name="cp"
                            defaultValue=""
                            render={({ field: { onChange, value } }) => (
                              <Entrada
                                label="Código postal"
                                keyboardType="numeric"
                                maxLength={5}
                                value={value}
                                onChangeText={(text) => {
                                  const digitos = text.replace(/[^0-9]/g, "");
                                  onChange(digitos);
                                }}
                                error={errors.cp?.message}
                              />
                            )}
                          />
                        </View>
                        <View style={[!esPantallaPequeña && { flex: 1 }, { marginBottom: errors.sexo ? 5 : 20 }]}>
                          <Controller
                            control={control}
                            name="sexo"
                            defaultValue=""
                            render={({ field: { onChange, value } }) => (
                              <Selector
                                label="Sexo"
                                selectedValue={value === "F" ? "Femenino" : value === "M" ? "Masculino" : ""}
                                onValueChange={(val) => onChange(val)}
                                items={[
                                  { label: "Masculino", value: "M" },
                                  { label: "Femenino", value: "F" },
                                ]}
                                error={errors.sexo?.message}
                              />
                            )}
                          />
                        </View>
                      </View>

                      <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                        <View style={[!esPantallaPequeña && { flex: 1 }, { marginBottom: errors.telcelular ? 5 : 20 }]}>
                          <Controller
                            control={control}
                            name="telcelular"
                            defaultValue=""
                            render={({ field: { onChange, value } }) => (
                              <Entrada
                                label="Celular"
                                keyboardType="phone-pad"
                                maxLength={10}
                                value={value}
                                onChangeText={(text) => {
                                  const digitos = text.replace(/[^0-9]/g, "");
                                  onChange(digitos);
                                }}
                                error={errors.telcelular?.message}
                              />
                            )}
                          />
                        </View>
                        <View style={[!esPantallaPequeña && { flex: 1 }, { marginBottom: errors.tellocal ? 5 : 30 }]}>
                          <Controller
                            control={control}
                            name="tellocal"
                            defaultValue=""
                            render={({ field: { onChange, value } }) => (
                              <Entrada
                                label="Teléfono local"
                                keyboardType="phone-pad"
                                maxLength={10}
                                value={value}
                                onChangeText={(text) => {
                                  const digitos = text.replace(/[^0-9]/g, "");
                                  onChange(digitos);
                                }}
                                error={errors.tellocal?.message}
                              />
                            )}
                          />
                        </View>
                      </View>

                      <View style={{ flexDirection: "row", gap: 12 }}>
                        <View style={{ flex: 1 }}>
                          <Boton title="Regresar" onPress={handleBack} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Boton
                            title={isSubmitting ? "Guardando…" : "Guardar datos"}
                            onPress={handleSubmit(onSubmit)}
                            disabled={isSubmitting}
                          />
                        </View>
                      </View>
                    </>
                  )}
                </View>
              </>
            )}
          </View>
          <PiePagina />
          <ModalAPI ref={modalAPI} />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  contenedorError: {
    flex: 1,
    width: 450,
    alignItems: "center",
    margin: "auto",
    justifyContent: "center",
  },
  contenedorFormulario: {
    width: "90%",
    maxWidth: 800,
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
    marginVertical: 30,
  },
  titulo: {
    fontSize: Fuentes.titulo,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 24,
    color: Colores.textoPrincipal,
  },
  error: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colores.primario,
    marginBottom: 15,
  },
  mensaje: {
    fontSize: Fuentes.cuerpo,
    color: Colores.textoClaro,
    textAlign: "center",
    marginBottom: 15,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
});
