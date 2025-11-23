import ModalAPI, { ModalAPIRef } from "@/componentes/layout/ModalAPI";
import Boton from "@/componentes/ui/Boton";
import Likert from "@/componentes/ui/BotonRadio";
import { useAuth } from "@/context/AuthProvider";
import { postData } from "@/servicios/api";
import { Colores, Fuentes } from "@/temas/colores";
import React, { useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

type ScaleValue = 1 | 2 | 3 | 4 | 5;

type Question = {
    id: string;
    index: number;
    text: string;
    scale: "FREQ" | "AGREE";
    section: "Ambiente" | "Actividades" | "Supervision" | "Valoracion";
};

type Answers = Record<string, ScaleValue | undefined>;

const LABELS_FREQ = ["Nunca", "Rara vez", "Algunas veces", "A menudo", "Siempre"];
const LABELS_AGREE = ["Totalmente en desacuerdo", "En desacuerdo", "Neutral", "De acuerdo", "Totalmente de acuerdo"];

const QUESTIONS: Question[] = [
    { id: "ambiente_trabajo", index: 1, text: "¿Cómo consideras que es el ambiente de trabajo en la institución?", scale: "AGREE", section: "Ambiente" },
    { id: "recursos_herramientas", index: 2, text: "¿Cuentas con los recursos y herramientas necesarios para realizar tus actividades?", scale: "FREQ", section: "Ambiente" },
    { id: "lugar_seguro_comodo", index: 3, text: "¿Tu lugar de trabajo es seguro y cómodo?", scale: "AGREE", section: "Ambiente" },
    { id: "actividades_relacion_formacion", index: 4, text: "¿Las actividades que realizas están relacionadas con tu formación académica?", scale: "FREQ", section: "Actividades" },
    { id: "tareas_claras_organizadas", index: 5, text: "¿Te asignan tareas claras y organizadas?", scale: "FREQ", section: "Actividades" },
    { id: "respeto_horario_carta", index: 6, text: "¿Se respeta tu horario establecido en la carta compromiso?", scale: "FREQ", section: "Actividades" },
    { id: "recibes_orientacion_supervision", index: 7, text: "¿Recibes orientación o supervisión por parte del responsable del hospital?", scale: "FREQ", section: "Supervision" },
    { id: "responsable_disponible_resolver", index: 8, text: "¿El responsable del hospital se encuentra disponible para resolver dudas o problemas?", scale: "FREQ", section: "Supervision" },
    { id: "informan_cambios_actividades", index: 9, text: "¿Te informan oportunamente sobre cambios en tus actividades?", scale: "FREQ", section: "Supervision" },
    { id: "satisfaccion_experiencia", index: 10, text: "¿Qué tan satisfecho te sientes con tu experiencia en esta etapa del servicio social?", scale: "FREQ", section: "Valoracion" },
    { id: "recomendarias_plaza", index: 11, text: "¿Recomendarías esta plaza a otros compañeros?", scale: "AGREE", section: "Valoracion" },
    { id: "te_has_sentido_apoyado", index: 12, text: "¿Te has sentido apoyado(a) por la institución durante este mes?", scale: "FREQ", section: "Valoracion" },
];

function SectionHeader({ title }: { title: string }) {
    return <Text style={styles.seccion}>{title}</Text>;
}

export default function EncuestaSatisfaccion() {
    const { sesion, verificarToken } = useAuth();
    const { width } = useWindowDimensions();
    const esPantallaPequeña = width < 790;

    const modalRef = useRef<ModalAPIRef>(null);
    const [loading, setLoading] = useState(false);
    const [answers, setAnswers] = useState<Answers>({});
    const [errors, setErrors] = useState<Record<string, boolean>>({});

    const sections = useMemo(() => {
        return {
            Ambiente: QUESTIONS.filter((q) => q.section === "Ambiente"),
            Actividades: QUESTIONS.filter((q) => q.section === "Actividades"),
            Supervision: QUESTIONS.filter((q) => q.section === "Supervision"),
            Valoracion: QUESTIONS.filter((q) => q.section === "Valoracion"),
        };
    }, []);

    const setAnswer = (id: string, v: ScaleValue) => {
        setAnswers((prev) => ({ ...prev, [id]: v }));
        setErrors((prev) => ({ ...prev, [id]: false }));
    };

    const handleSubmit = async () => {
        verificarToken();
        
        const newErrors: Record<string, boolean> = {};
        QUESTIONS.forEach((q) => {
            if (!answers[q.id]) {
                newErrors[q.id] = true;
            }
        });

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            modalRef.current?.show(false, "Algunos campos contienen errores. Revísalos y vuelve a intentarlo.");
            return;
        }

        try {
            setLoading(true);

            const respuestasArray = QUESTIONS
                .sort((a, b) => a.index - b.index)
                .map((q) => Number(answers[q.id]) as number);

            const resp = await postData("encuesta/agregarEncuesta", {
                tk: sesion?.token,
                respuestas: respuestasArray,
            });

            if (resp?.error === 0) {
                modalRef.current?.show(true, "Encuesta enviada correctamente");
                setAnswers({});
            } else {
                modalRef.current?.show(false, "Hubo un problema al enviar tu encuesta. Inténtalo de nuevo más tarde.");
            }
        } catch (e) {
            console.error(e);
            modalRef.current?.show(false, "Error al conectar con el servidor. Inténtalo de nuevo más tarde.");
        } finally {
           setLoading (false);
        }
    };

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={[styles.contenedor, esPantallaPequeña && { maxWidth: "95%" }]}>
                <Text style={styles.titulo}>Encuesta de satisfacción</Text>
                <Text style={styles.texto}>
                    Responde a esta breve encuesta de satisfacción sobre tu servicio social. Tus respuestas son
                    completamente confidenciales y nos ayudarán a identificar áreas donde podemos mejorar para ofrecer
                    una mejor experiencia en el futuro.
                </Text>

                <SectionHeader title="Ambiente y condiciones" />
                {sections.Ambiente.map((q) => (
                    <View key={q.id} style={styles.tarjeta}>
                        <Text style={styles.tarjetaTitulo}>
                            <Text style={{ fontWeight: "700" }}>{q.index}. </Text>
                            {q.text}
                        </Text>
                        <Likert
                            valor={answers[q.id]}
                            onChange={(v: ScaleValue) => setAnswer(q.id, v)}
                            etiquetas={q.scale === "FREQ" ? LABELS_FREQ : LABELS_AGREE}
                        />
                        {errors[q.id] && <Text style={styles.error}>Esta pregunta es obligatoria</Text>}
                    </View>
                ))}

                <SectionHeader title="Actividades" />
                {sections.Actividades.map((q) => (
                    <View key={q.id} style={styles.tarjeta}>
                        <Text style={styles.tarjetaTitulo}>
                            <Text style={{ fontWeight: "700" }}>{q.index}. </Text>
                            {q.text}
                        </Text>
                        <Likert
                            valor={answers[q.id]}
                            onChange={(v: ScaleValue) => setAnswer(q.id, v)}
                            etiquetas={q.scale === "FREQ" ? LABELS_FREQ : LABELS_AGREE}
                        />
                        {errors[q.id] && <Text style={styles.error}>Esta pregunta es obligatoria</Text>}
                    </View>
                ))}

                <SectionHeader title="Supervisión y comunicación" />
                {sections.Supervision.map((q) => (
                    <View key={q.id} style={styles.tarjeta}>
                        <Text style={styles.tarjetaTitulo}>
                            <Text style={{ fontWeight: "700" }}>{q.index}. </Text>
                            {q.text}
                        </Text>
                        <Likert
                            valor={answers[q.id]}
                            onChange={(v: ScaleValue) => setAnswer(q.id, v)}
                            etiquetas={q.scale === "FREQ" ? LABELS_FREQ : LABELS_AGREE}
                        />
                        {errors[q.id] && <Text style={styles.error}>Esta pregunta es obligatoria</Text>}
                    </View>
                ))}

                <SectionHeader title="Valoración general" />
                {sections.Valoracion.map((q) => (
                    <View key={q.id} style={styles.tarjeta}>
                        <Text style={styles.tarjetaTitulo}>
                            <Text style={{ fontWeight: "700" }}>{q.index}. </Text>
                            {q.text}
                        </Text>
                        <Likert
                            valor={answers[q.id]}
                            onChange={(v: ScaleValue) => setAnswer(q.id, v)}
                            etiquetas={q.scale === "FREQ" ? LABELS_FREQ : LABELS_AGREE}
                        />
                        {errors[q.id] && <Text style={styles.error}>Esta pregunta es obligatoria</Text>}
                    </View>
                ))}

                <View style={{ marginTop: 20, alignItems: "center" }}>
                    <Boton
                        title={loading ? "Enviando…" : "Enviar encuesta"}
                        onPress={handleSubmit}
                        disabled={loading}
                    />
                </View>
            </View>

            <ModalAPI ref={modalRef} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    contenedor: {
        width: "90%",
        maxWidth: 1050,
        margin: "auto",
        padding: 24,
        borderWidth: 1,
        borderRadius: 12,
        borderColor: Colores.borde,
        backgroundColor: Colores.fondo,
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
        fontSize: Fuentes.cuerpo,
        color: Colores.textoPrincipal,
        textAlign: "justify",
        marginBottom: 14,
        opacity: 0.9,
    },
    seccion: {
        fontWeight: "600",
        fontSize: Fuentes.cuerpo,
        color: Colores.textoSecundario,
        marginTop: 10,
        marginBottom: 6,
    },
    tarjeta: {
        borderWidth: 1,
        borderColor: Colores.borde,
        borderRadius: 10,
        padding: 25,
        marginBottom: 10,
        backgroundColor: Colores.fondo,
    },
    tarjetaTitulo: {
        fontSize: Fuentes.cuerpo,
        color: Colores.textoPrincipal,
        marginBottom: 10,
    },
    error: {
        marginTop: 6,
        fontSize: Fuentes.caption,
        color: Colores.textoError,
    },
});
