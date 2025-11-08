import { Colores } from "@/temas/colores";
import React from "react";
import { StyleSheet, Text } from "react-native";
import Modal from "./Modal";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function ModalAvisoPrivacidad({ visible, onClose }: Props) {
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      titulo="Aviso de Privacidad - SISEG"
      cerrar={false}
      cancelar={false}
      aceptar={true}
      textoAceptar="Aceptar"
      onAceptar={onClose}
    >
      <Text style={{ color: Colores.textoPrincipal, fontSize: 14, textAlign: "justify" }}>
        <Text style={styles.titulo}>Responsable del Tratamiento. </Text>
        La Administración del Sistema <Text style={{ color: Colores.primario }}>SISEG</Text> es responsable del tratamiento de los datos personales de los alumnos.{"\n\n"}

        <Text style={styles.titulo}>Finalidades del Tratamiento. </Text>
        Los datos personales serán utilizados para las siguientes finalidades primarias:
        <Text style={styles.cuerpo}> (i) </Text>Gestión académica y administrativa relacionada con servicio social, inscripción, seguimiento y acreditación;
        <Text style={styles.cuerpo}> (ii) </Text>Verificación de identidad y control de acceso a módulos y trámites dentro de la plataforma<Text style={{ color: Colores.primario }}> SISEG</Text>;
        <Text style={styles.cuerpo}> (iii) </Text>Generación de reportes, estadísticas institucionales y mejora de procesos académicos y administrativos;
        <Text style={styles.cuerpo}> (iv) </Text>Atención de requerimientos de autoridades competentes, en cumplimiento de normatividad vigente.
        Las finalidades mencionadas están fundamentadas en las atribuciones legales de La ENMyH.{"\n\n"}

        <Text style={styles.titulo}>Datos Personales Tratados. </Text>
        Los datos personales que se recabarán incluyen:
        <Text style={styles.cuerpo}> 1. </Text>Datos identificativos: nombre, CURP, boleta, correo institucional, teléfonos.
        <Text style={styles.cuerpo}> 2. </Text>Datos académicos: programa académico, carrera, generación, estatus, promedio, historial escolar.
        <Text style={styles.cuerpo}> 3. </Text>Datos de localización: dirección de domicilio, colonia, municipio, estado, código postal.
        <Text style={{ color: Colores.textoClaro }}> No se solicitan datos sensibles; en caso de requerirlos, se solicitará el consentimiento expreso del titular de los datos y se informará la finalidad específica.</Text>{"\n\n"}

        <Text style={styles.titulo}>Base Jurídica. </Text>
        El tratamiento de los datos personales se realiza con base en las atribuciones que corresponden a la ENMyH, conforme a la Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados (LGDPPSO) y otras disposiciones legales relacionadas.{"\n\n"}

        <Text style={styles.titulo}>Transferencias. </Text>
        Los datos personales podrán ser transferidos a autoridades educativas, organismos públicos o privados cuando se requiera para el cumplimiento de obligaciones legales o en los casos previstos por la ley. No se realizarán transferencias de datos personales con fines comerciales.{"\n\n"}

        <Text style={styles.titulo}>Medidas de Seguridad y Conservación. </Text>
        Se adoptan medidas administrativas, técnicas y físicas para proteger los datos personales de acceso no autorizado, uso indebido o divulgación. Los datos personales se conservarán por el tiempo necesario para cumplir con las finalidades descritas y conforme a la normativa vigente sobre conservación de documentos públicos. Después de este periodo, los datos serán eliminados o anonimizados.{"\n\n"}

        <Text style={styles.titulo}>Derechos ARCO y Mecanismos de Atención. </Text>
        Los titulares de los datos personales podrán ejercer en cualquier momento los derechos de Acceso, Rectificación, Cancelación y Oposición (Derechos ARCO), así como revocar su consentimiento y limitar el uso o divulgación de sus datos, enviando una solicitud por escrito a ccordovao@ipn.mx / deae.enmh@ipn.mx.
        La solicitud deberá incluir:
        - Nombre completo, boleta.
        - Descripción del derecho que se desea ejercer.
        - Documentos que sustenten la solicitud (cuando sea aplicable).
        <Text style={{ color: Colores.textoClaro }}> La respuesta se enviará dentro de los plazos establecidos por la ley. </Text>{"\n\n"}

        <Text style={styles.titulo}>Cambios al Aviso de Privacidad. </Text>
        Este aviso de privacidad podrá ser actualizado, y en caso de que se realicen modificaciones sustanciales, se publicarán en esta plataforma y/o en los medios institucionales disponibles para ello.{"\n\n"}

        <Text style={styles.titulo}>Fecha de última actualización: </Text>07/11/2025
      </Text>
    </Modal>
  );
}

const styles = StyleSheet.create({
  titulo: {
    fontWeight: 700
  },
  cuerpo: {
    color: Colores.textoSecundario,
    fontStyle: "italic"
  },
});