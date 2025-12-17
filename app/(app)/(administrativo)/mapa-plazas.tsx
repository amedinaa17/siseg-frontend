
import Modal from "@/componentes/layout/Modal";
import ModalAPI, { ModalAPIRef } from "@/componentes/layout/ModalAPI";
import PiePagina from "@/componentes/layout/PiePagina";
import Boton from "@/componentes/ui/Boton";
import Entrada from "@/componentes/ui/Entrada";
import Selector from "@/componentes/ui/Selector";
import Tabla from "@/componentes/ui/Tabla";
import { useAuth } from "@/context/AuthProvider";
import { fetchData } from "@/servicios/api";
import { Colores, Fuentes } from "@/temas/colores";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState, } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions
} from "react-native";

import NativeMap from "@/componentes/mapa/NativeMap";
import WebMap from "@/componentes/mapa/WebMap";

const CARRERA_LABELS: Record<number, string> = {
  1: "Médico Cirujano y Homeópata",
  2: "Médico Cirujano y Partero",
};

type Plaza = {
  ID: string | number;
  sede: string;
  ubicacion: string;
  PROGRAMA?: string;
  CARRERA?: number | string | null;
  carrera?: number | string | { ID?: number; NOMBRE?: string } | null;
  tarjetaDisponible?: number | string | null;
};

type MapaPunto = {
  sede: string;
  ubicacion: string;
  latitude: number | null;
  longitude: number | null;
};

type PuntoConPlaza = MapaPunto & { plaza?: Plaza };

type AlumnoMin = {
  boleta: string;
  nombre?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  sede?: string | number | null;
  carrera?: number | string | { ID?: number; NOMBRE?: string } | null;
  [k: string]: any;
};

function normalizePrograma(plaza?: Plaza): string {
  return plaza?.PROGRAMA ? String(plaza.PROGRAMA).trim() : "";
}

function normalizeCarreraPlaza(plaza?: Plaza): string {
  if (!plaza) return "";
  const nested =
    (plaza as any)?.carrera && typeof (plaza as any).carrera === "object"
      ? (plaza as any).carrera?.NOMBRE
      : undefined;
  if (nested) return String(nested).trim();
  if (typeof (plaza as any)?.carrera === "string")
    return String((plaza as any).carrera).trim();
  if (typeof plaza.CARRERA === "string") return String(plaza.CARRERA).trim();
  if (typeof (plaza as any)?.carrera === "number") {
    const id = (plaza as any).carrera as number;
    return CARRERA_LABELS[id] ?? String(id);
  }
  if (typeof plaza.CARRERA === "number") {
    const id = plaza.CARRERA as number;
    return CARRERA_LABELS[id] ?? String(id);
  }
  return "";
}

function useMapaPlazas() {
  const { sesion, verificarToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [plazas, setPlazas] = useState<Plaza[]>([]);
  const [mapaData, setMapaData] = useState<MapaPunto[]>([]);
  const [alumnos, setAlumnos] = useState<AlumnoMin[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const cargar = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      verificarToken();
      const [rPlazas, rMapa, rAlumnos] = await Promise.all([
        fetchData(`plaza/obtenerPlazas?tk=${sesion.token}`),
        fetchData(`plaza/getMapaData?tk=${sesion.token}`),
        fetchData(`users/obtenerTodosAlumnos?tk=${sesion.token}`),
      ]);

      if (rPlazas.error === 0) setPlazas(rPlazas.plazas ?? rPlazas.data ?? []);
      else throw new Error("Hubo un problema al obtener las plazas del servidor. Inténtalo de nuevo más tarde.");

      if (rMapa.error === 0) setMapaData(rMapa.data ?? []);
      else throw new Error("Hubo un problema al cargar el mapa. Inténtalo de nuevo más tarde.");

      if (rAlumnos.error === 0)
        setAlumnos(rAlumnos.data ?? rAlumnos.alumnos ?? []);
      else throw new Error("Hubo un problema al obtener los datos de los alumnos del servidor. Inténtalo de nuevo más tarde.");
    } catch (e: any) {
      setErrorMsg("Error al conectar con el servidor. Inténtalo de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const puntos: PuntoConPlaza[] = useMemo(() => {
    const porSede = new Map<string, Plaza[]>();
    plazas.forEach((p) => {
      const k = String(p.sede || "").trim();
      if (!porSede.has(k)) porSede.set(k, []);
      porSede.get(k)!.push(p);
    });

    return (mapaData || []).map((m) => {
      const lista = porSede.get(String(m.sede || "").trim());
      return { ...m, plaza: (lista && lista[0]) || undefined };
    });
  }, [plazas, mapaData]);

  const alumnosPorPlaza = useMemo(() => {
    const map = new Map<string, AlumnoMin[]>();
    (alumnos || []).forEach((a) => {
      const idPlaza = a?.sede != null ? String(a.sede) : "";
      if (!idPlaza) return;
      if (!map.has(idPlaza)) map.set(idPlaza, []);
      map.get(idPlaza)!.push(a);
    });
    return map;
  }, [alumnos]);

  const programas = useMemo(() => {
    const s = new Set<string>();
    plazas.forEach((p) => {
      const label = normalizePrograma(p);
      if (label) s.add(label);
    });
    return Array.from(s).sort();
  }, [plazas]);

  const carreras = useMemo(() => {
    const s = new Set<string>();
    plazas.forEach((p) => {
      const label = normalizeCarreraPlaza(p);
      if (label) s.add(label);
    });
    return Array.from(s).sort();
  }, [plazas]);

  return {
    loading,
    errorMsg,
    puntos,
    programas,
    carreras,
    alumnosPorPlaza,
    recargar: cargar,
  };
}

export default function MapaPlazas() {
  const { width } = useWindowDimensions();
  const esPantallaPequeña = width < 790;

  const modalAPI = useRef<ModalAPIRef>(null);
  const { sesion } = useAuth();
  const { loading, puntos, programas, carreras, alumnosPorPlaza, recargar } =
    useMapaPlazas();

  const [filtroCarrera, setFiltroCarrera] = useState<string>("Todos");
  const [filtroPrograma, setFiltroPrograma] = useState<string>("Todos");
  const [busquedaTexto, setBusquedaTexto] = useState<string>("");
  const [sedeJump, setSedeJump] = useState<string>("");

  const [modalVisible, setModalVisible] = useState(false);
  const [modalSede, setModalSede] = useState<string>("");
  const [modalAlumnos, setModalAlumnos] = useState<AlumnoMin[]>([]);

  const [modalAlumnoVisible, setModalAlumnoVisible] = useState(false);
  const [alumno, setAlumnoDetalles] = useState<any | null>(null);

  const puntosFiltrados: PuntoConPlaza[] = useMemo(() => {
    return puntos.filter((p) => {
      const okCoords = p.latitude && p.longitude;
      if (!okCoords) return false;

      const progLabel = normalizePrograma(p.plaza);
      const carreraLabel = normalizeCarreraPlaza(p.plaza);

      const progOK = filtroPrograma === "Todos" || progLabel === filtroPrograma;
      const carreraOK = filtroCarrera === "Todos" || carreraLabel === filtroCarrera;

      const texto = `${p.sede} ${p.ubicacion} ${progLabel} ${carreraLabel}`.toLowerCase();
      const matchBusqueda =
        !busquedaTexto || texto.includes(busquedaTexto.toLowerCase());

      return progOK && carreraOK && matchBusqueda;
    });
  }, [puntos, filtroPrograma, filtroCarrera, busquedaTexto]);

  const sedesDisponibles = useMemo(() => {
    const s = new Set<string>();
    puntosFiltrados.forEach((p) => {
      if (p.sede && p.latitude && p.longitude) s.add(p.sede);
    });
    return Array.from(s).sort();
  }, [puntosFiltrados]);

  useEffect(() => {
    if (sedeJump && !sedesDisponibles.includes(sedeJump)) {
      setSedeJump("");
    }
  }, [sedesDisponibles, sedeJump]);

  const seleccionado = useMemo(() => {
    if (!sedeJump) return null;
    return puntosFiltrados.find((p) => p.sede === sedeJump) || null;
  }, [sedeJump, puntosFiltrados]);

  useEffect(() => {
    if (sedeJump) {
      const p = puntos.find((x) => x.sede === sedeJump);
      if (p && (!p.latitude || !p.longitude)) {
        modalAPI.current?.show(false, "Esta sede aún no tiene coordenadas geo codificadas.");
      }
    }
  }, [sedeJump, puntos]);

  const handleMarkerPress = (p: PuntoConPlaza) => {
    setSedeJump(p.sede);

    const plazaId = p.plaza?.ID != null ? String(p.plaza.ID) : "";
    const alumnos = plazaId ? alumnosPorPlaza.get(plazaId) ?? [] : [];

    setModalSede(p.sede);
    setModalAlumnos(alumnos);
    setModalVisible(true);
  };

  async function verAlumno(boleta: string) {
    try {
      setAlumnoDetalles(null);

      const resp = await fetchData(
        `users/obtenerDetallesAlumnoPorBoleta?tk=${sesion.token}&boleta=${encodeURIComponent(
          boleta
        )}`
      );
      if (resp?.error === 0 && resp?.data) {
        setAlumnoDetalles(resp.data);
        setModalVisible(false);
        setModalAlumnoVisible(true);
      } else {
        setModalVisible(false);
        modalAPI.current?.show(false, "Hubo un problema al obtener los datos de los alumnos del servidor. Inténtalo de nuevo más tarde.", () => { modalAPI.current?.close(); setModalVisible(true); });
      }
    } catch (e) {
      setModalVisible(false);
      modalAPI.current?.show(false, "Error al conectar con el servidor. Inténtalo de nuevo más tarde.", () => { modalAPI.current?.close(); setModalVisible(true); });
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "web" ? undefined : "padding"} keyboardVerticalOffset={5} >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1 }}>
          <View style={[styles.contenedor, esPantallaPequeña && { maxWidth: "95%" }]}>
            <Text allowFontScaling={false} style={styles.titulo}>Mapa de plazas</Text>
            <View style={[styles.controlesSuperiores, !esPantallaPequeña && { marginBottom: 15 }]}>
              <View style={esPantallaPequeña ? { width: "100%", marginBottom: 15 } : { width: "34%" }}>
                <Entrada
                  label="Buscar"
                  value={busquedaTexto}
                  maxLength={45}
                  onChangeText={setBusquedaTexto}
                  editable={!loading}
                />
              </View>

              <View style={esPantallaPequeña ? { width: "100%", marginBottom: 15 } : { width: "30%" }}>
                <Selector
                  label="Programa"
                  items={[{ label: "Todos", value: "Todos" }, ...programas.map((p) => ({ label: p, value: p }))]}
                  selectedValue={filtroPrograma}
                  onValueChange={(v) => setFiltroPrograma(String(v))}
                  editable={!loading}
                />
              </View>

              <View style={esPantallaPequeña ? { width: "100%", marginBottom: 15 } : { width: "30%" }}>
                <Selector
                  label="Carrera"
                  items={[{ label: "Todos", value: "Todos" }, ...carreras.map((c) => ({ label: c, value: c }))]}
                  selectedValue={filtroCarrera}
                  onValueChange={(v) => setFiltroCarrera(String(v))}
                  editable={!loading}
                />
              </View>
            </View>
            <View style={[styles.controlesSuperiores, { marginBottom: 15 }]}>
              <View style={esPantallaPequeña ? { width: "100%", marginBottom: 15 } : { width: "60%" }}>
                <Selector
                  label="Ir a sede"
                  items={[{ label: "Todos", value: "" }, ...sedesDisponibles.map((s) => ({ label: s, value: s }))]}
                  selectedValue={sedeJump}
                  onValueChange={(v) => setSedeJump(String(v))}
                  editable={!loading}
                />
              </View>

              <View style={{ width: esPantallaPequeña ? "100%" : "40%", alignItems: "flex-end", justifyContent: "flex-end" }}>
                <Boton onPress={recargar} title={loading ? "Cargando..." : "Recargar"} />
              </View>
            </View>

            {Platform.OS === "web" ? (
              <WebMap
                puntos={puntosFiltrados}
                puntoSeleccionado={seleccionado}
                onMarkerPress={handleMarkerPress}
              />
            ) : (
              <NativeMap
                puntos={puntosFiltrados}
                puntoSeleccionado={seleccionado}
                onMarkerPress={handleMarkerPress}
              />
            )}

            <Text allowFontScaling={false} style={{ marginTop: 15, color: Colores.textoClaro, fontSize: Fuentes.caption }}>
              Mostrando {puntosFiltrados.length} sede(s) con coordenadas válidas.
            </Text>
          </View>
        </View>
        <Modal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          titulo={modalSede || "Detalle de sede"}
          maxWidth={820}
        >
          <View style={{ marginTop: 10 }}>
            {modalAlumnos.length === 0 ? (
              <View style={{ margin: "auto" }}>
                <Text allowFontScaling={false} style={{ color: Colores.textoClaro, textAlign: "center" }}>No hay alumnos realizando su servicio social en esta sede.</Text>
              </View>
            ) : (
              <ScrollView horizontal={esPantallaPequeña}>
                <Tabla
                  columnas={[
                    { key: "boleta", titulo: "Boleta", ancho: 130 },
                    { key: "nombre_completo", titulo: "Nombre", ...(esPantallaPequeña && { ancho: 275 }) },
                    { key: "carrera", titulo: "Carrera", ...(esPantallaPequeña && { ancho: 275 }) },

                    {
                      key: "acciones",
                      titulo: "Acciones",
                      ancho: 110,
                      render: (_, fila) => (
                        <View style={{ flexDirection: "row", gap: 10, justifyContent: "center", marginVertical: "auto" }}>
                          <Boton
                            onPress={() => { verAlumno(fila.boleta); }}
                            icon={<Ionicons name="eye" size={18} color={Colores.onPrimario} style={{ padding: 5 }} />}
                            color={Colores.textoInfo}
                          />
                        </View>
                      ),
                    },
                  ]}
                  datos={modalAlumnos.map((fila) => ({
                    ...fila,
                    nombre_completo: `${fila.nombre || ""} ${fila.apellido_paterno || ""} ${fila.apellido_materno || ""}`,
                    carrera: fila.carrera === 1 ? "Médico Cirujano y Homeópata" : "Médico Cirujano y Homeópata"
                  }))}
                />
              </ScrollView>
            )}
          </View>
        </Modal>

        <Modal
          visible={modalAlumnoVisible}
          onClose={() => { setModalAlumnoVisible(false); setModalVisible(true) }}
          titulo="Datos del alumno"
          maxWidth={750}
        >
          <View style={{ marginBottom: 20 }} >
            <Entrada label="Nombre" value={alumno?.nombre || ""} editable={false} />
          </View>

          <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
            <View style={{ flex: 1, marginBottom: 20 }}>
              <Entrada label="Apellido paterno" value={alumno?.apellido_paterno || ""} editable={false} />
            </View>
            <View style={{ flex: 1, marginBottom: 20 }}>
              <Entrada label="Apellido materno" value={alumno?.apellido_materno || ""} editable={false} />
            </View>
          </View>

          <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
            <View style={{ flex: 1, marginBottom: 20 }}>
              <Entrada label="CURP" value={alumno?.curp || ""} maxLength={18} editable={false} />
            </View>
            <View style={{ flex: 1, marginBottom: 20 }}>
              <Entrada label="RFC" value={alumno?.rfc || ""} editable={false} />
            </View>
          </View>

          <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
            <View style={{ flex: 1, marginBottom: 20 }}>
              <Entrada label="Boleta" value={alumno?.boleta || ""} keyboardType="numeric" maxLength={10} editable={false} />
            </View>
            <View style={{ flex: 1, marginBottom: 20 }}>
              <Entrada label="Carrera" value={alumno?.carrera || ""} editable={false} />
            </View>
          </View>

          <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
            <View style={{ flex: 1, marginBottom: 20 }}>
              <Entrada label="Generación" value={alumno?.generacion || ""} editable={false} />
            </View>
            <View style={{ flex: 1, marginBottom: 20 }}>
              <Entrada label="Promedio" value={alumno?.promedio || ""} keyboardType="decimal-pad" editable={false} />
            </View>
          </View>

          <View style={{ marginBottom: 20 }} >
            <Entrada
              label="Correo electrónico institucional"
              value={alumno?.correo || ""}
              keyboardType="email-address"
              editable={false}
            />
          </View>

          <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
            <View style={{ flex: 1, marginBottom: 20 }}>
              <Entrada label="Calle y número" value={alumno?.calle_y_numero || ""} editable={false} />
            </View>
            <View style={{ flex: 1, marginBottom: 20 }}>
              <Entrada label="Colonia" value={alumno?.colonia || ""} editable={false} />
            </View>
          </View>

          <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
            <View style={{ flex: 1, marginBottom: 20 }}>
              <Entrada label="Delegación / municipio" value={alumno?.delegacion || ""} editable={false} />
            </View>
            <View style={{ flex: 1, marginBottom: 20 }}>
              <Entrada label="Estado de procedencia" value={alumno?.estado || ""} editable={false} />
            </View>
          </View>

          <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
            <View style={{ flex: 1, marginBottom: 20 }}>
              <Entrada label="Código postal" value={alumno?.cp || ""} keyboardType="numeric" editable={false} />
            </View>
            <View style={{ flex: 1, marginBottom: 20 }}>
              <Selector
                label="Sexo"
                selectedValue={alumno?.sexo === "F" ? "Femenino" : alumno?.sexo === "M" ? "Masculino" : ""}
                items={[
                  { label: "Masculino", value: "M" },
                  { label: "Femenino", value: "F" },
                ]}
                onValueChange={() => { }}
                editable={false}
              />
            </View>
          </View>

          <View style={[esPantallaPequeña ? { flexDirection: "column" } : { flexDirection: "row", gap: 12 }]}>
            <View style={{ flex: 1, marginBottom: 20 }}>
              <Entrada label="Celular" value={alumno?.telcelular || ""} keyboardType="phone-pad" maxLength={10} editable={false} />
            </View>
            <View style={{ flex: 1, marginBottom: 20 }}>
              <Entrada label="Teléfono local" value={alumno?.tellocal || ""} keyboardType="phone-pad" maxLength={10} editable={false} />
            </View>
          </View>
        </Modal>
        <ModalAPI ref={modalAPI} />
        <PiePagina />
      </ScrollView >
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    width: "90%",
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
    marginBottom: 16,
  },
  filtros: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  controlesSuperiores: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  fila: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-end",
    flexWrap: "wrap",
  },
  selectWeb: {
    width: "100%",
    padding: 10,
    borderRadius: 8,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: Colores.borde,
    alignItems: "center",
  },
  headerRow: {
    backgroundColor: "#f7f7f9",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  cell: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  headerText: {
    fontWeight: "700",
    color: Colores.textoPrincipal,
  },
  cellText: {
    color: Colores.textoPrincipal,
  },
  iconBtn: {
    backgroundColor: Colores.textoInfo,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },

  grid2: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  colFull: {
    width: "100%",
  },
  colHalf: {
    width: "48%",
  },
});
