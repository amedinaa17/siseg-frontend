import ModalAPI, { ModalAPIRef } from "@/componentes/layout/ModalAPI";
import Boton from "@/componentes/ui/Boton";
import { useAuth } from "@/context/AuthProvider";
import { fetchData } from "@/servicios/api";
import { Colores, Fuentes } from "@/temas/colores";
import * as FileSystem from "expo-file-system/legacy";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

export default function CursoInduccion() {
  const { sesion, verificarToken } = useAuth();
  const router = useRouter();

  const [cargando, setCargando] = useState(false);

  const { width } = useWindowDimensions();
  const esPantallaPequeña = width < 790;

  const [codigoQR, setCodigoQR] = useState<string | null>(null);

  const modalRef = useRef<ModalAPIRef>(null);

  const obtenerDatos = async () => {
    verificarToken();

    try {
      setCargando(true);
      const response = await fetchData(`qr/generarQr?tk=${sesion.token}`);
      const match = response?.match?.(/<img src="([^"]+)"/);

      if (match && match[1]) {
        setCodigoQR(match[1]);
      } else {
        modalRef.current?.show(false, "Hubo un problema al obtener tu código QR del servidor. Inténtalo de nuevo más tarde.", () => { router.replace("/inicio-alumno"); });
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
      modalRef.current?.show(false, "Error al conectar con el servidor. Inténtalo de nuevo más tarde.", () => { router.replace("/inicio-alumno"); });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerDatos();
  }, []);

  const descargarQR = async (qr: string) => {
    if (!qr) {
      modalRef.current?.show(false, "El QR aún no está listo.");
      return;
    }

    try {
      if (Platform.OS === "web") {
        const link = document.createElement("a");
        link.href = qr;
        link.download = "codigoQR.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      let rutaArchivo = `${FileSystem.cacheDirectory}codigoQR.png`;

      if (qr.startsWith("data:image")) {
        const base64QR = qr.replace(/^data:image\/\w+;base64,/, "").trim();
        await FileSystem.writeAsStringAsync(rutaArchivo, base64QR, { encoding: "base64" });
      } else if (qr.startsWith("http")) {
        const downloadResult = await FileSystem.downloadAsync(qr, rutaArchivo);
        rutaArchivo = downloadResult.uri;
      } else {
        modalRef.current?.show(false, "El QR no tiene un formato válido para descargar.");
        return;
      }

      await Sharing.shareAsync(rutaArchivo);
    } catch (error) {
      console.error(error);
      modalRef.current?.show(false, "No se pudo descargar el código QR.");
    }
  };

  return (
    <>
      {cargando && (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white", position: "absolute", top: 60, left: 0, right: 0, bottom: 0, zIndex: 100 }}>
          <ActivityIndicator size="large" color="#5a0839" />
        </View>
      )}
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View
          style={[
            styles.contenedorFormulario,
            esPantallaPequeña && { maxWidth: "95%" },
          ]}
        >
          <Text style={styles.titulo}>Curso de inducción</Text>

          <Text style={styles.subtitulo}>
            Este código QR es único y personal para cada alumno. Se utilizará para registrar su asistencia al curso de inducción del servicio social.
          </Text>

          <Text style={{ fontSize: Fuentes.caption, color: Colores.textoError, marginBottom: 20, textAlign: "center" }}>
            Importante: Presenta este código en el momento de ingresar al curso. No debe ser compartido ni reutilizado.
          </Text>

          {codigoQR ? (
            <Image source={{ uri: codigoQR }} style={styles.logo} />
          ) : (
            <Text style={{ textAlign: "center", marginVertical: 20 }}>
              Generando tu código QR...
            </Text>
          )}

          <View style={{ marginTop: 15, alignItems: "center" }}>
            <Boton title="Descargar QR" onPress={() => descargarQR(codigoQR!)} />
          </View>
        </View>

        <ModalAPI ref={modalRef} />
      </ScrollView>
    </>
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
  subtitulo: {
    fontSize: Fuentes.cuerpo,
    color: Colores.textoSecundario,
    textAlign: "center",
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  logo: {
    alignSelf: "center",
    width: 350,
    height: 350,
  },
});
