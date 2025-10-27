import ModalAPI, { ModalAPIRef } from "@/componentes/layout/ModalAPI";
import { useAuth } from "@/context/AuthProvider";
import { fetchData } from "@/servicios/api";
import { Colores, Fuentes } from "@/temas/colores";
import * as FS from "expo-file-system/legacy";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { WebView } from "react-native-webview";

export default function AcuseSolicitud() {
  const { width } = useWindowDimensions();
  const esPantallaPequeña = width < 600;
  const webViewRef = useRef<any>(null);
  const { sesion } = useAuth();
  const modalAPI = useRef<ModalAPIRef>(null);

  const [datosAlumno, setDatosAlumno] = useState<any>(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const obtenerDatos = async () => {
      if (!sesion?.token) return;
      try {
        setCargando(true);
        const response = await fetchData(`users/obtenerTodosDatosAlumno?tk=${sesion.token}`);
        if (response.error === 0) {
          setDatosAlumno(response.data);
        } else {
          console.error(response.message);
          modalAPI.current?.show(false, "No se pudieron obtener los datos del alumno.");
        }
      } catch (error) {
        modalAPI.current?.show(false, "Error al conectar con el servidor. Inténtalo de nuevo más tarde.");
      } finally {
        setCargando(false);
      }
    };
    obtenerDatos();
  }, [sesion]);

  const generarHTML = useCallback(
    (includePrintButton: boolean) => `
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>Servicio Social: Solicitud de Registro al Servicio Social</title>
<style type="text/css">
  .titulo { text-align: justify; margin: 0 auto; font-family: Calibri; font-size: 20px; }
  .contenido { text-align: justify; margin: 0 auto; font-family: Calibri; font-size: 15px; }
  .texto { text-align: justify; margin: 0 auto; font-family: Calibri; font-size: 20px; line-height: 30px; }
  .fin { text-align: center; margin: 0 auto; font-family: Arial, Helvetica, sans-serif; font-size: 10px; }

  .nover {
    background-color: #333; 
    color: #fff; 
    font-family: Calibri, sans-serif;
    font-size: 16px;
    font-weight: bold;
    padding: 12px 25px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
    margin: 16px auto;
    display: block;
  }
  .nover:hover { background-color: #555; transform: translateY(-2px); box-shadow: 0 6px 10px rgba(0,0,0,0.3); }
  .nover:active { transform: translateY(1px); box-shadow: 0 3px 5px rgba(0,0,0,0.2); }

  @media print { .nover { display: none; } }
</style>
</head>

<body>
  <div align="center">
    <img src="http://148.204.10.106/ServicioSocial/cabezacarta.png" width="871">
  </div>

  <table width="681" border="0" cellspacing="0" cellpadding="0" align="center">
    <tbody>
      <tr>
        <td width="681" class="titulo" background="http://148.204.10.106/ServicioSocial/LugarFoto.png">
          <div align="center">
            <p><strong><u>SOLICITUD DE REGISTRO <br> SERVICIO SOCIAL</u></strong></p>
            <p><strong>PROMOCIÓN: AGOSTO 2025 – JULIO 2026</strong></p>
            <strong>MÉDICO CIRUJANO Y HOMEÓPATA</strong>
          </div>
        </td>
      </tr>

      <tr>
        <td>
          <table width="709" border="1" align="center" cellpadding="0" cellspacing="0" class="contenido">
            <tbody>
              <tr>
                <td colspan="2">Nombre:
                  ${datosAlumno?.nombre ?? ""} ${datosAlumno?.apellido_paterno ?? ""} ${datosAlumno?.apellido_materno ?? ""}</td>
              </tr>
              <tr>
                <td>No. boleta: ${datosAlumno?.boleta ?? ""}</td>
                <td>CURP: ${datosAlumno?.curp ?? ""}</td>
              </tr>
              <tr><td colspan="2">Domicilio: ${datosAlumno?.calle_y_numero ?? ""}</td></tr>
              <tr>
                <td colspan="2">
                  Colonia: ${datosAlumno?.colonia ?? ""}
                  <br>Delegación/Municipio: ${datosAlumno?.delegacion ?? ""}
                  <br>Estado: ${datosAlumno?.estado ?? ""}
                  <br>Código postal: ${datosAlumno?.cp ?? ""}
                </td>
              </tr>
              <tr>
                <td>
                  Teléfono local: ${datosAlumno?.tellocal ?? ""}
                  <br>Celular: ${datosAlumno?.telcelular ?? ""} </td>
                <td>
                  Correo electrónico: <br>${datosAlumno?.correo ?? ""}  </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>

      <tr align="center">
        <td class="texto" align="center">
          <p align="justify">Con la firma de este registro <strong>me comprometo</strong> a sujetarme a los lineamientos
            del Servicio Social de la NORMA OFICIAL 034 Y DEL REGLAMENTO DE SERVICIO SOCIAL DE ÁREA DE LA SALUD,
            cumplirlo en forma y en el período manifestado, así como observar una conducta ejemplar durante la
            permanencia en el lugar asignado y procurar acrecentar el prestigio del
            <strong>INSTITUTO POLITÉCNICO NACIONAL</strong>.</p>
          <p align="center">
            <strong>DE CONFORMIDAD</strong><br><br>
            <strong>_______________________________</strong>
            <br>${datosAlumno?.nombre ?? ""} ${datosAlumno?.apellido_paterno ?? ""} ${datosAlumno?.apellido_materno ?? ""}
          </p>
        </td>
      </tr>

      <tr class="fin">
        <td><p align="center"><img src="http://148.204.10.106/ServicioSocial/piecarta.png" width="871"></p></td>
      </tr>
    </tbody>
  </table>

  ${includePrintButton
        ? `<div align="center">
          <input type="button" name="imprimir" value="Imprimir" class="nover" onclick="window.print();">
        </div>`
        : ``
      }
</body>
</html>`,
    [datosAlumno]
  );

  const onDescargarPDF = useCallback(async () => {
    try {
      if (!datosAlumno) {
        modalAPI.current?.show(false, "Aún no se cargan los datos del alumno.");
        return;
      }
      setCargando(true);

      const html = generarHTML(false);
      const { uri } = await Print.printToFileAsync({ html });

      const base = datosAlumno?.boleta
        ? `solicitudRegistro_${datosAlumno.boleta}.pdf`
        : "solicitudRegistro.pdf";
      const nuevoNombre = `${FS.documentDirectory}${base}`;

      const existe = await FS.getInfoAsync(nuevoNombre);
      if (existe.exists) await FS.deleteAsync(nuevoNombre, { idempotent: true });

      await FS.moveAsync({ from: uri, to: nuevoNombre });

      const puedeCompartir = await Sharing.isAvailableAsync();
      if (puedeCompartir) {
        await Sharing.shareAsync(nuevoNombre, { mimeType: "application/pdf" });
      } else {
        modalAPI.current?.show(true, `Archivo PDF guardado en:\n${nuevoNombre}`);
      }
    } catch (e: any) {
      console.error(e);
      modalAPI.current?.show(false, "No se pudo generar o compartir el PDF.");
    } finally {
      setCargando(false);
    }
  }, [datosAlumno, generarHTML]);

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View
        style={[
          styles.contenedorFormulario,
          esPantallaPequeña && { maxWidth: "95%" },
        ]}
      >
        <Text style={styles.titulo}>
          Acuse de solicitud de registro al servicio social
        </Text>

        <Text style={styles.texto}>
          Confirma la información del documento antes de imprimir o descargar.
        </Text>

        {Platform.OS !== "web" && (
          <View style={{ alignItems: "center", marginTop: 12 }}>
            <TouchableOpacity
              onPress={onDescargarPDF}
              style={styles.botonPrimario}
              disabled={cargando}
            >
              {cargando ? (
                <ActivityIndicator />
              ) : (
                <Text style={styles.botonPrimarioTexto}>Descargar</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={{ marginTop: 30, flex: 1, minHeight: 600 }}>
          {Platform.OS === "web" ? (
            <iframe
              srcDoc={generarHTML(true)}
              style={{
                width: "100%",
                height: "100%",
                border: "1px solid #ccc",
                borderRadius: 8,
              }}
            />
          ) : (
            <WebView
              ref={webViewRef}
              originWhitelist={["*"]}
              source={{ html: generarHTML(false) }}
              style={{ flex: 1, borderRadius: 8 }}
              scalesPageToFit={true}
              automaticallyAdjustContentInsets={false}
            />
          )}
        </View>
      </View>

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
    marginBottom: 20,
  },
  texto: {
    fontSize: Fuentes.cuerpo,
    textAlign: "justify",
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  botonPrimario: {
    backgroundColor: "#333",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  botonPrimarioTexto: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
