import React, { useState, useEffect } from "react";
import { Layout, Menu, Button, Drawer, Typography, Space, Avatar, Badge, Grid, theme, Switch, Modal, List, Input, Tag, Divider, Select, message } from "antd";
import {
  BookOutlined,
  CreditCardOutlined,
  BulbOutlined,
  MessageOutlined,
  TranslationOutlined,
  FormOutlined,
  MenuOutlined,
  GlobalOutlined,
  UserOutlined,
  BellOutlined,
  SunOutlined,
  MoonOutlined,
  KeyOutlined,
  DeleteOutlined,
  PlusOutlined,
  CheckOutlined,
  EditOutlined
} from "@ant-design/icons";
import { StorageService } from "../services/storage";

const { Header, Content, Sider } = Layout;
const { Text, Title } = Typography;
const { useBreakpoint } = Grid;
const { Option } = Select;

export const AppLayout = ({ children, activeKey, onKeyChange, isDarkMode, onToggleTheme }) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [keyModalVisible, setKeyModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [apiKeys, setApiKeys] = useState(() => StorageService.getApiKeys());
  const [newKeyInput, setNewKeyInput] = useState("");

  const [userProfile, setUserProfile] = useState(() => StorageService.getUserProfile());
  const [nameInput, setNameInput] = useState(userProfile.name);
  const [levelSelect, setLevelSelect] = useState(userProfile.level);

  const screens = useBreakpoint();
  const { token } = theme.useToken();
  const isDesktop = screens.md === undefined ? true : screens.md;

  useEffect(() => {
    const handleProfileChange = () => {
      const p = StorageService.getUserProfile();
      setUserProfile(p);
      setNameInput(p.name);
      setLevelSelect(p.level);
    };
    window.addEventListener("user_profile_changed", handleProfileChange);
    
    if (!userProfile.name) {
      setProfileModalVisible(true);
    }

    return () => {
      window.removeEventListener("user_profile_changed", handleProfileChange);
    };
  }, []);

  const refreshKeys = () => {
    setApiKeys(StorageService.getApiKeys());
  };

  const handleSaveProfile = () => {
    if (!nameInput.trim()) {
      message.warning("Bitte geben Sie Ihren Namen ein.");
      return;
    }
    StorageService.saveUserProfile(nameInput.trim(), levelSelect);
    setProfileModalVisible(false);
    message.success("Profil erfolgreich aktualisiert! 🎉");
  };

  const handleAddKey = () => {
    if (!newKeyInput.trim()) return;
    const success = StorageService.saveApiKey({
      key: newKeyInput.trim(),
      provider: "Gemini"
    });
    if (success) {
      setNewKeyInput("");
      refreshKeys();
      window.dispatchEvent(new Event("active_api_key_changed"));
    }
  };

  const handleSetActive = (id) => {
    StorageService.setActiveKey(id);
    refreshKeys();
    window.dispatchEvent(new Event("active_api_key_changed"));
  };

  const handleDeleteKey = (id) => {
    StorageService.deleteApiKey(id);
    refreshKeys();
    window.dispatchEvent(new Event("active_api_key_changed"));
  };

  const menuItems = [
    { key: "syllabus", icon: <BookOutlined style={{ fontSize: "16px" }} />, label: "Syllabus Explorer" },
    { key: "course", icon: <BookOutlined style={{ fontSize: "16px" }} />, label: "Daily Course" },
    { key: "flashcards", icon: <CreditCardOutlined style={{ fontSize: "16px" }} />, label: "Flashcards" },
    { key: "vocab", icon: <BulbOutlined style={{ fontSize: "16px" }} />, label: "Daily Vocab" },
    { key: "ai-chat", icon: <MessageOutlined style={{ fontSize: "16px" }} />, label: "AI Conversation" },
    { key: "translation", icon: <TranslationOutlined style={{ fontSize: "16px" }} />, label: "Quick Translation" },
    { key: "mock-exam", icon: <FormOutlined style={{ fontSize: "16px" }} />, label: "Mock Exam" },
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: isDarkMode ? "#0b0e14" : "#f9f9f8" }}>
      {isDesktop && (
        <Sider
          width={260}
          trigger={null}
          style={{
            height: "100vh",
            position: "fixed",
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 100,
            background: isDarkMode ? "#121620" : "#ffffff",
            borderRight: isDarkMode ? "1px solid #1e2638" : "1px solid #e2e8f0",
            boxShadow: isDarkMode ? "4px 0 24px rgba(0, 0, 0, 0.4)" : "4px 0 24px rgba(15, 23, 42, 0.03)",
          }}
        >
          <div
            style={{
              height: "64px",
              display: "flex",
              alignItems: "center",
              padding: "0 24px",
              borderBottom: isDarkMode ? "1px solid #1e2638" : "1px solid #f1f5f9",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(217, 119, 6, 0.3)",
              }}
            >
              <GlobalOutlined style={{ fontSize: "18px", color: "#ffffff" }} />
            </div>
            <span
              style={{
                fontWeight: 800,
                fontSize: "19px",
                letterSpacing: "-0.5px",
                color: isDarkMode ? "#ffffff" : "#0f172a",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              Deutsch<span style={{ color: "#d97706" }}>Lernen</span>
            </span>
          </div>

          <Menu
            mode="inline"
            selectedKeys={[activeKey]}
            items={menuItems}
            onClick={({ key }) => onKeyChange(key)}
            style={{ borderRight: "none", padding: "16px 12px", background: "transparent" }}
            className="custom-side-menu"
          />

          <div style={{ position: "absolute", bottom: 20, left: 16, right: 16 }}>
            <div
              className="human-badge"
              style={{
                background: isDarkMode ? "rgba(16, 185, 129, 0.12)" : "#ecfdf5",
                color: "#10b981",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                width: "100%",
                justifyContent: "center",
                padding: "8px 12px",
                borderRadius: "10px"
              }}
            >
              <span className="pulse-dot" style={{ color: "#10b981" }}></span>
              <span>GERMAN AI ENGINE • READY</span>
            </div>
          </div>
        </Sider>
      )}

      {!isDesktop && (
        <Drawer
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <GlobalOutlined style={{ fontSize: "16px", color: "#ffffff" }} />
              </div>
              <span style={{ fontWeight: 800, fontSize: "18px", color: isDarkMode ? "#ffffff" : "#0f172a", fontFamily: "'Space Grotesk', sans-serif" }}>
                Deutsch<span style={{ color: "#d97706" }}>Lernen</span>
              </span>
            </div>
          }
          placement="left"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          styles={{ body: { padding: "12px 8px" } }}
          width={280}
        >
          <Menu
            mode="inline"
            selectedKeys={[activeKey]}
            items={menuItems}
            onClick={({ key }) => {
              onKeyChange(key);
              setDrawerVisible(false);
            }}
            style={{ borderRight: "none", background: "transparent" }}
          />
        </Drawer>
      )}

      <Layout
        style={{
          marginLeft: isDesktop ? 260 : 0,
          transition: "margin-left 0.2s ease-in-out",
          background: "transparent",
        }}
      >
        <Header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 90,
            width: "100%",
            background: isDarkMode ? "rgba(11, 14, 20, 0.85)" : "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            borderBottom: isDarkMode ? "1px solid #1e2638" : "1px solid #e2e8f0",
            padding: isDesktop ? "0 32px" : "0 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "64px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            {!isDesktop && (
              <Button
                type="text"
                icon={<MenuOutlined style={{ fontSize: "18px" }} />}
                onClick={() => setDrawerVisible(true)}
                style={{
                  marginRight: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  background: isDarkMode ? "#1e2638" : "#f1f5f9",
                  color: isDarkMode ? "#cbd5e1" : "#0f172a"
                }}
              />
            )}
            
            <Text
              style={{
                fontWeight: 700,
                fontSize: isDesktop ? "16px" : "14px",
                color: isDarkMode ? "#cbd5e1" : "#334155",
                letterSpacing: "-0.2px"
              }}
            >
              {menuItems.find((item) => item.key === activeKey)?.label || "Platform"}
            </Text>
          </div>

          <Space size={isDesktop ? 18 : 8}>
            <Button
              type="text"
              icon={<KeyOutlined />}
              onClick={() => {
                refreshKeys();
                setKeyModalVisible(true);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontWeight: 600,
                color: isDarkMode ? "#cbd5e1" : "#475569",
                background: isDarkMode ? "#1e2638" : "#f1f5f9",
                borderRadius: "8px",
                padding: isDesktop ? "0 12px" : "0 8px",
                height: "36px"
              }}
            >
              {isDesktop && "API Keys"}
            </Button>

            <Switch
              checked={isDarkMode}
              onChange={onToggleTheme}
              checkedChildren={<MoonOutlined style={{ verticalAlign: "middle" }} />}
              unCheckedChildren={<SunOutlined style={{ verticalAlign: "middle" }} />}
              style={{ background: isDarkMode ? "#d97706" : "#cbd5e1" }}
            />

            <Badge count={2} dot offset={[-2, 4]}>
              <Button
                type="text"
                shape="circle"
                icon={<BellOutlined style={{ fontSize: "18px", color: isDarkMode ? "#94a3b8" : "#64748b" }} />}
                style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
              />
            </Badge>

            <div 
              onClick={() => setProfileModalVisible(true)}
              style={{
                cursor: "pointer",
                padding: "4px 8px",
                borderRadius: "10px",
                transition: "background 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: isDarkMode ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.03)"
              }}
            >
              {isDesktop && (
                <div style={{ textAlign: "right", lineHeight: 1.1 }}>
                  <Text strong style={{ fontSize: "14px", color: token.colorText, display: "block" }}>
                    {userProfile.name || "Student"}
                  </Text>
                  <Text type="secondary" style={{ fontSize: "12px", display: "block", color: "#d97706", fontWeight: 700 }}>
                    {userLevelSelectLabel(userProfile.level)}
                  </Text>
                </div>
              )}
              <Avatar
                size={isDesktop ? 38 : 34}
                style={{
                  background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(217, 119, 6, 0.3)",
                }}
                icon={<UserOutlined />}
              />
            </div>
          </Space>
        </Header>

        <Content
          style={{
            padding: isDesktop ? "32px" : "16px",
            minHeight: "calc(100vh - 64px)",
            maxWidth: "1400px",
            width: "100%",
            margin: "0 auto",
          }}
        >
          {children}
        </Content>
      </Layout>

      <Modal
        title={
          <Space>
            <UserOutlined style={{ color: "#d97706" }} />
            <span style={{ fontWeight: 800 }}>{userProfile.name ? "Edit Student Profile" : "Welcome to DeutschLernen!"}</span>
          </Space>
        }
        open={profileModalVisible}
        onCancel={() => {
          if (userProfile.name) setProfileModalVisible(false);
        }}
        footer={null}
        destroyOnHidden
      >
        <Space direction="vertical" size={16} style={{ width: "100%", marginTop: 8 }}>
          <Text type="secondary" style={{ fontSize: "13px" }}>
            Set your display name and target CEFR German level. This is permanently saved in your local browser sandbox.
          </Text>

          <div>
            <Text strong style={{ fontSize: "13px", display: "block", marginBottom: 6 }}>
              Your Name
            </Text>
            <Input
              placeholder="e.g. Irshad Ahmad"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              prefix={<UserOutlined style={{ color: token.colorTextDescription }} />}
              size="large"
              style={{ borderRadius: "8px" }}
            />
          </div>

          <div>
            <Text strong style={{ fontSize: "13px", display: "block", marginBottom: 6 }}>
              Target German Level
            </Text>
            <Select
              value={levelSelect}
              onChange={setLevelSelect}
              size="large"
              style={{ width: "100%" }}
            >
              <Option value="A1">A1 - Anfänger (Breakthrough)</Option>
              <Option value="A2">A2 - Grundlagen (Waystage)</Option>
              <Option value="B1">B1 - Aufbau (Threshold)</Option>
              <Option value="B2">B2 - Fortgeschritten (Vantage)</Option>
              <Option value="C1">C1 - Fachkundig (Effective Proficiency)</Option>
              <Option value="C2">C2 - Beherrschung (Mastery)</Option>
            </Select>
          </div>

          <Button
            type="primary"
            block
            size="large"
            icon={<CheckOutlined />}
            onClick={handleSaveProfile}
            style={{
              height: "46px",
              borderRadius: "10px",
              fontWeight: 700,
              background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
              border: "none",
              marginTop: 8
            }}
          >
            Save Profile
          </Button>
        </Space>
      </Modal>

      <Modal
        title={
          <Space>
            <KeyOutlined style={{ color: token.colorPrimary }} />
            <span style={{ fontWeight: 800 }}>Manage API Keys</span>
          </Space>
        }
        open={keyModalVisible}
        onCancel={() => setKeyModalVisible(false)}
        footer={null}
        styles={{ body: { padding: "12px 0 0 0" } }}
        destroyOnHidden
      >
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Text type="secondary" style={{ fontSize: "13px" }}>
            Add one or more Google Gemini API Keys. The active key will be used for all AI operations.
          </Text>

          <div style={{ display: "flex", gap: "8px" }}>
            <Input.Password
              placeholder="Enter Gemini API Key (AIzaSy...)"
              value={newKeyInput}
              onChange={(e) => setNewKeyInput(e.target.value)}
              prefix={<KeyOutlined style={{ color: token.colorTextDescription }} />}
              onPressEnter={handleAddKey}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddKey}
              disabled={!newKeyInput.trim()}
              style={{ fontWeight: 600 }}
            >
              Add
            </Button>
          </div>

          <Divider style={{ margin: "8px 0" }} />

          <Text strong style={{ fontSize: "14px", color: token.colorText }}>
            Saved Keys ({apiKeys.length})
          </Text>

          <List
            dataSource={apiKeys}
            locale={{ emptyText: "No API keys configured yet." }}
            renderItem={(item) => {
              const maskedKey = item.key.length > 8 
                ? `${item.key.slice(0, 6)}...${item.key.slice(-4)}` 
                : "********";

              return (
                <List.Item
                  style={{
                    padding: "12px 16px",
                    background: item.active ? (isDarkMode ? "#1e2638" : "#ecfdf5") : "transparent",
                    borderRadius: "8px",
                    border: item.active 
                      ? `1px solid ${token.colorSuccessBorder}` 
                      : `1px solid ${token.colorBorderSecondary}`,
                    marginBottom: "8px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <Space direction="vertical" size={2} style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Text strong style={{ fontSize: "13px", color: token.colorText }}>
                        {item.provider} Key
                      </Text>
                      {item.active && (
                        <Tag color="success" style={{ margin: 0, fontWeight: 700, borderRadius: "4px", fontSize: "10px" }}>
                          ACTIVE
                        </Tag>
                      )}
                    </div>
                    <Text type="secondary" style={{ fontFamily: "monospace", fontSize: "12px" }}>
                      {maskedKey}
                    </Text>
                  </Space>

                  <Space size={8}>
                    {!item.active && (
                      <Button
                        type="text"
                        size="small"
                        icon={<CheckOutlined />}
                        onClick={() => handleSetActive(item.id)}
                        style={{
                          color: token.colorSuccess,
                          fontWeight: 600,
                          background: isDarkMode ? "rgba(16, 185, 129, 0.15)" : "#e6f7ff",
                          borderRadius: "4px"
                        }}
                      >
                        Use
                      </Button>
                    )}
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteKey(item.id)}
                      style={{
                        borderRadius: "4px",
                        background: isDarkMode ? "rgba(239, 68, 68, 0.15)" : "#fff0f6"
                      }}
                    >
                      Delete
                    </Button>
                  </Space>
                </List.Item>
              );
            }}
          />
        </Space>
      </Modal>
    </Layout>
  );
};

function userLevelSelectLabel(lvl) {
  return `${lvl || "A2"} telc Student`;
}
