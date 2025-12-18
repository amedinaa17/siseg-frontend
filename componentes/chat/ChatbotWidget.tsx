import { postData } from "@/servicios/api";
import { Colores, Fuentes } from "@/temas/colores";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from "react-native";

type Msg = { id: string; role: "user" | "bot"; text: string };

const NO_ANSWER_TEXT = "No tengo respuesta para la pregunta.";

const GREETING: Msg = {
  id: "greet",
  role: "bot",
  text: "¡Hola! Soy tu asistente virtual. Selecciona un tema o escribe tu pregunta.",
};

const FAQ_OPTIONS: { label: string; emoji: string }[] = [
  { label: "Requisitos de Inscripción", emoji: "📋" },
  { label: "Registro SIASS y Web", emoji: "💻" },
  { label: "Entrega de Calificaciones (Internado)", emoji: "📄" },
  { label: "Datos para el Donativo", emoji: "💰" },
  { label: "Curso de Inducción (Obligatorio)", emoji: "🎓" },
  { label: "Selección de Plaza (Acto Público)", emoji: "🏥" },
  { label: "Grupos de WhatsApp", emoji: "📱" },
  { label: "Problemas con vigencia IMSS", emoji: "🚑" },
];

const ChatbotWidget: React.FC<{
  endpoint?: string;
  title?: string;
}> = ({ endpoint = "chatbot/chatbotQuery", title = "Asistente SISEG" }) => {
  const { width } = useWindowDimensions();
  const esPantallaPequeña = width < 790;
  const [open, setOpen] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([GREETING]);
  const [showMenu, setShowMenu] = useState(true);
  const [awaitingAnotherQuery, setAwaitingAnotherQuery] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const noAnswerStreakRef = useRef(0);

  const resetChat = () => {
    noAnswerStreakRef.current = 0;
    setBlocked(false);
    setInput("");
    setLoading(false);
    setMsgs([GREETING]);
    setShowMenu(true);
    setAwaitingAnotherQuery(false);
  };

  const handleCloseChat = () => {
    setOpen(false);
    resetChat();
  };

  const appendMsg = (role: "user" | "bot", text: string) => {
    const m: Msg = { id: cryptoRandom(), role, text };
    setMsgs((prev) => [...prev, m]);
  };

  const scrollToEndSoon = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 40);
  };

  const normalize = (s: string) =>
    s
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const showMenuMessage = () => {
    appendMsg("bot", "Selecciona una opción del menú.");
    setShowMenu(true);
    setAwaitingAnotherQuery(false);
  };

  const askAnotherQueryPrompt = () => {
    appendMsg("bot", "¿Deseas realizar otra consulta?");
    setAwaitingAnotherQuery(true);
  };

  const handleNoAnswerRules = (answer: string) => {
    if (answer === NO_ANSWER_TEXT) {
      noAnswerStreakRef.current += 1;
    } else {
      noAnswerStreakRef.current = 0;
    }

    if (noAnswerStreakRef.current >= 3) {
      appendMsg(
        "bot",
        "Por el momento no ha sido posible brindar una respuesta adecuada a tus consultas. Para continuar con una atención adecuada, te solicitamos cerrar el chat y volver a abrirlo para reiniciar la conversación."
      );
      setBlocked(true);
      setShowMenu(false);
      setAwaitingAnotherQuery(false);
    }
  };

  const handleAnotherQueryAnswer = (val: "si" | "no") => {
    if (!awaitingAnotherQuery) return;

    if (val === "si") {
      appendMsg("user", "Sí");
      showMenuMessage();
    } else {
      appendMsg("user", "No");
      appendMsg(
        "bot",
        "De acuerdo. Si deseas realizar otra consulta, escribe “menú” para ver las opciones disponibles."
      );
      setShowMenu(false);
      setAwaitingAnotherQuery(false);
    }

    scrollToEndSoon();
  };

  const askBackend = async (question: string) => {
    const q = question.trim();
    if (!q || loading || blocked) return;

    setShowMenu(false);
    setAwaitingAnotherQuery(false);

    appendMsg("user", q);
    setLoading(true);

    try {
      const body: any = { question: q };
      const resp = await postData(endpoint, body);
      let answer = "Lo siento, no pude responder en este momento.";

      if (resp && resp.error === 0 && typeof resp.answer === "string") {
        answer = resp.answer.trim();
      } else if (resp?.message) {
        answer = String(resp.message).trim();
      }

      appendMsg("bot", answer);

      if (answer === NO_ANSWER_TEXT) {
        appendMsg("bot", "Selecciona una opción del menú.");
        setShowMenu(true);
        setAwaitingAnotherQuery(false);
      } else {
        askAnotherQueryPrompt();
      }

      handleNoAnswerRules(answer);
    } catch (e) {
      appendMsg(
        "bot",
        "Ocurrió un error al conectar con el asistente. Intenta nuevamente en un momento."
      );
      noAnswerStreakRef.current = 0;
    } finally {
      setLoading(false);
      scrollToEndSoon();
    }
  };

  const send = async () => {
    const q = input.trim();
    if (!q || blocked || loading) return;

    const qn = normalize(q);
    setInput("");

    if (awaitingAnotherQuery && (qn === "si" || qn === "sí" || qn === "no")) {
      handleAnotherQueryAnswer(qn === "no" ? "no" : "si");
      return;
    }

    if (qn === "menu" || qn === "menú") {
      appendMsg("user", q);
      showMenuMessage();
      scrollToEndSoon();
      return;
    }

    await askBackend(q);
  };

  const onPickOption = async (label: string) => {
    await askBackend(label);
  };

  useEffect(() => {
    if (open) scrollToEndSoon();
  }, [open, msgs.length]);

  const onKeyPress = (e: any) => {
    if (Platform.OS === "web" && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault?.();
      send();
    }
  };

  const optionsGrid = useMemo(() => {
    if (!showMenu || loading) return null;

    return (
      <View style={styles.optionsWrap}>
        {FAQ_OPTIONS.map((o) => (
          <TouchableOpacity
            key={o.label}
            onPress={() => onPickOption(o.label)}
            disabled={blocked || loading}
            activeOpacity={0.85}
            style={[styles.optionChip, (blocked || loading) && { opacity: 0.5 }]}
          >
            <Text allowFontScaling={false} style={styles.optionChipText}>
              {o.label} {o.emoji}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }, [blocked, loading, showMenu]);

  const yesNoRow = useMemo(() => {
    if (!awaitingAnotherQuery || loading || blocked) return null;

    return (
      <View style={styles.yesNoWrap}>
        <TouchableOpacity
          style={styles.yesBtn}
          activeOpacity={0.85}
          onPress={() => handleAnotherQueryAnswer("si")}
        >
          <Text allowFontScaling={false} style={[styles.yesNoText, styles.yesText]}>
            Sí
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.noBtn}
          activeOpacity={0.85}
          onPress={() => handleAnotherQueryAnswer("no")}
        >
          <Text allowFontScaling={false} style={[styles.yesNoText, styles.noText]}>
            No
          </Text>
        </TouchableOpacity>
      </View>
    );
  }, [awaitingAnotherQuery, loading, blocked]);

  const inputEditable = !blocked && !showMenu && !awaitingAnotherQuery && !loading;
  const sendDisabled =
    loading || blocked || showMenu || awaitingAnotherQuery || !input.trim();

  return (
    <>
      {!open && (
        <TouchableOpacity
          onPress={() => setOpen(true)}
          activeOpacity={0.9}
          style={styles.fab}
        >
          <Ionicons name="chatbubble-ellipses" size={26} color={Colores.onPrimario} />
        </TouchableOpacity>
      )}

      {open && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={5}
          style={styles.popupWrapper}
        >
          <View style={[styles.popup, { width: esPantallaPequeña ? "100%" : 360 }]}>
            <View style={styles.header}>
              <Text allowFontScaling={false} style={styles.headerTitle}>
                {title}
              </Text>

              <TouchableOpacity onPress={handleCloseChat}>
                <Ionicons name="close" size={20} color={Colores.textoPrincipal} />
              </TouchableOpacity>
            </View>

            <ScrollView
              ref={scrollRef}
              style={styles.body}
              contentContainerStyle={{ paddingBottom: 10 }}
            >
              {msgs.map((m) => (
                <View
                  key={m.id}
                  style={[
                    styles.bubble,
                    m.role === "user" ? styles.userBubble : styles.botBubble,
                  ]}
                >
                  <Text
                    selectable
                    style={[
                      styles.bubbleText,
                      m.role === "user" ? styles.userBubbleText : styles.botBubbleText,
                    ]}
                    allowFontScaling={false}
                  >
                    {m.text}
                  </Text>
                </View>
              ))}

              {yesNoRow}
              {optionsGrid}

              {loading && (
                <View style={[styles.bubble, styles.botBubble]}>
                  <Text allowFontScaling={false} style={[styles.bubbleText, styles.botBubbleText]}>
                    Pensando…
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.inputRow}>
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder={
                  blocked
                    ? "Cierra el chat para iniciar una nueva conversación"
                    : awaitingAnotherQuery
                      ? "Selecciona Sí o No…"
                      : showMenu
                        ? "Selecciona una opción del menú…"
                        : "Escribe tu pregunta…"
                }
                editable={inputEditable}
                multiline
                onKeyPress={onKeyPress}
                style={[
                  styles.textInput,
                  !inputEditable && { backgroundColor: "#F3F4F6" },
                ]}
                allowFontScaling={false}
                placeholderTextColor={Colores.textoClaro}
              />

              <TouchableOpacity
                onPress={send}
                disabled={sendDisabled}
                style={[
                  styles.sendBtn,
                  sendDisabled && { opacity: 0.5 },
                ]}
              >
                <Ionicons name="send" size={18} color={Colores.onPrimario} />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
    </>
  );
};

export default ChatbotWidget;

function cryptoRandom() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

const styles = StyleSheet.create({
  fab: {
    position: Platform.select({ web: "fixed" as any, default: "absolute" }),
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colores.primario,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      web: { zIndex: 9999, boxShadow: "0 8px 20px rgba(0,0,0,.2)" },
      default: { elevation: 6, zIndex: 999 },
    }),
  },
  popupWrapper: {
    position: Platform.select({ web: "fixed" as any, default: "absolute" }),
    right: 20,
    bottom: 20,
    ...Platform.select({ web: { zIndex: 9999 }, default: { zIndex: 999 } }),
  },
  popup: {
    maxHeight: 520,
    backgroundColor: Colores.fondo,
    borderWidth: 1,
    borderColor: Colores.borde,
    borderRadius: 12,
    overflow: "hidden",
    ...Platform.select({
      web: { boxShadow: "0 12px 28px rgba(0,0,0,.15)" },
      default: { elevation: 3 },
    }),
  },
  header: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colores.borde,
    backgroundColor: Colores.fondo,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: (Fuentes?.subtitulo as number) ?? 16,
    fontWeight: "700",
    color: Colores.textoPrincipal,
  },
  body: { padding: 12 },

  optionsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
    marginBottom: 10,
  },
  optionChip: {
    borderWidth: 1,
    borderColor: Colores.borde,
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  optionChipText: {
    fontSize: 12,
    color: Colores.textoPrincipal ?? "#111827",
    fontWeight: "600",
  },

  yesNoWrap: {
    flexDirection: "row",
    gap: 10,
    marginTop: 2,
    marginBottom: 10,
  },
  yesBtn: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colores.primario,
    justifyContent: "center",
    alignItems: "center",
  },
  noBtn: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colores.borde,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  yesNoText: { fontSize: 13, fontWeight: "700" },
  yesText: { color: Colores.onPrimario ?? "#FFFFFF" },
  noText: { color: Colores.textoPrincipal ?? "#111827" },

  bubble: {
    maxWidth: "85%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 8,
  },
  userBubble: {
    backgroundColor: "#EFE9FF",
    alignSelf: "flex-end",
    borderTopRightRadius: 4,
  },
  botBubble: {
    backgroundColor: "#F3F4F6",
    alignSelf: "flex-start",
    borderTopLeftRadius: 4,
  },
  bubbleText: { fontSize: (Fuentes?.cuerpoPrincipal as number) ?? 14 },
  userBubbleText: { color: Colores.textoPrincipal ?? "#111827" },
  botBubbleText: { color: Colores.textoPrincipal ?? "#111827" },

  inputRow: {
    flexDirection: "row",
    gap: 8,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: Colores.borde,
    backgroundColor: Colores.fondo,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 40,
    borderWidth: 1,
    borderColor: Colores.borde,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: Colores.textoPrincipal,
    backgroundColor: Colores.fondo,
    ...Platform.select({ web: { outlineStyle: "none" as any } }),
  },
  sendBtn: {
    height: 40,
    width: 40,
    borderRadius: 8,
    backgroundColor: Colores.primario,
    justifyContent: "center",
    alignItems: "center",
  },
});
