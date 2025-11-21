import Modal from "@/componentes/layout/Modal";
import ModalAPI, { ModalAPIRef } from "@/componentes/layout/ModalAPI";
import Boton from "@/componentes/ui/Boton";
import Entrada from "@/componentes/ui/Entrada";
import EntradaMultilinea from "@/componentes/ui/EntradaMultilinea";
import Tabla from "@/componentes/ui/Tabla";
import { useAuth } from "@/context/AuthProvider";
import { completarDocumentos } from "@/lib/documentosHelper";
import { fetchData, postData } from "@/servicios/api";
import { Colores, Fuentes } from "@/temas/colores";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Linking, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { WebView } from "react-native-webview";

export default function RevisarExpediente() {
  const { sesion, verificarToken } = useAuth();
  const router = useRouter();

  const { boleta } = useLocalSearchParams<{ boleta: string }>();
  const modalAPI = useRef<ModalAPIRef>(null);

  const { width } = useWindowDimensions();
  const esPantallaPequeña = width < 790;

  const [documentos, setDocumentos] = useState<any[]>([]);
  const [docSeleccionado, setDocSeleccionado] = useState<any | null>(null);

  const [estatus, setEstatus] = useState<"aprobado" | "rechazado" | null>(null);
  const [modalConfirmacionVisible, setModalConfirmacionVisible] = useState(false);
  const [observacion, setObservacion] = useState("");

  const obtenerDocumentos = async () => {
    verificarToken();

    try {
      const response = await fetchData(`users/expedienteDigital?boleta=${boleta}&tk=${sesion.token}`);

      if (response.error === 0) {
        const docsBackend = response.documents;
        setDocumentos(completarDocumentos(docsBackend));
      } else {
        modalAPI.current?.show(false, "Hubo un problema al obtener los datos del servidor. Inténtalo de nuevo más tarde.");
      }
    } catch (error) {
      modalAPI.current?.show(false, "Error al conectar con el servidor. Inténtalo de nuevo más tarde.");
    }
  };

  useEffect(() => {
    obtenerDocumentos();
  }, []);

  const { handleSubmit, formState: { isSubmitting } } = useForm<any>();

  const enviarValidacion = async () => {
    verificarToken();

    try {
      const data = {
        ID: docSeleccionado.ID,
        estatus: estatus === "aprobado" ? 3 : 4,
        observacion: observacion?.trim() || "",
        tk: sesion.token,
      };

      const response = await postData("users/validarExpediente", data);

      if (response?.error === 0) {
        setModalConfirmacionVisible(false);
        setDocSeleccionado(null);
        setObservacion("");
        setEstatus(null);
        obtenerDocumentos();
        modalAPI.current?.show(true, `El documento ha sido ${estatus?.toLowerCase()} correctamente.`);
      } else {
        modalAPI.current?.show(false, "Hubo un problema al validar el documento. Inténtalo de nuevo más tarde.");
      }
    } catch (error) {
      modalAPI.current?.show(false, "Error al conectar con el servidor. Inténtalo de nuevo más tarde.");
    }
  };

  const renderModalDetalle = () => {
    if (!docSeleccionado) return null;
    const { adminEncargado, estatus, fechaRegistro, nombreArchivo,
      observacion, rutaArchivo, color } = docSeleccionado;

    return (
      <Modal visible={!!docSeleccionado} onClose={() => setDocSeleccionado(null)} titulo={nombreArchivo}
        aceptar={estatus === "Pendiente" ? false : true}
        cancelar={estatus === "Pendiente" ? true : false}
        maxWidth={estatus === "Pendiente" ? 700 : undefined}>

        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 18 }}>
          <Text style={{ fontSize: 15, fontWeight: "600", color: color }}>
            {estatus}
          </Text>
          {estatus === "Pendiente" && (
            <View style={{ flexDirection: "row", gap: 15, marginTop: -10 }}>
              <Boton
                title="Aprobar"
                onPress={() => {
                  setEstatus("aprobado");
                  setModalConfirmacionVisible(true);
                }}
                color={Colores.textoExito}
              />
              <Boton
                title="Rechazar"
                onPress={() => {
                  setEstatus("rechazado");
                  setModalConfirmacionVisible(true);
                }}
                color={Colores.textoError}
              />
            </View>)}
        </View>

        {estatus === "Pendiente" && (
          <>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 15, gap: 10 }}>
              <View style={{ flex: 1 }} >
                <Entrada label="Archivo" value={rutaArchivo.split('/').pop()} editable={false} />
              </View>
              <Boton
                title=""
                onPress={() => Linking.openURL(rutaArchivo)}
                icon={<Ionicons name="eye-outline" size={20} color={Colores.onPrimario} style={{ paddingHorizontal: 10 }} />}
              />
            </View>
            <View style={{ marginBottom: 15 }} >
              <Entrada label="Fecha de envío" value={new Date(fechaRegistro).toLocaleDateString()} editable={false} />
            </View>
            {adminEncargado && (
              <>
                <Text style={{ fontSize: Fuentes.caption, color: Colores.textoClaro, marginBottom: 15, textAlign: "right" }}>Nota: Este documento fue rechazado anteriormente.</Text>
                <View style={{ marginBottom: 15 }} >
                  <Entrada label="Revisado anteriormente por" value={adminEncargado.nombre + " " + adminEncargado.APELLIDO_PATERNO + " " + adminEncargado.APELLIDO_MATERNO} editable={false} />
                </View>
                <View style={{ marginBottom: 20 }}>
                  <EntradaMultilinea
                    label="Observación"
                    value={observacion || "Sin observación."}
                    editable={false}
                    multiline
                    style={{ minHeight: 80 }}
                  />
                </View>
              </>
            )}

            <View style={{ height: 520, borderWidth: 1, borderColor: Colores.borde, borderRadius: 8, overflow: "hidden" }}>
              {Platform.OS === "web" ? (
                <iframe
                  src={`https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(rutaArchivo)}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                  }}
                  title="Vista previa PDF"
                />
              ) : (
                <WebView
                  source={{
                    uri: `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(rutaArchivo)}`,
                  }}
                  style={{ flex: 1 }}
                  startInLoadingState
                />
              )}
            </View>
          </>
        )}

        {estatus === "Aprobado" && (
          <>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 15, gap: 10 }}>
              <View style={{ flex: 1 }} >
                <Entrada label="Archivo" value={rutaArchivo.split('/').pop()} editable={false} />
              </View>
              <Boton
                title=""
                onPress={() => Linking.openURL(rutaArchivo)}
                icon={<Ionicons name="eye-outline" size={20} color={Colores.onPrimario} style={{ paddingHorizontal: 10 }} />}
              />
            </View>
            <View style={{ marginBottom: 15 }} >
              <Entrada label="Fecha de envío" value={new Date(fechaRegistro).toLocaleDateString()} editable={false} />
            </View>
            <View style={{ marginBottom: 15 }} >
              <Entrada label="Revisado por" value={adminEncargado.nombre + " " + adminEncargado.APELLIDO_PATERNO + " " + adminEncargado.APELLIDO_MATERNO} editable={false} />
            </View>
            <View>
              <EntradaMultilinea
                label="Observaciones"
                value={observacion}
              />
            </View>
          </>
        )}

        {estatus === "Rechazado" && (
          <>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 15, gap: 10 }}>
              <View style={{ flex: 1 }} >
                <Entrada label="Archivo" value={rutaArchivo.split('/').pop()} editable={false} />
              </View>
              <Boton
                title=""
                onPress={() => Linking.openURL(rutaArchivo)}
                icon={<Ionicons name="eye-outline" size={20} color={Colores.onPrimario} style={{ paddingHorizontal: 10 }} />}
              />
            </View>
            <View style={{ marginBottom: 15 }} >
              <Entrada label="Fecha de envío" value={new Date(fechaRegistro).toLocaleDateString()} editable={false} />
            </View>
            <View style={{ marginBottom: 15 }} >
              <Entrada label="Revisado por" value={adminEncargado.nombre + " " + adminEncargado.APELLIDO_PATERNO + " " + adminEncargado.APELLIDO_MATERNO} editable={false} />
            </View>
            <View>
              <EntradaMultilinea
                label="Observaciones"
                value={observacion}
              />
            </View>
          </>
        )}
      </Modal>
    );
  };

  const renderModalDetalleValidar = () => {
    if (!docSeleccionado) return null;

    return (
      <Modal
        visible={modalConfirmacionVisible}
        titulo={docSeleccionado.nombreArchivo}
        onClose={() => { setModalConfirmacionVisible(false); setEstatus(null); setObservacion("") }} cancelar
        deshabilitado={isSubmitting} textoAceptar={isSubmitting ? "Guardando…" : "Guardar"}
        onAceptar={handleSubmit(enviarValidacion)}
      >
        <View style={{ marginBottom: 15 }}>
          <Text style={{ marginBottom: 15 }}>El documento será <Text style={{ fontWeight: "600", color: estatus === "aprobado" ? Colores.textoExito : Colores.textoError }}>
            {estatus}
          </Text>. ¿Tienes algúna observación que agregar?
          </Text>

          <EntradaMultilinea
            label="Observaciones (opcional)"
            value={observacion}
            onChangeText={setObservacion}
          />
        </View>
      </Modal>
    )
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={[styles.contenedorFormulario, esPantallaPequeña && { maxWidth: "95%" }]}>
        <View style={[{ flexDirection: "row", justifyContent: "flex-end" }, esPantallaPequeña && { marginBottom: 5 }]}>
          {esPantallaPequeña ?
            <Boton
              onPress={() => router.push("/validar-documentos")}
              icon={<Ionicons name="arrow-back-outline" size={18} color={Colores.onPrimario} style={{ padding: 5 }} />}
            />
            :
            <Boton
              title="Regresar"
              onPress={() => router.push("/validar-documentos")}
            />
          }
        </View>
        <Text style={styles.titulo}>Expediente digital</Text>
        <Text style={styles.alumno}>{boleta}</Text>

        <Text style={styles.subtitulo}>Registro al servicio social</Text>
        <ScrollView horizontal={esPantallaPequeña}>
          <Tabla
            columnas={[
              { key: "nombreArchivo", titulo: "Documento", ...(esPantallaPequeña && { ancho: 250 }) },
              {
                key: "estatus",
                titulo: "Estatus",
                render: (valor, fila) => (
                  <Text style={[styles.texto, { color: fila.color }]}>
                    {valor}
                  </Text>
                ),
                ...(esPantallaPequeña && { ancho: 150 })
              },
              { key: "observacion", titulo: "Observaciones", ...(esPantallaPequeña && { ancho: 250 }) },
            ]}
            datos={documentos
              .filter((d) => d.tipo === 1)
              .map((fila) => ({
                ...fila,
                observacion: fila.estatus === "Pendiente" ? "En espera de revisión." : fila.observacion,
                onPress: () => setDocSeleccionado(fila),
              }))}
          />
        </ScrollView>

        <Text style={styles.subtitulo}>Término del servicio social</Text>

        <ScrollView horizontal={esPantallaPequeña}>
          <Tabla
            columnas={[
              { key: "nombreArchivo", titulo: "Documento", ...(esPantallaPequeña && { ancho: 250 }) },
              {
                key: "estatus",
                titulo: "Estatus",
                render: (valor, fila) => (
                  <Text style={[styles.texto, { color: fila.color }]}>
                    {valor}
                  </Text>
                ),
                ...(esPantallaPequeña && { ancho: 150 })
              },
              { key: "observacion", titulo: "Observaciones", ...(esPantallaPequeña && { ancho: 250 }) },
            ]}
            datos={documentos
              .filter((d) => d.tipo === 2)
              .map((fila) => ({
                ...fila,
                observacion: fila.estatus === "Pendiente" ? "En espera de revisión." : fila.observacion,
                onPress: () => setDocSeleccionado(fila),
              }))}
          />
        </ScrollView>
      </View>
      {renderModalDetalle()}
      {renderModalDetalleValidar()}
      <ModalAPI ref={modalAPI} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedorFormulario: {
    width: "90%",
    maxWidth: 1050,
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
    color: Colores.textoPrincipal,
    textAlign: "center",
    marginBottom: 10,
  },
  subtitulo: {
    fontSize: Fuentes.cuerpo,
    fontWeight: "500",
    color: Colores.textoClaro,
    marginTop: 20,
    marginBottom: 10,
  },
  alumno: {
    fontSize: Fuentes.cuerpo,
    fontWeight: "700",
    color: Colores.textoClaro,
    textAlign: "center",
  },
  texto: {
    fontSize: Fuentes.cuerpo,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontWeight: "500"
  },
});
