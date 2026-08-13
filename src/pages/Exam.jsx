import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Tabs,
  Button,
  Input,
  Select,
  Typography,
  Space,
  Row,
  Col,
  Alert,
  Spin,
  Skeleton,
  App,
  theme,
  Empty,
  Statistic,
  Divider,
  Radio,
  Tag
} from "antd";
import {
  BookOutlined,
  SoundOutlined,
  FormOutlined,
  AudioOutlined,
  AudioMutedOutlined,
  PlayCircleOutlined,
  SendOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  LockOutlined,
  KeyOutlined,
  InfoCircleOutlined,
  LoadingOutlined
} from "@ant-design/icons";
import { AIService } from "../services/ai";

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

export const Exam = () => {
  const { message } = App.useApp();
  const [apiKey, setApiKey] = useState(() => AIService.getAPIKey());
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [level, setLevel] = useState(() => localStorage.getItem("CURRENT_LEVEL") || "B2");
  
  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [answers, setAnswers] = useState({
    reading: {},
    listening: {},
    writing: "",
    speaking: ""
  });
  
  const [isPlayingAudio, setIsPlayingAudio] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);
  
  const [isGrading, setIsGrading] = useState(false);
  const [feedback, setFeedback] = useState("");
  
  const { token } = theme.useToken();

  const handleSaveAPIKey = () => {
    if (!apiKeyInput.trim()) {
      message.error("Bitte geben Sie einen API-Key ein.");
      return;
    }
    const saved = AIService.saveAPIKey(apiKeyInput.trim());
    if (saved) {
      setApiKey(apiKeyInput.trim());
      message.success("API Key gespeichert! Sie können das Mock Exam starten. 🚀");
    }
  };

  const handleGenerateExam = async () => {
    setLoading(true);
    setFeedback("");
    setAnswers({
      reading: {},
      listening: {},
      writing: "",
      speaking: ""
    });

    try {
      const data = await AIService.generateMockExam(level);
      setExamData(data);
      message.success(`telc Mock Exam für das Level ${level} erfolgreich generiert! 📝`);
    } catch (error) {
      console.error("Exam generation failed:", error);
      if (error.message === "NO_API_KEY") {
        setApiKey("");
      } else {
        message.error("Fehler beim Generieren der Prüfung. Bitte versuchen Sie es erneut.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePlayListeningAudio = (scriptText, partIdx) => {
    if (!scriptText) return;

    if (!window.speechSynthesis) {
      message.error("Text-to-Speech wird von Ihrem Browser nicht unterstützt.");
      return;
    }

    window.speechSynthesis.cancel();

    if (isPlayingAudio === partIdx) {
      setIsPlayingAudio(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(scriptText);
    utterance.lang = "de-DE";
    
    const voices = window.speechSynthesis.getVoices();
    const deVoice = voices.find(v => v.lang.startsWith("de") || v.lang.includes("DE"));
    if (deVoice) {
      utterance.voice = deVoice;
    }

    utterance.onend = () => {
      setIsPlayingAudio(null);
    };

    utterance.onerror = () => {
      setIsPlayingAudio(null);
    };

    setIsPlayingAudio(partIdx);
    window.speechSynthesis.speak(utterance);
  };

  const handleToggleRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      message.warning("Spracherkennung wird von Ihrem Browser nicht unterstützt. Bitte tippen Sie Ihre Antwort manuell ein.");
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "de-DE";

      recognition.onstart = () => {
        setIsRecording(true);
        message.success("Recording speaking response... Speak clearly in German!");
      };

      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setAnswers(prev => ({ ...prev, speaking: transcript }));
      };

      recognition.onerror = (e) => {
        console.error("Recording error:", e);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsRecording(false);
    }
  };

  const handleSubmitExam = async () => {
    if (!examData) return;
    
    setIsGrading(true);
    message.loading({ content: "telc Examiner is grading your answers...", duration: 2.5 });

    try {
      const result = await AIService.gradeExam(
        level,
        examData,
        answers
      );
      setFeedback(result);
      message.success("Grading complete! Review your feedback sheet below. 🏆");
    } catch (error) {
      console.error("Exam evaluation failed:", error);
      if (error.message === "NO_API_KEY") {
        setApiKey("");
      } else {
        message.error("Fehler beim Bewerten der Prüfung. Bitte versuchen Sie es erneut.");
      }
    } finally {
      setIsGrading(false);
    }
  };

  const extractScore = (feedbackText) => {
    if (!feedbackText) return null;
    const match = feedbackText.match(/Score:\s*(\d+)\s*\/\s*100/i);
    return match ? match[1] : null;
  };

  useEffect(() => {
    const handleKeyChange = () => {
      setApiKey(AIService.getAPIKey());
    };
    window.addEventListener("active_api_key_changed", handleKeyChange);

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      window.removeEventListener("active_api_key_changed", handleKeyChange);
    };
  }, []);

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
            Mock Exam Locked
          </Title>
          
          <Paragraph type="secondary" style={{ fontSize: "14px", marginBottom: "28px" }}>
            To run live simulated telc examinations with AI grading, please configure your <strong>Gemini API Key</strong>.
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
              Unlock Mock Exam
            </Button>
          </Space>
        </Card>
      </div>
    );
  }

  const score = extractScore(feedback);

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      <Card
        variant="borderless"
        style={{
          borderRadius: "16px",
          boxShadow: token.boxShadowCard,
          border: `1px solid ${token.colorBorderSecondary}`,
          background: token.colorBgContainer
        }}
        styles={{ body: { padding: "20px 24px" } }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <Title level={3} style={{ fontWeight: 800, margin: 0, color: token.colorText, fontFamily: "'Space Grotesk', sans-serif" }}>
              📝 telc Exam Simulator
            </Title>
            <Paragraph type="secondary" style={{ margin: "4px 0 0 0", fontSize: "13px" }}>
              Simulate full official telc examination papers across Reading, Listening, Writing, and Speaking modules.
            </Paragraph>
          </div>

          <Space size={14}>
            <Select
              value={level}
              onChange={(value) => {
                setLevel(value);
                setExamData(null);
                setFeedback("");
              }}
              style={{ width: "115px" }}
              styles={{ popup: { root: { borderRadius: "8px" } } }}
            >
              {["A1", "A2", "B1", "B2", "C1", "C2"].map((lvl) => (
                <Option key={lvl} value={lvl}>
                  Level {lvl}
                </Option>
              ))}
            </Select>

            <Button
              type="primary"
              icon={<FormOutlined />}
              onClick={handleGenerateExam}
              loading={loading}
              style={{
                borderRadius: "10px",
                background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
                border: "none",
                boxShadow: "0 4px 12px rgba(217, 119, 6, 0.25)",
                fontWeight: 600
              }}
            >
              Generate Exam
            </Button>
          </Space>
        </div>
      </Card>

      {loading && (
        <Card variant="borderless" style={{ borderRadius: "16px", background: token.colorBgContainer, padding: "24px" }}>
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Spin indicator={<LoadingOutlined style={{ fontSize: 32, color: token.colorPrimary }} spin />} />
            <Text type="secondary">Generating authentic telc {level} exam questions via Gemini...</Text>
            <Skeleton active paragraph={{ rows: 6 }} />
          </Space>
        </Card>
      )}

      {!loading && !examData && (
        <Card variant="borderless" style={{ borderRadius: "16px", background: token.colorBgContainer, textAlign: "center", padding: "48px 0" }}>
          <Space orientation="vertical" size={12}>
            <FormOutlined style={{ fontSize: "48px", color: token.colorTextDescription }} />
            <Text strong style={{ fontSize: "16px" }}>No mock exam generated yet</Text>
            <Text type="secondary">Select your target CEFR level above and click "Generate Exam" to start the simulation.</Text>
            <Button type="primary" onClick={handleGenerateExam} style={{ borderRadius: "10px", marginTop: "8px" }}>
              Start Level {level} Exam
            </Button>
          </Space>
        </Card>
      )}

      {!loading && examData && (
        <Card
          variant="borderless"
          style={{
            borderRadius: "16px",
            boxShadow: token.boxShadowCard,
            border: `1px solid ${token.colorBorderSecondary}`,
            background: token.colorBgContainer
          }}
          styles={{ body: { padding: "24px" } }}
        >
          <Tabs
            defaultActiveKey="reading"
            type="line"
            size="large"
            items={[
              {
                key: "reading",
                label: (
                  <span style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
                    <BookOutlined /> Leseverstehen (Reading)
                  </span>
                ),
                children: (
                  <div style={{ paddingTop: "16px", display: "flex", flexDirection: "column", gap: "24px" }}>
                    {examData.reading?.map((part, pIdx) => (
                      <Card
                        key={pIdx}
                        variant="borderless"
                        style={{
                          borderRadius: "12px",
                          background: token.colorBgLayout,
                          border: `1px solid ${token.colorBorderSecondary}`
                        }}
                      >
                        <Title level={4} style={{ marginTop: 0, fontWeight: 700, color: token.colorText }}>
                          {part.title}
                        </Title>
                        <Paragraph style={{ fontStyle: "italic", color: token.colorTextSecondary }}>
                          "{part.text}"
                        </Paragraph>

                        <Divider style={{ margin: "16px 0" }} />

                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                          {part.questions?.map((q) => (
                            <div key={q.id}>
                              <Text strong style={{ fontSize: "14px", display: "block", marginBottom: "8px", color: token.colorText }}>
                                {q.q}
                              </Text>
                              <Radio.Group
                                value={answers.reading[q.id]}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setAnswers(prev => ({
                                    ...prev,
                                    reading: { ...prev.reading, [q.id]: val }
                                  }));
                                }}
                              >
                                <Space direction="vertical">
                                  {q.options?.map((opt, oIdx) => (
                                    <Radio key={oIdx} value={opt}>
                                      <Text style={{ fontSize: "13px" }}>{opt}</Text>
                                    </Radio>
                                  ))}
                                </Space>
                              </Radio.Group>
                            </div>
                          ))}
                        </div>
                      </Card>
                    ))}
                  </div>
                )
              },
              {
                key: "listening",
                label: (
                  <span style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
                    <SoundOutlined /> Hörverstehen (Listening)
                  </span>
                ),
                children: (
                  <div style={{ paddingTop: "16px", display: "flex", flexDirection: "column", gap: "24px" }}>
                    {examData.listening?.map((part, pIdx) => (
                      <Card
                        key={pIdx}
                        variant="borderless"
                        style={{
                          borderRadius: "12px",
                          background: token.colorBgLayout,
                          border: `1px solid ${token.colorBorderSecondary}`
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                          <Title level={4} style={{ margin: 0, fontWeight: 700, color: token.colorText }}>
                            {part.title}
                          </Title>
                          <Button
                            type="primary"
                            icon={<PlayCircleOutlined />}
                            onClick={() => handlePlayListeningAudio(part.script, pIdx)}
                            style={{
                              borderRadius: "8px",
                              background: isPlayingAudio === pIdx ? "#e11d48" : "#d97706",
                              border: "none"
                            }}
                          >
                            {isPlayingAudio === pIdx ? "Audio Stoppen" : "Audio Abspielen"}
                          </Button>
                        </div>

                        <Alert
                          message={
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                              <strong>Audio Transcript (Simulation):</strong> {part.script}
                            </Text>
                          }
                          type="info"
                          showIcon={false}
                          style={{ marginBottom: "16px", borderRadius: "8px" }}
                        />

                        <Divider style={{ margin: "16px 0" }} />

                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                          {part.questions?.map((q) => (
                            <div key={q.id}>
                              <Text strong style={{ fontSize: "14px", display: "block", marginBottom: "8px", color: token.colorText }}>
                                {q.q}
                              </Text>
                              <Radio.Group
                                value={answers.listening[q.id]}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setAnswers(prev => ({
                                    ...prev,
                                    listening: { ...prev.listening, [q.id]: val }
                                  }));
                                }}
                              >
                                <Space direction="vertical">
                                  {q.options?.map((opt, oIdx) => (
                                    <Radio key={oIdx} value={opt}>
                                      <Text style={{ fontSize: "13px" }}>{opt}</Text>
                                    </Radio>
                                  ))}
                                </Space>
                              </Radio.Group>
                            </div>
                          ))}
                        </div>
                      </Card>
                    ))}
                  </div>
                )
              },
              {
                key: "writing",
                label: (
                  <span style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
                    <FormOutlined /> Schreiben (Writing)
                  </span>
                ),
                children: (
                  <div style={{ paddingTop: "16px" }}>
                    {examData.writing && (
                      <Card
                        variant="borderless"
                        style={{
                          borderRadius: "12px",
                          background: token.colorBgLayout,
                          border: `1px solid ${token.colorBorderSecondary}`
                        }}
                      >
                        <Title level={4} style={{ marginTop: 0, fontWeight: 700, color: token.colorText }}>
                          {examData.writing.title}
                        </Title>
                        <Paragraph style={{ fontSize: "14px", color: token.colorTextSecondary }}>
                          {examData.writing.prompt}
                        </Paragraph>

                        <Text strong style={{ fontSize: "13px", display: "block", marginBottom: "8px" }}>
                          Punkte berücksichtigen:
                        </Text>
                        <ul>
                          {examData.writing.points?.map((pt, idx) => (
                            <li key={idx} style={{ fontSize: "13px", color: token.colorTextSecondary, marginBottom: "4px" }}>
                              {pt}
                            </li>
                          ))}
                        </ul>

                        <Divider style={{ margin: "16px 0" }} />

                        <TextArea
                          value={answers.writing}
                          onChange={(e) => setAnswers(prev => ({ ...prev, writing: e.target.value }))}
                          placeholder="Schreiben Sie hier Ihre Antwort auf Deutsch..."
                          autoSize={{ minRows: 8, maxRows: 16 }}
                          style={{ borderRadius: "10px", padding: "14px", fontSize: "14px" }}
                        />
                      </Card>
                    )}
                  </div>
                )
              },
              {
                key: "speaking",
                label: (
                  <span style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
                    <AudioOutlined /> Sprechen (Speaking)
                  </span>
                ),
                children: (
                  <div style={{ paddingTop: "16px", display: "flex", flexDirection: "column", gap: "24px" }}>
                    {examData.speaking?.map((part) => (
                      <Card
                        key={part.id}
                        variant="borderless"
                        style={{
                          borderRadius: "12px",
                          background: token.colorBgLayout,
                          border: `1px solid ${token.colorBorderSecondary}`
                        }}
                      >
                        <Title level={4} style={{ marginTop: 0, fontWeight: 700, color: token.colorText }}>
                          {part.title}
                        </Title>
                        <Paragraph style={{ fontSize: "14px", color: token.colorTextSecondary }}>
                          {part.prompt}
                        </Paragraph>
                      </Card>
                    ))}

                    <Card
                      variant="borderless"
                      style={{
                        borderRadius: "12px",
                        background: token.colorBgContainer,
                        border: `1px solid ${token.colorBorderSecondary}`
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <Text strong style={{ fontSize: "14px", color: token.colorText }}>
                          Your Speaking Transcript Response:
                        </Text>
                        <Button
                          type={isRecording ? "primary" : "default"}
                          danger={isRecording}
                          icon={isRecording ? <AudioMutedOutlined /> : <AudioOutlined />}
                          onClick={handleToggleRecording}
                          style={{ borderRadius: "8px", fontWeight: 600 }}
                        >
                          {isRecording ? "Stop Recording" : "Start Voice Recording"}
                        </Button>
                      </div>

                      <TextArea
                        value={answers.speaking}
                        onChange={(e) => setAnswers(prev => ({ ...prev, speaking: e.target.value }))}
                        placeholder="Sprachaufnahme-Transkript oder manuelle Antwort hier..."
                        autoSize={{ minRows: 5, maxRows: 10 }}
                        style={{ borderRadius: "10px", padding: "12px", fontSize: "14px" }}
                      />
                    </Card>
                  </div>
                )
              }
            ]}
          />

          <Divider style={{ margin: "24px 0" }} />

          <div style={{ display: "flex", justifyContent: "center" }}>
            <Button
              type="primary"
              size="large"
              icon={<SendOutlined />}
              onClick={handleSubmitExam}
              loading={isGrading}
              style={{
                height: "50px",
                borderRadius: "12px",
                fontWeight: 700,
                padding: "0 36px",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                border: "none",
                boxShadow: "0 4px 14px rgba(16, 185, 129, 0.25)"
              }}
            >
              Submit & Grade Exam with AI
            </Button>
          </div>
        </Card>
      )}

      {isGrading && (
        <Card variant="borderless" style={{ borderRadius: "16px", background: token.colorBgContainer, textAlign: "center", padding: "40px" }}>
          <Spin size="large" />
          <Text style={{ display: "block", marginTop: "16px", fontWeight: 600 }}>
            Analyzing grammar, coherence, and accuracy against telc criteria...
          </Text>
        </Card>
      )}

      {feedback && (
        <Card
          variant="borderless"
          style={{
            borderRadius: "16px",
            boxShadow: token.boxShadowCard,
            border: `1px solid ${token.colorSuccessBorder}`,
            background: token.colorBgContainer
          }}
          styles={{ body: { padding: "28px" } }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <Space>
              <TrophyOutlined style={{ color: "#d97706", fontSize: "28px" }} />
              <div>
                <Title level={3} style={{ margin: 0, fontWeight: 800, color: token.colorText, fontFamily: "'Space Grotesk', sans-serif" }}>
                  Official telc Evaluation Report
                </Title>
                <Text type="secondary" style={{ fontSize: "13px" }}>
                  Detailed grading analysis provided by AI Examiner.
                </Text>
              </div>
            </Space>

            {score && (
              <Statistic
                title={<span style={{ color: token.colorTextDescription, fontSize: "12px" }}>Overall Score</span>}
                value={`${score} / 100`}
                styles={{ content: { color: "#10b981", fontWeight: 900, fontSize: "28px" } }}
              />
            )}
          </div>

          <Divider style={{ margin: "16px 0" }} />

          <div
            style={{
              background: token.colorBgLayout,
              padding: "20px",
              borderRadius: "12px",
              fontSize: "14px",
              lineHeight: "1.7",
              color: token.colorText,
              whiteSpace: "pre-wrap"
            }}
          >
            {feedback}
          </div>
        </Card>
      )}
    </div>
  );
};
export default Exam;
