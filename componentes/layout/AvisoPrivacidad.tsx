import { Colores, Fuentes } from "@/temas/colores";
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
      titulo=""
      cerrar={false}
      cancelar={false}
      aceptar={true}
      textoAceptar="Aceptar"
      onAceptar={onClose}
    >
      <Text style={styles.titulo}>AVISO DE PRIVACIDAD Y CONFIDENCIALIDAD DE TUS DATOS PERSONALES</Text>
      <Text style={{ color: Colores.textoPrincipal, fontSize: 14, textAlign: "justify" }}>
        La información personal recabada a través del{" "}
        <Text style={styles.siseg}>Sistema de Seguimiento del Servicio Social para la ENMyH (SISEG)</Text>
        {" "}será protegida, incorporada y tratada por el{" "}
        <Text style={styles.subtitulo}>Departamento de Extensión y Apoyos Educativos</Text>
        {" "}de la{" "}
        <Text style={styles.subtitulo}>Escuela Nacional de Medicina y Homeopatía (ENMyH)</Text>
        {" "}del{" "}<Text style={styles.subtitulo}>Instituto Politécnico Nacional (IPN)</Text>,
        con fundamento en el Artículo 16 de la Constitución Política de los Estados Unidos Mexicanos,
        la Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados (LGPDPPSO),
        así como en los Lineamientos Generales de Protección de Datos Personales para el Sector Público{" "}
        y el marco normativo institucional en materia de transparencia y protección de datos del IPN.{"\n\n"}
        Su recopilación tiene como objeto permitir el registro, seguimiento y verificación del servicio social{" "}
        de los estudiantes de la ENMYH, así como la gestión de información relacionada con la recepción de documentos,
        emisión de documentos electrónicos, asignación de plazas, supervisión y evaluación de satisfacción.{" "}
        El tratamiento de los datos se realizará bajo los principios de licitud, finalidad, lealtad,
        proporcionalidad y responsabilidad, conforme lo establecen los artículos 3, 4 y 6 de la LGPDPPSO.{"\n\n"}
        El{" "}<Text style={styles.subtitulo}>Departamento de Extensión y Apoyos Educativos</Text>
        {" "}de la{" "}<Text style={styles.subtitulo}>ENMyH</Text>{" "}del{" "}<Text style={styles.subtitulo}>IPN</Text>,
        es el encargado del tratamiento y resguardo de los datos personales proporcionados,
        y adopta las medidas administrativas, físicas y tecnológicas necesarias para garantizar su confidencialidad,
        integridad y disponibilidad. En cumplimiento de los artículos 43 al 49 de la LGPDPPSO,
        el titular podrá ejercer sus Derechos ARCO (Acceso, Rectificación, Cancelación y Oposición
        ) mediante solicitud directa en las instalaciones ubicadas en
        Av. Guillermo Massieu Helguera 239, La Purísima Ticoman, Gustavo A. Madero, 07320 Ciudad de México, CDMX.
        Tel: 55 5729 6000, Ext. 55567.{"\n\n"}
        Los datos personales recabados podrán ser transferidos a otras dependencias del IPN o autoridades competentes,
        únicamente cuando sea necesario para cumplir con las obligaciones legales o requisitos administrativos del sistema.
        Cualquier modificación al presente Aviso de Privacidad será publicada en la plataforma,
        a fin de garantizar transparencia y continuidad en la protección de la información.
        {"\n\n"}
        Lo anterior se informa en cumplimiento a los Lineamientos de Protección de Datos Personales.
      </Text>
    </Modal>
  );
}

const styles = StyleSheet.create({
  titulo: {
    fontSize: Fuentes.subtitulo,
    textAlign: "center",
    marginBottom: 25,
    fontWeight: 700,
  },
  subtitulo: {
    fontSize: Fuentes.cuerpo,
    fontWeight: 600,
  },
  siseg: {
    fontSize: Fuentes.cuerpo,
    color: Colores.primario,
    fontWeight: 600,
  }
});