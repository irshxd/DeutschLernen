import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Select,
  Button,
  Typography,
  Space,
  Skeleton,
  theme,
  Alert,
  Tag,
  Divider,
  List,
  App as AntApp
} from "antd";
import {
  BookOutlined,
  PlayCircleOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  GlobalOutlined,
  ArrowRightOutlined,
  InfoCircleOutlined
} from "@ant-design/icons";
import { AIService } from "../services/ai";
import { courseVideos } from "../data/videos";

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

export const Course = () => {
  const [cefrLevel, setCefrLevel] = useState("A1");
  const [lessonData, setLessonData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [, setHasApiKey] = useState(() => !!AIService.getAPIKey());
  
  const { token } = theme.useToken();
  const { message } = AntApp.useApp();

  useEffect(() => {
    const handleKeyChange = () => {
      setHasApiKey(!!AIService.getAPIKey());
    };
    window.addEventListener("active_api_key_changed", handleKeyChange);
    return () => {
      window.removeEventListener("active_api_key_changed", handleKeyChange);
    };
  }, []);

  const handleGenerateLesson = async () => {
    setIsLoading(true);
    setLessonData(null);
    try {
      const data = await AIService.generateDailyCourse(cefrLevel);
      setLessonData(data);
      message.success(`Erfolgreich! Lesson for Level ${cefrLevel} generated. 📖`);
    } catch (error) {
      console.error("Failed to generate lesson:", error);
      message.error("Es gab ein Problem. Check your API Keys inside the header.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadDefault = async () => {
      setIsLoading(true);
      try {
        const data = await AIService.generateDailyCourse(cefrLevel);
        setLessonData(data);
      } catch (e) {
        console.warn("Unable to load initial dynamic course, using mock placeholder", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadDefault();
  }, []);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
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
              📚 Active Daily Course
            </Title>
            <Paragraph type="secondary" style={{ margin: "4px 0 0 0", fontSize: "13px" }}>
              Dynamic AI Textbook Chapter generator based on official telc requirements.
            </Paragraph>
          </div>

          <Space size={14}>
            <Select
              value={cefrLevel}
              onChange={(value) => {
                setCefrLevel(value);
                setLessonData(null);
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
              icon={<BookOutlined />}
              onClick={handleGenerateLesson}
              loading={isLoading}
              style={{
                borderRadius: "10px",
                background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
                border: "none",
                boxShadow: "0 4px 12px rgba(217, 119, 6, 0.25)",
                fontWeight: 600
              }}
            >
              Generate Daily Lesson
            </Button>
          </Space>
        </div>
      </Card>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          {isLoading && (
            <Card variant="borderless" style={{ borderRadius: "16px", background: token.colorBgContainer, padding: "16px" }}>
              <Skeleton active paragraph={{ rows: 12 }} />
            </Card>
          )}

          {!isLoading && !lessonData && (
            <Card variant="borderless" style={{ borderRadius: "16px", background: token.colorBgContainer, textAlign: "center", padding: "48px 0" }}>
              <Space orientation="vertical" size={12}>
                <BookOutlined style={{ fontSize: "48px", color: token.colorTextDescription }} />
                <Text strong style={{ fontSize: "16px" }}>No lesson loaded yet</Text>
                <Text type="secondary">Select your CEFR level and click "Generate Daily Lesson" to build your active learning sheet.</Text>
                <Button type="primary" onClick={handleGenerateLesson} style={{ borderRadius: "10px", marginTop: "8px" }}>
                  Load Today's Chapter
                </Button>
              </Space>
            </Card>
          )}

          {!isLoading && lessonData && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
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
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <Tag color="gold" style={{ fontWeight: 700, borderRadius: "4px", padding: "2px 8px" }}>
                    TELC GERMAN CHAPTER
                  </Tag>
                  <Text type="secondary" style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                    <GlobalOutlined /> Standard textbook style
                  </Text>
                </div>

                <Title level={2} style={{ fontWeight: 800, marginTop: 0, color: token.colorText, fontFamily: "'Space Grotesk', sans-serif" }}>
                  {lessonData.title}
                </Title>
                
                <Paragraph style={{ fontSize: "15px", lineHeight: "1.6", color: token.colorTextSecondary }}>
                  {lessonData.introduction}
                </Paragraph>

                <Divider style={{ margin: "24px 0" }} />

                <div style={{ marginBottom: "28px" }}>
                  <Title level={4} style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: "8px", color: token.colorText, fontFamily: "'Space Grotesk', sans-serif" }}>
                    <BulbOutlined style={{ color: "#d97706" }} /> 1. Grammatik (Grammar Concept)
                  </Title>
                  <Text strong style={{ fontSize: "15px", color: token.colorPrimary, display: "block", marginBottom: "4px" }}>
                    {lessonData.grammar?.concept}
                  </Text>
                  <Paragraph style={{ fontSize: "14px", color: token.colorTextSecondary, marginBottom: "16px" }}>
                    {lessonData.grammar?.explanation}
                  </Paragraph>

                  <Card
                    variant="borderless"
                    style={{
                      background: token.colorBgLayout,
                      borderRadius: "12px",
                      border: `1px solid ${token.colorBorderSecondary}`
                    }}
                    styles={{ body: { padding: "16px 20px" } }}
                  >
                    <Text strong style={{ fontSize: "12px", color: token.colorTextDescription, textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                      Beispiele (Examples):
                    </Text>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {lessonData.grammar?.examples?.map((ex, idx) => (
                        <div key={idx} style={{ display: "flex", flexDirection: "column", borderLeft: `3px solid ${token.colorPrimary}`, paddingLeft: "12px" }}>
                          <Text strong style={{ fontSize: "14px", color: token.colorText }}>{ex.de}</Text>
                          <Text type="secondary" style={{ fontSize: "12px" }}>{ex.en}</Text>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                <div style={{ marginBottom: "28px" }}>
                  <Title level={4} style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: "8px", color: token.colorText, fontFamily: "'Space Grotesk', sans-serif" }}>
                    <BookOutlined style={{ color: token.colorPrimary }} /> 2. Leseverstehen (Reading Text)
                  </Title>

                  <div
                    style={{
                      background: token.colorPrimaryBg,
                      border: `1px solid ${token.colorPrimaryBorder}`,
                      padding: "20px",
                      borderRadius: "12px",
                      marginBottom: "16px"
                    }}
                  >
                    <Paragraph style={{ fontSize: "15px", lineHeight: "1.7", color: token.colorText, margin: 0, fontStyle: "italic" }}>
                      "{lessonData.reading?.text}"
                    </Paragraph>
                    <Divider style={{ margin: "12px 0", borderStyle: "dashed" }} />
                    <Text type="secondary" style={{ fontSize: "13px", display: "block", lineHeight: "1.5" }}>
                      <strong>Translation:</strong> {lessonData.reading?.translation}
                    </Text>
                  </div>

                  <div style={{ marginTop: "16px" }}>
                    <Text strong style={{ fontSize: "13px", display: "block", marginBottom: "8px", color: token.colorText }}>
                      💡 Wortschatz (Vocabulary helper):
                    </Text>
                    <Row gutter={[12, 12]}>
                      {lessonData.reading?.vocabulary?.map((vocab, idx) => (
                        <Col xs={12} sm={8} key={idx}>
                          <div
                            style={{
                              background: token.colorBgLayout,
                              padding: "8px 12px",
                              borderRadius: "6px",
                              border: `1px solid ${token.colorBorderSecondary}`,
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: "8px"
                            }}
                          >
                            <Text strong style={{ fontSize: "12px", color: token.colorText }}>{vocab.word}</Text>
                            <ArrowRightOutlined style={{ fontSize: "10px", color: token.colorTextDescription }} />
                            <Text type="secondary" style={{ fontSize: "12px", textAlign: "right" }}>{vocab.meaning}</Text>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </div>
                </div>

                <Divider style={{ margin: "24px 0" }} />

                {lessonData.speaking_writing_tips && (
                  <div>
                    <Title level={4} style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: "8px", color: token.colorText, fontFamily: "'Space Grotesk', sans-serif" }}>
                      <CheckCircleOutlined style={{ color: token.colorSuccess }} /> 3. Prüfungstipp (Exam Guide)
                    </Title>

                    <Alert
                      title={
                        <Space>
                          <InfoCircleOutlined style={{ color: "#e11d48" }} />
                          <span style={{ fontWeight: 700, color: token.colorText }}>Official telc Strategy</span>
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size={12} style={{ width: "100%", marginTop: "6px" }}>
                          <Text style={{ fontSize: "13px", color: token.colorTextSecondary }}>
                            {lessonData.speaking_writing_tips?.tip}
                          </Text>

                          {lessonData.speaking_writing_tips?.phrases && (
                            <div style={{ marginTop: "8px" }}>
                              <Text strong style={{ fontSize: "12px", display: "block", marginBottom: "6px", color: token.colorText }}>
                                Nützliche Redemittel (Useful Phrases):
                              </Text>
                              <List
                                size="small"
                                dataSource={lessonData.speaking_writing_tips.phrases}
                                renderItem={(item) => (
                                  <List.Item style={{ border: "none", padding: "4px 0", display: "flex", gap: "10px", alignItems: "baseline" }}>
                                    <Text style={{ color: token.colorPrimary, fontWeight: 600 }}>•</Text>
                                    <div style={{ flex: 1 }}>
                                      <Text strong style={{ fontSize: "13px", color: token.colorText }}>{item.de}</Text>
                                      <Text type="secondary" style={{ fontSize: "12px", display: "block" }}>{item.en}</Text>
                                    </div>
                                  </List.Item>
                                )}
                              />
                            </div>
                          )}
                        </Space>
                      }
                      type="warning"
                      showIcon={false}
                      style={{
                        borderRadius: "12px",
                        border: `1px dashed ${token.colorWarningBorder}`,
                        background: token.colorWarningBg
                      }}
                    />
                  </div>
                )}
              </Card>
            </div>
          )}
        </Col>

        <Col xs={24} lg={8}>
          <Card
            variant="borderless"
            style={{
              borderRadius: "16px",
              boxShadow: token.boxShadowCard,
              border: `1px solid ${token.colorBorderSecondary}`,
              background: token.colorBgContainer
            }}
            styles={{ body: { padding: "20px" } }}
          >
            <Title level={4} style={{ fontWeight: 700, margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: "8px", color: token.colorText, fontFamily: "'Space Grotesk', sans-serif" }}>
              <PlayCircleOutlined style={{ color: "#e11d48" }} /> Video Lecture
            </Title>
            
            <Paragraph type="secondary" style={{ fontSize: "13px", marginBottom: "16px" }}>
              Watch the curated YouTube lecture tailored specifically to help you master level {cefrLevel} topics.
            </Paragraph>

            <div
              style={{
                width: "100%",
                borderRadius: "12px",
                overflow: "hidden",
                border: `1px solid ${token.colorBorderSecondary}`,
                background: "#000",
                position: "relative"
              }}
            >
              {courseVideos[cefrLevel] ? (
                <iframe
                  width="100%"
                  src={courseVideos[cefrLevel]}
                  title={`German Level ${cefrLevel} Video Lecture`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  style={{
                    aspectRatio: "16/9",
                    display: "block",
                    borderRadius: "8px"
                  }}
                />
              ) : (
                <div style={{ aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Text type="secondary">No lecture video mapped for level {cefrLevel}.</Text>
                </div>
              )}
            </div>

            <Divider style={{ margin: "16px 0" }} />

            <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
              <InfoCircleOutlined style={{ color: token.colorPrimary, marginTop: "2px" }} />
              <Text type="secondary" style={{ fontSize: "11px", lineHeight: "1.4" }}>
                Curated lecture sourced from top-tier German instructional libraries. Pair the video notes together with your AI-generated daily textbooks above for maximum comprehension!
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
