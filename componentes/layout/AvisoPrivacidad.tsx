import { Colores } from "@/temas/colores";
import React from "react";
import { Text } from "react-native";
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
      titulo="Aviso de Privacidad"
      cerrar={false}
      cancelar={false}
      aceptar={true}
      textoAceptar="Aceptar"
      onAceptar={onClose}
    >
      <Text style={{ color: Colores.textoPrincipal, fontSize: 14, textAlign: "justify" }}>
        SISEG utiliza tus datos exclusivamente para fines académicos y administrativos
        relacionados con el servicio social en la ENMyH. El uso de esta plataforma implica
        la aceptación del aviso de privacidad, de conformidad con la Ley General de Protección
        de Datos Personales en Posesión de Sujetos Obligados.
      </Text>
    </Modal>
  );
}
