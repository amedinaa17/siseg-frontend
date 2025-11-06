import Modal from "@/componentes/layout/Modal";
import ModalAPI, { ModalAPIRef } from "@/componentes/layout/ModalAPI";
import Entrada from "@/componentes/ui/Entrada";
import Paginacion from "@/componentes/ui/Paginacion";
import Selector from "@/componentes/ui/Selector";
import Tabla from "@/componentes/ui/Tabla";
import { useAuth } from "@/context/AuthProvider";
import { fetchData } from "@/servicios/api";
import { Colores, Fuentes } from "@/temas/colores";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";


type Alumno = {
  boleta: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  carrera: { NOMBRE: string } | string | number;
};

type Encuesta = {
  ID: number;
  ALUMNO?: string | null;
  alumnoBoleta?: string | null;
  FECHA_REGISTRO?: string | null;
  fechaRegistro?: string | null;
  RESPUESTA?: string | null;
  respuesta?: string | null;
};

type ScaleValue = 1 | 2 | 3 | 4 | 5;
type Question = {
  index: number;
  text: string;
  scale: "FREQ" | "AGREE";
};

const QUESTIONS: Question[] = [
  { index: 1,  text: "¿Cómo consideras que es el ambiente de trabajo en la institución?", scale: "AGREE" },
  { index: 2,  text: "¿Cuentas con los recursos y herramientas necesarios para realizar tus actividades?", scale: "FREQ" },
  { index: 3,  text: "¿Tu lugar de trabajo es seguro y cómodo?", scale: "AGREE" },
  { index: 4,  text: "¿Las actividades que realizas están relacionadas con tu formación académica?", scale: "FREQ" },
  { index: 5,  text: "¿Te asignan tareas claras y organizadas?", scale: "FREQ" },
  { index: 6,  text: "¿Se respeta tu horario establecido en la carta compromiso?", scale: "FREQ" },
  { index: 7,  text: "¿Recibes orientación o supervisión por parte del responsable del hospital?", scale: "FREQ" },
  { index: 8,  text: "¿El responsable del hospital se encuentra disponible para resolver dudas o problemas?", scale: "FREQ" },
  { index: 9,  text: "¿Te informan oportunamente sobre cambios en tus actividades?", scale: "FREQ" },
  { index: 10, text: "¿Qué tan satisfecho te sientes con tu experiencia en esta etapa del servicio social?", scale: "FREQ" },
  { index: 11, text: "¿Recomendarías esta plaza a otros compañeros?", scale: "AGREE" },
  { index: 12, text: "¿Te has sentido apoyado(a) por la institución durante este mes?", scale: "FREQ" },
];

const LABELS_FREQ = ["Nunca", "Rara vez", "Algunas veces", "A menudo", "Siempre"];
const LABELS_AGREE = [
  "Totalmente en desacuerdo",
  "En desacuerdo",
  "Neutral",
  "De acuerdo",
  "Totalmente de acuerdo",
];

function prettyLabel(index: number, valor: number, base: string) {
  if (index === 1) {
    return ["Muy mala", "Mala", "Regular", "Buena", "Excelente"][valor - 1] ?? base;
  }
  if (index === 10) {
    return ["Nada satisfecho", "Poco satisfecho", "Neutral", "Satisfecho", "Muy satisfecho"][valor - 1] ?? base;
  }
  return base;
}

function valueToLabel(q: Question, valor: number): string {
  const arr = q.scale === "FREQ" ? LABELS_FREQ : LABELS_AGREE;
  const base = arr[(valor ?? 0) - 1] ?? "-";
  return prettyLabel(q.index, valor, base);
}

function labelColor(valor: number): any {
  if (valor >= 4) return { color: Colores.textoExito, fontWeight: "700" };
  if (valor === 3) return { color: Colores.textoAdvertencia, fontWeight: "700" };
  return { color: Colores.textoError, fontWeight: "700" };
}

function fullName(a: Alumno) {
  return `${a.nombre ?? ""} ${a.apellido_paterno ?? ""} ${a.apellido_materno ?? ""}`.trim();
}
function carreraTexto(c: Alumno["carrera"]) {
  if (!c) return "";
  if (typeof c === "string") return c;
  if (typeof c === "number") return String(c);
  return c.NOMBRE ?? "";
}
function fechaCorta(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
}
function parseRespuesta(resp?: string | null): number[] {
  if (!resp) return [];
  try {
    const arr = JSON.parse(resp);
    if (Array.isArray(arr)) return arr.map((n) => Number(n));
  } catch {
    const s = resp.replace(/[\[\]\s]/g, "");
    if (s.includes(",")) return s.split(",").map((x) => Number(x.trim()));
  }
  return [];
}

export default function EncuestasAdmin() {
  const { sesion, verificarToken } = useAuth();
  const modalAPI = useRef<ModalAPIRef>(null);
  const { width } = useWindowDimensions();
  const esChica = width < 900;

  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [encuestas, setEncuestas] = useState<Encuesta[]>([]);
  const [cargando, setCargando] = useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [filtroCarrera, setFiltroCarrera] = useState<string>("Todos");
  const [filtroEstatus, setFiltroEstatus] = useState<string>("Todos"); 
  const [filasPorPagina, setFilasPorPagina] = useState<number>(20);
  const [pagina, setPagina] = useState<number>(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitulo, setModalTitulo] = useState("");
  const [modalFecha, setModalFecha] = useState("");
  const [modalValores, setModalValores] = useState<number[]>([]);

  const cargar = async () => {
    setCargando(true);
    try {
      await verificarToken();
      const tk = encodeURIComponent(sesion?.token ?? "");

      const [rAlu, rEnc] = await Promise.all([
        fetchData(`users/obtenerTodosAlumnos?tk=${tk}`),
        fetchData(`encuesta/obtenerEncuestaAlumnos?tk=${tk}`),
      ]);

      if (rAlu?.error === 0) {
        const lista: Alumno[] = (rAlu.data ?? rAlu.alumnos ?? []).map((a: any) => ({
          boleta: a.boleta,
          nombre: a.nombre,
          apellido_paterno: a.apellido_paterno,
          apellido_materno: a.apellido_materno,
          carrera: a.carrera,
        }));
        setAlumnos(lista);
      } else {
        throw new Error(rAlu?.message || "No se pudieron cargar alumnos");
      }

      if (rEnc?.error === 0) {
        const listaEnc: Encuesta[] = (rEnc.encuestas ?? rEnc.data ?? []).map((e: any) => ({
          ID: e.ID ?? e.id,
          ALUMNO: e.ALUMNO ?? e.alumnoBoleta ?? e.alumno?.boleta ?? null,
          alumnoBoleta: e.alumnoBoleta ?? e.ALUMNO ?? null,
          FECHA_REGISTRO: e.FECHA_REGISTRO ?? e.fechaRegistro ?? null,
          fechaRegistro: e.fechaRegistro ?? e.FECHA_REGISTRO ?? null,
          RESPUESTA: e.RESPUESTA ?? e.respuesta ?? null,
          respuesta: e.respuesta ?? e.RESPUESTA ?? null,
        }));
        setEncuestas(listaEnc);
      } else {
        throw new Error(rEnc?.message || "No se pudieron cargar encuestas");
      }
    } catch (e: any) {
      modalAPI.current?.show(false, e?.message ?? "Error al cargar información.");
    } finally {
      setCargando(false);
      setPagina(1);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const alumnosByBoleta = useMemo(() => {
    const m = new Map<string, Alumno>();
    alumnos.forEach((a) => m.set(a.boleta, a));
    return m;
  }, [alumnos]);

  const opcionesCarrera = useMemo(() => {
    const set = new Set<string>();
    alumnos.forEach((a) => {
      const c = carreraTexto(a.carrera);
      if (c) set.add(c);
    });
    return ["Todos", ...Array.from(set).sort()];
  }, [alumnos]);

  const filas = useMemo(() => {
    const term = busqueda.trim().toLowerCase();
    const filasConEncuestas = encuestas
      .map((e) => {
        const boleta = (e.alumnoBoleta ?? e.ALUMNO ?? "") as string;
        const a = alumnosByBoleta.get(boleta);
        if (!a) return null;

        const nombre = fullName(a);
        const carrera = carreraTexto(a.carrera);
        const fecha = e.fechaRegistro ?? e.FECHA_REGISTRO ?? null;

        return {
          key: `E-${e.ID}`,
          boleta,
          nombre,
          carrera,
          fechaUltima: fecha ? fechaCorta(fecha) : "",
          estatus: "Completada",
          _valores: parseRespuesta(e.respuesta ?? e.RESPUESTA ?? null),
          _fechaIso: fecha ?? "",
        };
      })
      .filter(Boolean) as any[];

    const conEncuesta = new Set(
      filasConEncuestas.map((f: any) => f.boleta)
    );
    const filasSin = alumnos
      .filter((a) => !conEncuesta.has(a.boleta))
      .map((a) => ({
        key: `S-${a.boleta}`,
        boleta: a.boleta,
        nombre: fullName(a),
        carrera: carreraTexto(a.carrera),
        fechaUltima: "",
        estatus: "Sin encuesta",
        _valores: [] as number[],
        _fechaIso: "",
      }));

    const todas = [...filasConEncuestas, ...filasSin];

    // Filtros
    return todas
      .filter((r) => {
        const m =
          r.boleta.toLowerCase().includes(term) ||
          r.nombre.toLowerCase().includes(term);
        if (!m) return false;

        if (filtroCarrera !== "Todos" && r.carrera !== filtroCarrera) return false;
        if (filtroEstatus === "Con encuesta" && r.estatus !== "Completada") return false;
        if (filtroEstatus === "Sin encuesta" && r.estatus !== "Sin encuesta") return false;

        return true;
      })

      .sort((a, b) => (b._fechaIso ? +new Date(b._fechaIso) : 0) - (a._fechaIso ? +new Date(a._fechaIso) : 0));
  }, [encuestas, alumnos, alumnosByBoleta, busqueda, filtroCarrera, filtroEstatus]);

  const totalPaginas = Math.max(1, Math.ceil(filas.length / filasPorPagina));
  const pageRows = useMemo(
    () => filas.slice((pagina - 1) * filasPorPagina, pagina * filasPorPagina),
    [filas, pagina, filasPorPagina]
  );

  function abrirDetalle(fila: any) {
    if (!fila) return;
    setModalTitulo(`${fila.nombre} (${fila.boleta})`);
    setModalFecha(fila.fechaUltima || "");
    setModalValores(fila._valores ?? []);
    setModalOpen(true);
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={[styles.container, esChica && { maxWidth: "96%" }]}>
        <Text style={styles.title}>Encuestas de satisfacción</Text>

        <View style={[styles.controls, esChica && { flexDirection: "column", gap: 10 }]}>
          <View style={esChica ? { width: "100%" } : { flex: 1 }}>
            <Entrada
              label="Buscar por nombre o boleta"
              value={busqueda}
              onChangeText={setBusqueda}
            />
          </View>

          <View style={esChica ? { width: "100%" } : { width: 260 }}>
            {Platform.OS === "web" ? (
              <View>
                <Text style={styles.label}>Carrera</Text>
                <select
                  value={filtroCarrera}
                  onChange={(e) => setFiltroCarrera(e.target.value)}
                  style={styles.selectWeb}
                >
                  {opcionesCarrera.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </View>
            ) : (
              <Selector
                label="Carrera"
                selectedValue={filtroCarrera}
                onValueChange={(v) => setFiltroCarrera(String(v))}
                items={opcionesCarrera.map((c) => ({ label: c, value: c }))}
              />
            )}
          </View>

          <View style={esChica ? { width: "100%" } : { width: 200 }}>
            {Platform.OS === "web" ? (
              <View>
                <Text style={styles.label}>Estatus</Text>
                <select
                  value={filtroEstatus}
                  onChange={(e) => setFiltroEstatus(e.target.value)}
                  style={styles.selectWeb}
                >
                  {["Todos", "Con encuesta", "Sin encuesta"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </View>
            ) : (
              <Selector
                label="Estatus"
                selectedValue={filtroEstatus}
                onValueChange={(v) => setFiltroEstatus(String(v))}
                items={[
                  { label: "Todos", value: "Todos" },
                  { label: "Con encuesta", value: "Con encuesta" },
                  { label: "Sin encuesta", value: "Sin encuesta" },
                ]}
              />
            )}
          </View>

          
        </View>

        <ScrollView horizontal={esChica}>
          <Tabla
            columnas={[
              { key: "boleta", titulo: "Boleta", ancho: 140 },
              { key: "nombre", titulo: "Nombre", ...(esChica ? { ancho: 280 } : {}) },
              { key: "carrera", titulo: "Carrera", ...(esChica ? { ancho: 280 } : {}) },
              { key: "fechaUltima", titulo: "Fecha última encuesta", ancho: 210 },
              {
                key: "estatus",
                titulo: "Estatus",
                ancho: 150,
                render: (valor) => (
                  <Text
                    style={[
                      styles.estatus,
                      valor === "Completada" ? { color: Colores.textoExito } : { color: Colores.textoAdvertencia },
                    ]}
                  >
                    {valor}
                  </Text>
                ),
              },
            ]}
            datos={pageRows.map((r) => ({
              ...r,
              onPress: () => abrirDetalle(r), 
            }))}
          />
        </ScrollView>

        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
          <Paginacion paginaActual={pagina} totalPaginas={totalPaginas} setPaginaActual={setPagina} />
          <Text style={{ color: Colores.textoClaro }}>{filas.length} resultado(s)</Text>
        </View>
      </View>

      <Modal
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        titulo={`Respuestas — ${modalTitulo}${modalFecha ? ` — ${modalFecha}` : ""}`}
        maxWidth={900}
        cancelar
      >
        {modalValores.length === 0 ? (
          <Text style={{ color: Colores.textoClaro }}>Sin encuesta.</Text>
        ) : (
          <View style={{ borderWidth: 1, borderColor: Colores.borde, borderRadius: 8 }}>

            <View style={{ flexDirection: "row", backgroundColor: "#f7f7f9", borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
              <Text style={[styles.th, { flex: 1.5 }]}>Pregunta</Text>
              <Text style={[styles.th, { flex: 1 }]}>Respuesta</Text>
            </View>

            {QUESTIONS.map((q, i) => {
              const valor = modalValores[i];
              const etiqueta = valueToLabel(q, valor);
              return (
                <View
                  key={`row-${q.index}`}
                  style={{ flexDirection: "row", borderTopWidth: 1, borderColor: Colores.borde }}
                >
                  <Text style={[styles.td, { flex: 1.5 }]}>
                    <Text style={{ fontWeight: "700" }}>{q.index}. </Text>
                    {q.text}
                  </Text>
                  <Text style={[styles.td, { flex: 1 }, labelColor(valor)]}>
                    {etiqueta}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </Modal>

      <ModalAPI ref={modalAPI} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
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
  title: {
    fontSize: Fuentes.titulo,
    fontWeight: "700",
    color: Colores.textoPrincipal,
    textAlign: "center",
    marginBottom: 12,
  },
  controls: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-end",
    marginBottom: 12,
    flexWrap: "wrap",
  },
  label: { marginBottom: 6, color: Colores.textoClaro },
  selectWeb: {
    width: "100%",
    padding: 10,
    borderRadius: 8,
    border: `1px solid ${Colores.borde}` as any,
  },
  estatus: { fontSize: Fuentes.cuerpo, fontWeight: "600" },
  th: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontWeight: "700",
    color: Colores.textoPrincipal,
  },
  td: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colores.textoPrincipal,
  },
});
