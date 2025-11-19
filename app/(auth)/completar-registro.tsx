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
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import {
  registroEsquema,
  type RegistroFormulario,
} from "@/lib/validacion";

export default function CompletarRegistro() {
  const router = useRouter();
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
        modalAPI.current?.show(false, "Hubo un problema al completar tu registro. Inténtalo de nuevo más tarde.");
      }
    } catch (error) {
      modalAPI.current?.show(false, "Error al conectar con el servidor. Inténtalo de nuevo más tarde.");
    }
  };

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      modalAPI.current?.show(false, "Algunos campos contienen errores. Revísalos y vuelve a intentarlo.");
    }
  }, [errors]);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "web" ? undefined : "padding"} keyboardVerticalOffset={80} >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Encabezado />
        {error ? (
          <View style={[styles.contenedorError]}>
            <Ionicons name="sad-outline" size={65} color={Colores.textoClaro} />
            <Text style={styles.error}>¡Oops! Algo salió mal</Text>
            <Text style={styles.mensaje}>{error}</Text>
            <Boton title="Volver a intentarlo" onPress={() => router.replace("/registrar-cuenta")} />
          </View>
        ) : (
          <>
            <View style={[styles.contenedorFormulario, esPantallaPequeña && { maxWidth: "95%" }]}>
              <Text style={styles.titulo}>
                {step === 1 ? "Validar datos" : "Completar registro"}
              </Text>

              {step === 1 && (
                <>
                  <View style={{ marginBottom: 15 }} >
                    <Entrada label="Nombre" value={alumno?.nombre || ""} editable={false} />
                  </View>

                  <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                    <View style={{ flex: 1, marginBottom: 15 }}>
                      <Entrada
                        label="Apellido Paterno"
                        value={alumno?.apellido_paterno || ""}
                        editable={false}
                      />
                    </View>
                    <View style={{ flex: 1, marginBottom: 15 }}>
                      <Entrada
                        label="Apellido Materno"
                        value={alumno?.apellido_materno || ""}
                        editable={false}
                      />
                    </View>
                  </View>

                  <View style={{ marginBottom: 15 }} >
                    <Entrada
                      label="CURP"
                      value={alumno?.curp || ""}
                      editable={false}
                    />
                  </View>

                  <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                    <View style={{ flex: 1, marginBottom: 15 }}>
                      <Entrada
                        label="Boleta"
                        value={alumno?.boleta || ""}
                        editable={false}
                      />
                    </View>
                    <View style={{ flex: 1, marginBottom: 15 }}>
                      <Entrada
                        label="Carrera"
                        value={alumno?.carrera || ""}
                        editable={false}
                      />
                    </View>
                  </View>

                  <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                    <View style={{ flex: 1, marginBottom: 15 }}>
                      <Entrada
                        label="Generación"
                        value={alumno?.generacion || ""}
                        editable={false}
                      />
                    </View>
                    <View style={{ flex: 1, marginBottom: 15 }}>
                      <Entrada
                        label="Promedio"
                        value={alumno?.promedio || ""}
                        editable={false}
                      />
                    </View>
                  </View>

                  <View style={{ marginBottom: 25 }} >
                    <Entrada
                      label="Correo Electrónico Institucional"
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
                  <View style={{ marginBottom: 15 }}>
                    <Controller
                      control={control}
                      name="rfc"
                      defaultValue=""
                      render={({ field: { onChange, value } }) => (
                        <Entrada
                          label="RFC"
                          value={value}
                          onChangeText={onChange}
                          error={errors.rfc?.message}
                        />
                      )}
                    />
                  </View>

                  <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
                    <View style={{ flex: 1, marginBottom: esPantallaPequeña && errors.calle && !errors.colonia ? 30 : 15 }}>
                      <Controller
                        control={control}
                        name="calle"
                        defaultValue=""
                        render={({ field }) => (
                          <Entrada
                            label="Calle y Número"
                            {...field}
                            error={errors.calle?.message}
                          />
                        )}
                      />
                    </View>
                    <View style={{ flex: 1, marginBottom: esPantallaPequeña && errors.colonia && !errors.delegacion ? 30 : 15 }}>
                      <Controller
                        control={control}
                        name="colonia"
                        defaultValue=""
                        render={({ field }) => (
                          <Entrada
                            label="Colonia"
                            {...field}
                            error={errors.colonia?.message}
                          />
                        )}
                      />
                    </View>
                  </View>
                  <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]} >
                    <View style={{ flex: 1, marginBottom: esPantallaPequeña && errors.delegacion && !errors.estado ? 30 : 15 }}>
                      <Controller
                        control={control}
                        name="delegacion"
                        defaultValue=""
                        render={({ field }) => (
                          <Entrada
                            label="Delegación / Municipio"
                            {...field}
                            error={errors.delegacion?.message}
                          />
                        )}
                      />
                    </View>
                    <View style={{ flex: 1, marginBottom: esPantallaPequeña && errors.estado && !errors.cp ? 30 : 15 }}>
                      <Controller
                        control={control}
                        name="estado"
                        defaultValue=""
                        render={({ field }) => (
                          <Entrada
                            label="Estado de Procedencia"
                            {...field}
                            error={errors.estado?.message}
                          />
                        )}
                      />
                    </View>
                  </View>

                  <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]} >
                    <View style={{ flex: 1, marginBottom: esPantallaPequeña && errors.cp ? 30 : 15 }}>
                      <Controller
                        control={control}
                        name="cp"
                        defaultValue=""
                        render={({ field }) => (
                          <Entrada
                            label="Código Postal"
                            keyboardType="numeric"
                            {...field}
                            error={errors.cp?.message}
                          />
                        )}
                      />
                    </View>
                    <View style={{ flex: 1, marginBottom: esPantallaPequeña && !errors.telcelular ? 15 : 20 }}>
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
                    <View style={{ flex: 1, marginBottom: esPantallaPequeña && errors.telcelular && !errors.tellocal ? 30 : 15 }}>
                      <Controller
                        control={control}
                        name="telcelular"
                        defaultValue=""
                        render={({ field }) => (
                          <Entrada
                            label="Teléfono Celular"
                            keyboardType="phone-pad"
                            {...field}
                            error={errors.telcelular?.message}
                          />
                        )}
                      />
                    </View>
                    <View style={{ flex: 1, marginBottom: 30 }}>
                      <Controller
                        control={control}
                        name="tellocal"
                        defaultValue=""
                        render={({ field }) => (
                          <Entrada
                            label="Teléfono Local"
                            keyboardType="phone-pad"
                            {...field}
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
        <ModalAPI ref={modalAPI} />
        <PiePagina />
      </ScrollView>
    </KeyboardAvoidingView>
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
