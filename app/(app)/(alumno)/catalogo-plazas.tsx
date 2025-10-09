import Tabla from "@/componentes/ui/Tabla";
import { useAuth } from "@/context/AuthProvider";
import { fetchData } from "@/servicios/api";
import { Colores, Fuentes } from "@/temas/colores";
import React, { useEffect, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

const datosReportes = [
  {
    Sede: "DFIMS000266 UMF 3 LA JOYA GUSTAVO A. MADERO",
    Beca: "A",
    Tarjeta: "1",
  },
  {
    Sede: "DFIMS000085 UMF 11 PERALVILLO AZCAPOTZALCO",
    Beca: "A",
    Tarjeta: "2",
  },
  {
    Sede: "DFIMS000650 UMF 16 COL. GUERRERO CUAUHTÉMOC",
    Beca: "A",
    Tarjeta: "3",
  },
  {
    Sede: "DFIMS000254 UMF 23 U. MORELOS GUSTAVO A. MADERO",
    Beca: "A",
    Tarjeta: "4",
  },
  {
    Sede: "DFIMS000341 UMF 35 C.7 ZARAGOZA IZTACALCO",
    Beca: "A",
    Tarjeta: "5",
  },
  {
    Sede: "DFIMS000271 UMF 41 FORTUNA GUSTAVO A. MADERO",
    Beca: "A",
    Tarjeta: "6",
  },
  {
    Sede: "DFIMS000295 UMF 94  S JUAN DE ARAGÓN",
    Beca: "A",
    Tarjeta: "7",
  },
  {
    Sede: "DFIMS000230 HGZMF 29 S. JUAN ARAGÓN GUSTAVO A. MADERO",
    Beca: "A",
    Tarjeta: "8",
  },
  {
    Sede: "DFIMS000230 HGZMF 29 S. JUAN ARAGÓN GUSTAVO A. MADERO (DONACIÓN DE ORGANOS)",
    Beca: "A",
    Tarjeta: "9",
  },
  {
    Sede: "DFIMS000213 HT MAGDALENA DE LAS SALINAS GUSTAVO A. MADERO (DONACIÓN DE ORGANOS)",
    Beca: "A",
    Tarjeta: "10",
  },
];


export default function CatalogoPlazas() {
  const { width } = useWindowDimensions();
  const esPantallaPequeña = width < 600;
  const { sesion } = useAuth();
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

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View
        style={[
          styles.contenedorFormulario,
          esPantallaPequeña && { maxWidth: "95%" },
        ]}
      >
        <Text style={styles.titulo}>
          Plazas
        </Text>

        <Text style={styles.subtitulo}>
          Promoción Agosto 2025 - Julio 2026
        </Text>

        <Text style={styles.preTitulo}>
          {datosAlumno ? ("Médico Cirujano y " + datosAlumno.carrera) : ""}
        </Text>

        <Text style={styles.subtituloRojo}>
          “SUJETAS A CAMBIO SIN PREVIO AVISO DE LAS AUTORIDADES”
        </Text>

        <Text style={styles.textoPrograma}>
          IMSS NORTE, CDMX
        </Text>

        <Tabla
          columnas={[
            { key: "Sede", titulo: "Sede" , multilinea: true},
            { key: "Beca", titulo: "Beca", },
            { key: "Tarjeta", titulo: "Tarjeta" },
          ]}
          datos={datosReportes.map((fila) => {
            return {
              ...fila,
            };
          })}
        />

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
      web: {
        boxShadow: "0px 4px 6px rgba(0,0,0,0.05)"
      },
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
  preTitulo: {
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
  subtituloRojo: {
    fontSize: Fuentes.subtitulo,
    color: Colores.textoError,
    textAlign: "center",
    marginBottom: 20,
  },
  textoPrograma: {
    fontSize: Fuentes.cuerpo,
    fontWeight: "bold",
    color: Colores.textoPrincipal,
    marginBottom: 10,
  }
});
