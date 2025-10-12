import Modal from "@/componentes/layout/Modal";
import Boton from "@/componentes/ui/Boton";
import Entrada from "@/componentes/ui/Entrada";
import Paginacion from "@/componentes/ui/Paginacion";
import Selector from "@/componentes/ui/Selector";
import SelectorArchivo from "@/componentes/ui/SelectorArchivo";
import Tabla from "@/componentes/ui/Tabla";
import { alumnoEsquema, type AlumnoFormulario } from "@/lib/validacion";
import { Colores, Fuentes } from "@/temas/colores";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions, } from "react-native";

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

const defaultValues: AlumnoFormulario = {
    nombre: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    boleta: "",
    carrera: "",
    generacion: "",
    estatus: "",
    correo: "",
    promedio: "",
    curp: "",
    rfc: "",
    telefonoCelular: "",
    telefonoLocal: "",
    sexo: "",
    calleNumero: "",
    colonia: "",
    delegacionMunicipio: "",
    estadoProcedencia: "",
    codigoPostal: "",
};

export default function GestionAlumnos() {
    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AlumnoFormulario>({
        resolver: zodResolver(alumnoEsquema),
        defaultValues: defaultValues,
    });

    // Estados modales
    const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<any | null>(null);
    const [modalAgregar, setModalAgregar] = useState(false);
    const [modalEditar, setModalEditar] = useState(false);
    const [modalEliminar, setModalEliminar] = useState<any | null>(null);
    const [modalEliminarAlumnos, setModalEliminarAlumnos] = useState(false);
    const [modalCargar, setModalCargar] = useState(false);
    const [archivoSeleccionado, setArchivoSeleccionado] = useState<any | null>(null);

    // --- Estados para búsqueda, filtros y paginación ---
    const [busqueda, setBusqueda] = useState("");
    const [filtroCarrera, setFiltroCarrera] = useState("Todos");
    const [filtroEstatus, setFiltroEstatus] = useState("Todos");
    const [paginaActual, setPaginaActual] = useState(1);
    const [filasPorPagina, setFilasPorPagina] = useState(5);

    const { width } = useWindowDimensions();
    const esPantallaPequeña = width < 600;

    const abrirModalAgregar = () => {
        setModalAgregar(true);
    };

    const onSubmit = (data: AlumnoFormulario) => {
        reset(defaultValues);
        setModalAgregar(false);
    };

    const abrirModalEditar = (alumno) => {
        reset(alumno);
        setModalEditar(alumno);
    };

    const eliminarAlumno = () => {
        setModalEliminar(null);
    };

    const eliminarAlumnos = () => {
        setModalEliminarAlumnos(false);
    };

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


    // --- Render de modales ---
    const renderModalDetalle = () => {
        if (!alumnoSeleccionado) return null;
        const { nombre, apellidoPaterno, apellidoMaterno, boleta, carrera, generacion, estatus, correo,
            promedio, curp, rfc, telefonoCelular, telefonoLocal, sexo, calleNumero, colonia, delegacionMunicipio,
            estadoProcedencia, codigoPostal } = alumnoSeleccionado;

        return (
            <Modal visible={!!alumnoSeleccionado} onClose={() => setAlumnoSeleccionado(null)} titulo="Datos del Alumno" maxWidth={750}>
                <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "web" ? undefined : "padding"} keyboardVerticalOffset={80} >
                    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                        <View style={{ marginTop: 5, marginBottom: 15, pointerEvents: "none" }} >
                            <Entrada label="Nombre" value={nombre} editable={false} />
                        </View>

                        <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                            <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                <Entrada label="Apellido Paterno" value={apellidoPaterno} editable={false} />
                            </View>
                            <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                <Entrada label="Apellido Materno" value={apellidoMaterno} editable={false} />
                            </View>
                        </View>

                        <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                            <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                <Entrada label="CURP" value={curp} editable={false} />
                            </View>
                            <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                <Entrada label="RFC" value={rfc} editable={false} />
                            </View>
                        </View>

                        <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                            <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                <Entrada label="Boleta" value={boleta} keyboardType="numeric" editable={false} />
                            </View>
                            <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                <Entrada label="Carrera" value={carrera} editable={false} />
                            </View>
                        </View>

                        <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                            <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                <Entrada label="Generación" value={generacion} editable={false} />
                            </View>
                            <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                <Entrada label="Promedio" value={promedio} keyboardType="decimal-pad" editable={false} />
                            </View>
                        </View>

                        <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                            <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                <Entrada
                                    label="Correo Electrónico Institucional"
                                    value={correo}
                                    keyboardType="email-address"
                                    editable={false}
                                />
                            </View>
                            <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                <Entrada label="Estatus" value={estatus} editable={false} />
                            </View>
                        </View>

                        <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                            <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                <Entrada label="Calle y Número" value={calleNumero} editable={false} />
                            </View>
                            <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                <Entrada label="Colonia" value={colonia} editable={false} />
                            </View>
                        </View>

                        <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                            <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                <Entrada label="Delegación / Municipio" value={delegacionMunicipio} editable={false} />
                            </View>
                            <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                <Entrada label="Estado de Procedencia" value={estadoProcedencia} editable={false} />
                            </View>
                        </View>

                        <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                            <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                <Entrada label="Código Postal" value={codigoPostal} keyboardType="numeric" editable={false} />
                            </View>
                            <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                <Selector
                                    label="Sexo"
                                    selectedValue={sexo === "F" ? "Femenino" : sexo === "M" ? "Masculino" : ""}
                                    items={[
                                        { label: "Masculino", value: "M" },
                                        { label: "Femenino", value: "F" },
                                    ]}
                                    onValueChange={() => { }}
                                />
                            </View>
                        </View>

                        <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                            <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                <Entrada label="Teléfono Celular" value={telefonoCelular} keyboardType="phone-pad" editable={false} />
                            </View>
                            <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                <Entrada label="Teléfono Local" value={telefonoLocal} keyboardType="phone-pad" editable={false} />
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </Modal>
        );
    };

    const renderModalAgregar = () => {
        return (
            <Modal visible={modalAgregar} onClose={() => { setModalAgregar(false); reset(defaultValues); }} titulo="Agregar Alumno" maxWidth={700} cancelar textoAceptar="Agregar alumno" onAceptar={handleSubmit(onSubmit)}>
                <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "web" ? undefined : "padding"} keyboardVerticalOffset={80}>
                    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                        <View style={{ marginTop: 5, marginBottom: 15 }}>
                            <Controller
                                control={control}
                                name="nombre"
                                render={({ field }) => (
                                    <Entrada label="Nombre" {...field} error={errors.nombre?.message} />
                                )}
                            />
                        </View>

                        <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                            <View style={{ flex: 1, marginBottom: 0 }}>
                                <Controller
                                    control={control}
                                    name="apellidoPaterno"
                                    render={({ field }) => (
                                        <Entrada label="Apellido Paterno" {...field} error={errors.apellidoPaterno?.message} style={{ flex: 1 }} />
                                    )}
                                />
                            </View>
                            <View style={{ flex: 1, marginBottom: 0 }}>
                                <Controller
                                    control={control}
                                    name="apellidoMaterno"
                                    render={({ field }) => (
                                        <Entrada label="Apellido Materno" {...field} error={errors.apellidoMaterno?.message} style={{ flex: 1 }} />
                                    )}
                                />
                            </View>
                        </View>

                        <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                            <View style={{ flex: 1, marginBottom: 0 }}>
                                <Controller
                                    control={control}
                                    name="curp"
                                    render={({ field }) => (
                                        <Entrada label="CURP" {...field} error={errors.curp?.message} style={{ flex: 1 }} />
                                    )}
                                />
                            </View>
                            <View style={{ flex: 1, marginBottom: 0 }}>
                                <Controller
                                    control={control}
                                    name="rfc"
                                    render={({ field }) => (
                                        <Entrada label="RFC" {...field} error={errors.rfc?.message} style={{ flex: 1 }} />
                                    )}
                                />
                            </View>
                        </View>

                        <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                            <View style={{ flex: 1, marginBottom: 0 }}>
                                <Controller
                                    control={control}
                                    name="boleta"
                                    render={({ field }) => (
                                        <Entrada label="Boleta" keyboardType="numeric" {...field} error={errors.boleta?.message} style={{ flex: 1 }} />
                                    )}
                                />
                            </View>
                            <View style={{ flex: 1, marginBottom: 0 }}>
                                <Controller
                                    control={control}
                                    name="carrera"
                                    render={({ field }) => (
                                        <Entrada label="Carrera" {...field} error={errors.carrera?.message} style={{ flex: 1 }} />
                                    )}
                                />
                            </View>
                        </View>

                        <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                            <View style={{ flex: 1, marginBottom: 0 }}>
                                <Controller
                                    control={control}
                                    name="generacion"
                                    render={({ field }) => (
                                        <Entrada label="Generación" {...field} error={errors.generacion?.message} style={{ flex: 1 }} />
                                    )}
                                />
                            </View>
                            <View style={{ flex: 1, marginBottom: 0 }}>
                                <Controller
                                    control={control}
                                    name="promedio"
                                    render={({ field }) => (
                                        <Entrada label="Promedio" keyboardType="decimal-pad" {...field} error={errors.promedio?.message} style={{ flex: 1 }} />
                                    )}
                                />
                            </View>
                        </View>

                        <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                            <View style={{ flex: 1, marginBottom: 0 }}>
                                <Controller
                                    control={control}
                                    name="correo"
                                    render={({ field }) => (
                                        <Entrada label="Correo Electrónico" keyboardType="email-address" {...field} error={errors.correo?.message} style={{ flex: 1 }} />
                                    )}
                                />
                            </View>
                            <View style={{ flex: 1, marginBottom: 0 }}>
                                <Controller
                                    control={control}
                                    name="estatus"
                                    render={({ field: { onChange, value } }) => (
                                        <Selector
                                            label="Estatus"
                                            selectedValue={value}
                                            onValueChange={onChange}
                                            items={[
                                                { label: "Candidato", value: "Candidato" },
                                                { label: "Aspirante", value: "Aspirante" },
                                                { label: "En proceso", value: "En proceso" },
                                                { label: "Concluido", value: "Concluido" },
                                            ]}
                                            error={errors.estatus?.message}
                                        />
                                    )}
                                />
                            </View>
                        </View>

                        <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                            <View style={{ flex: 1, marginBottom: 0 }}>
                                <Controller
                                    control={control}
                                    name="calleNumero"
                                    render={({ field }) => (
                                        <Entrada label="Calle y Número" {...field} error={errors.calleNumero?.message} style={{ flex: 1 }} />
                                    )}
                                />
                            </View>
                            <View style={{ flex: 1, marginBottom: 0 }}>
                                <Controller
                                    control={control}
                                    name="colonia"
                                    render={({ field }) => (
                                        <Entrada label="Colonia" {...field} error={errors.colonia?.message} style={{ flex: 1 }} />
                                    )}
                                />
                            </View>
                        </View>

                        <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                            <View style={{ flex: 1, marginBottom: 0 }}>
                                <Controller
                                    control={control}
                                    name="delegacionMunicipio"
                                    render={({ field }) => (
                                        <Entrada label="Delegación / Municipio" {...field} error={errors.delegacionMunicipio?.message} style={{ flex: 1 }} />
                                    )}
                                />
                            </View>
                            <View style={{ flex: 1, marginBottom: 0 }}>
                                <Controller
                                    control={control}
                                    name="estadoProcedencia"
                                    render={({ field }) => (
                                        <Entrada label="Estado de Procedencia" {...field} error={errors.estadoProcedencia?.message} style={{ flex: 1 }} />
                                    )}
                                />
                            </View>
                        </View>

                        <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                            <View style={{ flex: 1, marginBottom: 0 }}>
                                <Controller
                                    control={control}
                                    name="codigoPostal"
                                    render={({ field }) => (
                                        <Entrada label="Código Postal" keyboardType="numeric" {...field} error={errors.codigoPostal?.message} style={{ flex: 1 }} />
                                    )}
                                />
                            </View>
                            <View style={{ flex: 1, marginBottom: 0 }}>
                                <Controller
                                    control={control}
                                    name="sexo"
                                    defaultValue={""}
                                    render={({ field: { onChange, value } }) => (
                                        <Selector
                                            label="Sexo"
                                            selectedValue={value === "F" ? "Femenino" : value === "M" ? "Masculino" : ""}
                                            onValueChange={onChange}
                                            items={[
                                                { label: "Masculino", value: "M" },
                                                { label: "Femenino", value: "F" },
                                            ]}
                                            error={errors.sexo?.message}
                                        />
                                    )}
                                />
                            </View>
                        </View>

                        <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                            <View style={{ flex: 1, marginBottom: 0 }}>
                                <Controller
                                    control={control}
                                    name="telefonoCelular"
                                    render={({ field }) => (
                                        <Entrada label="Teléfono Celular" keyboardType="phone-pad" {...field} error={errors.telefonoCelular?.message} style={{ flex: 1 }} />
                                    )}
                                />
                            </View>
                            <View style={{ flex: 1, marginBottom: 0 }}>
                                <Controller
                                    control={control}
                                    name="telefonoLocal"
                                    render={({ field }) => (
                                        <Entrada label="Teléfono Local" keyboardType="phone-pad" {...field} error={errors.telefonoLocal?.message} style={{ flex: 1 }} />
                                    )}
                                />
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </Modal>
        );
    };

    const renderModalEditar = () => {
        return (
            <Modal visible={modalEditar}
                onClose={() => { setAlumnoSeleccionado(null); setModalEditar(false); reset(defaultValues); }}
                titulo="Editar Alumno" maxWidth={750} cancelar textoAceptar="Guardar Cambios" onAceptar={handleSubmit(onSubmit)}
            >
                <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "web" ? undefined : "padding"} keyboardVerticalOffset={80}>
                    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                        <View style={{ marginTop: 10, marginBottom: 15 }} >
                            <Controller
                                control={control}
                                name="nombre"
                                render={({ field }) => (
                                    <Entrada label="Nombre" {...field} error={errors.nombre?.message} />
                                )}
                            />
                        </View>

                        <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                            <View style={{ flex: 1, marginBottom: 0 }}>
                                <Controller
                                    control={control}
                                    name="apellidoPaterno"
                                    render={({ field }) => (
                                        <Entrada
                                            label="Apellido Paterno"
                                            {...field}
                                            error={errors.apellidoPaterno?.message}
                                        />
                                    )}
                                />
                            </View>
                            <View style={{ flex: 1, marginBottom: 0 }}>
                                <Controller
                                    control={control}
                                    name="apellidoMaterno"
                                    render={({ field }) => (
                                        <Entrada
                                            label="Apellido Materno"
                                            {...field}
                                            error={errors.apellidoMaterno?.message}
                                        />
                                    )}
                                />
                            </View>
                        </View>

                        <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                            <View style={{ flex: 1, marginBottom: 0 }}>
                                <Controller
                                    control={control}
                                    name="curp"
                                    render={({ field }) => (
                                        <Entrada
                                            label="CURP"
                                            {...field}
                                            error={errors.curp?.message}
                                            style={{ flex: 1 }}
                                        />
                                    )}
                                />
                            </View>
                            <View style={{ flex: 1, marginBottom: 0 }}>
                                <Controller
                                    control={control}
                                    name="rfc"
                                    render={({ field }) => (
                                        <Entrada
                                            label="RFC"
                                            {...field}
                                            error={errors.rfc?.message}
                                            style={{ flex: 1 }}
                                        />
                                    )}
                                />
                            </View>
                        </View>

                        <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                            <View style={{ flex: 1, marginBottom: 0 }}>
                                <Controller
                                    control={control}
                                    name="boleta"
                                    render={({ field }) => (
                                        <Entrada
                                            label="Boleta"
                                            keyboardType="numeric"
                                            {...field}
                                            error={errors.boleta?.message}
                                            style={{ flex: 1 }}
                                        />
                                    )}
                                />
                            </View>
                            <View style={{ flex: 1, marginBottom: 0 }}>
                                <Controller
                                    control={control}
                                    name="carrera"
                                    render={({ field }) => (
                                        <Entrada
                                            label="Carrera"
                                            {...field}
                                            error={errors.carrera?.message}
                                            style={{ flex: 1 }}
                                        />
                                    )}
                                />
                            </View>
                        </View>

                        <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                            <View style={{ flex: 1, marginBottom: 0 }}>
                                <Controller
                                    control={control}
                                    name="generacion"
                                    render={({ field }) => (
                                        <Entrada
                                            label="Generación"
                                            {...field}
                                            error={errors.generacion?.message}
                                            style={{ flex: 1 }}
                                        />
                                    )}
                                />
                            </View>
                            <View style={{ flex: 1, marginBottom: 0 }}>
                                <Controller
                                    control={control}
                                    name="promedio"
                                    render={({ field }) => (
                                        <Entrada
                                            label="Promedio"
                                            keyboardType="decimal-pad"
                                            {...field}
                                            error={errors.promedio?.message}
                                            style={{ flex: 1 }}
                                        />
                                    )}
                                />
                            </View>
                        </View>

                        <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                            <View style={{ flex: 1, marginBottom: 0 }}>
                                <Controller
                                    control={control}
                                    name="correo"
                                    render={({ field }) => (
                                        <Entrada
                                            label="Correo Electrónico"
                                            keyboardType="email-address"
                                            {...field}
                                            error={errors.correo?.message}
                                            style={{ flex: 1 }}
                                        />
                                    )}
                                />
                            </View>
                            <View style={{ flex: 1, marginBottom: 0 }}>
                                <Controller
                                    control={control}
                                    name="estatus"
                                    render={({ field: { onChange, value } }) => (
                                        <Selector
                                            label="Estatus"
                                            selectedValue={value}
                                            onValueChange={onChange}
                                            items={[
                                                { label: "Candidato", value: "Candidato" },
                                                { label: "Aspirante", value: "Aspirante" },
                                                { label: "En proceso", value: "En proceso" },
                                                { label: "Concluido", value: "Concluido" },
                                            ]}
                                            error={errors.estatus?.message}
                                        />
                                    )}
                                />
                            </View>
                        </View>

                        <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                            <View style={{ flex: 1, marginBottom: 0 }}>
                                <Controller
                                    control={control}
                                    name="calleNumero"
                                    render={({ field }) => (
                                        <Entrada
                                            label="Calle y Número"
                                            {...field}
                                            error={errors.calleNumero?.message}
                                            style={{ flex: 1 }}
                                        />
                                    )}
                                />
                            </View>
                            <View style={{ flex: 1, marginBottom: 0 }}>
                                <Controller
                                    control={control}
                                    name="colonia"
                                    render={({ field }) => (
                                        <Entrada
                                            label="Colonia"
                                            {...field}
                                            error={errors.colonia?.message}
                                            style={{ flex: 1 }}
                                        />
                                    )}
                                />
                            </View>
                        </View>

                        <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                            <View style={{ flex: 1, marginBottom: 0 }}>
                                <Controller
                                    control={control}
                                    name="delegacionMunicipio"
                                    render={({ field }) => (
                                        <Entrada
                                            label="Delegación / Municipio"
                                            {...field}
                                            error={errors.delegacionMunicipio?.message}
                                            style={{ flex: 1 }}
                                        />
                                    )}
                                />
                            </View>
                            <View style={{ flex: 1, marginBottom: 0 }}>
                                <Controller
                                    control={control}
                                    name="estadoProcedencia"
                                    render={({ field }) => (
                                        <Entrada
                                            label="Estado de Procedencia"
                                            {...field}
                                            error={errors.estadoProcedencia?.message}
                                            style={{ flex: 1 }}
                                        />
                                    )}
                                />
                            </View>
                        </View>

                        <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                            <View style={{ flex: 1, marginBottom: 0 }}>
                                <Controller
                                    control={control}
                                    name="codigoPostal"
                                    render={({ field }) => (
                                        <Entrada
                                            label="Código Postal"
                                            keyboardType="numeric"
                                            {...field}
                                            error={errors.codigoPostal?.message}
                                            style={{ flex: 1 }}
                                        />
                                    )}
                                />
                            </View>
                            <View style={{ flex: 1, marginBottom: 0 }}>
                                <Controller
                                    control={control}
                                    name="sexo"
                                    render={({ field: { onChange, value } }) => (
                                        <Selector
                                            label="Sexo"
                                            selectedValue={value === "F" ? "Femenino" : value === "M" ? "Masculino" : ""}
                                            onValueChange={onChange}
                                            items={[
                                                { label: "Masculino", value: "M" },
                                                { label: "Femenino", value: "F" },
                                            ]}
                                            error={errors.sexo?.message}
                                        />
                                    )}
                                />
                            </View>
                        </View>

                        <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                            <View style={{ flex: 1, marginBottom: 0 }}>
                                <Controller
                                    control={control}
                                    name="telefonoCelular"
                                    render={({ field }) => (
                                        <Entrada
                                            label="Teléfono Celular"
                                            keyboardType="phone-pad"
                                            {...field}
                                            error={errors.telefonoCelular?.message}
                                            style={{ flex: 1 }}
                                        />
                                    )}
                                />
                            </View>
                            <View style={{ flex: 1, marginBottom: 0 }}>
                                <Controller
                                    control={control}
                                    name="telefonoLocal"
                                    render={({ field }) => (
                                        <Entrada
                                            label="Teléfono Local"
                                            keyboardType="phone-pad"
                                            {...field}
                                            error={errors.telefonoLocal?.message}
                                            style={{ flex: 1 }}
                                        />
                                    )}
                                />
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </Modal>
        );
    };

    const renderModalEliminar = () => {
        if (!modalEliminar) return null;
        return (
            <Modal visible={modalEliminar} onClose={() => setModalEliminar(null)} titulo="Eliminar Alumno" maxWidth={500}
                cancelar textoAceptar="Eliminar alumno" onAceptar={eliminarAlumno}>
                <Text style={{ marginBottom: 20 }}>
                    ¿Estás seguro de que deseas eliminar al alumno con número de boleta{" "}
                    <Text style={{ fontWeight: "700" }}>{modalEliminar.boleta}</Text>?
                </Text>
            </Modal>
        );
    };

    const renderModalEliminarAlumnos = () => {
        if (!modalEliminarAlumnos) return null;
        return (
            <Modal visible={modalEliminarAlumnos} onClose={() => setModalEliminarAlumnos(false)} titulo="Eliminar Alumnos" maxWidth={500}
                cancelar textoAceptar="Eliminar alumnos" onAceptar={eliminarAlumnos}>
                <Text style={{ marginBottom: 20 }}>
                    ¿Estás seguro de que deseas eliminar todos los alumnos registrados?
                </Text>
            </Modal>
        );
    };

    const handleArchivoSeleccionado = (file: { name: string; uri: string; mimeType?: string }) => {
        setArchivoSeleccionado(file);
    };

    const manejarSubidaArchivo = () => {
        if (!archivoSeleccionado) {
            return;
        }
        setModalCargar(false);
    };

    const renderModalCargarAlumnos = () => {
        return (
            <Modal visible={modalCargar} onClose={() => setModalCargar(false)} titulo="Cargar Alumnos" maxWidth={600}
                cancelar onAceptar={manejarSubidaArchivo}>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <Text>
                        Para cargar alumnos al sistema, el archivo debe estar en formato Excel (.xls, .xlsx) y no puede exceder un tamaño de 2MB.
                    </Text>
                    <View style={{ marginTop: 20, marginBottom: 5 }}>
                        <SelectorArchivo
                            label="Selecciona el archivo"
                            onArchivoSeleccionado={(file) => { setArchivoSeleccionado(file); }}
                            allowedTypes={[".csv", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]} />
                    </View>
                </ScrollView>
            </Modal>
        );
    };

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={[styles.contenedorFormulario, esPantallaPequeña && { maxWidth: "95%" }]}>
                <Text style={styles.titulo}>Gestionar Alumnos</Text>
                <View style={{ marginBottom: 15, flexDirection: "row", gap: 10 }}>
                    <View style={[esPantallaPequeña && { flex: 1 }]}>
                        <Boton title="Agregar alumno" onPress={abrirModalAgregar} />
                    </View>
                    <View style={[esPantallaPequeña && { flex: 1 }]}>
                        <Boton title="Cargar alumnos" onPress={() => setModalCargar(true)} />
                    </View>
                </View>

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


                <Tabla
                    columnas={[
                        { key: "boleta", titulo: "Boleta" },
                        { key: "nombre_completo", titulo: "Nombre" },
                        { key: "carrera", titulo: "Carrera" },
                        { key: "generacion", titulo: "Generación" },
                        {
                            key: "estatus",
                            titulo: "Estatus",
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
                            titulo: "Acciones",
                            render: (_, fila) => (
                                <View style={{ flexDirection: "row", gap: 10, justifyContent: "center", margin: "auto" }}>
                                    <Pressable
                                        style={{
                                            paddingVertical: 3,
                                            paddingHorizontal: 4,
                                            borderRadius: 5,
                                            backgroundColor: Colores.textoInfo,
                                        }}
                                        onPress={() => abrirModalEditar(fila)}
                                    >
                                        <Ionicons name="pencil" size={20} color={Colores.onPrimario} />
                                    </Pressable>
                                    <Pressable
                                        style={{
                                            paddingVertical: 3,
                                            paddingHorizontal: 4,
                                            borderRadius: 5,
                                            backgroundColor: Colores.textoError,
                                        }}
                                        onPress={() => setModalEliminar(fila)}
                                    >
                                        <Ionicons name="trash" size={20} color={Colores.onPrimario} />
                                    </Pressable>
                                </View>
                            ),
                        },
                    ]}
                    datos={obtenerDatosFiltrados().map((fila) => ({
                        ...fila,
                        nombre_completo: `${fila.nombre} ${fila.apellidoPaterno} ${fila.apellidoMaterno}`,
                        onPress: () => setAlumnoSeleccionado(fila),
                    }))}
                />

                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <View style={{ flexDirection: "row", marginVertical: 15, gap: 6 }}>
                        <Paginacion
                            paginaActual={paginaActual}
                            totalPaginas={totalPaginas}
                            setPaginaActual={setPaginaActual}
                        />
                    </View>


                    <View style={{ marginTop: 15, alignItems: "flex-end" }}>
                        <Boton title="Eliminar alumnos" onPress={() => setModalEliminarAlumnos(true)} />
                    </View>
                </View>

            </View>
            {renderModalDetalle()}
            {renderModalAgregar()}
            {renderModalEditar()}
            {renderModalEliminar()}
            {renderModalEliminarAlumnos()}
            {renderModalCargarAlumnos()}
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
