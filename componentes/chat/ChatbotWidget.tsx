import { useAuth } from "@/context/AuthProvider";
import { postData } from "@/servicios/api";
import { Colores, Fuentes } from "@/temas/colores";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type Msg = { id: string; role: "user" | "bot"; text: string };

const ChatbotWidget: React.FC<{
  endpoint?: string;    
  title?: string;      
}> = ({ endpoint = "chatbot/chatbotQuery", title = "Asistente SISEG" }) => {
  const { sesion } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      id: "greet",
      role: "bot",
      text:
        "¡Hola! Soy tu asistente sobre el documento de servicio social. Responderé solo con base en el documento. 😊",
    },
  ]);

  const scrollRef = useRef<ScrollView>(null);

  const send = async () => {
    const q = input.trim();
    if (!q || loading) return;

    const userMsg: Msg = { id: cryptoRandom(), role: "user", text: q };
    setMsgs((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const body: any = { question: q };
      const resp = await postData(endpoint, body); 
      let answer = "Lo siento, no pude responder en este momento.";

      if (resp && resp.error === 0 && typeof resp.answer === "string") {
        answer = resp.answer.trim();
      } else if (resp?.message) {
        answer = resp.message;
      }

      const botMsg: Msg = { id: cryptoRandom(), role: "bot", text: answer };
      setMsgs((m) => [...m, botMsg]);
    } catch (e) {
      const botMsg: Msg = {
        id: cryptoRandom(),
        role: "bot",
        text:
          "Ocurrió un error al conectar con el asistente. Intenta nuevamente en un momento.",
      };
      setMsgs((m) => [...m, botMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 20);
    }
  };

  useEffect(() => {
    if (open) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    }
  }, [open, msgs.length]);

  const onKeyPress = (e: any) => {
    if (Platform.OS === "web" && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault?.();
      send();
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen((v) => !v)}
        activeOpacity={0.9}
        style={styles.fab}
      >
        <Ionicons name={open ? "close" : "chatbubble-ellipses"} size={26} color="#fff" />
      </TouchableOpacity>

      {open && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={80}
          style={styles.popupWrapper}
        >
          <View style={styles.popup}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{title}</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Ionicons name="close" size={20} color={Colores.textoPrincipal} />
              </TouchableOpacity>
            </View>

            <ScrollView
              ref={scrollRef}
              style={styles.body}
              contentContainerStyle={{ paddingBottom: 8 }}
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
                  >
                    {m.text}
                  </Text>
                </View>
              ))}
              {loading && (
                <View style={[styles.bubble, styles.botBubble]}>
                  <Text style={[styles.bubbleText, styles.botBubbleText]}>Pensando…</Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.inputRow}>
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Escribe tu pregunta…"
                multiline
                onKeyPress={onKeyPress}
                style={styles.textInput}
                placeholderTextColor={Colores.textoClaro}
              />
              <TouchableOpacity
                onPress={send}
                disabled={loading || !input.trim()}
                style={[styles.sendBtn, (loading || !input.trim()) && { opacity: 0.5 }]}
              >
                <Ionicons name="send" size={18} color="#fff" />
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
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colores.textoInfo ?? "#6b4ad8",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      web: { zIndex: 9999, boxShadow: "0 8px 20px rgba(0,0,0,.2)" },
      default: { elevation: 6, zIndex: 999 },
    }),
  },
  popupWrapper: {
    position: Platform.select({ web: "fixed" as any, default: "absolute" }),
    right: 24,
    bottom: 90,
    ...Platform.select({ web: { zIndex: 9999 }, default: { zIndex: 999 } }),
  },
  popup: {
    width: 360,
    maxHeight: 520,
    backgroundColor: Colores.fondo ?? "#fff",
    borderWidth: 1,
    borderColor: Colores.borde ?? "#e5e7eb",
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
    borderBottomColor: Colores.borde ?? "#e5e7eb",
    backgroundColor: Colores.fondo ?? "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: (Fuentes?.subtitulo as number) ?? 16,
    fontWeight: "700",
    color: Colores.textoPrincipal ?? "#111827",
  },
  body: {
    padding: 12,
  },
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
  bubbleText: {
    fontSize: (Fuentes?.cuerpoPrincipal as number) ?? 14,
  },
  userBubbleText: {
    color: Colores.textoPrincipal ?? "#111827",
  },
  botBubbleText: {
    color: Colores.textoPrincipal ?? "#111827",
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: Colores.borde ?? "#e5e7eb",
    backgroundColor: Colores.fondo ?? "#fff",
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 110,
    borderWidth: 1,
    borderColor: Colores.borde ?? "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: Colores.textoPrincipal ?? "#111827",
    backgroundColor: "#fff",
    ...Platform.select({ web: { outlineStyle: "none" as any } }),
  },
  sendBtn: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: Colores.textoInfo ?? "#6b4ad8",
    justifyContent: "center",
    alignItems: "center",
  },
});
