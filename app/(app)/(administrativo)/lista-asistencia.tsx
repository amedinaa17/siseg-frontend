import ModalAPI, { ModalAPIRef } from "@/componentes/layout/ModalAPI";
import PiePagina from "@/componentes/layout/PiePagina";
import Boton from "@/componentes/ui/Boton";
import Entrada from "@/componentes/ui/Entrada";
import Paginacion from "@/componentes/ui/Paginacion";
import Selector from "@/componentes/ui/Selector";
import Tabla from "@/componentes/ui/Tabla";
import { useAuth } from "@/context/AuthProvider";
import { fetchData, postData } from "@/servicios/api";
import { Colores, Fuentes } from "@/temas/colores";
import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

type RegistroQr = {
  id: number;
  adminEncargado: string;
  alumnoBoleta: string;
  fechaLectura: string;
};

const formatearFecha = (isoString: string) => {
  if (!isoString) return "";

  const fecha = new Date(isoString);
  if (isNaN(fecha.getTime())) return isoString;

  const dia = fecha.getDate().toString().padStart(2, "0");
  const mes = (fecha.getMonth() + 1).toString().padStart(2, "0");
  const anio = fecha.getFullYear();

  const horas = fecha.getHours().toString().padStart(2, "0");
  const minutos = fecha.getMinutes().toString().padStart(2, "0");

  return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
};

export default function CursoInduccion() {
  const { sesion, verificarToken } = useAuth();

  const modalAPI = useRef<ModalAPIRef>(null);

  const { width } = useWindowDimensions();
  const esPantallaPequeña = width < 790;

  const [permission, requestPermission] = useCameraPermissions();
  const [escaneando, setEscaneando] = useState(false);
  const [bloquearLectura, setBloquearLectura] = useState(false);
  const [facing, setFacing] = useState<"back" | "front">("back");
  const [torch, setTorch] = useState(false);

  const [registros, setRegistros] = useState<RegistroQr[]>([]);
  const [cargandoRegistros, setCargandoRegistros] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [filasPorPagina, setFilasPorPagina] = useState(5);

  const iniciarEscaneo = async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        modalAPI.current?.show(
          false,
          "El acceso a la cámara ha sido denegado. Para continuar, otorga el permiso necesario."
        );
        return;
      }
    }
    setBloquearLectura(false);
    setEscaneando(true);
  };

  const detenerEscaneo = () => {
    setEscaneando(false);
    setTorch(false);
  };

  const getBoletaFromQR = (raw: string) => String(raw || "").trim();

  const registrarAsistencia = async (boleta: string) => {
    detenerEscaneo();
    verificarToken();

    try {
      const response = await postData("qr/registrarQR", {
        tk: sesion?.token,
        boleta: boleta,
      });

      if (response.error === 0) {
        modalAPI.current?.show(true, `La asistencia ha sido registrada correctamente para el alumno ${boleta}`);
        obtenerRegistros();
      } else if (response.message?.includes("confirmar usuario")) {
        modalAPI.current?.show(false, "El código QR no es válido.");
      } else if (response.message === "Token expirado") {
        modalAPI.current?.show(false, "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
      } else {
        modalAPI.current?.show(false, "Hubo un problema al registrar la asistencia del alumno. Inténtalo de nuevo más tarde.");
      }
    } catch (error) {
      modalAPI.current?.show(false, "Error al conectar con el servidor. Inténtalo de nuevo más tarde.");
    }
  };

  const onBarcodeScanned = useCallback(
    async ({ data }: { data: string }) => {
      if (bloquearLectura) return;
      setBloquearLectura(true);
      setTorch(false);

      const boleta = getBoletaFromQR(data);
      if (!boleta) {
        modalAPI.current?.show(false, "El código QR no contiene una boleta válida.");
        setTimeout(() => setBloquearLectura(false), 800);
        return;
      }

      await registrarAsistencia(boleta);
      setTimeout(() => setBloquearLectura(false), 1000);
    },
    [bloquearLectura]
  );

  const obtenerRegistros = async () => {
    verificarToken();

    try {
      setCargandoRegistros(true);
      const resp = await fetchData(`qr/obtenerRegistrosQr?tk=${sesion.token}`);

      if (resp.error === 0) {
        const normalizados: RegistroQr[] = (resp.registros || []).map(
          (r: any) => ({
            alumnoBoleta: r.alumnoBoleta ?? "",
            fechaLectura: formatearFecha(r.fechaLectura ?? ""),
            id: r.id ?? 0,
            adminEncargado: r.adminEncargado ?? "",
          })
        );
        setRegistros(normalizados);
      } else if (resp.message === "Token expirado") {
        modalAPI.current?.show(false, "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
      } else {
        modalAPI.current?.show(false, "Hubo un problema al obtener los registros de asistencia. Inténtalo de nuevo más tarde.");
      }
    } catch (error) {
      console.error(error);
      modalAPI.current?.show(false, "Error al conectar con el servidor. Inténtalo de nuevo más tarde.");
    } finally {
      setCargandoRegistros(false);
    }
  };

  useEffect(() => {
    obtenerRegistros();
  }, []);

  const registrosFiltrados = registros.filter((r) =>
    `${r.alumnoBoleta} ${r.adminEncargado}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  const totalPaginas = Math.max(1, Math.ceil(registrosFiltrados.length / filasPorPagina));
  const registrosMostrados = registrosFiltrados.slice((paginaActual - 1) * filasPorPagina, paginaActual * filasPorPagina);

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={{ flex: 1 }}>
        <View style={[styles.contenedorFormulario, esPantallaPequeña && { maxWidth: "95%" }]}>
          <Text allowFontScaling={false} style={styles.titulo}>Registrar asistencia al curso de inducción</Text>
          <Text allowFontScaling={false} style={styles.subtitulo}>Escanea el código QR del alumno para registrar su asistencia al curso de inducción.</Text>
          <Text
            style={{
              fontSize: Fuentes.caption,
              color: Colores.textoClaro,
              marginBottom: 20,
              textAlign: "center",
            }}
            allowFontScaling={false}
          >
            Nota: Habilita el acceso a la cámara de tu dispositivo.
          </Text>
          <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
            <View style={{ flex: 1, marginBottom: esPantallaPequeña ? 30 : 15 }}>
              <View
                style={[
                  styles.seccionEscaneo,
                ]}
              >
                <View style={styles.marcoEscaneo}>
                  {escaneando ? (
                    <CameraView
                      style={StyleSheet.absoluteFillObject}
                      facing={facing}
                      enableTorch={torch}
                      barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                      onBarcodeScanned={onBarcodeScanned}
                    />
                  ) : (
                    <View style={styles.placeholderCamara}>
                      <Text allowFontScaling={false} style={styles.emojiCamara}>📷</Text>
                    </View>
                  )}
                </View>

                <View style={{ marginTop: 18, alignItems: "center", gap: 10 }}>
                  {!escaneando ? (
                    <Boton title="Escanear" onPress={iniciarEscaneo} />
                  ) : (
                    <Boton title="Detener" onPress={detenerEscaneo} />
                  )}
                </View>
              </View>
            </View>
            <View style={{ flex: 1, marginBottom: 15 }}>
              <View>
                <Text allowFontScaling={false} style={[styles.subtitulo, { fontSize: Fuentes.subtitulo, fontWeight: "600" }]}>Registros de asistencia</Text>
                <View style={styles.controlesSuperiores}>
                  <View style={[{ flexDirection: "row", alignItems: "center", gap: 8 }, esPantallaPequeña && { marginBottom: 5, width: "100%" }]}>
                    <View style={[esPantallaPequeña && [filasPorPagina === 5 ? { minWidth: 35.8 } : filasPorPagina === 10 ? { width: 42.8 } : { minWidth: 44.8 }], { marginBottom: 15 }]}>
                      <Selector
                        label=""
                        selectedValue={String(filasPorPagina)}
                        onValueChange={(valor) => setFilasPorPagina(Number(valor))}
                        items={[
                          { label: "5", value: "5" },
                          { label: "10", value: "10" },
                          { label: "20", value: "20" },
                        ]}
                      />
                    </View>
                    <Text allowFontScaling={false} style={{ color: Colores.textoClaro, fontSize: Fuentes.caption }}>
                      por página
                    </Text>
                  </View>
                  <View style={{ width: esPantallaPequeña ? "100%" : "40%", marginBottom: 22 }}>
                    <Entrada
                      label="Buscar"
                      value={busqueda}
                      maxLength={45}
                      onChangeText={(text) => {
                        setBusqueda(text);
                        setPaginaActual(1);
                      }}
                    />
                  </View>
                </View>

                {cargandoRegistros ? (
                  <View style={{ marginTop: 20, alignItems: "center" }}>
                    <ActivityIndicator size="small" color={Colores.primario} />
                  </View>
                ) : registros.length === 0 ? (
                  <Text
                    style={{
                      marginTop: 16,
                      textAlign: "center",
                      color: Colores.textoClaro,
                    }}
                  >
                    Aún no hay asistencias registradas.
                  </Text>
                ) : (
                  <>
                    <ScrollView>
                      <Tabla
                        columnas={[
                          {
                            key: "alumnoBoleta",
                            titulo: "Boleta",
                            ...(esPantallaPequeña && { ancho: 150 }),
                            multilinea: true
                          },
                          {
                            key: "fechaLectura",
                            titulo: "Fecha y hora",
                            multilinea: true
                          },
                        ]}
                        datos={registrosMostrados}
                      />
                    </ScrollView>

                    <View style={{ flexDirection: esPantallaPequeña ? "column" : "row", justifyContent: "space-between" }}>
                      <View style={{ flexDirection: "row", marginTop: 15, gap: 6 }}>
                        <Paginacion
                          paginaActual={paginaActual}
                          totalPaginas={totalPaginas}
                          setPaginaActual={setPaginaActual}
                        />
                      </View>

                      <Text
                        style={{
                          color: Colores.textoClaro,
                          fontSize: Fuentes.caption,
                          marginTop: 15,
                        }}
                        allowFontScaling={false}
                      >
                        {`Mostrando ${registrosMostrados.length} de ${registrosFiltrados.length} resultados`}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>
      <ModalAPI ref={modalAPI} />
      <PiePagina />
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
      android: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      web: { boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.05)" },
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
    color: Colores.textoSecundario,
    textAlign: "center",
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  seccionEscaneo: {
    alignItems: "center",
  },
  marcoEscaneo: {
    alignSelf: "center",
    width: 300,
    height: 300,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colores.borde,
    backgroundColor: Colores.fondo,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  placeholderCamara: {
    width: 240,
    height: 240,
    borderRadius: 12,
    backgroundColor: "#e6e6e9",
    justifyContent: "center",
    alignItems: "center",
  },
  emojiCamara: {
    fontSize: 72,
    opacity: 0.7,
    marginBottom: 6,
  },
  controlesSuperiores: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
});
