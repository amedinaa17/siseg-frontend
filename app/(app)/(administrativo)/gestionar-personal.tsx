import Modal from "@/componentes/layout/Modal";
import Boton from "@/componentes/ui/Boton";
import Entrada from "@/componentes/ui/Entrada";
import Paginacion from "@/componentes/ui/Paginacion";
import Selector from "@/componentes/ui/Selector";
import SelectorArchivo from "@/componentes/ui/SelectorArchivo";
import Tabla from "@/componentes/ui/Tabla";
import { personalEsquema, type PersonalFormulario } from "@/lib/validacion";
import { Colores, Fuentes } from "@/temas/colores";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

const datosAdministrativos = [
    {
        noEmpleado: "2022630301", nombre: "Andrea", apellidoPaterno: "Salgado", apellidoMaterno: "Ramírez", curp: "SARA010312MDFLND09",
        correo: "asalga@alumno.ipn.mx", perfil: "Administrador general", telefonoCelular: "5512345678", telefonoLocal: "5553123456",
    },
    {
        noEmpleado: "2022630320", nombre: "Mariana", apellidoPaterno: "Torres", apellidoMaterno: "López", curp: "TOLM010215MDFLNS09",
        correo: "mariana.tl@alumno.ipn.mx", perfil: "Administrador general", telefonoCelular: "5511223344", telefonoLocal: "5556789123"
    },
    {
        noEmpleado: "2022630312", nombre: "Alejandro", apellidoPaterno: "Vega", apellidoMaterno: "Domínguez", curp: "ALEA010112MDFLND09",
        correo: "alejandro@alumno.ipn.mx", perfil: "Administrador de seguimiento", telefonoCelular: "5544332211", telefonoLocal: "5553445566"
    },
    {
        noEmpleado: "2022630333", nombre: "Jorge", apellidoPaterno: "Hernández", apellidoMaterno: "Castillo", curp: "HECJ991120MDFRNL08",
        correo: "jorgehc@alumno.ipn.mx", perfil: "Administrador de seguimiento", telefonoCelular: "5522334455", telefonoLocal: "5559876543"
    },
    {
        noEmpleado: "2022630345", nombre: "Paola", apellidoPaterno: "Méndez", apellidoMaterno: "García", curp: "MEGP000305MDFLNR07",
        correo: "paolamg@alumno.ipn.mx", perfil: "Administrador general", telefonoCelular: "5533445566", telefonoLocal: "5552233445"
    },
    {
        noEmpleado: "2022630363", nombre: "Joel", apellidoPaterno: "Mora", apellidoMaterno: "Castañeda", curp: "MOCJ000305MDFLNR07",
        correo: "joelmc@alumno.ipn.mx", perfil: "Administrador de seguimiento", telefonoCelular: "5533445566", telefonoLocal: "5552233445"
    },
];

const defaultValues = {
    nombre: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    curp: "",
    noEmpleado: "",
    perfil: "",
    correo: "",
    telefonoCelular: "",
    telefonoLocal: "",
};

export default function GestionPersonalAdministrativo() {
    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PersonalFormulario>({
        resolver: zodResolver(personalEsquema),
        defaultValues: defaultValues
    });

    // Estados modales
    const [adminisrativoSeleccionado, setAdminisrativoSeleccionado] = useState<any | null>(null);
    const [modalAgregar, setModalAgregar] = useState(false);
    const [modalEditar, setModalEditar] = useState(false);
    const [modalEliminar, setModalEliminar] = useState<any | null>(null);
    const [modalEliminarAdministrativos, setModalEliminarAdministrativos] = useState(false);
    const [modalCargar, setModalCargar] = useState(false);
    const [archivoSeleccionado, setArchivoSeleccionado] = useState<any | null>(null);

    // --- Estados para búsqueda, filtros y paginación ---
    const [busqueda, setBusqueda] = useState("");
    const [filtroPerfil, setFiltroPerfil] = useState("Todos");
    const [paginaActual, setPaginaActual] = useState(1);
    const [filasPorPagina, setFilasPorPagina] = useState(5);

    const { width } = useWindowDimensions();
    const esPantallaPequeña = width < 600;

    const abrirModalAgregar = () => {
        setModalAgregar(true);
    };

    const onSubmit = (data: PersonalFormulario) => {
        reset(defaultValues);
        setModalAgregar(false);
    };

    const abrirModalEditar = (administrativo) => {
        reset(administrativo);
        setModalEditar(administrativo);
    };

    const eliminarAdministrativo = () => {
        setModalEliminar(null);
    };

    const eliminarAdministrativos = () => {
        setModalEliminarAdministrativos(false);
    };

    // --- Filtrado y paginación de los datos ---
    const obtenerDatosFiltrados = () => {
        let datos = [...datosAdministrativos];

        // Búsqueda por nombre completo o noEmpleado del administrativo
        if (busqueda) {
            datos = datos.filter(administrativo =>
                `${administrativo.nombre} ${administrativo.apellidoPaterno} ${administrativo.apellidoMaterno}`
                    .toLowerCase()
                    .includes(busqueda.toLowerCase()) ||
                administrativo.noEmpleado.includes(busqueda.toLowerCase())
            );
        }

        // Filtro por perfil
        if (filtroPerfil && filtroPerfil != "Todos") datos = datos.filter(a => a.perfil === "Administrador " + filtroPerfil);

        // Paginación
        const inicio = (paginaActual - 1) * filasPorPagina;
        const fin = inicio + filasPorPagina;

        return datos.slice(inicio, fin);
    };

    const totalRegistros = (() => {
        let datos = [...datosAdministrativos];
        if (busqueda) {
            datos = datos.filter(administrativo =>
                `${administrativo.nombre} ${administrativo.apellidoPaterno} ${administrativo.apellidoMaterno}`
                    .toLowerCase()
                    .includes(busqueda.toLowerCase())
            );
        }
        if (filtroPerfil && filtroPerfil != "Todos") datos = datos.filter(a => a.perfil === "Administrador " + filtroPerfil);
        return datos.length;
    })();
    const totalPaginas = Math.ceil(totalRegistros / filasPorPagina);


    // --- Render de modales ---
    const renderModalDetalle = () => {
        if (!adminisrativoSeleccionado) return null;
        const { nombre, apellidoPaterno, apellidoMaterno, curp, noEmpleado, perfil, telefonoCelular, telefonoLocal, correo } = adminisrativoSeleccionado;

        return (
            <Modal visible={!!adminisrativoSeleccionado} onClose={() => setAdminisrativoSeleccionado(null)} titulo="Datos del Personal Administrativo" maxWidth={750}>
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

                        <View style={{ marginBottom: 15, pointerEvents: "none" }} >
                            <Entrada label="CURP" value={curp} editable={false} />
                        </View>

                        <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                            <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                <Entrada label="No. Empleado" value={noEmpleado} keyboardType="numeric" editable={false} />
                            </View>
                            <View style={{ flex: 1, marginBottom: 0, pointerEvents: "none" }}>
                                <Selector
                                    label="Perfil"
                                    selectedValue={perfil}
                                    items={[
                                        { label: "Administrador general", value: "Administrador general" },
                                        { label: "Administrador de seguimiento", value: "Administrador de seguimiento" },
                                    ]}
                                    onValueChange={() => { }}
                                />
                            </View>
                        </View>

                        <View style={{ marginBottom: 15, pointerEvents: "none" }} >
                            <Entrada
                                label="Correo Electrónico Institucional"
                                value={correo}
                                keyboardType="email-address"
                                editable={false}
                            />
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
            <Modal visible={modalAgregar} onClose={() => { setModalAgregar(false); reset(defaultValues); }} titulo="Agregar Personal Administrativo" maxWidth={700} cancelar textoAceptar="Agregar personal" onAceptar={handleSubmit(onSubmit)}>
                <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "web" ? undefined : "padding"} keyboardVerticalOffset={80}>
                    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                        <View style={{ marginBottom: 15 }}>
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

                        <View style={{ marginBottom: 15 }}>
                            <Controller
                                control={control}
                                name="curp"
                                render={({ field }) => (
                                    <Entrada label="CURP" {...field} error={errors.curp?.message} style={{ flex: 1 }} />
                                )}
                            />
                        </View>

                        <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                            <View style={{ flex: 1, marginBottom: 0 }}>
                                <Controller
                                    control={control}
                                    name="noEmpleado"
                                    render={({ field }) => (
                                        <Entrada label="No. Empleado" keyboardType="numeric" {...field} error={errors.noEmpleado?.message} style={{ flex: 1 }} />
                                    )}
                                />
                            </View>
                            <View style={{ flex: 1, marginBottom: 0 }}>
                                <Controller
                                    control={control}
                                    name="perfil"
                                    render={({ field: { onChange, value } }) => (
                                        <Selector
                                            label="Perfil"
                                            selectedValue={value}
                                            onValueChange={onChange}
                                            items={[
                                                { label: "Administrador general", value: "Administrador general" },
                                                { label: "Administrador de seguimiento", value: "Administrador de seguimiento" },
                                            ]}
                                            error={errors.perfil?.message}
                                        />
                                    )}
                                />
                            </View>
                        </View>

                        <View style={{ marginBottom: 15 }}>
                            <Controller
                                control={control}
                                name="correo"
                                render={({ field }) => (
                                    <Entrada label="Correo Electrónico" keyboardType="email-address" {...field} error={errors.correo?.message} style={{ flex: 1 }} />
                                )}
                            />
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
                onClose={() => { setAdminisrativoSeleccionado(null); setModalEditar(false); reset(defaultValues); }}
                titulo="Editar Personal Administrativo" maxWidth={750} cancelar textoAceptar="Guardar Cambios" onAceptar={handleSubmit(onSubmit)}
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

                        <View style={{ marginBottom: 15 }} >
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

                        <View style={[styles.row, esPantallaPequeña && { flexDirection: "column" }]}>
                            <View style={{ flex: 1, marginBottom: 0 }}>
                                <Controller
                                    control={control}
                                    name="noEmpleado"
                                    render={({ field }) => (
                                        <Entrada
                                            label="No. Empleado"
                                            keyboardType="numeric"
                                            {...field}
                                            error={errors.noEmpleado?.message}
                                            style={{ flex: 1 }}
                                        />
                                    )}
                                />
                            </View>
                            <View style={{ flex: 1, marginBottom: 0 }}>
                                <Controller
                                    control={control}
                                    name="perfil"
                                    render={({ field: { onChange, value } }) => (
                                        <Selector
                                            label="Perfil"
                                            selectedValue={value}
                                            onValueChange={onChange}
                                            items={[
                                                { label: "Administrador general", value: "Administrador general" },
                                                { label: "Administrador de seguimiento", value: "Administrador de seguimiento" },
                                            ]}
                                            error={errors.perfil?.message}
                                        />
                                    )}
                                />
                            </View>
                        </View>

                        <View style={{ marginBottom: 15 }} >
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
            <Modal visible={modalEliminar} onClose={() => setModalEliminar(null)} titulo="Eliminar Personal Administrativo" maxWidth={500}
                cancelar textoAceptar="Eliminar Personal" onAceptar={eliminarAdministrativo}>
                <Text style={{ marginBottom: 20 }}>
                    ¿Estás seguro de que deseas eliminar al personal administrativo con número de número de empleado{" "}
                    <Text style={{ fontWeight: "700" }}>{modalEliminar.noEmpleado}</Text>?
                </Text>
            </Modal>
        );
    };

    const rendermodalEliminarAdministrativos = () => {
        if (!modalEliminarAdministrativos) return null;
        return (
            <Modal visible={modalEliminarAdministrativos} onClose={() => setModalEliminarAdministrativos(false)} titulo="Eliminar Personales Administrativos" maxWidth={500}
                cancelar textoAceptar="Eliminar personal" onAceptar={eliminarAdministrativos}>
                <Text style={{ marginBottom: 20 }}>
                    ¿Estás seguro de que deseas eliminar todo el personal administrativ0 registrados?
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

    const renderModalCargarAdministrativos = () => {
        return (
            <Modal visible={modalCargar} onClose={() => setModalCargar(false)} titulo="Cargar Personal Administrativo" maxWidth={600}
                cancelar onAceptar={manejarSubidaArchivo}>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <Text>
                        Para cargar personal administrativo al sistema, el archivo debe estar en formato Excel (.xls, .xlsx) y no puede exceder un tamaño de 2MB.
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
                <Text style={styles.titulo}>Gestionar Personal Administrativo</Text>
                <View style={{ marginBottom: 15, flexDirection: "row", gap: 10 }}>
                    <View style={[esPantallaPequeña && { flex: 1 }]}>
                        <Boton title="Agregar personal" onPress={abrirModalAgregar} />
                    </View>
                    <View style={[esPantallaPequeña && { flex: 1 }]}>
                        <Boton title="Cargar personal" onPress={() => setModalCargar(true)} />
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

                    <View style={[{ flexDirection: "row", gap: 8, justifyContent: "space-between" }, esPantallaPequeña ? { width: "100%" } : { width: "40%" }]}>
                        <View style={[esPantallaPequeña ? { width: "60%", marginBottom: 15 } : { width: "60%" }]}>
                            <Entrada
                                label="Buscar"
                                value={busqueda}
                                onChangeText={setBusqueda}
                            />
                        </View>
                        <View style={[esPantallaPequeña ? { width: "40%" } : { width: "40%" }]}>
                            <Selector
                                label="Perfil"
                                selectedValue={filtroPerfil}
                                onValueChange={setFiltroPerfil}
                                items={[
                                    { label: "Todos", value: "Todos" },
                                    { label: "Administrador general", value: "general" },
                                    { label: "Administrador de seguimiento", value: "de seguimiento" },
                                ]}
                            />
                        </View>
                    </View>
                </View>

                <ScrollView horizontal={esPantallaPequeña}>
                    <Tabla
                        columnas={[
                            { key: "noEmpleado", titulo: "No. Empleado", ancho: 150 },
                            { key: "nombre_completo", titulo: "Nombre", ...(esPantallaPequeña && { ancho: 250 }) },
                            { key: "perfil", titulo: "Perfil", ...(esPantallaPequeña && { ancho: 250 }) },
                            {
                                key: "acciones",
                                titulo: "Acciones",
                                ancho: 110,
                                render: (_, fila) => (
                                    <View style={{ flexDirection: "row", gap: 10, justifyContent: "center", margin: "auto" }}>
                                        <Boton
                                            title=""
                                            onPress={() => { abrirModalEditar(fila) }}
                                            icon={<Ionicons name="pencil" size={18} color={Colores.onPrimario} style={{ margin: -5 }} />}
                                            color={Colores.textoInfo}
                                        />
                                        <Boton
                                            title=""
                                            onPress={() => { setModalEliminar(fila) }}
                                            icon={<Ionicons name="trash" size={18} color={Colores.onPrimario} style={{ margin: -5 }} />}
                                            color={Colores.textoError}
                                        />
                                    </View>
                                ),
                            },
                        ]}
                        datos={obtenerDatosFiltrados().map((fila) => ({
                            ...fila,
                            nombre_completo: `${fila.nombre} ${fila.apellidoPaterno} ${fila.apellidoMaterno}`,
                            onPress: () => setAdminisrativoSeleccionado(fila),
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


                    <View style={{ marginTop: 15, alignItems: "flex-end" }}>
                        <Boton title="Eliminar personal" onPress={() => setModalEliminarAdministrativos(true)} />
                    </View>
                </View>

            </View>
            {renderModalDetalle()}
            {renderModalAgregar()}
            {renderModalEditar()}
            {renderModalEliminar()}
            {rendermodalEliminarAdministrativos()}
            {renderModalCargarAdministrativos()}
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
