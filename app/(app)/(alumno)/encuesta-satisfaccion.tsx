import ModalAPI, { ModalAPIRef } from "@/componentes/layout/ModalAPI";
import Boton from "@/componentes/ui/Boton";
import { useAuth } from "@/context/AuthProvider";
import { postData } from "@/servicios/api";
import { Colores, Fuentes } from "@/temas/colores";
import React, { useMemo, useRef, useState } from "react";
import {
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from "react-native";

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
const LABELS_AGREE = [
    "Totalmente en desacuerdo",
    "En desacuerdo",
    "Neutral",
    "De acuerdo",
    "Totalmente de acuerdo",
];

const QUESTIONS: Question[] = [
    // Ambiente y condiciones
    { id: "ambiente_trabajo", index: 1, text: "¿Cómo consideras que es el ambiente de trabajo en la institución?", scale: "AGREE", section: "Ambiente" },
    { id: "recursos_herramientas", index: 2, text: "¿Cuentas con los recursos y herramientas necesarios para realizar tus actividades?", scale: "FREQ", section: "Ambiente" },
    { id: "lugar_seguro_comodo", index: 3, text: "¿Tu lugar de trabajo es seguro y cómodo?", scale: "AGREE", section: "Ambiente" },

    // Actividades
    { id: "actividades_relacion_formacion", index: 4, text: "¿Las actividades que realizas están relacionadas con tu formación académica?", scale: "FREQ", section: "Actividades" },
    { id: "tareas_claras_organizadas", index: 5, text: "¿Te asignan tareas claras y organizadas?", scale: "FREQ", section: "Actividades" },
    { id: "respeto_horario_carta", index: 6, text: "¿Se respeta tu horario establecido en la carta compromiso?", scale: "FREQ", section: "Actividades" },

    // Supervisión y comunicación
    { id: "recibes_orientacion_supervision", index: 7, text: "¿Recibes orientación o supervisión por parte del responsable del hospital?", scale: "FREQ", section: "Supervision" },
    { id: "responsable_disponible_resolver", index: 8, text: "¿El responsable del hospital se encuentra disponible para resolver dudas o problemas?", scale: "FREQ", section: "Supervision" },
    { id: "informan_cambios_actividades", index: 9, text: "¿Te informan oportunamente sobre cambios en tus actividades?", scale: "FREQ", section: "Supervision" },

    // Valoración general
    { id: "satisfaccion_experiencia", index: 10, text: "¿Qué tan satisfecho te sientes con tu experiencia en esta etapa del servicio social?", scale: "FREQ", section: "Valoracion" },
    { id: "recomendarias_plaza", index: 11, text: "¿Recomendarías esta plaza a otros compañeros?", scale: "AGREE", section: "Valoracion" },
    { id: "te_has_sentido_apoyado", index: 12, text: "¿Te has sentido apoyado(a) por la institución durante este mes?", scale: "FREQ", section: "Valoracion" },
];


function SectionHeader({ title }: { title: string }) {
    return (
        <Text style={styles.sectionHeader}>{title}</Text>
    );
}

function LikertRow({
    value,
    onChange,
    labels,
    compact,
}: {
    value?: ScaleValue;
    onChange: (v: ScaleValue) => void;
    labels: string[];
    compact: boolean;
}) {
    return (
        <View style={{ marginTop: 10 }}>
            <View style={[styles.dotsRow, compact && { justifyContent: "space-between" }]}>
                {[1, 2, 3, 4, 5].map((v) => {
                    const active = value === v;
                    return (
                        <Pressable
                            key={v}
                            onPress={() => onChange(v as ScaleValue)}
                            style={[
                                styles.dot,
                                active && styles.dotActive,
                                compact && { marginHorizontal: 6 },
                            ]}
                            android_ripple={{ color: "#00000011", borderless: true }}
                        >
                            <View style={[styles.dotInner, active && styles.dotInnerActive]} />
                        </Pressable>
                    );
                })}
            </View>

            <View style={[styles.labelsRow, compact && { gap: 6 }]}>
                {labels.map((t, i) => (
                    <Text key={i} style={[styles.label, compact && { maxWidth: 70, textAlign: "center" }]}>
                        {t}
                    </Text>
                ))}
            </View>
        </View>
    );
}

function QuestionItem({
    q,
    answer,
    onChange,
    isSmall,
    showRequired,
}: {
    q: Question;
    answer?: ScaleValue;
    onChange: (id: string, v: ScaleValue) => void;
    isSmall: boolean;
    showRequired?: boolean;
}) {
    const labels = q.scale === "FREQ" ? LABELS_FREQ : LABELS_AGREE;
    return (
        <View style={styles.questionCard}>
            <Text style={styles.questionTitle}>
                <Text style={{ fontWeight: "700" }}>{q.index}. </Text>
                {q.text}
            </Text>
            <LikertRow
                value={answer}
                onChange={(v) => onChange(q.id, v)}
                labels={labels}
                compact={isSmall}
            />
            {showRequired && !answer && (
                <Text style={styles.requiredText}>Este campo es obligatorio.</Text>
            )}
        </View>
    );
}

export default function EncuestaSatisfaccion() {
    const { sesion } = useAuth();
    const { width } = useWindowDimensions();
    const esPantallaPequeña = width < 700;

    const modalRef = useRef<ModalAPIRef>(null);
    const [loading, setLoading] = useState(false);

    const [answers, setAnswers] = useState<Answers>({});

    const sections = useMemo(() => {
        return {
            Ambiente: QUESTIONS.filter((q) => q.section === "Ambiente"),
            Actividades: QUESTIONS.filter((q) => q.section === "Actividades"),
            Supervision: QUESTIONS.filter((q) => q.section === "Supervision"),
            Valoracion: QUESTIONS.filter((q) => q.section === "Valoracion"),
        };
    }, []);

    const setAnswer = (id: string, v: ScaleValue) =>
        setAnswers((prev) => ({ ...prev, [id]: v }));

    const faltantes = useMemo(() => {
        return QUESTIONS.filter((q) => !answers[q.id]).map((q) => q.id);
    }, [answers]);

    const handleSubmit = async () => {
        const faltantesIds = QUESTIONS.filter((q) => !answers[q.id]).map((q) => q.id);
        if (faltantesIds.length > 0) {
            modalRef.current?.show(false, "Por favor responde todas las preguntas antes de enviar.");
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
                modalRef.current?.show(true, "¡Gracias! Tu encuesta fue enviada.");
                setAnswers({});
            } else {
                modalRef.current?.show(false, resp?.message || "No se pudo enviar la encuesta.");
            }
        } catch (e) {
            console.error(e);
            modalRef.current?.show(false, "Error de conexión al enviar la encuesta.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View
                style={[
                    styles.container,
                    esPantallaPequeña && { maxWidth: "95%" },
                ]}
            >
                <Text style={styles.title}>Encuesta de Satisfacción</Text>

                <Text style={styles.subtitle}>
                    Responde esta breve encuesta. Tus respuestas son confidenciales y nos
                    permiten detectar áreas de mejora.
                </Text>

                <SectionHeader title="Ambiente y condiciones" />
                {sections.Ambiente.map((q) => (
                    <QuestionItem
                        key={q.id}
                        q={q}
                        answer={answers[q.id] as ScaleValue | undefined}
                        onChange={setAnswer}
                        isSmall={esPantallaPequeña}
                        showRequired
                    />
                ))}

                <SectionHeader title="Actividades" />
                {sections.Actividades.map((q) => (
                    <QuestionItem
                        key={q.id}
                        q={q}
                        answer={answers[q.id] as ScaleValue | undefined}
                        onChange={setAnswer}
                        isSmall={esPantallaPequeña}
                        showRequired
                    />
                ))}

                <SectionHeader title="Supervisión y comunicación" />
                {sections.Supervision.map((q) => (
                    <QuestionItem
                        key={q.id}
                        q={q}
                        answer={answers[q.id] as ScaleValue | undefined}
                        onChange={setAnswer}
                        isSmall={esPantallaPequeña}
                        showRequired
                    />
                ))}

                <SectionHeader title="Valoración general" />
                {sections.Valoracion.map((q) => (
                    <QuestionItem
                        key={q.id}
                        q={q}
                        answer={answers[q.id] as ScaleValue | undefined}
                        onChange={setAnswer}
                        isSmall={esPantallaPequeña}
                        showRequired
                    />
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
    container: {
        width: "90%",
        maxWidth: 1050,
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
    title: {
        fontSize: Fuentes.titulo,
        fontWeight: "700",
        color: Colores.textoPrincipal,
        textAlign: "center",
        marginBottom: 6,
    },
    subtitle: {
        fontSize: Fuentes.cuerpo,
        color: Colores.textoPrincipal,
        textAlign: "justify",
        marginBottom: 14,
        opacity: 0.9,
    },
    sectionHeader: {
        fontWeight: "600",
        fontSize: Fuentes.cuerpo,
        color: Colores.textoSecundario,
        marginTop: 10,
        marginBottom: 6,
    },
    questionCard: {
        borderWidth: 1,
        borderColor: Colores.borde,
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
        backgroundColor: Colores.fondo,
    },
    questionTitle: {
        fontSize: Fuentes.cuerpo,
        color: Colores.textoPrincipal,
    },
    dotsRow: {
        marginTop: 10,
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
    },
    dot: {
        width: 28,
        height: 28,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: Colores.borde,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
    },
    dotActive: {
        borderColor: Colores.textoSecundario,
        backgroundColor: "#fff",
    },
    dotInner: {
        width: 10,
        height: 10,
        borderRadius: 6,
        backgroundColor: "transparent",
    },
    dotInnerActive: {
        backgroundColor: Colores.textoSecundario,
    },
    labelsRow: {
        marginTop: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 8,
    },
    label: {
        flex: 1,
        fontSize: Fuentes.caption,
        color: Colores.textoClaro,
    },
    requiredText: {
        marginTop: 6,
        fontSize: Fuentes.caption,
        color: Colores.textoError,
    },
});
