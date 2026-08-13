import React, { useState, useEffect } from "react";
import { Card, Button, Typography, Space, Progress, Tag, Alert, Row, Col, message, theme } from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  RedoOutlined,
  InteractionOutlined,
  SmileOutlined
} from "@ant-design/icons";
import { StorageService } from "../services/storage";

const { Title, Paragraph, Text } = Typography;

const initialDeck = [
  {
    id: "hund",
    german: "Hund",
    article: "der",
    english: "dog",
    exampleGerman: "Der Hund bellt laut im Garten.",
    exampleEnglish: "The dog is barking loudly in the garden.",
    level: "A1"
  },
  {
    id: "katze",
    german: "Katze",
    article: "die",
    english: "cat",
    exampleGerman: "Die Katze schläft friedlich auf dem Sofa.",
    exampleEnglish: "The cat is sleeping peacefully on the sofa.",
    level: "A1"
  },
  {
    id: "buch",
    german: "Buch",
    article: "das",
    english: "book",
    exampleGerman: "Ich lese jeden Abend ein spannendes Buch.",
    exampleEnglish: "I read an exciting book every evening.",
    level: "A1"
  },
  {
    id: "arbeit",
    german: "Arbeit",
    article: "die",
    english: "work / job",
    exampleGerman: "Sie fährt jeden Morgen um acht Uhr zur Arbeit.",
    exampleEnglish: "She goes to work every morning at eight o'clock.",
    level: "A2"
  },
  {
    id: "bahnhof",
    german: "Bahnhof",
    article: "der",
    english: "train station",
    exampleGerman: "Entschuldigung, wie komme ich zum Bahnhof?",
    exampleEnglish: "Excuse me, how do I get to the train station?",
    level: "A1"
  },
  {
    id: "termin",
    german: "Termin",
    article: "der",
    english: "appointment",
    exampleGerman: "Ich habe morgen einen wichtigen Termin beim Arzt.",
    exampleEnglish: "I have an important appointment at the doctor's tomorrow.",
    level: "A2"
  },
  {
    id: "fahrrad",
    german: "Fahrrad",
    article: "das",
    english: "bicycle",
    exampleGerman: "Bei gutem Wetter fahre ich gerne mit dem Fahrrad.",
    exampleEnglish: "When the weather is good, I like to ride my bicycle.",
    level: "A1"
  },
  {
    id: "reise",
    german: "Reise",
    article: "die",
    english: "journey / trip",
    exampleGerman: "Gute Reise und kommen Sie gesund wieder!",
    exampleEnglish: "Have a good trip and return safely!",
    level: "A2"
  },
  {
    id: "geschenk",
    german: "Geschenk",
    article: "das",
    english: "gift / present",
    exampleGerman: "Das Geschenk ist eine Überraschung für meine Mutter.",
    exampleEnglish: "The gift is a surprise for my mother.",
    level: "A2"
  },
  {
    id: "fruehstueck",
    german: "Frühstück",
    article: "das",
    english: "breakfast",
    exampleGerman: "Was essen Sie normalerweise zum Frühstück?",
    exampleEnglish: "What do you normally eat for breakfast?",
    level: "A1"
  }
];

export const Flashcards = () => {
  const [deck] = useState(initialDeck);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredMap, setMasteredMap] = useState({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slideDirection, setSlideDirection] = useState("in");

  const { token } = theme.useToken();

  useEffect(() => {
    const loadProgress = async () => {
      const progress = await StorageService.getFlashcardsProgress();
      setMasteredMap(progress);
    };
    loadProgress();
  }, []);

  const currentCard = deck[currentIndex];

  const getArticleColor = (article) => {
    switch (article) {
      case "der": return "#2563eb";
      case "die": return "#e11d48";
      case "das": return "#10b981";
      default: return token.colorTextSecondary;
    }
  };

  const nextCard = (direction = "left") => {
    setSlideDirection(direction);
    setIsTransitioning(true);

    setTimeout(() => {
      setIsFlipped(false);
      setCurrentIndex((prev) => (prev + 1) % deck.length);
      setSlideDirection("in");
      setIsTransitioning(false);
    }, 250);
  };

  const handleStillLearning = () => {
    nextCard("left");
  };

  const handleIKnowThis = async () => {
    const cardId = currentCard.id;
    const newMasteredMap = { ...masteredMap, [cardId]: "mastered" };
    setMasteredMap(newMasteredMap);
    await StorageService.saveFlashcardStatus(cardId, "mastered");
    
    message.success({
      content: `Gewusst! Added "${currentCard.german}" to Mastered. 🎉`,
      duration: 1.5
    });

    nextCard("right");
  };

  const handleResetDeck = async () => {
    if (window.confirm("Möchten Sie Ihren gesamten Vokabel-Fortschritt zurücksetzen?")) {
      await StorageService.clearFlashcardsProgress();
      setMasteredMap({});
      setCurrentIndex(0);
      setIsFlipped(false);
      message.success("Flashcards progress reset successfully!");
    }
  };

  const masteredCount = deck.filter(card => masteredMap[card.id] === "mastered").length;
  const masteryPercentage = Math.round((masteredCount / deck.length) * 100);

  const cardContainerStyle = {
    perspective: "1200px",
    width: "100%",
    maxWidth: "460px",
    height: "320px",
    margin: "0 auto 28px auto",
    cursor: "pointer",
    position: "relative",
    transform: slideDirection === "left" 
      ? "translateX(-150px) rotate(-8deg) scale(0.9)" 
      : slideDirection === "right" 
      ? "translateX(150px) rotate(8deg) scale(0.9)" 
      : "translateX(0) scale(1)",
    opacity: isTransitioning ? 0 : 1,
    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
  };

  const cardInnerStyle = {
    position: "relative",
    width: "100%",
    height: "100%",
    textAlign: "center",
    transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
    transformStyle: "preserve-3d",
    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
  };

  const cardFaceStyle = {
    position: "absolute",
    width: "100%",
    height: "100%",
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    borderRadius: "20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "32px 28px",
    boxShadow: token.boxShadowCard,
    border: `1px solid ${token.colorBorderSecondary}`,
  };

  const cardFrontStyle = {
    ...cardFaceStyle,
    background: token.colorBgContainer,
  };

  const cardBackStyle = {
    ...cardFaceStyle,
    background: token.colorBgContainer,
    transform: "rotateY(180deg)",
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ textAlign: "center" }}>
        <Title level={2} style={{ fontWeight: 800, margin: 0, color: token.colorText, fontFamily: "'Space Grotesk', sans-serif" }}>
          TELC Vocab Flashcards
        </Title>
        <Paragraph type="secondary" style={{ marginTop: "6px", fontSize: "14px" }}>
          Build retention with smart physical-tactile digital deck models. Tap card to flip.
        </Paragraph>
      </div>

      <Card variant="borderless" style={{ borderRadius: "16px", boxShadow: token.boxShadowCard, background: token.colorBgContainer }}>
        <Row align="middle" gutter={16}>
          <Col xs={18}>
            <Text type="secondary" style={{ fontSize: "13px", display: "block", marginBottom: "4px" }}>
              Deck Mastery Progress ({masteredCount} of {deck.length} words learned)
            </Text>
            <Progress percent={masteryPercentage} strokeColor="#d97706" />
          </Col>
          <Col xs={6} style={{ textAlign: "right" }}>
            <Button size="small" type="dashed" danger icon={<RedoOutlined />} onClick={handleResetDeck}>
              Reset
            </Button>
          </Col>
        </Row>
      </Card>

      <div style={cardContainerStyle} onClick={() => setIsFlipped(!isFlipped)}>
        <div style={cardInnerStyle}>
          <div style={cardFrontStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
              <Tag color="gold" style={{ borderRadius: "4px", border: "none", fontWeight: 700 }}>
                Level {currentCard.level}
              </Tag>
              {masteredMap[currentCard.id] === "mastered" && (
                <Tag color="success" icon={<CheckOutlined />} style={{ borderRadius: "4px", border: "none", fontWeight: 700 }}>
                  Mastered
                </Tag>
              )}
            </div>

            <div style={{ textAlign: "center", margin: "24px 0" }}>
              {currentCard.article !== "none" && (
                <Text
                  style={{
                    fontSize: "24px",
                    fontWeight: 700,
                    color: getArticleColor(currentCard.article),
                    display: "block",
                    textTransform: "lowercase",
                    marginBottom: "4px",
                    fontFamily: "'Space Grotesk', sans-serif"
                  }}
                >
                  {currentCard.article}
                </Text>
              )}
              <Title
                level={1}
                style={{
                  margin: 0,
                  fontSize: "44px",
                  fontWeight: 900,
                  color: token.colorText,
                  fontFamily: "'Space Grotesk', sans-serif",
                  letterSpacing: "-1px"
                }}
              >
                {currentCard.german}
              </Title>
            </div>

            <Space style={{ color: token.colorTextDescription, fontSize: "13px" }}>
              <InteractionOutlined />
              <Text type="secondary">Tap to flip & see English example</Text>
            </Space>
          </div>

          <div style={cardBackStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
              <Tag color="purple" style={{ borderRadius: "4px", border: "none", fontWeight: 700 }}>
                Translation
              </Tag>
              <Text type="secondary" style={{ fontSize: "12px", fontWeight: 600 }}>
                {currentIndex + 1} / {deck.length}
              </Text>
            </div>

            <div style={{ textAlign: "center", margin: "16px 0", width: "100%" }}>
              <Text type="secondary" style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>
                English Meaning
              </Text>
              <Title
                level={2}
                style={{
                  margin: "4px 0 16px 0",
                  fontSize: "30px",
                  fontWeight: 800,
                  color: "#d97706",
                  fontFamily: "'Space Grotesk', sans-serif"
                }}
              >
                {currentCard.english}
              </Title>

              <div
                style={{
                  background: token.colorBgLayout,
                  padding: "16px",
                  borderRadius: "12px",
                  border: `1px dashed ${token.colorBorder}`,
                  textAlign: "left",
                  maxWidth: "100%",
                }}
              >
                <Text strong style={{ display: "block", fontSize: "14px", color: token.colorText, marginBottom: "4px" }}>
                  🇩🇪 {currentCard.exampleGerman}
                </Text>
                <Text type="secondary" style={{ display: "block", fontSize: "13px", color: token.colorTextSecondary }}>
                  🇬🇧 {currentCard.exampleEnglish}
                </Text>
              </div>
            </div>

            <Space style={{ color: token.colorTextDescription, fontSize: "13px" }}>
              <InteractionOutlined />
              <Text type="secondary">Tap to flip back</Text>
            </Space>
          </div>
        </div>
      </div>

      <Row gutter={16}>
        <Col xs={12}>
          <Button
            danger
            block
            size="large"
            icon={<CloseOutlined />}
            onClick={handleStillLearning}
            style={{
              height: "56px",
              borderRadius: "16px",
              fontWeight: 700,
              fontSize: "16px",
              boxShadow: "0 4px 12px rgba(239, 68, 68, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}
          >
            Noch lernen
          </Button>
        </Col>
        <Col xs={12}>
          <Button
            type="primary"
            block
            size="large"
            icon={<CheckOutlined />}
            onClick={handleIKnowThis}
            style={{
              height: "56px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              border: "none",
              fontWeight: 700,
              fontSize: "16px",
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}
          >
            Kenne ich
          </Button>
        </Col>
      </Row>

      <Alert
        message={
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <SmileOutlined style={{ color: token.colorPrimary }} />
            <Text style={{ fontSize: "13px", color: token.colorText }}>
              <strong>Tip:</strong> Try to formulate your own sentence using the word before flipping the card!
            </Text>
          </div>
        }
        type="info"
        showIcon={false}
        style={{ borderRadius: "12px", border: `1px dashed ${token.colorPrimaryBorder}`, background: token.colorPrimaryBg }}
      />
    </div>
  );
};
