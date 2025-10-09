import { useAuth } from "@/context/AuthProvider";
import { fetchData } from "@/servicios/api";
import { Colores, Fuentes } from "@/temas/colores";
import React, { useEffect, useRef, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { WebView } from "react-native-webview";


export default function AcuseSolicitud() {
    const { width } = useWindowDimensions();
    const esPantallaPequeña = width < 600;
    const webViewRef = useRef<any>(null);
    const { sesion, verificarToken } = useAuth();
    const [datosAlumno, setDatosAlumno] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMensaje, setModalMensaje] = useState('');
    const [modalTipo, setModalTipo] = useState(false);

    useEffect(() => {
        const obtenerDatos = async () => {
            if (sesion?.token) {
                try {
                    const response = await fetchData(`users/obtenerTodosDatosAlumno?tk=${sesion.token}`);
                    if (response.error === 0) {
                        setDatosAlumno(response.data);
                    } else {
                        console.error(response.message);
                    }
                } catch (error) {
                    setModalTipo(false);
                    setModalMensaje("Error al conectar con el servidor. Intentalo de nuevo más tarde.")
                    setModalVisible(true)
                }
            }
        };
        obtenerDatos();
    }, [sesion]);

    const generarHTML = () => `<html xmlns="http://www.w3.org/1999/xhtml">

<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <title>Servicio Social: Solicitud de Registro al Servicio Social</title>

  <style type="text/css">
    .titulo {
      text-align: justify;
      margin: 0 auto;
      font-family: Calibri;
      font-size: 20px;
    }

    .redaccion {
      text-align: justify;
      margin: 0 auto;
      font-family: Calibri;
      font-size: 14px;
    }

    .contenido {

      text-align: justify;
      margin: 0 auto;
      font-family: Calibri;
      font-size: 15px;
    }

    .texto {
      text-align: justify;
      margin: 0 auto;
      font-family: Calibri;
      font-size: 20px;
      line-height: 30px;
    }

    .fin {
      text-align: center;
      margin: 0 auto;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 10px;
    }

    .firmas {
      text-align: center;
      font-family: Calibri;
      font-size: 12px;
    }

    .certifica {
      text-align: left;
      font-family: Calibri;
      font-size: 10px;
    }

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
}

.nover:hover {
    background-color: #555; /* un poco más claro al pasar el mouse */
    transform: translateY(-2px);
    box-shadow: 0 6px 10px rgba(0, 0, 0, 0.3);
}

.nover:active {
    transform: translateY(1px);
    box-shadow: 0 3px 5px rgba(0, 0, 0, 0.2);
}

    @media print {
      .nover {
        display: none;
      }
    }
  </style>

</head>

<body>
  <div align="center">
    <img src="http://148.204.10.106/ServicioSocial/cabezacarta.png" width="871">
  </div>
  <table width="681" height="927" border="0" cellspacing="0" cellpadding="0" align="center">
    <tbody>
      <tr>
        <td width="681" class="titulo" background="http://148.204.10.106/ServicioSocial/LugarFoto.png">
          <div align="center">
            <p><strong><u>SOLICITUD DE REGISTRO <br> SERVICIO SOCIAL</u></strong><br></p>
            <p><strong>PROMOCION: PROMOCIÓN: AGOSTO 2025 – JULIO 2026</strong></p>
            <strong>MÉDICO CIRUJANO Y HOMEÓPATA</strong>
          </div>
        </td>
      </tr>
      <tr>
        <td height="206">
          <table width="709" height="163" border="1" align="center" cellpadding="0" cellspacing="0" class="contenido">
            <tbody>
              <tr>
                <td height="31" colspan="2">Nombre:
                  ${datosAlumno?.nombre} ${datosAlumno?.apellido_paterno} ${datosAlumno?.apellido_materno}</td>
              </tr>
              <tr>
                <td width="346" height="31">No. boleta: ${datosAlumno?.boleta}</td>
                <td width="269">CURP: ${datosAlumno?.curp}</td>
              </tr>
              <tr>
                <td height="34" colspan="2">Domicilio: ${datosAlumno?.calle_y_numero}</td>
              </tr>
              <tr>
                <td height="30" colspan="2">
                  Colonia: ${datosAlumno?.colonia}
                  <br>Delegación/Municipio: ${datosAlumno?.delegacion}
                  <br>Estado: ${datosAlumno?.estado}
                  <br>Código postal: ${datosAlumno?.cp}
                </td>
              </tr>
              <tr>
                <td>
                  Teléfono local: ${datosAlumno?.tellocal}
                  <br>Celular: ${datosAlumno?.telcelular} </td>
                <td>
                  Correo electrónico: <br>${datosAlumno?.correo}  </td>
              </tr>
            </tbody>
          </table>

        </td>
      </tr>
      <tr align="center">
        <td class="texto" align="center">
          <p align="justify">Con la firma de este registro <strong>me comprometo</strong> a sujetarme a los lineamientos
            del Servicio Social de la NORMA OFICIAL 034 Y DEL REGLAMENTO DE SERVICIO SOCIAL DE AREA DE LA SALUD,
            cumplirlo en forma y en el período manifestado, así como observar una conducta ejemplar durante la
            permanencia en el lugar asignado y procurar por todos los medios a mi alcance, acrecentar el prestigio del
            <strong>INSTITUTO POLITÉCNICO NACIONAL</strong>, de no hacerlo así, me haré acreedor a las sanciones que
            dicho Reglamento establece.</p>
          <p align="center">
            <strong>DE CONFORMIDAD</strong><br><br>
            <strong>_______________________________</strong>
            <br>${datosAlumno?.nombre} ${datosAlumno?.apellido_paterno} ${datosAlumno?.apellido_materno}
          </p>
        </td>
      </tr>
      <tr class="fin">
        <td>
          <p align="center" class="fin">
            <img src="http://148.204.10.106/ServicioSocial/piecarta.png" width="871">
          </p>
        </td>
      </tr>
    </tbody>
  </table>

  <div align="center">
    <input type="button" name="imprimir" value="Imprimir" class="nover" onclick="window.print();">
  </div>

</body>

</html>`;

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
                    Confirma la información del documento antes de imprimir.
                </Text>

                <View style={{ marginTop: 30, height: 800 }}>
                    {Platform.OS === "web" ? (
                        <iframe
                            srcDoc={generarHTML()}
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
                            source={{ html: generarHTML() }}
                            style={{ flex: 1, borderRadius: 8 }}
                        />
                    )}
                </View>
            </View>
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
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.05,
                shadowRadius: 6,
            },
            android: { elevation: 2 },
            web: { boxShadow: "0px 4px 6px rgba(0,0,0,0.05)" },
        }),
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
});
