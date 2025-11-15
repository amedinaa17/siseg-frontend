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

const norm = (s: string) =>
  s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();

const CARRERA_ID_BY_NOMBRE: Record<string, number> = {
  [norm("Médico Cirujano y Homeópata")]: 1,
  [norm("Médico Cirujano y Partero")]: 2,
};

export default function CatalogoPlazas() {
  const { width } = useWindowDimensions();
  const esPantallaPequeña = width < 790;
  const { sesion } = useAuth();

  const [alumno, setAlumno] = useState<any>(null);
  const [plazas, setPlazas] = useState<Plaza[]>([]);
  const modalAPI = useRef<ModalAPIRef>(null);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [filasPorPagina, setFilasPorPagina] = useState(5);

  useEffect(() => {
    const cargarAlumno = async () => {
      if (!sesion?.token) return;
      try {
        const res = await fetchData(`users/obtenerTodosDatosAlumno?tk=${encodeURIComponent(sesion.token)}`);
        if (res?.error === 0)
          setAlumno(res.data);
        else
          modalAPI.current?.show(false, "Hubo un problema al obtener los datos del servidor. Inténtalo de nuevo más tarde.");
      } catch (e) {
        modalAPI.current?.show(false, "Error al conectar con el servidor. Inténtalo de nuevo más tarde.");
      }
    };
    cargarAlumno();
  }, [sesion]);

  useEffect(() => {
    const cargarPlazas = async () => {
      if (!sesion?.token) return;
      try {
        const res = await fetchData(
          `plaza/obtenerPlazas?tk=${encodeURIComponent(sesion.token)}`
        );
        if (res?.error === 0 && Array.isArray(res.plazas)) setPlazas(res.plazas);
        else modalAPI.current?.show(false, res?.message || "Error al obtener las plazas disponibles.");
      } catch (e) {
        console.error("[Plazas] Error de red", e);
        modalAPI.current?.show(false, "Error al conectar con el servidor al obtener las plazas.");
      }
    };
    cargarPlazas();
  }, [sesion]);

  const alumnoCarreraId = useMemo(() => {
    if (!alumno?.carrera) return undefined;
    return CARRERA_ID_BY_NOMBRE[norm(String(alumno.carrera))];
  }, [alumno]);

  const plazasFiltradas = useMemo(() => {
    const base = alumnoCarreraId
      ? plazas.filter((p) => p.carrera === alumnoCarreraId)
      : plazas;
    if (!busqueda) return base;
    const q = norm(busqueda);
    return base.filter((p) => norm(String(p.sede ?? "")).includes(q));
  }, [plazas, alumnoCarreraId, busqueda]);

  const filasTabla = useMemo(
    () =>
      plazasFiltradas.map((p) => ({
        Programa: String(p.PROGRAMA ?? p.programa ?? ""),
        Sede: String(p.sede ?? ""),
        Beca: String(p.tipoBeca ?? ""),
        Tarjeta: String(p.tarjetaDisponible ?? ""),
      })),
    [plazasFiltradas]
  );

  const totalPaginas = Math.ceil(filasTabla.length / filasPorPagina) || 1;
  const filasMostradas = useMemo(
    () =>
      filasTabla.slice(
        (paginaActual - 1) * filasPorPagina,
        paginaActual * filasPorPagina
      ),
    [filasTabla, paginaActual, filasPorPagina]
  );

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, alumnoCarreraId, filasPorPagina]);

  const promoTexto = plazasFiltradas[0]?.promocion;

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View
        style={[
          styles.contenedorFormulario,
          esPantallaPequeña && { maxWidth: "95%" },
        ]}
      >
        <Text style={styles.titulo}>Plazas</Text>
        <Text style={styles.subtitulo}>Promoción {promoTexto}</Text>
        <Text style={styles.carrera}>{alumno?.carrera ?? ""}</Text>
        <Text style={styles.aviso}>
          “SUJETAS A CAMBIO SIN PREVIO AVISO DE LAS AUTORIDADES”
        </Text>

        <View style={styles.controlesSuperiores}>
          <View
            style={[
              { flexDirection: "row", alignItems: "center", gap: 8 },
              esPantallaPequeña && { marginBottom: 15, width: "100%" },
            ]}
          >
            <View
              style={[
                esPantallaPequeña && [
                  filasPorPagina === 10
                    ? { minWidth: 42.8 }
                    : filasPorPagina === 15
                      ? { minWidth: 48.8 }
                      : { minWidth: 52.8 },
                ],
              ]}
            >
              <Selector
                label=""
                selectedValue={String(filasPorPagina)}
                onValueChange={(valor) => setFilasPorPagina(Number(valor))}
                items={[
                  { label: "10", value: "10" },
                  { label: "15", value: "15" },
                  { label: "20", value: "20" },
                ]}
              />
            </View>

            <Text style={{ color: Colores.textoClaro, fontSize: Fuentes.caption }}>
              por página
            </Text>
          </View>

          <View style={{ width: esPantallaPequeña ? "100%" : "40%" }}>
            <Entrada
              label="Buscar"
              value={busqueda}
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
                key: "Programa",
                titulo: "Programa",
                multilinea: true,
                ancho: 170
              },
              {
                key: "Sede",
                titulo: "Sede",
                multilinea: true,
                ...(esPantallaPequeña && { ancho: 350 })
              },
              {
                key: "Beca",
                titulo: "Beca",
                ancho: 100
              },
              {
                key: "Tarjeta",
                titulo: "Tarjeta",
                ancho: 100
              },
            ]}
            datos={filasMostradas}
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
          >
            {`Mostrando ${filasMostradas.length} de ${filasTabla.length} resultados`}
          </Text>
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
