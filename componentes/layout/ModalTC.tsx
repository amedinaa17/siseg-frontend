import { Colores, Fuentes } from "@/temas/colores";
import React from "react";
import { StyleSheet, Text } from "react-native";
import Modal from "./Modal";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function ModalTC({ visible, onClose }: Props) {
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
      <Text allowFontScaling={false} style={styles.titulo}>TÉRMINOS Y CONDICIONES</Text>
      <Text allowFontScaling={false} style={{ color: Colores.textoPrincipal, fontSize: 14, textAlign: "justify" }}>
        <Text style={styles.subtitulo}>1. Aceptación de los Términos y Condiciones</Text>{"\n"}
        La utilización del{" "}
        <Text style={styles.siseg}>Sistema de Seguimiento del Servicio Social para la ENMyH (SISEG)</Text>
        {" "}implica el pleno y expreso consentimiento del usuario para sujetarse a los términos y
        condiciones aquí establecidos, así como a las políticas de privacidad y
        demás documentos que regulen la participación del usuario en este sistema. Si alguno de los
        términos aquí contenidos resulta incompatible con los intereses del usuario, este deberá
        abstenerse de hacer uso del sistema.{"\n\n"}
        <Text style={styles.subtitulo}>2. Uso del sistema</Text>{"\n"}
        El{" "}
        <Text style={styles.siseg}>SISEG</Text>
        {" "}está diseñado para facilitar el seguimiento del servicio social de los alumnos de la{" "}
        <Text style={styles.subtitulo}>Escuela Nacional de Medicina y Homeopatía (ENMyH)</Text>{" "}
        {" "}del{" "}<Text style={styles.subtitulo}>Instituto Politécnico Nacional (IPN)</Text>.
        {" "}El uso del sistema está restringido a estos fines, y cualquier uso no autorizado o{" "}
        indebido está prohibido.{"\n\n"}
        <Text style={styles.subtitulo}>3. Obligaciones del usuario</Text>{"\n"}
        Al utilizar el{" "}
        <Text style={styles.siseg}>SISEG</Text>
        , el usuario se compromete a utilizar el sistema únicamente para los{" "}
        fines establecidos. Al utilizar el sistema, el usuario deberá proporcionar información veraz,{" "}
        completa y actualizada. Cualquier intento de modificar, acceder sin autorización o alterar{" "}
        el funcionamiento del sistema está prohibido.{"\n\n"}
        <Text style={styles.subtitulo}>4. Propiedad Intelectual</Text>{"\n"}
        Todos los contenidos del{" "}
        <Text style={styles.siseg}>SISEG</Text>
        , incluyendo textos, imágenes, gráficos y software, son propiedad del{" "}
        <Text style={styles.subtitulo}>IPN</Text>{" "}
        o de sus respectivos propietarios. El usuario está autorizado a utilizar el sistema{" "}
        exclusivamente para fines personales y no comerciales.{"\n\n"}
        <Text style={styles.subtitulo}>5. Responsabilidad del Usuario</Text>{"\n"}
        El usuario es responsable de mantener la confidencialidad de sus credenciales de acceso al{" "}
        sistema. El uso indebido del sistema, como el acceso no autorizado, la falsificación de{" "}
        información o el uso comercial no autorizado, resultará en la suspensión del acceso al sistema{" "}
        y puede derivar en sanciones legales.{"\n\n"}
        <Text style={styles.subtitulo}>6. Modificación de los Términos y Condiciones</Text>{"\n"}
        El{" "}
        <Text style={styles.subtitulo}>IPN</Text>{" "}
        se reserva el derecho de modificar estos términos en cualquier momento. Las modificaciones{" "}
        serán publicadas en la plataforma y entrarán en vigor inmediatamente. El uso continuado del{" "}
        sistema después de la publicación de los cambios implica la aceptación de los nuevos términos.{"\n\n"}
        <Text style={styles.subtitulo}>7. Transferencia de Datos</Text>{"\n"}
        Los datos personales recopilados a través del{" "}
        <Text style={styles.siseg}>SISEG</Text>
        {" "}podrán ser transferidos a otras dependencias del{" "}
        <Text style={styles.subtitulo}>IPN</Text>{" "}o a autoridades competentes, únicamente{" "}
        cuando sea necesario para cumplir con obligaciones legales, administrativas o para el funcionamiento{" "}
        del sistema.{"\n\n"}
        <Text style={styles.subtitulo}>8. Suspensión y Terminación del Servicio</Text>{"\n"}
        El{" "}
        <Text style={styles.subtitulo}>IPN</Text>{" "}
        se reserva el derecho de suspender o interrumpir el acceso al{" "}
        <Text style={styles.siseg}>SISEG</Text>
        {" "}en cualquier momento, ya{" "}
        sea para mantenimiento, mejoras o por razones de seguridad. El usuario no tendrá derecho a{" "}
        compensación alguna en caso de suspensión o interrupción.
      </Text>
    </Modal>
  );
}

const styles = StyleSheet.create({
  titulo: {
    fontSize: Fuentes.subtitulo,
    textAlign: "center",
    marginTop: -10,
    marginBottom: 15,
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