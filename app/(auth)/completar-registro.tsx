import Encabezado from "@/componentes/layout/Encabezado";
import PiePagina from "@/componentes/layout/PiePagina";
import Boton from "@/componentes/ui/Boton";
import Entrada from "@/componentes/ui/Entrada";
import Selector from "@/componentes/ui/Selector";
import { Colores, Fuentes } from '@/temas/colores';
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import {
  registroEsquema,
  type RegistroFormulario,
} from "@/lib/validacion";

export default function RegistroMultipasos() {
  const { width } = useWindowDimensions();
  const esPantallaPequeña = width < 600;
  const [step, setStep] = useState(1);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegistroFormulario>({
    resolver: zodResolver(registroEsquema),
    defaultValues: {
      rfc: "",
      calle: "",
      colonia: "",
      municipio: "",
      estado: "",
      codigoPostal: "",
      sexo: "",
      telefonoCelular: "",
      telefonoLocal: "",
    },
  });

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const onSubmit = (data: RegistroFormulario) => {
    console.log("Datos guardados:", data);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "web" ? undefined : "padding"} keyboardVerticalOffset={80} >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Encabezado />
        <View
          style={[styles.contenedorFormulario, esPantallaPequeña && { maxWidth: "95%" }]}
        >
          <Text style={styles.titulo}>
            {step === 1 ? "Validar Datos" : "Completar Registro"}
          </Text>

          {step === 1 && (
            <>
              <View style={{ marginBottom: 15, pointerEvents: "none" }} >
                <Entrada label="Nombre" value="Ana" editable={false} />
              </View>

              <View
                style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}
              >
                <View style={{ flex: 1, marginBottom: 5, pointerEvents: "none" }} >
                  <Entrada
                    label="Apellido Paterno"
                    value="Medina"
                    editable={false}
                  />
                </View>
                <View style={{ flex: 1, marginBottom: 15, pointerEvents: "none" }}>
                  <Entrada
                    label="Apellido Materno"
                    value="Angeles"
                    editable={false}
                  />
                </View>
              </View>

              <View style={{ marginBottom: 15, pointerEvents: "none" }} >
                <Entrada
                  label="CURP"
                  value="MEAA010203AACDNNA1"
                  editable={false}
                />
              </View>

              <View
                style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}
              >
                <View style={{ flex: 1, marginBottom: 5, pointerEvents: "none" }}>
                  <Entrada
                    label="Boleta"
                    value="2022570330"
                    editable={false}
                  />
                </View>
                <View style={{ flex: 1, marginBottom: 5, pointerEvents: "none" }}>
                  <Entrada
                    label="Carrera"
                    value="Médico Cirujano y Homeópata"
                    editable={false}
                  />
                </View>
              </View>

              <View
                style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}
              >
                <View style={{ flex: 1, marginBottom: 5 }} pointerEvents="none">
                  <Entrada
                    label="Generación"
                    value="Febrero 2025"
                    editable={false}
                  />
                </View>
                <View style={{ flex: 1, marginBottom: 5, pointerEvents: "none" }}>
                  <Entrada
                    label="Promedio"
                    value="9.0"
                    editable={false}
                  />
                </View>
              </View>

              <View style={{ marginBottom: 25 }} pointerEvents="none">
                <Entrada
                  label="Correo Electrónico Institucional"
                  value="amedina1416@alumno.ipn.mx"
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

              <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                <View style={{ flex: 1, marginBottom: 5 }}>
                  <Controller
                    control={control}
                    name="calle"
                    render={({ field }) => (
                      <Entrada
                        label="Calle y Número"
                        {...field}
                        error={errors.calle?.message}
                      />
                    )}
                  />
                </View>
                <View style={{ flex: 1, marginBottom: 15 }}>
                  <Controller
                    control={control}
                    name="colonia"
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
              <View
                style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}
              >
                <View style={{ flex: 1, marginBottom: 5 }}>
                  <Controller
                    control={control}
                    name="municipio"
                    render={({ field }) => (
                      <Entrada
                        label="Delegación / Municipio"
                        {...field}
                        error={errors.municipio?.message}
                      />
                    )}
                  />
                </View>
                <View style={{ flex: 1, marginBottom: 15 }}>
                  <Controller
                    control={control}
                    name="estado"
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

              <View
                style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}
              >
                <View style={{ flex: 1, marginBottom: errors.sexo ? 0 : 5 }}>
                  <Controller
                    control={control}
                    name="codigoPostal"
                    render={({ field }) => (
                      <Entrada
                        label="Código Postal"
                        keyboardType="numeric"
                        {...field}
                        error={errors.codigoPostal?.message}
                      />
                    )}
                  />
                </View>
                <View style={{ flex: 1, marginBottom: 15, marginTop: errors.codigoPostal && esPantallaPequeña && !errors.sexo ? 15 : 0 }}>
                  <Controller
                    control={control}
                    name="sexo"
                    defaultValue={""}
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

              <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                <View style={{ flex: 1, marginBottom: 5 }}>
                  <Controller
                    control={control}
                    name="telefonoCelular"
                    render={({ field }) => (
                      <Entrada
                        label="Teléfono Celular"
                        keyboardType="phone-pad"
                        {...field}
                        error={errors.telefonoCelular?.message}
                      />
                    )}
                  />
                </View>
                <View style={{ flex: 1, marginBottom: 25 }}>
                  <Controller
                    control={control}
                    name="telefonoLocal"
                    render={({ field }) => (
                      <Entrada
                        label="Teléfono Local"
                        keyboardType="phone-pad"
                        {...field}
                        error={errors.telefonoLocal?.message}
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
                    title={isSubmitting ? "Guardando…" : "Guardar Datos"}
                    onPress={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                  />
                </View>
              </View>
            </>
          )}
        </View>
        <PiePagina />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
  row: {
    flexDirection: "row",
    gap: 12,
  },
});
