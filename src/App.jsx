import React, { useState, useEffect } from "react";
import { ConfigProvider, Card, Result, Button, Typography, theme, App as AntApp } from "antd";
import { AppLayout } from "./layouts/AppLayout";
import { Syllabus } from "./pages/Syllabus";
import { Course } from "./pages/Course";
import { Flashcards } from "./pages/Flashcards";
import { Translation } from "./pages/Translation";
import { AIConvo } from "./pages/AIConvo";
import { Exam } from "./pages/Exam";
import { StorageService } from "./services/storage";
import { ThunderboltOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

function App() {
  const [activeKey, setActiveKey] = useState("syllabus");
  const [isDarkMode, setIsDarkMode] = useState(() => StorageService.getThemePreference());

  useEffect(() => {
    const bg = isDarkMode ? "#0b0e14" : "#f9f9f8";
    document.body.style.backgroundColor = bg;
    document.body.style.color = isDarkMode ? "#f1f5f9" : "#0f172a";
  }, [isDarkMode]);

  const handleToggleTheme = (checked) => {
    setIsDarkMode(checked);
    StorageService.saveThemePreference(checked);
  };

  const customTheme = {
    algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: "#d97706",
      colorSuccess: "#10b981",
      colorWarning: "#f59e0b",
      colorError: "#e11d48",
      colorInfo: "#2563eb",
      borderRadius: 12,
      fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
      fontFamilyCode: "monospace",
    },
    components: {
      Layout: {
        headerBg: isDarkMode ? "rgba(11, 14, 20, 0.85)" : "rgba(255, 255, 255, 0.85)",
        bodyBg: isDarkMode ? "#0b0e14" : "#f9f9f8",
      },
      Card: {
        boxShadowCard: isDarkMode ? "0 4px 20px rgba(0, 0, 0, 0.4)" : "0 4px 20px rgba(15, 23, 42, 0.04)",
      },
      Collapse: {
        headerBg: "transparent",
        contentPadding: "16px 24px",
      },
      Menu: {
        itemBg: "transparent",
        itemSelectedBg: isDarkMode ? "rgba(217, 119, 6, 0.12)" : "rgba(217, 119, 6, 0.08)",
        itemSelectedColor: "#f59e0b",
        itemColor: isDarkMode ? "#94a3b8" : "#475569",
        itemHoverBg: isDarkMode ? "rgba(255, 255, 255, 0.04)" : "#f1f5f9",
        itemHoverColor: isDarkMode ? "#f8fafc" : "#1e293b",
      }
    }
  };

  const renderContent = () => {
    switch (activeKey) {
      case "syllabus":
        return <Syllabus />;
      case "course":
        return <Course />;
      case "flashcards":
        return <Flashcards />;
      case "vocab":
        return (
          <div style={{ maxWidth: "800px", margin: "40px auto" }}>
            <Result
              icon={<ThunderboltOutlined style={{ color: "#d97706", fontSize: "56px" }} />}
              title="Daily Vocab Booster"
              subTitle="Get 5 new context-specific high-yield German words daily based on your level."
              extra={
                <Card variant="borderless" style={{ textAlign: "left", marginTop: 24, borderRadius: 16 }}>
                  <Title level={5}>How it works:</Title>
                  <Paragraph type="secondary">
                    Every morning, we curate five custom expressions with sentence examples tailored to your currently selected CEFR syllabus level (e.g. B2 Redemittel).
                  </Paragraph>
                  <Button type="primary" onClick={() => setActiveKey("syllabus")}>
                    Back to Explorer
                  </Button>
                </Card>
              }
            />
          </div>
        );
      case "ai-chat":
        return <AIConvo />;
      case "translation":
        return <Translation />;
      case "mock-exam":
        return <Exam />;
      default:
        return <Syllabus />;
    }
  };

  return (
    <ConfigProvider theme={customTheme}>
      <AntApp style={{ width: "100%", height: "100%" }}>
        <AppLayout 
          activeKey={activeKey} 
          onKeyChange={setActiveKey}
          isDarkMode={isDarkMode}
          onToggleTheme={handleToggleTheme}
        >
          {renderContent()}
        </AppLayout>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
