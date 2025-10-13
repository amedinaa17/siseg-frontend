import Modal from "@/componentes/layout/Modal";
import Boton from "@/componentes/ui/Boton";
import Entrada from "@/componentes/ui/Entrada";
import EntradaMultilinea from "@/componentes/ui/EntradaMultilinea";
import Tabla from "@/componentes/ui/Tabla";
import { Colores, Fuentes } from "@/temas/colores";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Linking, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { WebView } from "react-native-webview";


const datosAlumnos = [
  {
    boleta: "2022630301", nombre: "Andrea", apellidoPaterno: "Salgado", apellidoMaterno: "Ramírez", carrera: "Médico Cirujano y Partero",
    generacion: "2025", estatus: "En proceso", correo: "asalga@alumno.ipn.mx", promedio: "9.1", curp: "SARA010312MDFLND09",
    rfc: "SARA010312T55", telefonoCelular: "5512345678", telefonoLocal: "5553123456", sexo: "F", calleNumero: "Cedros 134",
    colonia: "San Miguel", delegacionMunicipio: "2022630301", estadoProcedencia: "Iztapalapa", codigoPostal: "09830"
  },
  {
    boleta: "2022630320", nombre: "Mariana", apellidoPaterno: "Torres", apellidoMaterno: "López", carrera: "Médico Cirujano y Partero",
    generacion: "2025", estatus: "En proceso", correo: "mariana.tl@alumno.ipn.mx", promedio: "9.3", curp: "TOLM010215MDFLNS09",
    rfc: "TOLM010215RT5", telefonoCelular: "5511223344", telefonoLocal: "5556789123", sexo: "F", calleNumero: "Insurgentes Sur 900",
    colonia: "Del Valle", delegacionMunicipio: "Benito Juárez", estadoProcedencia: "CDMX", codigoPostal: "03100"
  },
  {
    boleta: "2022630312", nombre: "Alejandro", apellidoPaterno: "Vega", apellidoMaterno: "Domínguez", carrera: "Médico Cirujano y Homeópata",
    generacion: "2024", estatus: "Concluido", correo: "alejandro@alumno.ipn.mx", promedio: "8.5", curp: "ALEA010112MDFLND09",
    rfc: "ALEA010112T55", telefonoCelular: "5544332211", telefonoLocal: "5553445566", sexo: "M", calleNumero: "Av. Hidalgo 45",
    colonia: "Centro", delegacionMunicipio: "Cuauhtémoc", estadoProcedencia: "CDMX", codigoPostal: "06000"
  },
  {
    boleta: "2022630333", nombre: "Jorge", apellidoPaterno: "Hernández", apellidoMaterno: "Castillo", carrera: "Médico Cirujano y Homeópata",
    generacion: "-", estatus: "Aspirante", correo: "jorgehc@alumno.ipn.mx", promedio: "8.1", curp: "HECJ991120MDFRNL08",
    rfc: "HECJ991120KL9", telefonoCelular: "5522334455", telefonoLocal: "5559876543", sexo: "M", calleNumero: "Reforma 100",
    colonia: "Juárez", delegacionMunicipio: "Cuauhtémoc", estadoProcedencia: "CDMX", codigoPostal: "06600"
  },
  {
    boleta: "2022630345", nombre: "Paola", apellidoPaterno: "Méndez", apellidoMaterno: "García", carrera: "Médico Cirujano y Partero",
    generacion: "-", estatus: "Candidato", correo: "paolamg@alumno.ipn.mx", promedio: "9.7", curp: "MEGP000305MDFLNR07",
    rfc: "MEGP000305PR2", telefonoCelular: "5533445566", telefonoLocal: "5552233445", sexo: "F", calleNumero: "Av. Universidad 320",
    colonia: "Copilco", delegacionMunicipio: "Coyoacán", estadoProcedencia: "CDMX", codigoPostal: "04360"
  },
  {
    boleta: "2022630363", nombre: "Joel", apellidoPaterno: "Mora", apellidoMaterno: "Castañeda", carrera: "Médico Cirujano y Partero",
    generacion: "-", estatus: "Candidato", correo: "joelmc@alumno.ipn.mx", promedio: "8.7", curp: "MOCJ000305MDFLNR07",
    rfc: "MOCJ000305PR2", telefonoCelular: "5533445566", telefonoLocal: "5552233445", sexo: "F", calleNumero: "Av. Universidad 350",
    colonia: "Copilco", delegacionMunicipio: "Coyoacán", estadoProcedencia: "CDMX", codigoPostal: "04360"
  },
];

export default function RevisarExpediente() {
  const { boleta } = useLocalSearchParams<{ boleta: string }>();
  const router = useRouter();

  const { width } = useWindowDimensions();
  const esPantallaPequeña = width < 790;

  const [documentos, setDocumentos] = useState<any[]>([]);
  const [docSeleccionado, setDocSeleccionado] = useState<any | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMensaje, setModalMensaje] = useState('');
  const [modalTipo, setModalTipo] = useState(false);

  const [accionSeleccionada, setAccionSeleccionada] = useState<"Aprobado" | "Rechazado" | null>(null);
  const [modalConfirmacionVisible, setModalConfirmacionVisible] = useState(false);
  const [observacionAccion, setObservacionAccion] = useState("");


  const alumno = useMemo(() => {
    if (!boleta) return undefined;
    return datosAlumnos.find(a => a.boleta === String(boleta));
  }, [boleta]);

  if (!alumno) {
    return (
      <View>
        <Text style={{ color: Colores.textoError, fontSize: Fuentes.cuerpo }}>
          No se encontró información del alumno.
        </Text>
      </View>
    );
  }

  useEffect(() => {
    setDocumentos([
      {
        ID: 1,
        alumnoBoleta: alumno.boleta,
        adminEncargado: "2022630603",
        estatus: "Pendiente",
        fechaRegistro: "2025-10-05T02:30:16.000Z",
        nombreArchivo: "Preregistro SISS",
        observacion: "En revisión",
        rutaArchivo: "https://sisegplataform.online/uploads/2022630604/Constancia de derechos del IMSS.pdf",
        tipo: 1,
        color: Colores.textoInfo
      },
      {
        ID: 2,
        alumnoBoleta: "2022630604",
        adminEncargado: "2022630603",
        estatus: "Rechazado",
        fechaRegistro: "2025-10-05T02:30:16.000Z",
        nombreArchivo: "Preregistro SIASS",
        observacion: "Archivo ilegible",
        tipo: 1,
        rutaArchivo: "https://sisegplataform.online/uploads/2022630604/Constancia de derechos del IMSS.pdf",
        color: Colores.textoError
      },
      {
        ID: 8,
        alumnoBoleta: "2022630604",
        adminEncargado: null,
        estatus: "Aprobado",
        rutaArchivo: "https://sisegplataform.online/uploads/2022630604/Constancia de derechos del IMSS.pdf",
        fechaRegistro: "2025-10-06T02:30:16.000Z",
        nombreArchivo: "Preregistro SIRSS",
        observacion: "Validado correctamente",
        tipo: 1,
        color: Colores.textoExito,
      },
      { ID: null, alumnoBoleta: null, rutaArchivo: "null", nombreArchivo: "Constancia de derechos del IMSS", adminEncargado: null, estatus: "Sin cargar", fechaRegistro: null, tipo: 1, color: Colores.textoAdvertencia },
      { ID: null, alumnoBoleta: null, rutaArchivo: "null", nombreArchivo: "Constancia de término", adminEncargado: null, estatus: "Sin cargar", fechaRegistro: null, tipo: 2, color: Colores.textoAdvertencia, observacion: "Sin observación." },
    ]);
  }, [boleta]);

  const onSubmitValidacion = async () => {
    if (!docSeleccionado || !accionSeleccionada) return;

    try {
      setModalConfirmacionVisible(false);
      setDocSeleccionado(null);
      setModalMensaje(`Documento ${accionSeleccionada.toLowerCase()} correctamente.`);
      setModalTipo(true);
      setModalVisible(true);
    } catch (error) {
      setModalConfirmacionVisible(false);
      setDocSeleccionado(null);
      setModalMensaje("Ocurrió un error al procesar la validación.");
      setModalTipo(false);
      setModalVisible(true);
    }
  };


  const renderModal = () => {
    if (!docSeleccionado) return null;
    const { alumnoBoleta, adminEncargado, estatus, fechaRegistro, nombreArchivo,
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
                  setAccionSeleccionada("Aprobado");
                  setModalConfirmacionVisible(true);
                }}
                color={Colores.textoExito}
              />
              <Boton
                title="Rechazar"
                onPress={() => {
                  setAccionSeleccionada("Rechazado");
                  setModalConfirmacionVisible(true);
                }}
                color={Colores.textoError}
              />
            </View>)}
        </View>

        {estatus === "Pendiente" && (
          <>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 15, gap: 10 }}>
              <View style={{ flex: 1, pointerEvents: "none" }} >
                <Entrada label="Archivo" value={rutaArchivo.split('/').pop()} editable={false} />
              </View>
              <Boton
                title=""
                onPress={() => Linking.openURL(rutaArchivo)}
                icon={<Ionicons name="eye-outline" size={20} color={Colores.onPrimario} />}
              />
            </View>
            <View style={{ pointerEvents: "none", marginBottom: 15 }} >
              <Entrada label="Fecha de modificación" value={new Date(fechaRegistro).toLocaleString()} editable={false} />
            </View>

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
              <View style={{ flex: 1, pointerEvents: "none" }} >
                <Entrada label="Archivo" value={rutaArchivo.split('/').pop()} editable={false} />
              </View>
              <Boton
                title=""
                onPress={() => Linking.openURL(rutaArchivo)}
                icon={<Ionicons name="eye-outline" size={20} color={Colores.onPrimario} />}
              />
            </View>
            <View style={{ pointerEvents: "none", marginBottom: 15 }} >
              <Entrada label="Fecha de modificación" value={new Date(fechaRegistro).toLocaleString()} editable={false} />
            </View>
            <View style={{ pointerEvents: "none", marginBottom: 15 }} >
              <Entrada label="Reviso" value="{adminEncargado}" editable={false} />
            </View>
            <View style={{ pointerEvents: "none" }}>
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
              <View style={{ flex: 1, pointerEvents: "none" }} >
                <Entrada label="Archivo" value={rutaArchivo.split('/').pop()} editable={false} />
              </View>
              <Boton
                title=""
                onPress={() => Linking.openURL(rutaArchivo)}
                icon={<Ionicons name="eye-outline" size={20} color={Colores.onPrimario} />}
              />
            </View>
            <View style={{ pointerEvents: "none", marginBottom: 15 }} >
              <Entrada label="Fecha de modificación" value={new Date(fechaRegistro).toLocaleString()} editable={false} />
            </View>
            <View style={{ pointerEvents: "none", marginBottom: 15 }} >
              <Entrada label="Reviso" value="{adminEncargado}" editable={false} />
            </View>
            <View style={{ pointerEvents: "none" }}>
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

  const renderModalValidar = () => {
    if (!docSeleccionado) return null;
    const { alumnoBoleta, adminEncargado, estatus, fechaRegistro, nombreArchivo,
      observacion, rutaArchivo, color } = docSeleccionado;
    return (
      <Modal
        visible={modalConfirmacionVisible}
        titulo={nombreArchivo}
        onClose={() => setModalConfirmacionVisible(false)}
        cancelar onCancelar={() => setModalConfirmacionVisible(false)}
        textoAceptar="Guardar" onAceptar={onSubmitValidacion}
      >
        <View style={{ marginBottom: 15 }}>
          <Text style={{ fontSize: 15, fontWeight: "600", marginBottom: 18, color: accionSeleccionada === "Aprobado" ? Colores.textoExito : Colores.textoError }}>
            {accionSeleccionada}
          </Text>

          <EntradaMultilinea
            label="Observaciones"
            value={observacionAccion}
            onChangeText={setObservacionAccion}
          />
        </View>
      </Modal>
    )
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={[styles.contenedorFormulario, esPantallaPequeña && { maxWidth: "95%" }]}>
        <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
          <Boton
            title="Regresar"
            onPress={() => router.push("/validar-documentos")}
          />
        </View>
        <Text style={styles.titulo}>Expediente Digital</Text>
        <Text style={styles.alumno}>{alumno.nombre + " " + alumno.apellidoPaterno + " " + alumno.apellidoMaterno}</Text>

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
                onPress: fila.estatus !== "Sin cargar" ? () => setDocSeleccionado(fila) : undefined,
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
                onPress: fila.estatus !== "Sin cargar" ? () => setDocSeleccionado(fila) : undefined,
              }))}
          />
        </ScrollView>
      </View>
      {renderModal()}
      {renderModalValidar()}
      < Modal
        visible={modalVisible}
        titulo={modalTipo ? "" : ""}
        cerrar={false}
        onClose={() => setModalVisible(false)}
      >
        <View style={{ alignItems: "center" }}>
          <Ionicons
            name={modalTipo ? "checkmark-circle-outline" : "close-circle-outline"}
            size={80}
            color={modalTipo ? Colores.textoExito : Colores.textoError}
          />
          <Text style={{ fontSize: Fuentes.cuerpo, color: Colores.textoClaro, marginBottom: 8 }}>
            {modalTipo ? "¡Todo Listo!" : "¡Algo Salió Mal!"}
          </Text>
          <Text style={{ fontSize: Fuentes.cuerpo, color: Colores.textoPrincipal, marginBottom: 8, textAlign: "center" }}>{modalMensaje}</Text>
        </View>
      </Modal>
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
