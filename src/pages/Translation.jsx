import React, { useState } from "react";
import { Card, Input, Button, Typography, Space, Divider, Row, Col, App, Spin, Alert, Switch, Tag, theme } from "antd";
import {
  TranslationOutlined,
  CopyOutlined,
  SnippetsOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  LoadingOutlined
} from "@ant-design/icons";
import { AIService } from "../services/ai";

const { TextArea } = Input;
const { Title, Paragraph, Text } = Typography;

export const Translation = () => {
  const { message } = App.useApp();
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [toGerman, setToGerman] = useState(true);

  const { token } = theme.useToken();

  const handlePaste = async () => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.readText) {
        message.warning("Clipboard paste API is not supported by your browser or secure context.");
        return;
      }
      
      const text = await navigator.clipboard.readText();
      if (text) {
        setSourceText(text);
        message.success("Text successfully pasted from clipboard! 📋");
      } else {
        message.info("Clipboard is empty.");
      }
    } catch (error) {
      console.error("Paste failed:", error);
      message.error("Unable to access clipboard. Please paste manually (Cmd+V / Ctrl+V).");
    }
  };

  const handleCopy = async () => {
    if (!translatedText) {
      message.info("Nothing to copy yet.");
      return;
    }
    
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) {
        message.error("Clipboard copy API is not supported.");
        return;
      }

      await navigator.clipboard.writeText(translatedText);
      message.success("Translated text copied to clipboard! 🔗");
    } catch (error) {
      console.error("Copy failed:", error);
      message.error("Failed to copy text.");
    }
  };

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      message.warning("Bitte geben Sie zuerst einen Text ein.");
      return;
    }

    setLoading(true);
    setTranslatedText("");
    setNotes("");

    try {
      const result = await AIService.quickTranslate(sourceText, toGerman);
      
      if (result) {
        setTranslatedText(typeof result.translation === "string" ? result.translation : (result.translation ? JSON.stringify(result.translation) : ""));
        setNotes(typeof result.notes === "string" ? result.notes : (result.notes ? JSON.stringify(result.notes) : ""));
        message.success("Translation complete!");
      }
    } catch (error) {
      console.error("Translation API failed:", error);
      if (error.message === "NO_API_KEY") {
        message.error("Gemini API Key missing. Please configure it in the Header settings.");
      } else {
        message.error("Fehler bei der Live-Übersetzung. Mock-Übersetzung geladen.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSourceText("");
    setTranslatedText("");
    setNotes("");
    message.info("Fields cleared.");
  };

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ textAlign: "center" }}>
        <Title level={2} style={{ fontWeight: 800, margin: 0, color: token.colorText, fontFamily: "'Space Grotesk', sans-serif" }}>
          Quick Translation Box
        </Title>
        <Paragraph type="secondary" style={{ marginTop: "6px", fontSize: "14px" }}>
          Contextual translation and grammar insights helper. Highly optimized for mobile workflows.
        </Paragraph>
      </div>

      <Card
        variant="borderless"
        style={{
          borderRadius: "16px",
          boxShadow: token.boxShadowCard,
          border: `1px solid ${token.colorBorderSecondary}`,
          background: token.colorBgContainer
        }}
        styles={{ body: { padding: "28px" } }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
          <Space size={12} align="center">
            <span style={{ fontWeight: 600, fontSize: "14px", color: toGerman ? token.colorTextDescription : token.colorText }}>
              DE ➔ EN
            </span>
            <Switch
              checked={toGerman}
              onChange={(checked) => {
                setToGerman(checked);
                setSourceText(translatedText);
                setTranslatedText(sourceText);
                setNotes("");
              }}
              checkedChildren="EN ➔ DE"
              unCheckedChildren="DE ➔ EN"
              style={{ background: "#d97706" }}
            />
            <span style={{ fontWeight: 600, fontSize: "14px", color: toGerman ? token.colorText : token.colorTextDescription }}>
              EN ➔ DE
            </span>
          </Space>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <Space>
                <span style={{ fontWeight: 700, fontSize: "14px", color: token.colorText }}>
                  {toGerman ? "English (Englisch)" : "German (Deutsch)"}
                </span>
                <Tag color="red" style={{ border: "none", fontWeight: 600 }}>Source</Tag>
              </Space>
              <Button
                type="text"
                size="small"
                icon={<SnippetsOutlined />}
                onClick={handlePaste}
                style={{
                  color: "#d97706",
                  fontWeight: 600,
                  borderRadius: "6px",
                  background: "rgba(217, 119, 6, 0.1)",
                  padding: "0 10px",
                  display: "flex",
                  alignItems: "center",
                  height: "28px"
                }}
              >
                Einfügen
              </Button>
            </div>
            
            <TextArea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder={toGerman ? "Enter English text to translate..." : "Geben Sie hier Ihren deutschen Text ein..."}
              autoSize={{ minRows: 6, maxRows: 10 }}
              style={{
                borderRadius: "12px",
                padding: "16px",
                fontSize: "15px",
                lineHeight: "1.5",
                border: `1px solid ${token.colorBorder}`,
                fontFamily: "inherit"
              }}
              maxLength={1000}
            />
            
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", padding: "0 4px" }}>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {sourceText.length} / 1000 characters
              </Text>
              {sourceText && (
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={handleClear}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  Löschen
                </Button>
              )}
            </div>
          </Col>

          <Col xs={24} md={12}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <Space>
                <span style={{ fontWeight: 700, fontSize: "14px", color: token.colorText }}>
                  {toGerman ? "German (Deutsch)" : "English (Englisch)"}
                </span>
                <Tag color="gold" style={{ border: "none", fontWeight: 600 }}>Target</Tag>
              </Space>
              
              <Button
                type="text"
                size="small"
                icon={<CopyOutlined />}
                onClick={handleCopy}
                disabled={!translatedText}
                style={{
                  color: translatedText ? "#10b981" : "#94a3b8",
                  fontWeight: 600,
                  borderRadius: "6px",
                  background: translatedText ? "rgba(16, 185, 129, 0.12)" : "rgba(255, 255, 255, 0.05)",
                  padding: "0 10px",
                  display: "flex",
                  alignItems: "center",
                  height: "28px"
                }}
              >
                Kopieren
              </Button>
            </div>

            <div
              style={{
                minHeight: "142px",
                borderRadius: "12px",
                padding: "16px",
                fontSize: "15px",
                lineHeight: "1.5",
                background: token.colorBgLayout,
                border: `1px solid ${token.colorBorderSecondary}`,
                color: translatedText ? token.colorText : token.colorTextDescription,
                whiteSpace: "pre-wrap",
                fontFamily: "inherit",
                display: "flex",
                flexDirection: "column",
                gap: "12px"
              }}
            >
              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center", justifyContent: "center", minHeight: "110px", width: "100%" }}>
                  <Spin indicator={antIcon} />
                  <Text type="secondary" style={{ fontSize: "13px" }}>Analyzing context cases...</Text>
                </div>
              ) : (
                <>
                  {translatedText ? (
                    <Text style={{ color: token.colorText, fontSize: "15px" }}>
                      {typeof translatedText === "string" ? translatedText : JSON.stringify(translatedText)}
                    </Text>
                  ) : (
                    <Text type="secondary" style={{ fontSize: "14px", color: token.colorTextDescription }}>
                      Translation will appear here automatically after translation is triggered...
                    </Text>
                  )}

                  {notes && (
                    <div
                      style={{
                        marginTop: "12px",
                        paddingTop: "12px",
                        borderTop: `1px dashed ${token.colorBorder}`,
                      }}
                    >
                      <Text strong style={{ fontSize: "12px", color: token.colorPrimary, display: "block", marginBottom: "4px" }}>
                        💡 Grammar & Context Notes:
                      </Text>
                      <Text type="secondary" style={{ fontSize: "13px", display: "block" }}>
                        {typeof notes === "string" ? notes : JSON.stringify(notes)}
                      </Text>
                    </div>
                  )}
                </>
              )}
            </div>
          </Col>
        </Row>

        <Divider style={{ margin: "24px 0" }} />

        <div style={{ display: "flex", justifyContent: "center" }}>
          <Button
            type="primary"
            size="large"
            icon={<TranslationOutlined />}
            onClick={handleTranslate}
            loading={loading}
            style={{
              height: "50px",
              borderRadius: "12px",
              fontWeight: 700,
              padding: "0 32px",
              background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
              border: "none",
              boxShadow: "0 4px 14px rgba(217, 119, 6, 0.3)",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            {toGerman ? "Translate to German (DE)" : "Translate to English (EN)"}
          </Button>
        </div>
      </Card>

      <Alert
        message={
          <div style={{ display: "flex", gap: "8px", alignItems: "baseline" }}>
            <InfoCircleOutlined style={{ color: token.colorPrimary, marginTop: "2px" }} />
            <div>
              <Text strong style={{ fontSize: "13px", color: token.colorText, display: "block" }}>
                Deep Grammar Translations:
              </Text>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                Our AI model automatically detects noun genders (der/die/das), plural endings, and formal vs. informal registers (Sie vs. du).
              </Text>
            </div>
          </div>
        }
        type="info"
        showIcon={false}
        style={{ borderRadius: "12px", border: `1px dashed ${token.colorPrimaryBorder}`, background: token.colorPrimaryBg }}
      />
    </div>
  );
};
