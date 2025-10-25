import { Colores } from "@/temas/colores";

// Helper para completar los documentos y asignar color y estatus
export function completarDocumentos(docsBackend: any[]) {
    const documentosCompletos = [
        { documento: "Preregistro SISS", tipo: 1 },
        { documento: "Preregistro SIASS", tipo: 1 },
        { documento: "Preregistro SIRSS", tipo: 1 },
        { documento: "Constancia de derechos del IMSS", tipo: 1 },
        { documento: "Constancia de término del internado", tipo: 1 },
        { documento: "Certificado original de salud", tipo: 1 },
        { documento: "Acta de calificaciones del internado", tipo: 1 },
        { documento: "Acuse de solicitud de registro al servicio social", tipo: 1 },
        { documento: "Carta compromiso", tipo: 1 },
        { documento: "CURP", tipo: 1 },
        { documento: "Comprobante de estudios", tipo: 1 },
        { documento: "Constancia de adscripción y aceptación", tipo: 1 },
        { documento: "Constancia de término", tipo: 2 }
    ];

    return documentosCompletos.map((item) => {
        const doc = docsBackend.find((doc) => doc.nombreArchivo === item.documento);

        if (doc) {
            // Si el documento existe, actualizamos su estatus y color
            return {
                ...doc,
                color:
                    doc.estatus === 1 ? Colores.textoAdvertencia
                        : doc.estatus === 2 ? Colores.textoInfo
                            : doc.estatus === 3 ? Colores.textoExito
                                : Colores.textoError,
                estatus:
                    doc.estatus === 1 ? "Sin cargar"
                        : doc.estatus === 2 ? "Pendiente"
                            : doc.estatus === 3 ? "Aprobado"
                                : "Rechazado",
                observacion: doc.observacion || (doc.estatus === 2 ? "En espera de revisión.": "Sin observaciones."),
                tipo: item.tipo,
            };
        } else {
            // Si el documento no existe, lo creamos con estatus "sin cargar"
            return {
                ID: null,
                alumnoBoleta: null,
                adminEncargado: null,
                estatus: "Sin cargar",
                fechaRegistro: null,
                nombreArchivo: item.documento,
                observacion: "Sin observaciones.",
                rutaArchivo: null,
                tipo: item.tipo,
                color: Colores.textoAdvertencia,
            };
        }
    });
}
