import { GoogleGenerativeAI } from "@google/generative-ai";
import { StorageService } from "./storage";

export class AIService {
  static API_KEY_NAME = "GEMINI_API_KEY";
  static DEFAULT_MODEL = "gemini-2.5-flash";
  static FALLBACK_MODEL = "gemini-flash-latest";

  static getAPIKey() {
    try {
      return StorageService.getActiveApiKey() || "";
    } catch (e) {
      console.error("Failed to read GEMINI_API_KEY from storage:", e);
      return "";
    }
  }

  static saveAPIKey(key) {
    try {
      if (key && key.trim()) {
        localStorage.setItem(this.API_KEY_NAME, key.trim());
        return true;
      }
      return false;
    } catch (e) {
      console.error("Failed to write GEMINI_API_KEY to storage:", e);
      return false;
    }
  }

  static deleteAPIKey() {
    try {
      localStorage.removeItem(this.API_KEY_NAME);
      return true;
    } catch (e) {
      console.error("Failed to delete GEMINI_API_KEY from storage:", e);
      return false;
    }
  }

  static getModel(genAI, config = {}) {
    try {
      return genAI.getGenerativeModel({
        model: this.DEFAULT_MODEL,
        ...config
      });
    } catch (e) {
      console.warn("Failed to load primary model, falling back to flash-latest:", e);
      return genAI.getGenerativeModel({
        model: this.FALLBACK_MODEL,
        ...config
      });
    }
  }

  static async sendMessageToTutor(chatHistory, userMessage, cefrLevel) {
    const apiKey = this.getAPIKey();
    if (!apiKey) {
      throw new Error("No active API Key found. Please add one in the Header settings.");
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const systemInstruction = 
        `You are an expert German language tutor for telc exam preparation. ` +
        `The user is practicing at the ${cefrLevel} level. ` +
        `Speak 80% in German matching this level exactly, and 20% in English for corrections. ` +
        `Keep responses concise, perfect for mobile reading. ` +
        `End responses with a practical follow-up question. ` +
        `If the user makes a grammatical mistake, gently point it out first in English.`;

      const model = this.getModel(genAI, { systemInstruction });

      const formattedHistory = chatHistory.map((message) => ({
        role: message.role === "user" ? "user" : "model",
        parts: [{ text: message.text || "" }],
      }));

      const chat = model.startChat({
        history: formattedHistory,
      });

      const result = await chat.sendMessage(userMessage);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("AIService.sendMessageToTutor failed:", error);
      throw error;
    }
  }

  static async generateMockExam(cefrLevel) {
    const apiKey = this.getAPIKey();
    if (!apiKey) {
      throw new Error("No active API Key found. Please add one in the Header settings.");
    }

    const fallbackExams = {
      A1: {
        reading: [
          {
            title: "Teil 1: Schilder und Hinweise (Matching)",
            text: "Read the following short signs or notices.",
            questions: [
              { "id": "r1", "q": "Schild 1: 'Eingang nur für Personal'. Was bedeutet das?", "options": ["Man darf hier nicht reingehen.", "Jeder darf hier reingehen.", "Hier gibt es Essen."], "answer": "Man darf hier nicht reingehen." },
              { "id": "r2", "q": "Hinweis: 'Fahrkarten bitte vor Fahrtantritt entwerten'. Was bedeutet das?", "options": ["Fahrkarte erst nach der Fahrt kaufen.", "Fahrkarte vor dem Zug einsteigen stempeln.", "Fahrkarte wegschmeißen."], "answer": "Fahrkarte vor dem Zug einsteigen stempeln." }
            ]
          },
          {
            title: "Teil 2: Lesetext (Reading Comprehension)",
            text: "Hallo! Ich heiße Lukas und wohne in Berlin. Ich bin 25 Jahre alt und lerne Deutsch bei einer Sprachschule. Mein Kurs ist jeden Montag und Mittwoch um 10 Uhr. Nach dem Unterricht trinke ich Kaffee mit meinen Freunden.",
            questions: [
              { "id": "r3", "q": "Lukas lernt Deutsch an einer Schule.", "options": ["Richtig", "Falsch"], "answer": "Richtig" },
              { "id": "r4", "q": "Lukas hat jeden Montag und Mittwoch Deutschkurs.", "options": ["Richtig", "Falsch"], "answer": "Richtig" }
            ]
          }
        ],
        listening: [
          {
            title: "Teil 1: Voicemail / Anrufbeantworter",
            script: "Guten Tag, hier spricht Herr Weber von der Arztpraxis. Ihr Termin für morgen um 9 Uhr muss leider auf 14 Uhr verschoben werden. Bitte rufen Sie uns zurück.",
            questions: [
              { "id": "l1", "q": "Warum ruft der Arzt an?", "options": ["Termin absagen", "Termin verschieben", "Rezept abholen"], "answer": "Termin verschieben" },
              { "id": "l2", "q": "Was soll der Patient tun?", "options": ["Direkt vorbeikommen", "Anrufen", "Eine E-Mail schreiben"], "answer": "Anrufen" }
            ]
          },
          {
            title: "Teil 2: Radio Announcement",
            script: "Guten Tag, liebe Fahrgäste. Der ICE 574 nach Hamburg Hauptbahnhof fährt heute ausnahmsweise von Gleis 4 ab, nicht von Gleis 7.",
            questions: [
              { "id": "l3", "q": "Der Zug nach Hamburg fährt ab von:", "options": ["Gleis 7", "Gleis 4", "Gleis 9"], "answer": "Gleis 4" }
            ]
          }
        ],
        writing: {
          title: "Schreiben: Eine kurze Nachricht",
          prompt: "Schreiben Sie eine kurze Nachricht an Ihren Freund Max. Laden Sie ihn zum Abendessen ein.",
          points: [
            "Grund für das Schreiben (Abendessen)",
            "Essen vorschlagen (Pizza oder Pasta)",
            "Nach der Uhrzeit fragen"
          ]
        },
        speaking: [
          { "id": "s1", "title": "Teil 1: Über sich sprechen", "prompt": "Stellen Sie sich kurz vor: Name, Alter, Herkunftsland, Wohnort, Hobbys, Beruf." },
          { "id": "s2", "title": "Teil 2: Informationen austauschen", "prompt": "Stellen Sie Ihrem Partner Fragen zu Hobbys und Beruf." },
          { "id": "s3", "title": "Teil 3: Etwas aushandeln", "prompt": "Planen Sie ein Treffen am Wochenende mit Ihrem Partner." }
        ]
      },
      B2: {
        reading: [
          {
            title: "Teil 1: Schilder und Hinweise (Matching)",
            text: "Lesen Sie die folgenden Hinweise in einer Behörde.",
            questions: [
              { "id": "r1", "q": "Schild: 'Zutritt für Unbefugte verboten'. Wer darf eintreten?", "options": ["Mitarbeiter der Behörde", "Jeder Besucher", "Niemand"], "answer": "Mitarbeiter der Behörde" },
              { "id": "r2", "q": "Hinweis: 'Bitte ziehen Sie eine Wartenummer am Automaten vor dem Betreten des Zimmers'.", "options": ["Direkt eintreten", "Zuerst Wartenummer ziehen", "Zettel schreiben"], "answer": "Zuerst Wartenummer ziehen" }
            ]
          },
          {
            title: "Teil 2: Lesetext (Reading Comprehension)",
            text: "Die fortschreitende Digitalisierung verändert die deutsche Arbeitswelt grundlegend. Immer mehr Unternehmen bieten flexible Arbeitszeiten und Homeoffice-Optionen an. Dies steigert einerseits die Mitarbeiterzufriedenheit, führt jedoch andererseits zu einer Verschmelzung von Freizeit und Beruf, was gesundheitliche Belastungen zur Folge haben kann.",
            questions: [
              { "id": "r3", "q": "Laut Text hat Homeoffice ausschließlich positive Auswirkungen auf Arbeitnehmer.", "options": ["Richtig", "Falsch"], "answer": "Falsch" },
              { "id": "r4", "q": "Die fortschreitende Digitalisierung führt zu flexibleren Arbeitszeiten.", "options": ["Richtig", "Falsch"], "answer": "Richtig" }
            ]
          }
        ],
        listening: [
          {
            title: "Teil 1: Voicemail / Anrufbeantworter",
            script: "Hallo Sarah, hier ist Jan. Ich schaffe es heute leider nicht pünktlich zum Treffen, da mein Auto eine Panne hat. Ich denke, ich werde etwa eine halbe Stunde später kommen. Sollen wir uns lieber direkt im Restaurant treffen?",
            questions: [
              { "id": "l1", "q": "Warum verspätet sich Jan?", "options": ["Er hat verschlafen.", "Sein Auto hat eine Panne.", "Es gibt viel Verkehr."], "answer": "Sein Auto hat eine Panne." },
              { "id": "l2", "q": "Wo schlägt Jan vor, sich zu treffen?", "options": ["Bei ihm zu Hause.", "Direkt im Restaurant.", "Am Bahnhof."], "answer": "Direkt im Restaurant." }
            ]
          },
          {
            title: "Teil 2: Radio Announcement",
            script: "Herzlich willkommen zu unserem wöchentlichen Wirtschaftsbericht. Heute geht es um den Trend zum nachhaltigen Konsum. Immer mehr deutsche Verbraucher sind bereit, für Bio-Lebensmittel und fair gehandelte Kleidung höhere Preise zu zahlen. Experten deuten dies als langfristigen Wandel im Kaufverhalten.",
            questions: [
              { "id": "l3", "q": "Welche Aussage zum nachhaltigen Konsum ist laut Bericht richtig?", "options": ["Deutsche Verbraucher sparen beim Einkauf von Kleidung.", "Nachhaltigkeit wird von Käufern immer mehr geschätzt.", "Experten sehen in Bio-Lebensmitteln einen kurzfristigen Trend."], "answer": "Nachhaltigkeit wird von Käufern immer mehr geschätzt." }
            ]
          }
        ],
        writing: {
          title: "Schreiben: Eine formelle Beschwerde-E-Mail",
          prompt: "Schreiben Sie eine formelle Beschwerde-E-Mail an ein Online-Möbelhaus. Sie haben einen Tisch bestellt, der beschädigt geliefert wurde.",
          points: [
            "Grund für Ihre Beschwerde",
            "Mängel am Tisch beschreiben",
            "Einen Vorschlag zur Problemlösung machen (Ersatz oder Rabatt)"
          ]
        },
        speaking: [
          { "id": "s1", "title": "Teil 1: Über sich sprechen", "prompt": "Stellen Sie sich kurz vor und beschreiben Sie Ihren beruflichen Werdegang." },
          { "id": "s2", "title": "Teil 2: Ein Gespräch führen", "prompt": "Diskutieren Sie mit Ihrem Partner über das Thema: 'Sollte Plastikspielzeug komplett verboten werden?'" },
          { "id": "s3", "title": "Teil 3: Etwas aushandeln", "prompt": "Planen Sie ein Event mit Ihrem Partner." }
        ]
      }
    };

    const getFallbackData = (lvl) => {
      if (lvl === "A1" || lvl === "A2") return fallbackExams.A1;
      return fallbackExams.B2;
    };

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = this.getModel(genAI);

      const prompt = `Generate a full, authentic mock telc German exam for the ${cefrLevel} level. 
      You MUST return ONLY a raw JSON object. Do not include markdown formatting or code blocks.
      Use this exact structure with multiple questions per section to simulate the real exam length:
      {
        "reading": [
          {
            "title": "Teil 1: Schilder und Hinweise (Matching)",
            "text": "Read the following 3 short signs or notices.",
            "questions": [
              { "id": "r1", "q": "Sign 1: [Text of sign]. What does this mean?", "options": ["A", "B", "C"], "answer": "The correct option string" },
              { "id": "r2", "q": "Sign 2: [Text of sign]. What does this mean?", "options": ["A", "B", "C"], "answer": "The correct option string" }
            ]
          },
          {
            "title": "Teil 2: Lesetext (Reading Comprehension)",
            "text": "A medium-length email or newspaper article appropriate for ${cefrLevel}.",
            "questions": [
              { "id": "r3", "q": "Question about the text.", "options": ["A", "B", "C"], "answer": "The correct option string" },
              { "id": "r4", "q": "Another question about the text.", "options": ["A", "B", "C"], "answer": "The correct option string" }
            ]
          }
        ],
        "listening": [
          {
            "title": "Teil 1: Voicemail / Anrufbeantworter",
            "script": "A German transcript of a short voicemail.",
            "questions": [
              { "id": "l1", "q": "Why is the person calling?", "options": ["A", "B", "C"], "answer": "The correct option string" },
              { "id": "l2", "q": "What should the listener do?", "options": ["A", "B", "C"], "answer": "The correct option string" }
            ]
          },
          {
            "title": "Teil 2: Radio Announcement",
            "script": "A German transcript of a radio weather or traffic report.",
            "questions": [
              { "id": "l3", "q": "What is the announcement about?", "options": ["A", "B", "C"], "answer": "The correct option string" }
            ]
          }
        ],
        "writing": {
          "title": "Schreiben: Eine kurze Nachricht",
          "prompt": "You need to cancel an appointment and suggest a new time. Write an email to your colleague.",
          "points": [
            "Apologize for canceling.",
            "Give a reason why you cannot come.",
            "Suggest a new date and time."
          ]
        },
        "speaking": [
          { "id": "s1", "title": "Teil 1: Über sich sprechen", "prompt": "Introduce yourself: Name, Age, Country, Profession, Languages, Hobbies." },
          { "id": "s2", "title": "Teil 2: Informationen austauschen", "prompt": "Ask your partner 3 questions about their weekend." },
          { "id": "s3", "title": "Teil 3: Etwas aushandeln", "prompt": "Plan a birthday party with your partner. Discuss: When, Where, Food, Drinks, Present." }
        ]
      }
      Ensure the German text is highly accurate for the ${cefrLevel} level. Output raw JSON only.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();

      if (text.startsWith("```")) {
        text = text.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      }

      return JSON.parse(text);
    } catch (error) {
      console.warn("AIService.generateMockExam API failed, using structured CEFR fallback:", error);
      return getFallbackData(cefrLevel);
    }
  }

  static async gradeExam(cefrLevel, examData, userAnswers) {
    const apiKey = this.getAPIKey();
    if (!apiKey) {
      throw new Error("No active API Key found. Please add one in the Header settings.");
    }

    let totalQuestions = 0;
    let correctAnswersCount = 0;
    const details = [];

    if (examData && examData.reading) {
      examData.reading.forEach(part => {
        if (part.questions) {
          part.questions.forEach(q => {
            totalQuestions++;
            const studentAns = (userAnswers && userAnswers.reading && userAnswers.reading[q.id]) || "";
            const isCorrect = String(studentAns).trim().toLowerCase() === String(q.answer).trim().toLowerCase();
            if (isCorrect) correctAnswersCount++;
            details.push(`- Reading ${q.id}: Student: "${studentAns}", Correct: "${q.answer}" -> ${isCorrect ? "RICHTIG" : "FALSCH"}`);
          });
        }
      });
    }

    if (examData && examData.listening) {
      examData.listening.forEach(part => {
        if (part.questions) {
          part.questions.forEach(q => {
            totalQuestions++;
            const studentAns = (userAnswers && userAnswers.listening && userAnswers.listening[q.id]) || "";
            const isCorrect = String(studentAns).trim().toLowerCase() === String(q.answer).trim().toLowerCase();
            if (isCorrect) correctAnswersCount++;
            details.push(`- Listening ${q.id}: Student: "${studentAns}", Correct: "${q.answer}" -> ${isCorrect ? "RICHTIG" : "FALSCH"}`);
          });
        }
      });
    }

    const writingAnswer = (userAnswers && userAnswers.writing) || "";
    const speakingTranscript = (userAnswers && userAnswers.speaking) || "";

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = this.getModel(genAI);

      const prompt = `You are a strict certified telc examiner. Evaluate the student's mock exam responses for German level ${cefrLevel}.\n\n` +
        `--- OBJECTIVE PORTION RESULTS ---\n` +
        `The student completed the Reading and Listening parts.\n` +
        `Score: ${correctAnswersCount} / ${totalQuestions} correct answers.\n` +
        `Detailed objective questions log:\n${details.join("\n")}\n\n` +
        `--- STUDENT WRITING ANSWER ---\n${writingAnswer || "No writing answer provided."}\n\n` +
        `--- STUDENT SPEAKING TRANSCRIPT ---\n${speakingTranscript || "No speaking answer provided."}\n\n` +
        `Evaluate the student's overall performance under official telc criteria (grammar, range, contextual accuracy, level compliance). ` +
        `Incorporate both the objective score (${correctAnswersCount}/${totalQuestions}) and your subjective assessment of Writing/Speaking into the final score.\n` +
        `Provide a clear breakdown identifying: \n` +
        `1. Objective Portion Breakdown (Reading/Listening performance analysis).\n` +
        `2. Writing Portion Feedback (spelling, grammar, structural coherence, addressing bullet points).\n` +
        `3. Speaking Portion Feedback (fluency, range, pronunciation observations).\n` +
        `4. Grammatical corrections (identify specific errors and explain corrections in English).\n` +
        `5. Level suitability advice.\n` +
        `6. A final numerical score out of 100 (e.g. "Score: 78/100").\n` +
        `Respond in a clear, formatted professional layout using markdown.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("AIService.gradeExam failed:", error);
      throw error;
    }
  }

  static async quickTranslate(text, toGerman = true) {
    const apiKey = this.getAPIKey();
    if (!apiKey) {
      throw new Error("No active API Key found. Please add one in the Header settings.");
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = this.getModel(genAI);

      const prompt = toGerman
        ? `Translate the following English text to German. Return a JSON object: { "translation": "...", "notes": "Include the gender (der/die/das) for nouns, plural forms, or mention if it is formal/informal." }. Text: ${text}`
        : `Translate the following German text to English. Return a JSON object: { "translation": "...", "notes": "Briefly explain any complex grammar or idioms used." }. Text: ${text}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let resText = response.text().trim();

      if (resText.startsWith("```")) {
        resText = resText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      }

      return JSON.parse(resText);
    } catch (error) {
      console.warn("AIService.quickTranslate API failed, using fallback:", error);
      return {
        translation: toGerman 
          ? `[Simuliert] Übersetzung für: "${text}"` 
          : `[Simulated] Translation for: "${text}"`,
        notes: "Hinweis: Zur Live-Übersetzung wird ein funktionierender Gemini API-Key benötigt."
      };
    }
  }

  static async generateDailyCourse(cefrLevel) {
    const apiKey = this.getAPIKey();
    if (!apiKey) {
      throw new Error("No active API Key found. Please add one in the Header settings.");
    }

    const fallbacks = {
      A1: {
        title: "Kapitel 1: Unterwegs in Bayern",
        introduction: "Today we will learn how to greet people, ask for simple directions, and order a beverage in a traditional Bavarian café.",
        grammar: {
          concept: "Verben im Präsens (Present Tense Verbs)",
          explanation: "In German, verbs change their endings based on the subject pronoun. Regular verbs like 'lernen' (to learn) follow a strict conjugation pattern.",
          examples: [
            { de: "Ich wohne in München.", en: "I live in Munich." },
            { de: "Woher kommst du?", en: "Where do you come from?" }
          ]
        },
        reading: {
          text: "Hallo! Ich heiße Anna und ich bin Studentin in München. München ist sehr schön. Ich lerne hier Deutsch und treffe meine Freunde im Englischen Garten. Am Wochenende trinke ich gern Spezi in einem Biergarten.",
          translation: "Hello! My name is Anna and I am a student in Munich. Munich is very beautiful. I learn German here and meet my friends in the English Garden. On the weekend, I like to drink Spezi in a beer garden.",
          vocabulary: [
            { word: "heißen", meaning: "to be called" },
            { word: "schön", meaning: "beautiful / nice" },
            { word: "treffen", meaning: "to meet" },
            { word: "der Biergarten", meaning: "the beer garden" }
          ]
        },
        speaking_writing_tips: {
          tip: "For the telc A1 Speaking Part 1, practice spelling your last name out loud using the German alphabet.",
          phrases: [
            { de: "Wie bitte?", en: "Pardon me? / What was that?" },
            { de: "Können Sie das buchstabieren?", en: "Can you spell that?" }
          ]
        }
      },
      B2: {
        title: "Kapitel 4: Zukunft der Mobilität",
        introduction: "Lernen Sie, wie Sie komplexe argumentative Diskussionen über die Mobilitätswende führen und zweiteilige Konnektoren einsetzen.",
        grammar: {
          concept: "Zweiteilige Konnektoren (Correlative Conjunctions)",
          explanation: "Correlative connectors link two clauses or options together. Examples include 'sowohl... als auch' (both... and) and 'weder... noch' (neither... nor).",
          examples: [
            { de: "Die Mobilitätswende ist sowohl ökologisch notwendig als auch ökonomisch herausfordernd.", en: "The mobility transition is both ecologically necessary and economically challenging." }
          ]
        },
        reading: {
          text: "Die Reduzierung des Individualverkehrs in deutschen Großstädten wird kontrovers diskutiert. Befürworter plädieren für einen massiven Ausbau des Schienennetzes und kostenlosen Personennahverkehr. Kritiker hingegen befürchten erhebliche Einschränkungen der persönlichen Freiheit und weisen auf die mangelnde Infrastruktur im ländlichen Raum hin.",
          translation: "The reduction of individual traffic in major German cities is controversially discussed. Supporters advocate for a massive expansion of the rail network and free public transport. Critics, on the other hand, fear significant restrictions on personal freedom and point to the lack of infrastructure in rural areas.",
          vocabulary: [
            { word: "die Mobilitätswende", meaning: "the mobility transition" },
            { word: "Befürworter", meaning: "supporters / advocates" },
            { word: "plädieren für", meaning: "to plead for / advocate for" }
          ]
        },
        speaking_writing_tips: {
          tip: "In the telc B2 Discussion portion, always use correlative connectors like 'nicht nur... sondern auch' to express multi-faceted arguments elegantly.",
          phrases: [
            { de: "Ich bin der Ansicht, dass...", en: "I am of the opinion that..." },
            { de: "Man sollte nicht nur die Vorteile sehen, sondern auch...", en: "One should not only look at the advantages, but also..." }
          ]
        }
      }
    };

    const getFallback = (lvl) => {
      if (lvl === "A1" || lvl === "A2" || lvl === "B1") return fallbacks.A1;
      return fallbacks.B2;
    };

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = this.getModel(genAI);

      const prompt = `Act as an expert German textbook author creating a daily lesson for the ${cefrLevel} level. 
      The style should mimic modern textbooks like "Netzwerk neu" or "Menschen" — highly contextual, explaining rules clearly, providing direct English translations, and offering exam tips.
      
      Return ONLY a raw JSON object with this exact structure:
      {
        "title": "A catchy chapter title (e.g., 'Kapitel 1: Unterwegs in Bayern')",
        "introduction": "A brief intro to what we are learning today.",
        "grammar": {
          "concept": "The grammar rule being taught.",
          "explanation": "Clear explanation in English.",
          "examples": [
            { "de": "German sentence", "en": "English translation" }
          ]
        },
        "reading": {
          "text": "A short, level-appropriate text.",
          "translation": "Full English translation of the text.",
          "vocabulary": [ { "word": "der Begriff", "meaning": "the concept" } ]
        },
        "speaking_writing_tips": {
          "tip": "A practical tip for the telc exam regarding this topic.",
          "phrases": [ { "de": "Useful phrase", "en": "Translation" } ]
        }
      }
      Ensure the German text is highly accurate for the ${cefrLevel} level. Do not wrap in markdown code blocks. Output raw JSON only.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();

      if (text.startsWith("```")) {
        text = text.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      }

      return JSON.parse(text);
    } catch (error) {
      console.warn("AIService.generateDailyCourse API failed, using structured fallback:", error);
      return getFallback(cefrLevel);
    }
  }
}
