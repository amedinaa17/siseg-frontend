import ModalAPI, { ModalAPIRef } from "@/componentes/layout/ModalAPI";
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
  const { width } = useWindowDimensions();
  const esPantallaPequeña = width < 600;
  const { sesion, verificarToken } = useAuth();
  const modalAPI = useRef<ModalAPIRef>(null);

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

  const mostrarLayoutDosColumnas = Platform.OS === "web" && !esPantallaPequeña;

  const renderControlesTabla = () => {
    if (esPantallaPequeña) {
      return (
        <>
          <View style={styles.controlesTablaMobile}>
            <View style={styles.selectorFilasWrapperMobile}>
              <Selector
                label=""
                selectedValue={String(filasPorPagina)}
                onValueChange={(valor) => {
                  setPaginaActual(1);
                  setFilasPorPagina(Number(valor));
                }}
                items={[
                  { label: "5", value: "5" },
                  { label: "10", value: "10" },
                  { label: "20", value: "20" },
                ]}
              />
            </View>
            <Text
              style={{ color: Colores.textoClaro, fontSize: Fuentes.caption }}
            >
              por página
            </Text>
          </View>

          <View style={{ width: "100%", marginBottom: 8 }}>
            <Entrada
              label="Buscar"
              value={busqueda}
              onChangeText={setBusqueda}
            />
          </View>
        </>
      );
    }

    return (
      <View style={styles.controlesTabla}>
        <View style={{ flex: 1 }}>
          <Entrada
            label="Buscar"
            value={busqueda}
            onChangeText={setBusqueda}
          />
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginLeft: 12,
          }}
        >
          <View style={styles.selectorFilasWrapperWeb}>
            <Selector
              label=""
              selectedValue={String(filasPorPagina)}
              onValueChange={(valor) => {
                setPaginaActual(1);
                setFilasPorPagina(Number(valor));
              }}
              items={[
                { label: "5", value: "5" },
                { label: "10", value: "10" },
                { label: "20", value: "20" },
              ]}
            />
          </View>
          <Text
            style={{ color: Colores.textoClaro, fontSize: Fuentes.caption }}
          >
            por página
          </Text>
        </View>
      </View>
    );
  };

  const renderTablaRegistros = () => (
    <>
      <Text style={styles.subtitulo}>Registros de asistencia</Text>

      {renderControlesTabla()}

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
          <ScrollView
            horizontal={esPantallaPequeña}
            style={{ marginTop: 16, width: "100%" }}
          >
            <View style={{ flex: 1, minWidth: "100%" }}>
              <Tabla
                columnas={[
                  {
                    key: "alumnoBoleta",
                    titulo: "Boleta",
                  },
                  {
                    key: "fechaLectura",
                    titulo: "Fecha y hora",
                  },
                ]}
                datos={registrosMostrados}
              />
            </View>
          </ScrollView>

          <View
            style={{
              flexDirection: esPantallaPequeña ? "column" : "row",
              justifyContent: "space-between",
              alignItems: esPantallaPequeña ? "flex-start" : "center",
              marginTop: 10,
              gap: 8,
            }}
          >
            <View style={{ flexDirection: "row", gap: 6, marginTop: 5 }}>
              <Paginacion
                paginaActual={paginaActual}
                totalPaginas={totalPaginas}
                setPaginaActual={setPaginaActual}
              />
            </View>

            <Text
              style={{
                fontSize: Fuentes.caption,
                color: Colores.textoClaro,
                marginTop: esPantallaPequeña ? 8 : 0,
              }}
            >
              {`Mostrando ${registrosMostrados.length} de ${registrosFiltrados.length} registros`}
            </Text>
          </View>
        </>
      )}
    </>
  );

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View
        style={[
          styles.contenedorFormulario,
          esPantallaPequeña && { maxWidth: "95%" },
        ]}
      >
        <Text style={styles.titulo}>Registrar asistencia al curso de inducción</Text>
        <Text style={styles.subtitulo}>Escanea el código QR del alumno para registrar su asistencia al curso de inducción.</Text>
        <Text
          style={{
            fontSize: Fuentes.caption,
            color: Colores.textoClaro,
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          Nota: Habilita el acceso a la cámara de tu dispositivo.
        </Text>

        <View
          style={[
            styles.contenidoResponsive,
            mostrarLayoutDosColumnas
              ? { flexDirection: "row", alignItems: "flex-start" }
              : { flexDirection: "column" },
          ]}
        >
          <View
            style={[
              styles.seccionEscaneo,
              mostrarLayoutDosColumnas && { flex: 1, marginRight: 16 },
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
                  <Text style={styles.emojiCamara}>📷</Text>
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

          {mostrarLayoutDosColumnas && (
            <View
              style={[
                styles.seccionTabla,
                { flex: 1, marginLeft: 16, marginTop: 0 },
              ]}
            >
              {renderTablaRegistros()}
            </View>
          )}
        </View>

        {!mostrarLayoutDosColumnas && (
          <View style={{ marginTop: 30 }}>{renderTablaRegistros()}</View>
        )}
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
  contenidoResponsive: {
    width: "100%",
    marginTop: 16,
  },
  seccionEscaneo: {
    alignItems: "center",
  },
  seccionTabla: {
    marginTop: 30,
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
  controlesTabla: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 12,
    marginBottom: 8,
    flexWrap: "wrap",
  },
  selectorFilasWrapperWeb: {
    minWidth: 50,
  },
  controlesTablaMobile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  selectorFilasWrapperMobile: {
    width: 60,
  },
});
