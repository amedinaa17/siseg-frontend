import Boton from "@/componentes/ui/Boton";
import Entrada from "@/componentes/ui/Entrada";
import Paginacion from "@/componentes/ui/Paginacion";
import Selector from "@/componentes/ui/Selector";
import Tabla from "@/componentes/ui/Tabla";
import { Colores, Fuentes } from "@/temas/colores";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

const datosAlumnos = [
    {
        boleta: "2022630301", nombre: "Andrea", apellidoPaterno: "Salgado", apellidoMaterno: "Ramírez", carrera: "Médico Cirujano y Partero",
        generacion: "2025", estatus: "En proceso", correo: "asalga@alumno.ipn.mx", promedio: "9.1", curp: "SARA010312MDFLND09",
        rfc: "SARA010312T55", telefonoCelular: "5512345678", telefonoLocal: "5553123456", sexo: "F", calleNumero: "Cedros 134",
        colonia: "San Miguel", delegacionMunicipio: "2022630301", estadoProcedencia: "Iztapalapa", codigoPostal: "09830"
    },
    {
        boleta: "2022630320", nombre: "Mariana", apellidoPaterno: "Torres", apellidoMaterno: "López", carrera: "Médico Cirujano y Partero",
        generacion: "2025", estatus: "En proceso", correo: "mariana.tl@alumno.ipn.mx", promedio: "9.3", curp: "TOLM010215MDFLNS09",
        rfc: "TOLM010215RT5", telefonoCelular: "5511223344", telefonoLocal: "5556789123", sexo: "F", calleNumero: "Insurgentes Sur 900",
        colonia: "Del Valle", delegacionMunicipio: "Benito Juárez", estadoProcedencia: "CDMX", codigoPostal: "03100"
    },
    {
        boleta: "2022630312", nombre: "Alejandro", apellidoPaterno: "Vega", apellidoMaterno: "Domínguez", carrera: "Médico Cirujano y Homeópata",
        generacion: "2024", estatus: "Concluido", correo: "alejandro@alumno.ipn.mx", promedio: "8.5", curp: "ALEA010112MDFLND09",
        rfc: "ALEA010112T55", telefonoCelular: "5544332211", telefonoLocal: "5553445566", sexo: "M", calleNumero: "Av. Hidalgo 45",
        colonia: "Centro", delegacionMunicipio: "Cuauhtémoc", estadoProcedencia: "CDMX", codigoPostal: "06000"
    },
    {
        boleta: "2022630333", nombre: "Jorge", apellidoPaterno: "Hernández", apellidoMaterno: "Castillo", carrera: "Médico Cirujano y Homeópata",
        generacion: "-", estatus: "Aspirante", correo: "jorgehc@alumno.ipn.mx", promedio: "8.1", curp: "HECJ991120MDFRNL08",
        rfc: "HECJ991120KL9", telefonoCelular: "5522334455", telefonoLocal: "5559876543", sexo: "M", calleNumero: "Reforma 100",
        colonia: "Juárez", delegacionMunicipio: "Cuauhtémoc", estadoProcedencia: "CDMX", codigoPostal: "06600"
    },
    {
        boleta: "2022630345", nombre: "Paola", apellidoPaterno: "Méndez", apellidoMaterno: "García", carrera: "Médico Cirujano y Partero",
        generacion: "-", estatus: "Candidato", correo: "paolamg@alumno.ipn.mx", promedio: "9.7", curp: "MEGP000305MDFLNR07",
        rfc: "MEGP000305PR2", telefonoCelular: "5533445566", telefonoLocal: "5552233445", sexo: "F", calleNumero: "Av. Universidad 320",
        colonia: "Copilco", delegacionMunicipio: "Coyoacán", estadoProcedencia: "CDMX", codigoPostal: "04360"
    },
    {
        boleta: "2022630363", nombre: "Joel", apellidoPaterno: "Mora", apellidoMaterno: "Castañeda", carrera: "Médico Cirujano y Partero",
        generacion: "-", estatus: "Candidato", correo: "joelmc@alumno.ipn.mx", promedio: "8.7", curp: "MOCJ000305MDFLNR07",
        rfc: "MOCJ000305PR2", telefonoCelular: "5533445566", telefonoLocal: "5552233445", sexo: "F", calleNumero: "Av. Universidad 350",
        colonia: "Copilco", delegacionMunicipio: "Coyoacán", estadoProcedencia: "CDMX", codigoPostal: "04360"
    },
];

export default function ValidarDocumentos() {
    // Estados modales
    const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<any | null>(null);

    // --- Estados para búsqueda, filtros y paginación ---
    const [busqueda, setBusqueda] = useState("");
    const [filtroCarrera, setFiltroCarrera] = useState("Todos");
    const [filtroEstatus, setFiltroEstatus] = useState("Todos");
    const [paginaActual, setPaginaActual] = useState(1);
    const [filasPorPagina, setFilasPorPagina] = useState(5);

    const { width } = useWindowDimensions();
    const esPantallaPequeña = width < 790;

    // --- Filtrado y paginación de los datos ---
    const obtenerDatosFiltrados = () => {
        let datos = [...datosAlumnos];

        // Búsqueda por nombre completo o boleta del alumno
        if (busqueda) {
            datos = datos.filter(alumno =>
                `${alumno.nombre} ${alumno.apellidoPaterno} ${alumno.apellidoMaterno}`
                    .toLowerCase()
                    .includes(busqueda.toLowerCase()) ||
                alumno.boleta.includes(busqueda.toLowerCase())
            );
        }

        // Filtros por carrera y estatus
        if (filtroCarrera && filtroCarrera != "Todos") datos = datos.filter(a => a.carrera === "Médico Cirujano y " + filtroCarrera);
        if (filtroEstatus && filtroEstatus != "Todos") datos = datos.filter(a => a.estatus === filtroEstatus);

        // Paginación
        const inicio = (paginaActual - 1) * filasPorPagina;
        const fin = inicio + filasPorPagina;

        return datos.slice(inicio, fin);
    };

    const totalRegistros = (() => {
        let datos = [...datosAlumnos];
        if (busqueda) {
            datos = datos.filter(alumno =>
                `${alumno.nombre} ${alumno.apellidoPaterno} ${alumno.apellidoMaterno}`
                    .toLowerCase()
                    .includes(busqueda.toLowerCase())
            );
        }
        if (filtroCarrera && filtroCarrera != "Todos") datos = datos.filter(a => a.carrera === "Médico Cirujano y " + filtroCarrera);
        if (filtroEstatus && filtroEstatus != "Todos") datos = datos.filter(a => a.estatus === filtroEstatus);
        return datos.length;
    })();
    const totalPaginas = Math.ceil(totalRegistros / filasPorPagina);

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={[styles.contenedorFormulario, esPantallaPequeña && { maxWidth: "95%" }]}>
                <Text style={styles.titulo}>Validar Documentos</Text>
                <View style={styles.controlesSuperiores}>
                    <View style={[{ flexDirection: "row", alignItems: "center", gap: 8 }, esPantallaPequeña && { width: "100%", marginBottom: 15 }]}>
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
                        <Text style={{ color: Colores.textoClaro, fontSize: Fuentes.caption }}>por página</Text>
                    </View>

                    <View style={[esPantallaPequeña ? { width: "100%" } : { flexDirection: "row", gap: 8, justifyContent: "space-between", width: "50%" }]}>
                        <View style={[esPantallaPequeña ? { width: "100%", marginBottom: 15 } : { width: "50%" }]}>
                            <Entrada
                                label="Buscar"
                                value={busqueda}
                                onChangeText={setBusqueda}
                            />
                        </View>

                        <View style={{ flexDirection: "row", gap: 8, width: "100%" }}>
                            <View style={[esPantallaPequeña ? { width: "50%" } : { width: "30%" }]}>
                                <Selector
                                    label="Carrera"
                                    selectedValue={filtroCarrera}
                                    onValueChange={setFiltroCarrera}
                                    items={[
                                        { label: "Todos", value: "Todos" },
                                        { label: "Médico Cirujano y Partero", value: "Partero" },
                                        { label: "Médico Cirujano y Homeópata", value: "Homeópata" },
                                    ]}
                                />
                            </View>

                            <View style={[esPantallaPequeña ? { width: "50%" } : { width: "20%" }]}>
                                <Selector
                                    label="Estatus"
                                    selectedValue={filtroEstatus}
                                    onValueChange={setFiltroEstatus}
                                    items={[
                                        { label: "Todos", value: "Todos" },
                                        { label: "En proceso", value: "En proceso" },
                                        { label: "Concluido", value: "Concluido" },
                                        { label: "Aspirante", value: "Aspirante" },
                                        { label: "Candidato", value: "Candidato" },
                                    ]}
                                />
                            </View>
                        </View>
                    </View>
                </View>

                <ScrollView horizontal={esPantallaPequeña}>
                    <Tabla
                        columnas={[
                            { key: "boleta", titulo: "Boleta", ancho: 150 },
                            { key: "nombre_completo", titulo: "Nombre", ...(esPantallaPequeña && { ancho: 250 }) },
                            { key: "carrera", titulo: "Carrera", ...(esPantallaPequeña && { ancho: 250 }) },
                            { key: "generacion", titulo: "Generación", ancho: 150 },
                            {
                                key: "estatus",
                                titulo: "Estatus",
                                ancho: 150,
                                render: (valor) => (
                                    <Text
                                        style={[
                                            styles.texto,
                                            valor === "En proceso" && { color: Colores.textoInfo },
                                            valor === "Concluido" && { color: Colores.textoExito },
                                            valor === "Candidato" && { color: Colores.textoError },
                                            valor === "Aspirante" && { color: Colores.textoAdvertencia },
                                        ]}
                                    >
                                        {valor}
                                    </Text>
                                ),
                            },
                            {
                                key: "acciones",
                                titulo: "Expediente",
                                ancho: 110,
                                render: (_, fila) => (
                                    <View style={{ flexDirection: "row", gap: 10, justifyContent: "center", margin: "auto" }}>
                                        <Boton
                                            title=""
                                            onPress={() => {
                                                router.push({
                                                    pathname: "/validar-documentos/[boleta]",
                                                    params: { boleta: fila.boleta },
                                                });
                                            }}
                                            icon={<Ionicons name="eye-outline" size={18} color={Colores.onPrimario} style={{margin: -5}} />}
                                            color={Colores.textoInfo}
                                        />
                                    </View>
                                ),
                            },
                        ]}
                        datos={obtenerDatosFiltrados().map((fila) => ({
                            ...fila,
                            nombre_completo: `${fila.nombre} ${fila.apellidoPaterno} ${fila.apellidoMaterno}`,
                            //onPress: () => setAlumnoSeleccionado(fila),
                        }))}
                    />
                </ScrollView>

                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <View style={{ flexDirection: "row", marginVertical: 15, gap: 6 }}>
                        <Paginacion
                            paginaActual={paginaActual}
                            totalPaginas={totalPaginas}
                            setPaginaActual={setPaginaActual}
                        />
                    </View>
                </View>
            </View>
        </ScrollView >
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
    row: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 15,
    },
    controlesSuperiores: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
        flexWrap: "wrap",
    }
});
