import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Input,
  Button,
  Select,
  Typography,
  Space,
  Avatar,
  Spin,
  Tooltip,
  theme,
  Divider,
  message
} from "antd";
import {
  SendOutlined,
  SoundOutlined,
  KeyOutlined,
  LockOutlined,
  ReloadOutlined,
  RobotOutlined,
  UserOutlined,
  DeleteOutlined
} from "@ant-design/icons";
import { AIService } from "../services/ai";

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

const LEVEL_GREETINGS = {
  A1: "Hallo! Ich bin dein telc A1 Deutschlehrer. Wie heißt du und wie geht es dir heute? (Tell me your name and how you are!)",
  A2: "Hallo! Schön, dass du heute Deutsch lernst. Was hast du heute Schönes gemacht? (Let's chat about your day!)",
  B1: "Guten Tag! Willkommen zurück zum telc B1 Training. Welches Thema möchtest du heute besprechen? Möchtest du einen Brief üben oder einfach plaudern?",
  B2: "Guten Tag! Lassen Sie uns heute eine telc B2 Diskussionsaufgabe simulieren. Über welches aktuelle Thema möchten Sie sprechen? Z. B. Umweltschutz, Homeoffice oder gesunde Ernährung?",
  C1: "Guten Tag! Willkommen zum telc C1 Hochschule Sprachtraining. Wir können heute die Struktur einer akademischen Grafikbeschreibung üben oder über gesellschaftliche Streitfragen debattieren. Welches Thema wählen Sie?",
  C2: "Herzlich willkommen zur C2-Meisterklasse. Lassen Sie uns über komplexe philosophische oder politische Fragestellungen debattieren. Welchen Diskurs möchten Sie heute führen?"
};

export const AIConvo = () => {
  const [apiKey, setApiKey] = useState(() => AIService.getAPIKey());
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [level, setLevel] = useState("B2");
  
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const [speakingWord, setSpeakingWord] = useState(null);

  const { token } = theme.useToken();
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (apiKey) {
      setMessages([
        {
          role: "model",
          text: LEVEL_GREETINGS[level] || LEVEL_GREETINGS.B2,
          timestamp: new Date()
        }
      ]);
    }
  }, [level, apiKey]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, sending]);

  const handleSaveAPIKey = () => {
    if (!apiKeyInput.trim()) {
      message.error("Bitte geben Sie einen gültigen API-Key ein.");
      return;
    }
    const saved = AIService.saveAPIKey(apiKeyInput.trim());
    if (saved) {
      setApiKey(apiKeyInput.trim());
      message.success("API Key gespeichert! Viel Spaß beim Deutschlernen! 🚀");
    } else {
      message.error("Fehler beim Speichern des API-Keys.");
    }
  };

  const handleDeleteAPIKey = () => {
    if (window.confirm("Möchten Sie Ihren API-Key wirklich löschen?")) {
      AIService.deleteAPIKey();
      setApiKey("");
      setApiKeyInput("");
      setMessages([]);
      message.info("API Key gelöscht.");
    }
  };

  const handleSpeak = (text, msgIdx) => {
    if (!window.speechSynthesis) {
      message.warning("Text-to-Speech wird von Ihrem Browser nicht unterstützt.");
      return;
    }

    window.speechSynthesis.cancel();

    if (speakingWord === msgIdx) {
      setSpeakingWord(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "de-DE";
    
    const voices = window.speechSynthesis.getVoices();
    const deVoice = voices.find(v => v.lang.startsWith("de") || v.lang.includes("DE"));
    if (deVoice) {
      utterance.voice = deVoice;
    }

    utterance.onend = () => {
      setSpeakingWord(null);
    };

    utterance.onerror = () => {
      setSpeakingWord(null);
    };

    setSpeakingWord(msgIdx);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || sending) return;

    const userText = inputValue.trim();
    setInputValue("");
    setSending(true);

    const updatedMessages = [
      ...messages,
      { role: "user", text: userText, timestamp: new Date() }
    ];
    setMessages(updatedMessages);

    try {
      const response = await AIService.sendMessageToTutor(
        updatedMessages,
        userText,
        level
      );

      setMessages((prev) => [
        ...prev,
        { role: "model", text: response, timestamp: new Date() }
      ]);
    } catch (error) {
      console.error("AI convo response error:", error);
      if (error.message === "NO_API_KEY") {
        setApiKey("");
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            text: "Entschuldigung, es gab ein Verbindungsproblem mit dem Gemini Server. Bitte versuchen Sie es erneut.",
            timestamp: new Date()
          }
        ]);
      }
    } finally {
      setSending(false);
    }
  };

  const handleResetChat = () => {
    if (window.confirm("Gesprächsverlauf zurücksetzen?")) {
      setMessages([
        {
          role: "model",
          text: LEVEL_GREETINGS[level],
          timestamp: new Date()
        }
      ]);
      message.success("Gesprächsverlauf zurückgesetzt.");
    }
  };

  if (!apiKey) {
    return (
      <div style={{ maxWidth: "500px", margin: "40px auto", padding: "0 16px" }}>
        <Card
          variant="borderless"
          style={{
            borderRadius: "20px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
            border: `1px solid ${token.colorBorderSecondary}`,
            textAlign: "center",
            background: token.colorBgContainer
          }}
          styles={{ body: { padding: "40px 32px" } }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "rgba(217, 119, 6, 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px auto",
            }}
          >
            <LockOutlined style={{ fontSize: "30px", color: "#d97706" }} />
          </div>

          <Title level={3} style={{ fontWeight: 800, margin: "0 0 12px 0", fontFamily: "'Space Grotesk', sans-serif" }}>
            AI Tutor Setup
          </Title>
          
          <Paragraph type="secondary" style={{ fontSize: "14px", marginBottom: "28px" }}>
            To practice conversational German serverlessly, paste your personal <strong>Gemini API Key</strong> below. 
            It is stored encrypted inside your local sandbox browser and never sent to our servers.
          </Paragraph>

          <Space orientation="vertical" size={16} style={{ width: "100%" }}>
            <Input.Password
              prefix={<KeyOutlined style={{ color: token.colorTextDescription }} />}
              placeholder="AIzaSy..."
              size="large"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              style={{ borderRadius: "10px" }}
            />

            <Button
              type="primary"
              size="large"
              block
              onClick={handleSaveAPIKey}
              style={{
                height: "48px",
                borderRadius: "10px",
                fontWeight: 700,
                background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
                border: "none",
                boxShadow: "0 4px 12px rgba(217, 119, 6, 0.3)"
              }}
            >
              Start Conversation
            </Button>
          </Space>

          <Divider style={{ margin: "24px 0" }} />
          
          <Text type="secondary" style={{ fontSize: "11px", display: "block" }}>
            Don't have a key? Get a free API Key instantly from the{" "}
            <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" style={{ color: "#d97706", fontWeight: 600 }}>
              Google AI Studio
            </a>.
          </Text>
        </Card>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        height: "calc(100vh - 128px)",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <Card
        variant="borderless"
        style={{
          borderRadius: "16px",
          boxShadow: token.boxShadowCard,
          border: `1px solid ${token.colorBorderSecondary}`,
          background: token.colorBgContainer
        }}
        styles={{ body: { padding: "12px 20px" } }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <Space>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: "rgba(217, 119, 6, 0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <RobotOutlined style={{ fontSize: "18px", color: "#d97706" }} />
            </div>
            <div>
              <Text strong style={{ fontSize: "14px", display: "block", color: token.colorText }}>
                Tutor Lukas (AI)
              </Text>
              <Text type="secondary" style={{ fontSize: "11px", display: "block" }}>
                TELC Exam German Assistant
              </Text>
            </div>
          </Space>

          <Space size={12}>
            <Select
              value={level}
              onChange={setLevel}
              style={{ width: "110px" }}
              styles={{ popup: { root: { borderRadius: "8px" } } }}
            >
              {Object.keys(LEVEL_GREETINGS).map((lvl) => (
                <Option key={lvl} value={lvl}>
                  Level {lvl}
                </Option>
              ))}
            </Select>

            <Tooltip title="Verlauf leeren">
              <Button
                type="text"
                shape="circle"
                icon={<ReloadOutlined style={{ color: token.colorTextDescription }} />}
                onClick={handleResetChat}
              />
            </Tooltip>
            
            <Tooltip title="Key verwalten">
              <Button
                type="text"
                shape="circle"
                danger
                icon={<DeleteOutlined />}
                onClick={handleDeleteAPIKey}
              />
            </Tooltip>
          </Space>
        </div>
      </Card>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          borderRadius: "16px",
          border: `1px solid ${token.colorBorderSecondary}`,
          background: token.colorBgContainer,
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          minHeight: "200px"
        }}
      >
        {messages.map((msg, index) => {
          const isAI = msg.role === "model";
          
          return (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: isAI ? "flex-start" : "flex-end",
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  maxWidth: "80%",
                  flexDirection: isAI ? "row" : "row-reverse",
                  alignItems: "flex-start"
                }}
              >
                <Avatar
                  size={32}
                  style={{
                    background: isAI 
                      ? "rgba(217, 119, 6, 0.12)" 
                      : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                  icon={isAI ? <RobotOutlined style={{ color: "#d97706" }} /> : <UserOutlined />}
                />

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: isAI ? "0px 16px 16px 16px" : "16px 0px 16px 16px",
                      background: isAI 
                        ? token.colorBgElevated 
                        : "#d97706",
                      color: isAI ? token.colorText : "#ffffff",
                      boxShadow: isAI ? "0 2px 8px rgba(0,0,0,0.04)" : "0 4px 12px rgba(217, 119, 6, 0.25)",
                      fontSize: "14px",
                      lineHeight: "1.5",
                      position: "relative"
                    }}
                  >
                    <Typography.Paragraph
                      style={{
                        margin: 0,
                        color: "inherit",
                        whiteSpace: "pre-wrap",
                        fontSize: "14px"
                      }}
                    >
                      {msg.text}
                    </Typography.Paragraph>
                  </div>
                  
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: isAI ? "flex-start" : "flex-end",
                      gap: "8px",
                      padding: "0 4px"
                    }}
                  >
                    {isAI && (
                      <Button
                        type="link"
                        size="small"
                        icon={<SoundOutlined />}
                        onClick={() => handleSpeak(msg.text, index)}
                        style={{
                          padding: 0,
                          fontSize: "11px",
                          color: speakingWord === index ? "#10b981" : token.colorTextDescription,
                          height: "auto",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {speakingWord === index ? "Spricht..." : "Listen (Vorlesen)"}
                      </Button>
                    )}
                    <span style={{ fontSize: "10px", color: token.colorTextDescription }}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {sending && (
          <div style={{ display: "flex", justifyContent: "flex-start", width: "100%" }}>
            <div style={{ display: "flex", gap: "10px", maxWidth: "80%", alignItems: "center" }}>
              <Avatar
                size={32}
                style={{ background: "rgba(217, 119, 6, 0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}
                icon={<RobotOutlined style={{ color: "#d97706" }} />}
              />
              <Card
                variant="borderless"
                style={{
                  borderRadius: "0px 16px 16px 16px",
                  background: token.colorBgElevated,
                  padding: "4px 8px"
                }}
                styles={{ body: { padding: "8px 12px" } }}
              >
                <Space size={8}>
                  <Spin size="small" />
                  <Text type="secondary" style={{ fontSize: "12px" }}>Tutor Lukas schreibt...</Text>
                </Space>
              </Card>
            </div>
          </div>
        )}
        
        <div ref={chatEndRef} />
      </div>

      <Card
        variant="borderless"
        style={{
          borderRadius: "16px",
          boxShadow: token.boxShadowCard,
          border: `1px solid ${token.colorBorderSecondary}`,
          background: token.colorBgContainer
        }}
        styles={{ body: { padding: "12px 16px" } }}
      >
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={handleSendMessage}
            placeholder={`Schreiben Sie eine Nachricht auf ${level}-Deutsch...`}
            size="large"
            disabled={sending}
            style={{
              borderRadius: "10px",
              border: `1px solid ${token.colorBorder}`,
              fontSize: "14px"
            }}
          />
          <Button
            type="primary"
            size="large"
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || sending}
            style={{
              borderRadius: "10px",
              background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
              border: "none",
              boxShadow: "0 4px 12px rgba(217, 119, 6, 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "46px",
              height: "40px"
            }}
          />
        </div>
      </Card>
    </div>
  );
};

export default AIConvo;
