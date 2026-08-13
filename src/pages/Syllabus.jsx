import React, { useState, useEffect } from "react";
import {
  Card,
  Collapse,
  Checkbox,
  Tag,
  Progress,
  Row,
  Col,
  Typography,
  Space,
  Divider,
  Statistic,
  List,
  Button,
  message,
  Empty,
  Skeleton,
  theme
} from "antd";
import {
  TrophyOutlined,
  CheckCircleFilled,
  ThunderboltOutlined,
  ReloadOutlined
} from "@ant-design/icons";
import { syllabusData, levelDescriptions } from "../data/syllabus";
import { StorageService } from "../services/storage";

const { Title, Paragraph, Text } = Typography;

export const Syllabus = () => {
  const [selectedLevel, setSelectedLevel] = useState("B2");
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  
  const { token } = theme.useToken();

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const storedProgress = await StorageService.getProgress();
        setProgress(storedProgress);
      } catch (error) {
        console.error("Failed to load syllabus progress:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  const getCategoryColor = (category) => {
    const colors = {
      Grammatik: "blue",
      Wortschatz: "green",
      Alltag: "cyan",
      Beruf: "geekblue",
      "telc Exam": "volcano",
    };
    return colors[category] || "default";
  };

  const getTopicProgressInfo = (level, topicId, subPoints) => {
    const topicProgress = progress[level]?.[topicId];
    
    if (topicProgress && typeof topicProgress === "object" && topicProgress.subPoints) {
      const total = subPoints.length;
      const completed = Object.values(topicProgress.subPoints).filter(Boolean).length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      const isMastered = completed === total && total > 0;
      return { percentage, completed, total, isMastered };
    }
    
    const isMastered = !!(topicProgress === true || (topicProgress && topicProgress.mastered === true));
    return {
      percentage: isMastered ? 100 : 0,
      completed: isMastered ? subPoints.length : 0,
      total: subPoints.length,
      isMastered
    };
  };

  const getLevelProgressInfo = (level) => {
    const topics = syllabusData[level] || [];
    let totalSubPoints = 0;
    let completedSubPoints = 0;
    let masteredTopicsCount = 0;

    topics.forEach((topic) => {
      const info = getTopicProgressInfo(level, topic.id, topic.subPoints);
      totalSubPoints += info.total;
      completedSubPoints += info.completed;
      if (info.isMastered) {
        masteredTopicsCount++;
      }
    });

    const subpointPercentage = totalSubPoints > 0 ? Math.round((completedSubPoints / totalSubPoints) * 100) : 0;
    const topicPercentage = topics.length > 0 ? Math.round((masteredTopicsCount / topics.length) * 100) : 0;

    return {
      subpointPercentage,
      topicPercentage,
      completedSubPoints,
      totalSubPoints,
      completedTopics: masteredTopicsCount,
      totalTopics: topics.length
    };
  };

  const getGlobalStats = () => {
    let grandTotalSubPoints = 0;
    let grandCompletedSubPoints = 0;
    let totalTopicsCount = 0;
    let completedTopicsCount = 0;

    Object.keys(syllabusData).forEach((level) => {
      const info = getLevelProgressInfo(level);
      grandTotalSubPoints += info.totalSubPoints;
      grandCompletedSubPoints += info.completedSubPoints;
      totalTopicsCount += info.totalTopics;
      completedTopicsCount += info.completedTopics;
    });

    const percentage = grandTotalSubPoints > 0 ? Math.round((grandCompletedSubPoints / grandTotalSubPoints) * 100) : 0;

    return {
      percentage,
      completedSubPoints: grandCompletedSubPoints,
      totalSubPoints: grandTotalSubPoints,
      completedTopics: completedTopicsCount,
      totalTopics: totalTopicsCount
    };
  };

  const handleSubPointToggle = async (level, topicId, subPointIndex, checked) => {
    const currentProgress = { ...progress };
    if (!currentProgress[level]) currentProgress[level] = {};
    if (!currentProgress[level][topicId] || typeof currentProgress[level][topicId] !== "object") {
      currentProgress[level][topicId] = { mastered: false, subPoints: {} };
    }
    
    const topicProg = {
      mastered: currentProgress[level][topicId].mastered || false,
      subPoints: { ...(currentProgress[level][topicId].subPoints || {}) }
    };
    
    topicProg.subPoints[subPointIndex] = checked;

    const topic = syllabusData[level].find((t) => t.id === topicId);
    const totalSubPoints = topic.subPoints.length;
    const completedCount = Object.values(topicProg.subPoints).filter(Boolean).length;
    topicProg.mastered = completedCount === totalSubPoints;

    currentProgress[level][topicId] = topicProg;
    setProgress(currentProgress);

    const success = await StorageService.saveProgress(level, topicId, topicProg);
    if (!success) {
      message.error("Failed to save progress");
    }
  };

  const handleTopicMasteryToggle = async (level, topicId, masterChecked) => {
    const topic = syllabusData[level].find((t) => t.id === topicId);
    if (!topic) return;

    const currentProgress = { ...progress };
    if (!currentProgress[level]) currentProgress[level] = {};

    const subPointsProgress = {};
    topic.subPoints.forEach((_, idx) => {
      subPointsProgress[idx] = masterChecked;
    });

    const topicProg = {
      mastered: masterChecked,
      subPoints: subPointsProgress
    };

    currentProgress[level][topicId] = topicProg;
    setProgress(currentProgress);

    const success = await StorageService.saveProgress(level, topicId, topicProg);
    if (success) {
      if (masterChecked) {
        message.success(`Mastered: "${topic.title}"! 🎉`);
      }
    } else {
      message.error("Failed to update topic mastery");
    }
  };

  const handleResetAllProgress = async () => {
    if (window.confirm("Möchten Sie Ihren gesamten Lernfortschritt wirklich zurücksetzen? This cannot be undone.")) {
      const success = await StorageService.clearProgress();
      if (success) {
        setProgress({});
        message.success("Lernfortschritt erfolgreich zurückgesetzt! Fresh start. 🌟");
      } else {
        message.error("Failed to clear progress.");
      }
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px 0" }}>
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  const globalStats = getGlobalStats();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <Card
        variant="borderless"
        style={{
          borderRadius: "16px",
          background: "linear-gradient(135deg, #121620 0%, #0b0e14 100%)",
          color: "#ffffff",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
          border: "1px solid #1e2638"
        }}
        styles={{ body: { padding: "28px" } }}
      >
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={14}>
            <Space orientation="vertical" size={6}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <TrophyOutlined style={{ color: "#d97706", fontSize: "24px" }} />
                <Tag color="#d97706" style={{ border: "none", fontWeight: 700, borderRadius: "4px" }}>
                  TELC GERMAN EXAM PREP
                </Tag>
              </div>
              <Title level={2} style={{ color: "#ffffff", margin: "6px 0 0 0", fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>
                Syllabus Explorer
              </Title>
              <Paragraph style={{ color: "#94a3b8", fontSize: "15px", margin: "8px 0 0 0", maxWidth: "600px" }}>
                Track your structured syllabus from level A1 to C2 based on the telc exam guidelines. 
                Complete granular tasks and monitor your readiness level-by-level.
              </Paragraph>
            </Space>
          </Col>
          <Col xs={24} md={10}>
            <div
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                padding: "20px",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                alignItems: "center",
                gap: "24px",
              }}
            >
              <Progress
                type="circle"
                percent={globalStats.percentage}
                size={80}
                strokeColor={{
                  "0%": "#d97706",
                  "100%": "#10b981",
                }}
                railColor="rgba(255, 255, 255, 0.1)"
                format={(percent) => (
                  <span style={{ color: "#fff", fontWeight: 700, fontSize: "18px" }}>{percent}%</span>
                )}
              />
              <div style={{ flex: 1 }}>
                <Statistic
                  title={<span style={{ color: "#94a3b8", fontSize: "13px" }}>Total Mastery</span>}
                  value={`${globalStats.completedTopics} / ${globalStats.totalTopics}`}
                  suffix={<span style={{ color: "#64748b", fontSize: "14px" }}>Topics</span>}
                  styles={{ content: { color: "#ffffff", fontWeight: 700, fontSize: "22px" } }}
                />
                <div style={{ marginTop: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <ThunderboltOutlined style={{ color: "#d97706" }} />
                  <Text style={{ color: "#94a3b8", fontSize: "12px" }}>
                    {globalStats.completedSubPoints} of {globalStats.totalSubPoints} syllabus tasks achieved
                  </Text>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <Title level={4} style={{ margin: 0, fontWeight: 700, color: token.colorText, fontFamily: "'Space Grotesk', sans-serif" }}>
            Select CEFR Level
          </Title>
          <Button
            type="link"
            danger
            icon={<ReloadOutlined />}
            onClick={handleResetAllProgress}
            style={{ marginLeft: "auto", fontSize: "13px", padding: 0 }}
          >
            Reset Progress
          </Button>
        </div>

        <Row gutter={[16, 16]}>
          {Object.keys(levelDescriptions).map((level) => {
            const desc = levelDescriptions[level];
            const stats = getLevelProgressInfo(level);
            const isSelected = selectedLevel === level;

            const colorsMap = {
              A1: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
              A2: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              B1: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
              B2: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
              C1: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)",
              C2: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
            };

            return (
              <Col xs={12} sm={8} lg={4} key={level}>
                <Card
                  hoverable
                  onClick={() => setSelectedLevel(level)}
                  style={{
                    borderRadius: "12px",
                    border: isSelected ? `2px solid ${token.colorPrimary}` : `1px solid ${token.colorBorderSecondary}`,
                    background: token.colorBgContainer,
                    transform: isSelected ? "translateY(-4px)" : "none",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: isSelected ? "0 10px 20px rgba(217, 119, 6, 0.15)" : "0 2px 4px rgba(0, 0, 0, 0.01)",
                  }}
                  styles={{ body: { padding: "16px 14px", display: "flex", flexDirection: "column", gap: "10px" } }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div
                      style={{
                        padding: "4px 10px",
                        borderRadius: "6px",
                        background: colorsMap[level],
                        color: "#fff",
                        fontWeight: 800,
                        fontSize: "14px",
                      }}
                    >
                      {level}
                    </div>
                    {stats.subpointPercentage === 100 && (
                      <CheckCircleFilled style={{ color: "#10b981", fontSize: "16px" }} />
                    )}
                  </div>
                  
                  <div>
                    <Text strong style={{ display: "block", fontSize: "13px", color: token.colorText, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {desc.name.split(" - ")[1] || desc.name}
                    </Text>
                    <Text type="secondary" style={{ fontSize: "11px" }}>
                      {stats.completedTopics} of {stats.totalTopics} Mastered
                    </Text>
                  </div>

                  <div style={{ marginTop: "4px" }}>
                    <Progress
                      percent={stats.subpointPercentage}
                      size="small"
                      status={stats.subpointPercentage === 100 ? "success" : "normal"}
                      strokeColor={stats.subpointPercentage === 100 ? "#10b981" : "#d97706"}
                      showInfo={false}
                    />
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>

      <Card
        variant="borderless"
        style={{
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
          border: `1px solid ${token.colorBorderSecondary}`,
          background: token.colorBgContainer
        }}
        styles={{ body: { padding: "24px" } }}
      >
        <div style={{ marginBottom: "20px" }}>
          <Space align="baseline">
            <span style={{ fontSize: "28px", fontWeight: 800, color: token.colorText, fontFamily: "'Space Grotesk', sans-serif" }}>{selectedLevel}</span>
            <Title level={4} style={{ margin: 0, fontWeight: 700, color: token.colorTextSecondary }}>
              — {levelDescriptions[selectedLevel]?.name}
            </Title>
          </Space>
          <Paragraph type="secondary" style={{ margin: "4px 0 0 0", fontSize: "14px" }}>
            {levelDescriptions[selectedLevel]?.desc}
          </Paragraph>
        </div>

        <Divider style={{ margin: "16px 0" }} />

        {syllabusData[selectedLevel] && syllabusData[selectedLevel].length > 0 ? (
          <Collapse
            accordion
            expandIconPlacement="end"
            variant="borderless"
            style={{ background: "transparent" }}
            items={syllabusData[selectedLevel].map((topic) => {
              const topicInfo = getTopicProgressInfo(selectedLevel, topic.id, topic.subPoints);
              
              const panelHeader = (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    paddingRight: "8px",
                  }}
                >
                  <Space size={12} style={{ flexWrap: "wrap" }}>
                    <div onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={topicInfo.isMastered}
                        onChange={(e) => handleTopicMasteryToggle(selectedLevel, topic.id, e.target.checked)}
                        style={{ transform: "scale(1.1)" }}
                      />
                    </div>
                    <Tag
                      color={getCategoryColor(topic.category)}
                      style={{
                        margin: 0,
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: "4px",
                      }}
                    >
                      {topic.category}
                    </Tag>
                    <Text
                      strong
                      style={{
                        fontSize: "15px",
                        color: topicInfo.isMastered ? token.colorTextDescription : token.colorText,
                        textDecoration: topicInfo.isMastered ? "line-through" : "none",
                      }}
                    >
                      {topic.title}
                    </Text>
                  </Space>
                  
                  <Space size={12} style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ width: "80px", textAlign: "right" }}>
                      <Progress
                        percent={topicInfo.percentage}
                        size="small"
                        showInfo={false}
                        strokeColor={topicInfo.isMastered ? "#10b981" : "#d97706"}
                      />
                    </div>
                    <Text type="secondary" style={{ fontSize: "12px", minWidth: "42px", textAlign: "right" }}>
                      {topicInfo.completed}/{topicInfo.total} tasks
                    </Text>
                  </Space>
                </div>
              );

              return {
                key: topic.id,
                label: panelHeader,
                style: {
                  marginBottom: 12,
                  background: topicInfo.isMastered ? token.colorBgLayout : token.colorBgContainer,
                  borderRadius: "10px",
                  border: `1px solid ${token.colorBorderSecondary}`,
                  overflow: "hidden",
                },
                children: (
                  <div style={{ padding: "8px 12px 16px 24px" }}>
                    <Text strong type="secondary" style={{ fontSize: "12px", letterSpacing: "0.5px", textTransform: "uppercase", display: "block", marginBottom: "12px" }}>
                      Syllabus Checklist ({topic.category})
                    </Text>
                    
                    <List
                      dataSource={topic.subPoints}
                      renderItem={(subPoint, index) => {
                        const isSubChecked = !!(
                          progress[selectedLevel]?.[topic.id]?.subPoints?.[index]
                        );
                        
                        return (
                          <List.Item
                            style={{
                              border: "none",
                              padding: "8px 0",
                              display: "flex",
                              justifyContent: "flex-start",
                              alignItems: "center",
                              gap: "12px",
                            }}
                          >
                            <Checkbox
                              checked={isSubChecked}
                              onChange={(e) =>
                                handleSubPointToggle(selectedLevel, topic.id, index, e.target.checked)
                              }
                            />
                            <Text
                              style={{
                                color: isSubChecked ? token.colorTextDescription : token.colorText,
                                textDecoration: isSubChecked ? "line-through" : "none",
                                fontSize: "14px",
                              }}
                            >
                              {subPoint}
                            </Text>
                          </List.Item>
                        );
                      }}
                    />
                  </div>
                ),
              };
            })}
          />
        ) : (
          <Empty description={`No topics available for level ${selectedLevel}`} />
        )}
      </Card>
    </div>
  );
};
