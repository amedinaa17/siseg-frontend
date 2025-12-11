import { Colores, Fuentes } from "@/temas/colores";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface PaginacionProps {
  paginaActual: number;
  totalPaginas: number;
  setPaginaActual: React.Dispatch<React.SetStateAction<number>>;
}

const Paginacion: React.FC<PaginacionProps> = ({ paginaActual, totalPaginas, setPaginaActual }) => {
  // Calcula las páginas a mostrar
  const calcularPaginacion = () => {
    let paginasMostradas: (number | string)[] = [];

    if (totalPaginas <= 3) {
      for (let i = 1; i <= totalPaginas; i++) {
        paginasMostradas.push(i);
      }
    } else {
      // Si estamos en la primera página, mostramos las primeras 3 páginas
      if (paginaActual === 1) {
        paginasMostradas = [1, 2, 3];
      }
      // Si estamos en la última página, mostramos las últimas 3 páginas
      else if (paginaActual === totalPaginas) {
        paginasMostradas = [totalPaginas - 2, totalPaginas - 1, totalPaginas];
      } else {
        // Si estamos en medio, mostramos las páginas más cercanas a la actual
        paginasMostradas = [paginaActual - 1, paginaActual, paginaActual + 1];
      }

      // Añadir "..." si hay más páginas hacia adelante
      if (paginaActual < totalPaginas - 1 && !paginasMostradas.includes(totalPaginas)) {
        paginasMostradas.push("...");
      }
    }

    return paginasMostradas;
  };

  const totalPaginasMostradas = calcularPaginacion();

  return (
    <View style={{ flexDirection: "row", gap: 6 }}>
      <Pressable
        style={styles.pagina}
        onPress={() => setPaginaActual(1)}
        disabled={paginaActual === 1}
      >
        <Text allowFontScaling={false} style={[styles.btnTexto, paginaActual === 1 && { color: Colores.textoClaro }]}>{"«"}</Text>
      </Pressable>

      {totalPaginasMostradas.map((page, index) => {
        if (page === "...") {
          return (
            <Text key={index} style={styles.btnTexto}>...</Text>
          );
        }

        return (
          <Pressable
            key={index}
            style={[
              styles.pagina,
              paginaActual === page && styles.paginaActiva,
            ]}
            onPress={() => {
              if (typeof page === 'number') {
                setPaginaActual(page);
              }
            }}
          >
            <Text
              style={[
                styles.btnTexto,
                paginaActual === page && styles.btnTextoActivo,
              ]}
            >
              {page}
            </Text>
          </Pressable>
        );
      })}

      <Pressable
        style={styles.pagina}
        onPress={() => setPaginaActual(totalPaginas)}
        disabled={paginaActual === totalPaginas}
      >
        <Text allowFontScaling={false} style={[styles.btnTexto, paginaActual === totalPaginas && { color: Colores.textoClaro }]}>{"»"}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  pagina: {
    borderWidth: 1,
    borderColor: Colores.borde,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: Colores.fondo,
  },
  paginaActiva: {
    backgroundColor: Colores.textoSecundario,
    borderColor: Colores.textoSecundario,
  },
  btnTexto: {
    fontSize: Fuentes.cuerpo,
    color: Colores.textoPrincipal,
  },
  btnTextoActivo: {
    color: Colores.onPrimario,
    fontWeight: "bold",
  },
});

export default Paginacion;
