import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Speech from "expo-speech";
import { Ionicons } from "@expo/vector-icons";

import { api } from "../services/api";
import { usePortal } from "../hooks/PortalProvider";
import type { ChatMessage } from "../types";

const GREEN = "#075C45";
const LIGHT_GREEN = "#E8F5ED";

const questions = {
  en: [
    "How can I improve soil health?",
    "How can I identify crop diseases?",
    "How can I save water while farming?",
    "What should I check before using fertilizer?",
  ],
  hi: [
    "मिट्टी की सेहत कैसे सुधारें?",
    "फसल की बीमारी कैसे पहचानें?",
    "खेती में पानी कैसे बचाएं?",
    "खाद डालने से पहले क्या जांचें?",
  ],
};

export default function Chat() {
  const { language, t } = usePortal();
  const hindi = language === "hi";

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      void Speech.stop();
    };
  }, []);

  async function send(question?: string) {
    const value = (question ?? text).trim();

    if (!value || busy) return;

    const userMessage: ChatMessage = {
      role: "user",
      text: value.slice(0, 2000),
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setText("");
    setError("");
    setBusy(true);

    const history = updatedMessages.slice(-10);

    while (
      history.length > 1 &&
      history.reduce(
        (total, message) => total + message.text.length,
        0
      ) > 7500
    ) {
      history.shift();
    }

    try {
      const result = await api<{ text: string }>(
        "chatbot/message",
        {
          language,
          messages: history,
        }
      );

      if (!result.text || !result.text.trim()) {
        throw new Error("No response received from the assistant.");
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "model",
          text: result.text,
        },
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "The farming assistant is unavailable."
      );
    } finally {
      setBusy(false);
    }
  }

  function speak(message: string) {
    void Speech.stop().then(() => {
      Speech.speak(message, {
        language: hindi ? "hi-IN" : "en-IN",
        rate: 0.9,
      });
    });
  }

  function clearConversation() {
    if (busy) return;

    setMessages([]);
    setText("");
    setError("");
    void Speech.stop();
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons
              name="leaf-outline"
              size={27}
              color={GREEN}
            />
          </View>

          <View style={styles.headerText}>
            <Text style={styles.title}>
              {hindi ? "कृषि AI सहायक" : "AI Farming Assistant"}
            </Text>

            <Text style={styles.subtitle}>
              {hindi
                ? "आपका डिजिटल खेती साथी"
                : "Your digital farming companion"}
            </Text>
          </View>
        </View>

        <View style={styles.welcomeCard}>
          <View style={styles.welcomeIcon}>
            <Ionicons
              name="chatbubbles-outline"
              size={34}
              color={GREEN}
            />
          </View>

          <Text style={styles.welcomeTitle}>
            {hindi ? "नमस्ते किसान साथी!" : "Hello, Farmer!"}
          </Text>

          <Text style={styles.welcomeDescription}>
            {hindi
              ? "फसल, मिट्टी, सिंचाई, मौसम और खेती से जुड़े सवाल पूछें।"
              : "Ask questions about crops, soil, irrigation, weather and farming."}
          </Text>
        </View>

        {messages.length === 0 && (
          <View style={styles.questionsSection}>
            <Text style={styles.sectionTitle}>
              {hindi ? "कुछ उपयोगी सवाल" : "Suggested questions"}
            </Text>

            {questions[hindi ? "hi" : "en"].map((item) => (
              <Pressable
                key={item}
                style={styles.questionCard}
                disabled={busy}
                onPress={() => {
                  void send(item);
                }}
              >
                <Ionicons
                  name="help-circle-outline"
                  size={21}
                  color={GREEN}
                />

                <Text style={styles.questionText}>
                  {item}
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={GREEN}
                />
              </Pressable>
            ))}
          </View>
        )}

        {messages.map((message, index) => {
          const isUser = message.role === "user";

          return (
            <View
              key={index}
              style={[
                styles.messageRow,
                isUser && styles.userMessageRow,
              ]}
            >
              {!isUser && (
                <View style={styles.avatar}>
                  <Ionicons
                    name="leaf"
                    size={17}
                    color={GREEN}
                  />
                </View>
              )}

              <View
                style={[
                  styles.messageBubble,
                  isUser
                    ? styles.userBubble
                    : styles.assistantBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageSender,
                    isUser && styles.whiteText,
                  ]}
                >
                  {isUser
                    ? hindi
                      ? "आप"
                      : "You"
                    : t("home.brand")}
                </Text>

                <Text
                  style={[
                    styles.messageBody,
                    isUser && styles.whiteText,
                  ]}
                >
                  {message.text}
                </Text>

                {!isUser && (
                  <Pressable
                    style={styles.listenButton}
                    onPress={() => speak(message.text)}
                  >
                    <Ionicons
                      name="volume-medium-outline"
                      size={19}
                      color={GREEN}
                    />

                    <Text style={styles.listenText}>
                      {hindi ? "जवाब सुनें" : "Listen"}
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          );
        })}

        {busy && (
          <View style={styles.loadingBox}>
            <ActivityIndicator
              size="small"
              color={GREEN}
            />

            <Text style={styles.loadingText}>
              {hindi
                ? "जवाब तैयार हो रहा है..."
                : "Preparing your answer..."}
            </Text>
          </View>
        )}

        {error !== "" && (
          <View style={styles.errorCard}>
            <Ionicons
              name="alert-circle-outline"
              size={21}
              color="#B42318"
            />

            <View style={styles.errorContent}>
              <Text style={styles.errorText}>
                {t(error)}
              </Text>

              <Text style={styles.errorHelp}>
                {hindi
                  ? "कनेक्शन जांचें और फिर कोशिश करें।"
                  : "Check the connection and try again."}
              </Text>
            </View>
          </View>
        )}

        {messages.length > 0 && (
          <Pressable
            style={styles.clearButton}
            disabled={busy}
            onPress={clearConversation}
          >
            <Ionicons
              name="trash-outline"
              size={18}
              color="#68766D"
            />

            <Text style={styles.clearText}>
              {hindi
                ? "बातचीत साफ करें"
                : "Clear conversation"}
            </Text>
          </Pressable>
        )}

        <View style={styles.noticeCard}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#68766D"
          />

          <Text style={styles.noticeText}>
            {hindi
              ? "यह सामान्य जानकारी है। कीटनाशक, खाद या सरकारी योजनाओं से जुड़े महत्वपूर्ण निर्णयों की पुष्टि कृषि विशेषज्ञ या आधिकारिक स्रोत से करें।"
              : "This assistant provides general information. Verify pesticide, fertilizer and government scheme advice with local agricultural experts or official sources."}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder={
            hindi
              ? "अपना सवाल लिखें..."
              : "Ask your farming question..."
          }
          placeholderTextColor="#87968C"
          multiline
          maxLength={2000}
          editable={!busy}
        />

        <Pressable
          style={[
            styles.sendButton,
            (busy || !text.trim()) && styles.disabledButton,
          ]}
          disabled={busy || !text.trim()}
          onPress={() => {
            void send();
          }}
        >
          <Ionicons
            name="send"
            size={21}
            color="#FFFFFF"
          />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAF7",
  },

  scroll: {
    flex: 1,
  },

  content: {
    padding: 18,
    paddingBottom: 30,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },

  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: LIGHT_GREEN,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 23,
    fontWeight: "800",
    color: "#073E30",
  },

  subtitle: {
    fontSize: 16,
    color: "#69776E",
    marginTop: 4,
  },

  welcomeCard: {
    backgroundColor: "#E8F5EC",
    padding: 24,
    borderRadius: 24,
    alignItems: "center",
    marginBottom: 25,
  },

  welcomeIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  welcomeTitle: {
    fontSize: 23,
    fontWeight: "800",
    color: "#084C38",
    textAlign: "center",
    marginBottom: 8,
  },

  welcomeDescription: {
    fontSize: 15,
    lineHeight: 24,
    color: "#53685C",
    textAlign: "center",
  },

  questionsSection: {
    marginBottom: 22,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#103F32",
    marginBottom: 14,
  },

  questionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E9E1",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },

  questionText: {
    flex: 1,
    fontSize: 16,
    color: "#234C3E",
    marginHorizontal: 12,
  },

  messageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },

  userMessageRow: {
    justifyContent: "flex-end",
  },

  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: LIGHT_GREEN,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  messageBubble: {
    maxWidth: "84%",
    borderRadius: 18,
    padding: 15,
  },

  userBubble: {
    backgroundColor: GREEN,
    borderBottomRightRadius: 4,
  },

  assistantBubble: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E9E3",
    borderBottomLeftRadius: 4,
  },

  messageSender: {
    fontSize: 14,
    fontWeight: "800",
    color: GREEN,
    marginBottom: 7,
  },

  messageBody: {
    fontSize: 15,
    lineHeight: 23,
    color: "#203E33",
  },

  whiteText: {
    color: "#FFFFFF",
  },

  listenButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },

  listenText: {
    color: GREEN,
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 6,
  },

  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },

  loadingText: {
    fontSize: 16,
    color: "#61766B",
    marginLeft: 10,
  },

  errorCard: {
    flexDirection: "row",
    backgroundColor: "#FFF0EE",
    borderRadius: 14,
    padding: 15,
    marginBottom: 16,
  },

  errorContent: {
    flex: 1,
    marginLeft: 10,
  },

  errorText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#B42318",
  },

  errorHelp: {
    fontSize: 14,
    color: "#8F504A",
    marginTop: 5,
  },

  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    padding: 12,
    marginVertical: 12,
  },

  clearText: {
    color: "#66736E",
    fontWeight: "600",
    marginLeft: 7,
  },

  noticeCard: {
    flexDirection: "row",
    backgroundColor: "#EDF1ED",
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
  },

  noticeText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 24,
    color: "#647168",
    marginLeft: 9,
  },

  inputArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E4EBE5",
    paddingHorizontal: 15,
    paddingVertical: 12,
  },

  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 110,
    backgroundColor: "#F3F7F3",
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 15,
    color: "#193D30",
    textAlignVertical: "top",
    marginRight: 10,
  },

  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
  },

  disabledButton: {
    opacity: 0.45,
  },
});