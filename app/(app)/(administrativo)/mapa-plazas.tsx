
import Modal from "@/componentes/layout/Modal";
import ModalAPI, { ModalAPIRef } from "@/componentes/layout/ModalAPI";
import Boton from "@/componentes/ui/Boton";
import Entrada from "@/componentes/ui/Entrada";
import Selector from "@/componentes/ui/Selector";
import { useAuth } from "@/context/AuthProvider";
import { fetchData } from "@/servicios/api";
import { Colores, Fuentes } from "@/temas/colores";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions,
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

type DetallesAlumno = {
  boleta: string;
  correo?: string;
  curp?: string;
  rfc?: string;
  nombre?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  generacion?: string | number;
  promedio?: string | number;
  carrera?: string;
  calle_y_numero?: string | null;
  colonia?: string | null;
  delegacion?: string | null;
  estado?: string | null;
  cp?: string | null;
  sexo?: string | null;
  telcelular?: string | null;
  tellocal?: string | null;
  sede?: string | null;
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

function normalizeCarreraAlumno(a?: AlumnoMin | null): string {
  if (!a) return "";
  if (a.carrera && typeof a.carrera === "object" && "NOMBRE" in a.carrera!) {
    return String((a.carrera as any).NOMBRE ?? "").trim();
  }
  if (typeof a.carrera === "string") return String(a.carrera).trim();
  if (typeof a.carrera === "number") {
    return CARRERA_LABELS[a.carrera] ?? String(a.carrera);
  }
  return "";
}

function nombreCompleto(a?: AlumnoMin | null): string {
  if (!a) return "";
  return [a.nombre, a.apellido_paterno, a.apellido_materno]
    .filter(Boolean)
    .map((x) => String(x).trim())
    .join(" ");
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
      else throw new Error(rPlazas.message || "Error al obtener plazas");

      if (rMapa.error === 0) setMapaData(rMapa.data ?? []);
      else throw new Error(rMapa.message || "Error al obtener datos del mapa");

      if (rAlumnos.error === 0)
        setAlumnos(rAlumnos.data ?? rAlumnos.alumnos ?? []);
      else throw new Error(rAlumnos.message || "Error al obtener alumnos");
    } catch (e: any) {
      setErrorMsg(e?.message || "Error al cargar datos");
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
  const esPequeña = width < 790;

  const modalAPI = useRef<ModalAPIRef>(null);
  const { sesion } = useAuth();
  const { loading, errorMsg, puntos, programas, carreras, alumnosPorPlaza, recargar } =
    useMapaPlazas();

  const [filtroCarrera, setFiltroCarrera] = useState<string>("Todos");
  const [filtroPrograma, setFiltroPrograma] = useState<string>("");
  const [busquedaTexto, setBusquedaTexto] = useState<string>("");
  const [sedeJump, setSedeJump] = useState<string>("");

  const [modalVisible, setModalVisible] = useState(false);
  const [modalSede, setModalSede] = useState<string>("");
  const [modalAlumnos, setModalAlumnos] = useState<AlumnoMin[]>([]);

  const [modalAlumnoVisible, setModalAlumnoVisible] = useState(false);
  const [alumnoDetalles, setAlumnoDetalles] = useState<DetallesAlumno | null>(null);
  const [loadingAlumno, setLoadingAlumno] = useState(false);

  const puntosFiltrados: PuntoConPlaza[] = useMemo(() => {
    return puntos.filter((p) => {
      const okCoords = p.latitude && p.longitude;
      if (!okCoords) return false;

      const progLabel = normalizePrograma(p.plaza);
      const carreraLabel = normalizeCarreraPlaza(p.plaza);

      const progOK = !filtroPrograma || progLabel === filtroPrograma;
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
        modalAPI.current?.show(false, "Esta sede aún no tiene coordenadas geocodificadas.");
      }
    }
  }, [sedeJump, puntos]);

  const programasOpts = [
    { label: "Todos los programas", value: "" },
    ...programas.map((p) => ({ label: p, value: p })),
  ];

  const carrerasOpts = [
    { label: "Todos", value: "Todos" },
    ...carreras.map((c) => ({ label: c, value: c })),
  ];

  const sedesOpts = [
    { label: "Ir a sede…", value: "" },
    ...sedesDisponibles.map((s) => ({ label: s, value: s })),
  ];

  useEffect(() => {
    if (errorMsg) modalAPI.current?.show(false, errorMsg);
  }, [errorMsg]);

  const disableIrASede = sedesDisponibles.length === 0;

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
      setLoadingAlumno(true);
      setAlumnoDetalles(null);

      const resp = await fetchData(
        `users/obtenerDetallesAlumnoPorBoleta?tk=${sesion.token}&boleta=${encodeURIComponent(
          boleta
        )}`
      );
console.log(resp.data)
      if (resp?.error === 0 && resp?.data) {
        setAlumnoDetalles(resp.data as DetallesAlumno);
        setModalAlumnoVisible(true);
      } else {
        modalAPI.current?.show(false, resp?.message || "No se pudo obtener el alumno.");
      }
    } catch (e) {
      modalAPI.current?.show(false, "Error al conectar con el servidor.");
    } finally {
      setLoadingAlumno(false);
    }
  }

  const renderFilaAlumno = (a: AlumnoMin, idx: number) => {
    const nombre = nombreCompleto(a) || "(Sin nombre)";
    const carrera = normalizeCarreraAlumno(a) || "-";
    return (
      <View key={`${a.boleta}-${idx}`} style={styles.row}>
        <View style={[styles.cell, { flex: 2 }]}>
          <Text style={styles.cellText}>{nombre}</Text>
        </View>
        <View style={[styles.cell, { flex: 2 }]}>
          <Text style={styles.cellText}>{carrera}</Text>
        </View>
        <View style={[styles.cell, { width: 80, alignItems: "center" }]}>
          <TouchableOpacity
            onPress={() => verAlumno(a.boleta)}
            style={styles.iconBtn}
          >
            <Ionicons name="eye" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={[styles.contenedor, esPequeña && { maxWidth: "95%" }]}>
        <Text style={styles.titulo}>Mapa de plazas</Text>

        <View style={styles.filtros}>
          <View style={esPequeña ? { width: "100%", marginBottom: 12 } : { width: "34%" }}>
            <Entrada
              label="Buscar (sede/ubicación/programa)"
              value={busquedaTexto}
              onChangeText={setBusquedaTexto}
            />
          </View>

          <View style={esPequeña ? { width: "100%", marginBottom: 12 } : { width: "30%" }}>
            {Platform.OS === "web" ? (
              <View>
                <Text style={{ marginBottom: 6, color: Colores.textoClaro }}>Programa</Text>
                <select
                  value={filtroPrograma}
                  onChange={(e) => setFiltroPrograma(e.target.value)}
                  style={styles.selectWeb}
                >
                  {[{ label: "Todos los programas", value: "" }, ...programas.map((p) => ({ label: p, value: p }))].map(
                    (o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    )
                  )}
                </select>
              </View>
            ) : (
              <Selector
                label="Programa"
                items={[{ label: "Todos los programas", value: "" }, ...programas.map((p) => ({ label: p, value: p }))]}
                selectedValue={filtroPrograma}
                onValueChange={(v) => setFiltroPrograma(String(v))}
              />
            )}
          </View>

          <View style={esPequeña ? { width: "100%", marginBottom: 12 } : { width: "30%" }}>
            {Platform.OS === "web" ? (
              <View>
                <Text style={{ marginBottom: 6, color: Colores.textoClaro }}>Carrera</Text>
                <select
                  value={filtroCarrera}
                  onChange={(e) => setFiltroCarrera(e.target.value)}
                  style={styles.selectWeb}
                >
                  {[{ label: "Todos", value: "Todos" }, ...carreras.map((c) => ({ label: c, value: c }))].map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </View>
            ) : (
              <Selector
                label="Carrera"
                items={[{ label: "Todos", value: "Todos" }, ...carreras.map((c) => ({ label: c, value: c }))]}
                selectedValue={filtroCarrera}
                onValueChange={(v) => setFiltroCarrera(String(v))}
              />
            )}
          </View>
        </View>

        <View style={[styles.fila, { marginTop: 6, marginBottom: 14 }]}>
          <View style={esPequeña ? { width: "100%" } : { width: "60%" }}>
            {Platform.OS === "web" ? (
              <View>
                <Text style={{ marginBottom: 6, color: Colores.textoClaro }}>Ir a sede</Text>
                <select
                  value={sedeJump}
                  onChange={(e) => setSedeJump(e.target.value)}
                  disabled={disableIrASede}
                  style={{
                    ...styles.selectWeb,
                    ...(disableIrASede ? { background: "#f3f4f6" } : {}),
                  }}
                >
                  {[{ label: "Ir a sede…", value: "" }, ...sedesDisponibles.map((s) => ({ label: s, value: s }))].map(
                    (o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    )
                  )}
                </select>
              </View>
            ) : (
              <Selector
                label="Ir a sede"
                items={[{ label: "Ir a sede…", value: "" }, ...sedesDisponibles.map((s) => ({ label: s, value: s }))]}
                selectedValue={sedeJump}
                onValueChange={(v) => setSedeJump(String(v))}
              />
            )}
          </View>

          <View style={{ flex: 1, alignItems: esPequeña ? "stretch" : "flex-end", justifyContent: "flex-end" }}>
            <Boton onPress={recargar} texto={loading ? "Cargando..." : "Recargar"} />
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

        <Text style={{ marginTop: 10, color: Colores.textoClaro, fontSize: 13 }}>
          Mostrando {puntosFiltrados.length} sede(s) con coordenadas válidas.
        </Text>
      </View>

      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        titulo={modalSede || "Detalle de sede"}
        maxWidth={820}
        cancelar
      >
        {Platform.OS === "web" ? (
          <View style={{ paddingTop: 8 }}> 
            <View style={[styles.row, styles.headerRow]}>
              <View style={[styles.cell, { flex: 2 }]}><Text style={styles.headerText}>Alumno</Text></View>
              <View style={[styles.cell, { flex: 2 }]}><Text style={styles.headerText}>Carrera</Text></View>
              <View style={[styles.cell, { width: 80, alignItems: "center" }]}><Text style={styles.headerText}>Acciones</Text></View>
            </View>
            {modalAlumnos.length === 0 ? (
              <View style={[styles.row, { justifyContent: "center", paddingVertical: 16 }]}>
                <Text style={{ color: Colores.textoClaro }}>No hay alumnos asignados a esta sede.</Text>
              </View>
            ) : (
              modalAlumnos.map((a, i) => renderFilaAlumno(a, i))
            )}
          </View>
        ) : (
          <ScrollView style={{ maxHeight: 420 }}>
            <View style={[styles.row, styles.headerRow]}>
              <View style={[styles.cell, { flex: 2 }]}><Text style={styles.headerText}>Alumno</Text></View>
              <View style={[styles.cell, { flex: 2 }]}><Text style={styles.headerText}>Carrera</Text></View>
              <View style={[styles.cell, { width: 80, alignItems: "center" }]}><Text style={styles.headerText}>Acciones</Text></View>
            </View>
            {modalAlumnos.length === 0 ? (
              <View style={[styles.row, { justifyContent: "center", paddingVertical: 16 }]}>
                <Text style={{ color: Colores.textoClaro }}>No hay alumnos asignados a esta sede.</Text>
              </View>
            ) : (
              modalAlumnos.map((a, i) => renderFilaAlumno(a, i))
            )}
          </ScrollView>
        )}
      </Modal>

      <Modal
        visible={modalAlumnoVisible}
        onClose={() => setModalAlumnoVisible(false)}
        titulo="Datos del Alumno"
        maxWidth={900}
        cancelar
      >
        <ScrollView style={{ maxHeight: 520 }}>
          {loadingAlumno && <Text style={{ color: Colores.textoClaro }}>Cargando…</Text>}
          {!loadingAlumno && alumnoDetalles && (
            <View style={{ gap: 12 }}>
              <View style={styles.grid2}>
                <Entrada label="Nombre" value={alumnoDetalles?.nombre ?? ""} editable={false} />
                <Entrada label="Apellido Paterno" value={alumnoDetalles?.apellido_paterno ?? ""} editable={false} />
                <Entrada label="Apellido Materno" value={alumnoDetalles?.apellido_materno ?? ""} editable={false} />
                <Entrada label="CURP" value={alumnoDetalles?.curp ?? ""} editable={false} />
                <Entrada label="RFC" value={alumnoDetalles?.rfc ?? ""} editable={false} />
                <Entrada label="Boleta" value={alumnoDetalles?.boleta ?? ""} editable={false} />
                <Entrada label="Carrera" value={alumnoDetalles?.carrera ?? ""} editable={false} />
                <Entrada label="Generación" value={String(alumnoDetalles?.generacion ?? "")} editable={false} />
                <Entrada label="Promedio" value={String(alumnoDetalles?.promedio ?? "")} editable={false} />
                <Entrada label="Calle y Número" value={alumnoDetalles?.calle_y_numero ?? ""} editable={false} />
                <Entrada label="Colonia" value={alumnoDetalles?.colonia ?? ""} editable={false} />
                <Entrada label="Delegación / Municipio" value={alumnoDetalles?.delegacion ?? ""} editable={false} />
                <Entrada label="Estado" value={alumnoDetalles?.estado ?? ""} editable={false} />
                <Entrada label="Código Postal" value={alumnoDetalles?.cp ?? ""} editable={false} />
                <Entrada label="Sexo" value={alumnoDetalles?.sexo ?? ""} editable={false} />
                <Entrada label="Teléfono Celular" value={alumnoDetalles?.telcelular ?? ""} editable={false} />
                <Entrada label="Teléfono Local" value={alumnoDetalles?.tellocal ?? ""} editable={false} />
                <Entrada label="Sede" value={alumnoDetalles?.sede ?? modalSede} editable={false} />
              </View>
            </View>
          )}
        </ScrollView>
      </Modal>

      <ModalAPI ref={modalAPI} />
    </ScrollView>
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
      android:{ shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 6 },
      web:   { boxShadow: "0px 4px 6px rgba(0,0,0,0.05)" },
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
    border: `1px solid ${Colores.borde}` as any,
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
});
