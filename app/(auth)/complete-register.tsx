import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import FloatingLabelInput from "@/components/ui/FloatingLabelInput";
import FloatingLabelSelect from "@/components/ui/FloatingLabelSelect";
import { Colors, Fonts } from '@/theme/colors';
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import {
  registroSchema,
  type RegistroForm,
} from "@/lib/validation";

export default function RegistroMultipasos() {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 600;
  const [step, setStep] = useState(1);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegistroForm>({
    resolver: zodResolver(registroSchema),
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

  const onSubmit = (data: RegistroForm) => {
    console.log("Datos guardados:", data);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Header />
        <View
          style={[styles.formWrapper, isSmallScreen && { maxWidth: "95%" }]}
        >
          <Text style={styles.title}>
            {step === 1 ? "Validar Datos" : "Completar Registro"}
          </Text>

          {step === 1 && (
            <>
              <View style={{ marginBottom: 15 }} pointerEvents="none" >
                <FloatingLabelInput label="Nombre" value="Ana" editable={false} />
              </View>

              <View
                style={[styles.row, isSmallScreen && { flexDirection: "column" }]}
              >
                <View style={{ flex: 1, marginBottom: 5 }} pointerEvents="none" >
                  <FloatingLabelInput
                    label="Apellido Paterno"
                    value="Medina"
                    editable={false}
                  />
                </View>
                <View style={{ flex: 1, marginBottom: 15 }} pointerEvents="none">
                  <FloatingLabelInput
                    label="Apellido Materno"
                    value="Angeles"
                    editable={false}
                  />
                </View>
              </View>

              <View style={{ marginBottom: 15 }} pointerEvents="none" >
                <FloatingLabelInput
                  label="CURP"
                  value="MEAA010203AACDNNA1"
                  editable={false}
                />
              </View>

              <View
                style={[styles.row, isSmallScreen && { flexDirection: "column" }]}
              >
                <View style={{ flex: 1, marginBottom: 5 }} pointerEvents="none">
                  <FloatingLabelInput
                    label="Boleta"
                    value="2022570330"
                    editable={false}
                  />
                </View>
                <View style={{ flex: 1, marginBottom: 15 }} pointerEvents="none">
                  <FloatingLabelInput
                    label="Carrera"
                    value="Médico Cirujano y Homeópata"
                    editable={false}
                  />
                </View>
              </View>

              <View
                style={[styles.row, isSmallScreen && { flexDirection: "column" }]}
              >
                <View style={{ flex: 1, marginBottom: 5 }} pointerEvents="none">
                  <FloatingLabelInput
                    label="Generación"
                    value="Febrero 2025"
                    editable={false}
                  />
                </View>
                <View style={{ flex: 1, marginBottom: 15 }} pointerEvents="none">
                  <FloatingLabelInput
                    label="Promedio"
                    value="9.0"
                    editable={false}
                  />
                </View>
              </View>

              <View style={{ marginBottom: 25 }} pointerEvents="none">
                <FloatingLabelInput
                  label="Correo Electrónico Institucional"
                  value="amedina1416@alumno.ipn.mx"
                  editable={false}
                />
              </View>

              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }} />
                <View style={{ flex: 1 }}>
                  <Button title="Siguiente" onPress={handleNext} />
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
                    <FloatingLabelInput
                      label="RFC"
                      value={value}
                      onChangeText={onChange}
                      error={errors.rfc?.message}
                    />
                  )}
                />
              </View>

              <View style={[styles.row, isSmallScreen && { flexDirection: "column" }]}>
                <View style={{ flex: 1, marginBottom: 5 }}>
                  <Controller
                    control={control}
                    name="calle"
                    render={({ field }) => (
                      <FloatingLabelInput
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
                      <FloatingLabelInput
                        label="Colonia"
                        {...field}
                        error={errors.colonia?.message}
                      />
                    )}
                  />
                </View>
              </View>
              <View
                style={[styles.row, isSmallScreen && { flexDirection: "column" }]}
              >
                <View style={{ flex: 1, marginBottom: 5 }}>
                  <Controller
                    control={control}
                    name="municipio"
                    render={({ field }) => (
                      <FloatingLabelInput
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
                      <FloatingLabelInput
                        label="Estado de Procedencia"
                        {...field}
                        error={errors.estado?.message}
                      />
                    )}
                  />
                </View>
              </View>

              <View
                style={[styles.row, isSmallScreen && { flexDirection: "column" }]}
              >
                <View style={{ flex: 1, marginBottom: errors.sexo ? 0 : 5 }}>
                  <Controller
                    control={control}
                    name="codigoPostal"
                    render={({ field }) => (
                      <FloatingLabelInput
                        label="Código Postal"
                        keyboardType="numeric"
                        {...field}
                        error={errors.codigoPostal?.message}
                      />
                    )}
                  />
                </View>
                <View style={{ flex: 1, marginBottom: 15, marginTop: errors.codigoPostal && isSmallScreen && !errors.sexo ? 15 : 0 }}>
                  <Controller
                    control={control}
                    name="sexo"
                    render={({ field: { onChange, value } }) => (
                      <FloatingLabelSelect
                        label="Sexo"
                        selectedValue={value}
                        onValueChange={onChange}
                        items={[
                          { label: "Hombre", value: "Hombre" },
                          { label: "Mujer", value: "Mujer" },
                        ]}
                        error={errors.sexo?.message}
                      />
                    )}
                  />
                </View>
              </View>

              <View style={[styles.row, isSmallScreen && { flexDirection: "column" }]}>
                <View style={{ flex: 1, marginBottom: 5 }}>
                  <Controller
                    control={control}
                    name="telefonoCelular"
                    render={({ field }) => (
                      <FloatingLabelInput
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
                      <FloatingLabelInput
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
                  <Button title="Atrás" onPress={handleBack} />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    title={isSubmitting ? "Guardando…" : "Guardar Datos"}
                    onPress={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                  />
                </View>
              </View>
            </>
          )}
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
    maxWidth: 800,
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
    marginVertical: 30,
  },
  title: {
    fontSize: Fonts.title,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 24,
    color: Colors.secondary,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
});
