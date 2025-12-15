import ModalAPI, { ModalAPIRef } from "@/componentes/layout/ModalAPI";
import PiePagina from "@/componentes/layout/PiePagina";
import Entrada from "@/componentes/ui/Entrada";
import Paginacion from "@/componentes/ui/Paginacion";
import Selector from "@/componentes/ui/Selector";
import Tabla from "@/componentes/ui/Tabla";
import { useAuth } from "@/context/AuthProvider";
import { fetchData } from "@/servicios/api";
import { Colores, Fuentes } from "@/temas/colores";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

type Plaza = {
  ID: number;
  sede: string;
  carrera: number;
  estatus: number;
  promocion: string;
  PROGRAMA?: string;
  programa?: string;
  tarjetaDisponible: number;
  tipoBeca: string;
  ubicacion: string;
};

export default function CatalogoPlazas() {
  const { sesion, verificarToken } = useAuth();
  const router = useRouter();

  const [cargando, setCargando] = useState(false);

  const { width } = useWindowDimensions();
  const esPantallaPequeña = width < 790;

  const [alumno, setAlumno] = useState<any>(null);
  const [plazas, setPlazas] = useState<Plaza[]>([]);
  const modalAPI = useRef<ModalAPIRef>(null);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [filasPorPagina, setFilasPorPagina] = useState(5);

  const cargarAlumno = async () => {
    verificarToken();

    try {
      setCargando(true);

      const res = await fetchData(`users/obtenerTodosDatosAlumno?tk=${encodeURIComponent(sesion.token)}`);
      if (res?.error === 0) {
        setAlumno(res.data);
      }
      else {
        setCargando(false);
        modalAPI.current?.show(false, "Hubo un problema al obtener los datos del servidor. Inténtalo de nuevo más tarde.", () => { router.replace("/inicio-alumno"); });
      }
    } catch (e) {
      setCargando(false);
      modalAPI.current?.show(false, "Error al conectar con el servidor. Inténtalo de nuevo más tarde.", () => { router.replace("/inicio-alumno"); });
    }
  };

  useEffect(() => {
    cargarAlumno();
  }, []);

  const cargarPlazas = async () => {
    if (!alumno?.carrera) return undefined;

    verificarToken();

    try {
      setCargando(true);

      const res = await fetchData(`plaza/obtenerPlazas?tk=${encodeURIComponent(sesion.token)}`);

      if (res?.error === 0 && Array.isArray(res.plazas))
        setPlazas(res.plazas.filter((plaza) => plaza.carrera !== alumno.carrera));
      else
        modalAPI.current?.show(false, "Hubo un problema al obtener las plazas. Inténtalo de nuevo más tarde.", () => { router.replace("/inicio-alumno"); });
    } catch (e) {
      console.error("[Plazas] Error de red", e);
      modalAPI.current?.show(false, "Error al conectar con el servidor. Inténtalo de nuevo más tarde.", () => { router.replace("/inicio-alumno"); });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPlazas();
  }, [alumno]);

  const plazasFiltradas = plazas
    .filter(plaza =>
      plaza.PROGRAMA?.toLowerCase().includes(busqueda.toLowerCase())
      || plaza.sede?.toLowerCase().includes(busqueda.toLowerCase())
    )

  const totalPaginas = Math.ceil(plazasFiltradas.length / filasPorPagina);
  const plazasMostradas = plazasFiltradas.slice(
    (paginaActual - 1) * filasPorPagina,
    paginaActual * filasPorPagina
  );

  return (
    <>
      {cargando && (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "white", position: "absolute", top: 60, left: 0, right: 0, bottom: 0, zIndex: 100 }}>
          <ActivityIndicator size="large" color="#5a0839" />
        </View>
      )}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "web" ? undefined : "padding"} keyboardVerticalOffset={5} >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={{ flex: 1 }}>
            <View
              style={[
                styles.contenedorFormulario,
                esPantallaPequeña && { maxWidth: "95%" },
              ]}
            >
              <Text allowFontScaling={false} style={styles.titulo}>Plazas</Text>
              <Text allowFontScaling={false} style={styles.subtitulo}>Promoción {plazas[0]?.promocion}</Text>
              <Text allowFontScaling={false} style={styles.carrera}>{alumno?.carrera ?? ""}</Text>
              <Text allowFontScaling={false} style={styles.aviso}>
                “SUJETAS A CAMBIO SIN PREVIO AVISO DE LAS AUTORIDADES”
              </Text>

              <View style={styles.controlesSuperiores}>
                <View style={[{ flexDirection: "row", alignItems: "center", gap: 8 }, esPantallaPequeña && { marginBottom: 5, width: "100%" }]}>
                  <View style={[esPantallaPequeña && [filasPorPagina === 5 ? { minWidth: 35.8 } : filasPorPagina === 10 ? { width: 42.8 } : { minWidth: 44.8 }]]}>
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

                <View style={{ width: esPantallaPequeña ? "100%" : "40%", marginBottom: 15 }}>
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

              {/* Tabla */}
              <ScrollView horizontal={esPantallaPequeña}>
                <Tabla
                  columnas={[
                    {
                      key: "PROGRAMA",
                      titulo: "Programa",
                      multilinea: true,
                      ancho: 240
                    },
                    {
                      key: "sede",
                      titulo: "Sede",
                      multilinea: true,
                      ...(esPantallaPequeña && { ancho: 350 })
                    },
                    {
                      key: "tipoBeca",
                      titulo: "Beca",
                      ancho: 100
                    },
                    {
                      key: "tarjetaDisponible",
                      titulo: "Tarjeta",
                      ancho: 100
                    },
                  ]}
                  datos={plazasMostradas}
                />
              </ScrollView>

              {/* Paginación */}
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
                  {`Mostrando ${plazasMostradas.length} de ${plazas.length} resultados`}
                </Text>
              </View>
            </View>
          </View>
          <ModalAPI ref={modalAPI} />
          <PiePagina />
        </ScrollView>
      </KeyboardAvoidingView>
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
    marginBottom: 15,
  },
  carrera: {
    fontSize: Fuentes.titulo,
    fontWeight: "700",
    color: Colores.textoPrincipal,
    textAlign: "center",
    marginBottom: 10,
  },
  subtitulo: {
    fontSize: Fuentes.subtitulo,
    color: Colores.textoPrincipal,
    textAlign: "center",
    marginBottom: 10,
  },
  aviso: {
    fontSize: Fuentes.cuerpo,
    color: Colores.textoError,
    textAlign: "center",
    marginBottom: 20,
  },
  controlesSuperiores: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    gap: 12,
    flexWrap: "wrap",
  },
});
