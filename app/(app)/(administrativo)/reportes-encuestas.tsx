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

type Question = {
  index: number;
  text: string;
  scale: "FREQ" | "AGREE";
};

const QUESTIONS: Question[] = [
  { index: 1, text: "¿Cómo consideras que es el ambiente de trabajo en la institución?", scale: "AGREE" },
  { index: 2, text: "¿Cuentas con los recursos y herramientas necesarios para realizar tus actividades?", scale: "FREQ" },
  { index: 3, text: "¿Tu lugar de trabajo es seguro y cómodo?", scale: "AGREE" },
  { index: 4, text: "¿Las actividades que realizas están relacionadas con tu formación académica?", scale: "FREQ" },
  { index: 5, text: "¿Te asignan tareas claras y organizadas?", scale: "FREQ" },
  { index: 6, text: "¿Se respeta tu horario establecido en la carta compromiso?", scale: "FREQ" },
  { index: 7, text: "¿Recibes orientación o supervisión por parte del responsable del hospital?", scale: "FREQ" },
  { index: 8, text: "¿El responsable del hospital se encuentra disponible para resolver dudas o problemas?", scale: "FREQ" },
  { index: 9, text: "¿Te informan oportunamente sobre cambios en tus actividades?", scale: "FREQ" },
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

function fullName(a: Alumno) {
  return `${a.nombre} ${a.apellido_paterno} ${a.apellido_materno}`.trim();
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
    if (Array.isArray(arr)) return arr.map(Number);
  } catch {
    const s = resp.replace(/[\[\]\s]/g, "");
    if (s.includes(",")) return s.split(",").map((x) => Number(x.trim()));
  }
  return [];
}

function colorRespuesta(valor: number) {
  if (valor === 5) return { color: "#15793bff" };
  if (valor === 4) return { color: Colores.textoExito };
  if (valor === 3) return { color: Colores.textoAdvertencia };
  if (valor === 2) return { color: "#b35802ff" };
  return { color: Colores.textoError };
}

export default function EncuestasAdmin() {
  const { sesion, verificarToken } = useAuth();
  const modalAPI = useRef<ModalAPIRef>(null);

  const { width } = useWindowDimensions();
  const esPantallaPequeña = width < 790;

  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [encuestas, setEncuestas] = useState<Encuesta[]>([]);

  const [busqueda, setBusqueda] = useState("");
  const [filtroCarrera, setFiltroCarrera] = useState("Todos");
  const [paginaActual, setPaginaActual] = useState(1);
  const [filasPorPagina, setFilasPorPagina] = useState(5);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalFecha, setModalFecha] = useState("");
  const [modalAlumno, setModalAlumno] = useState("");
  const [modalBoleta, setModalBoleta] = useState("");

  const [modalValores, setModalValores] = useState<number[]>([]);

  const cargar = async () => {
    try {
      await verificarToken();
      const tk = encodeURIComponent(sesion?.token ?? "");

      const [rAlu, rEnc] = await Promise.all([
        fetchData(`users/obtenerTodosAlumnos?tk=${tk}`),
        fetchData(`encuesta/obtenerEncuestaAlumnos?tk=${tk}`),
      ]);

      if (rAlu.error === 0) {
        const lista = (rAlu.data ?? []).map((a: any) => ({
          boleta: a.boleta,
          nombre: a.nombre,
          apellido_paterno: a.apellido_paterno,
          apellido_materno: a.apellido_materno,
          carrera: a.carrera,
        }));
        setAlumnos(lista);
      }

      if (rEnc.error === 0) {
        const listaEnc = (rEnc.encuestas ?? []).map((e: any) => ({
          ID: e.ID ?? e.id,
          ALUMNO: e.ALUMNO ?? e.alumnoBoleta ?? e.alumno?.boleta ?? null,
          alumnoBoleta: e.alumnoBoleta ?? e.ALUMNO ?? null,
          FECHA_REGISTRO: e.FECHA_REGISTRO ?? e.fechaRegistro ?? null,
          fechaRegistro: e.fechaRegistro ?? e.FECHA_REGISTRO ?? null,
          RESPUESTA: e.RESPUESTA ?? e.respuesta ?? null,
          respuesta: e.respuesta ?? e.RESPUESTA ?? null,
        }));
        setEncuestas(listaEnc);
      }
    } catch (e) {
      modalAPI.current?.show(false, "Hubo un problema al obtener los datos del servidor. Inténtalo de nuevo más tarde.");
    } finally {
      setPaginaActual(1);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const alumnosByBoleta = useMemo(() => {
    const map = new Map();
    alumnos.forEach((a) => map.set(a.boleta, a));
    return map;
  }, [alumnos]);

  const filas = useMemo(() => {
    const term = busqueda.toLowerCase().trim();

    // Solo encuestas completadas
    const contestadas = encuestas
      .map((e) => {
        const boleta = (e.alumnoBoleta ?? e.ALUMNO ?? "") as string;
        const al = alumnosByBoleta.get(boleta);
        if (!al) return null;

        const valores = parseRespuesta(e.respuesta ?? e.RESPUESTA ?? "");
        const fechaISO = e.fechaRegistro ?? e.FECHA_REGISTRO ?? null;

        return {
          key: `C-${e.ID}`,
          boleta,
          nombre: fullName(al),
          carrera: carreraTexto(al.carrera),
          fechaUltima: fechaISO ? fechaCorta(fechaISO) : "",
          estatus: "Completada",
          _valores: valores,
          _fechaISO: fechaISO ?? "",
        };
      })
      .filter(Boolean) as any[];

    // Filtros
    let todas = contestadas.filter((r) => {
      const match =
        r.boleta.toLowerCase().includes(term) ||
        r.nombre.toLowerCase().includes(term);

      if (!match) return false;
      if (filtroCarrera !== "Todos" && r.carrera !== filtroCarrera) return false;

      return true;
    });

    return todas.sort(
      (a, b) => (b._fechaISO ? +new Date(b._fechaISO) : 0) - (a._fechaISO ? +new Date(a._fechaISO) : 0)
    );
  }, [alumnos, encuestas, alumnosByBoleta, busqueda, filtroCarrera]);


  const totalPaginas = Math.max(1, Math.ceil(filas.length / filasPorPagina));
  const filasPaginadas = filas.slice(
    (paginaActual - 1) * filasPorPagina,
    paginaActual * filasPorPagina
  );

  const abrirDetalle = (fila: any) => {
    if (!fila) return;
    setModalFecha(fila.fechaUltima);
    setModalAlumno(fila.nombre);
    setModalBoleta(fila.boleta);
    setModalValores(fila._valores ?? []);
    setModalOpen(true);
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={[styles.contenedorFormulario, esPantallaPequeña && { maxWidth: "95%" }]}>
        <Text style={styles.titulo}>Encuestas de satisfacción</Text>

        <View style={styles.controlesSuperiores}>
          <View style={[{ flexDirection: "row", alignItems: "center", gap: 8 }, esPantallaPequeña && { width: "100%", marginBottom: 15 }]}>
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
            <Text style={{ color: Colores.textoClaro, fontSize: Fuentes.caption }}>por página</Text>
          </View>

          <View style={[esPantallaPequeña ? { width: "100%" } : { flexDirection: "row", gap: 8, justifyContent: "space-between", width: "50%" }]}>
            <View style={[esPantallaPequeña ? { width: "100%", marginBottom: 15 } : { width: "70%" }]}>
              <Entrada
                label="Buscar"
                value={busqueda}
                onChangeText={setBusqueda}
              />
            </View>

            <View style={[esPantallaPequeña ? { width: "100%" } : { width: "30%" }]}>
              <Selector
                label="Carrera"
                selectedValue={filtroCarrera}
                onValueChange={setFiltroCarrera}
                items={[
                  { label: "Todos", value: "Todos" },
                  ...Array.from(new Set(alumnos.map((a) => carreraTexto(a.carrera)))).map((c) => ({
                    label: c,
                    value: c,
                  })),
                ]}
              />
            </View>
          </View>
        </View>

        <ScrollView horizontal={esPantallaPequeña}>
          <Tabla
            columnas={[
              { key: "boleta", titulo: "Boleta", ancho: 150 },
              { key: "nombre", titulo: "Nombre", ...(esPantallaPequeña && { ancho: 250 }) },
              { key: "carrera", titulo: "Carrera", ...(esPantallaPequeña && { ancho: 250 }) },
              { key: "fechaUltima", titulo: "Período", ancho: 200 },
              {
                key: "estatus",
                titulo: "Estatus",
                ancho: 140,
                render: (valor) => (
                  <Text
                    style={[
                      styles.texto,
                      valor === "Completada" && { color: Colores.textoExito },
                      valor === "Pendiente" && { color: Colores.textoAdvertencia },
                    ]}
                  >
                    {valor}
                  </Text>
                ),
              },
            ]}
            datos={filasPaginadas.map((f) => ({
              ...f,
              onPress: () => abrirDetalle(f),
            }))}
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
          >
            {`Mostrando ${filasPaginadas.length} de ${filas.length} resultados`}
          </Text>
        </View>
      </View>

      <Modal
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        titulo="Encuesta de satisfacción mensual"
        maxWidth={900}
      >
        <Text style={{ fontSize: Fuentes.subtitulo, marginBottom: 15, textAlign: "right" }}><Text style={{ fontWeight: "600" }}>Período: </Text> {modalFecha}</Text>
        <Text style={{ fontSize: 15, color: Colores.textoSecundario, fontWeight: "600", marginBottom: 10 }}>{modalAlumno}</Text>
        <Text style={{ fontSize: Fuentes.caption, color: Colores.textoClaro, fontWeight: "600", marginBottom: 20 }}>{modalBoleta}</Text>
        <ScrollView horizontal={esPantallaPequeña}>
          <Tabla
            columnas={[
              { key: "pregunta", titulo: "Pregunta", ...(esPantallaPequeña && { ancho: 600 }) },
              {
                key: "respuesta",
                titulo: "Respuesta",
                ancho: 200,
                render: (_, fila) => {
                  const index = fila.pregunta.split(".")[0];
                  const q = QUESTIONS.find((x) => String(x.index) === index);
                  const valor = modalValores[q!.index - 1] ?? 0;

                  return (
                    <Text style={[styles.texto, colorRespuesta(valor)]}>
                      {valueToLabel(q!, valor)}
                    </Text>
                  );
                },
              },
            ]}
            datos={QUESTIONS.map((q, i) => ({
              pregunta: `${q.index}. ${q.text}`,
              respuesta: valueToLabel(q, modalValores[i] ?? 0),
            }))}
          />
        </ScrollView>
      </Modal>


      <ModalAPI ref={modalAPI} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedorFormulario: {
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
    marginBottom: 20,
  },
  texto: {
    fontSize: Fuentes.cuerpoPrincipal,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontWeight: "500",
  },
  controlesSuperiores: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    flexWrap: "wrap",
  },
});
