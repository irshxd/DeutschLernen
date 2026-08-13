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
        `If the user makes a grammatical mistake, gently point it out first in English. ` +
        `Always keep the conversation dynamic and fresh, introducing new contextual vocabulary.`;

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

    const previousExams = StorageService.getGeneratedHistory("exam");

    const fallbackExams = [
      {
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
      {
        reading: [
          {
            title: "Teil 1: Wohnungsanzeigen & Hinweise",
            text: "Lesen Sie die Hinweise im Bürgeramt.",
            questions: [
              { "id": "r1", "q": "Hinweis: 'Terminbuchung nur online möglich'. Was gilt?", "options": ["Ohne Online-Termin kein Zutritt.", "Man kann vor Ort warten.", "Bürgeramt ist geschlossen."], "answer": "Ohne Online-Termin kein Zutritt." },
              { "id": "r2", "q": "Aushang: 'Ruhezeiten im Mietshaus von 22 bis 7 Uhr'. Was bedeutet das?", "options": ["Nachts keine laute Musik machen.", "Tagsüber leise sein.", "Kein Besuch gestattet."], "answer": "Nachts keine laute Musik machen." }
            ]
          },
          {
            title: "Teil 2: E-Mail von der Hausverwaltung",
            text: "Sehr geehrte Mieterinnen und Mieter, am nächsten Dienstag finden zwischen 8:00 und 12:00 Uhr Wartungsarbeiten an den Wasserleitungen statt. Bitte halten Sie in dieser Zeit die Haupthähne geschlossen.",
            questions: [
              { "id": "r3", "q": "Am Dienstag gibt es Einschränkungen bei der Wasserversorgung.", "options": ["Richtig", "Falsch"], "answer": "Richtig" },
              { "id": "r4", "q": "Die Arbeiten dauern den ganzen Tag.", "options": ["Richtig", "Falsch"], "answer": "Falsch" }
            ]
          }
        ],
        listening: [
          {
            title: "Teil 1: Durchsage im Supermarkt",
            script: "Liebe Kundinnen und Kunden, heute haben wir frische Bio-Äpfel aus der Region im Angebot für nur 1,99 Euro pro Kilo. Greifen Sie zu!",
            questions: [
              { "id": "l1", "q": "Was ist heute im Angebot?", "options": ["Äpfel", "Brot", "Milch"], "answer": "Äpfel" }
            ]
          }
        ],
        writing: {
          title: "Schreiben: E-Mail an den Vermieter",
          prompt: "In Ihrer Wohnung funktioniert die Heizung nicht mehr. Schreiben Sie eine E-Mail an den Vermieter Herr Müller.",
          points: [
            "Problem schildern (Heizung kalt)",
            "Seit wann das Problem besteht",
            "Um dringenden Handwerkertermin bitten"
          ]
        },
        speaking: [
          { "id": "s1", "title": "Teil 1: Beruf & Alltagsroutine", "prompt": "Beschreiben Sie Ihren typischen Tagesablauf in Deutschland." },
          { "id": "s2", "title": "Teil 2: Meinung äußern", "prompt": "Diskutieren Sie: 'Sollte der öffentliche Nahverkehr für alle Bürger kostenlos sein?'" }
        ]
      }
    ];

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = this.getModel(genAI);

      const avoidText = previousExams.length > 0 
        ? `CRITICAL UNIQUE CONSTRAINT: Do NOT repeat any of these topics/titles previously generated: [${previousExams.join(", ")}].`
        : "";

      const prompt = `Generate a completely NEW and UNIQUE mock telc German exam for level ${cefrLevel}. 
      Random seed entropy: ${Date.now()}_${Math.random()}.
      ${avoidText}
      
      You MUST return ONLY a raw JSON object. Do not include markdown code fences or commentary.
      Structure:
      {
        "reading": [
          {
            "title": "Teil 1: Schilder und Hinweise",
            "text": "Unique German text for level ${cefrLevel}.",
            "questions": [
              { "id": "r1", "q": "Question string", "options": ["A", "B", "C"], "answer": "Correct option" }
            ]
          }
        ],
        "listening": [
          {
            "title": "Teil 1: Hörtext",
            "script": "Unique German transcript",
            "questions": [
              { "id": "l1", "q": "Question string", "options": ["A", "B", "C"], "answer": "Correct option" }
            ]
          }
        ],
        "writing": {
          "title": "Schreiben",
          "prompt": "Unique writing prompt appropriate for level ${cefrLevel}",
          "points": ["Point 1", "Point 2", "Point 3"]
        },
        "speaking": [
          { "id": "s1", "title": "Teil 1: Sprechaufgabe", "prompt": "Unique speaking prompt" }
        ]
      }
      Ensure raw JSON output only.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();

      if (text.startsWith("```")) {
        text = text.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      }

      const parsed = JSON.parse(text);
      if (parsed.reading && parsed.reading[0]?.title) {
        StorageService.addGeneratedHistory("exam", parsed.reading[0].title);
      }
      return parsed;
    } catch (error) {
      console.warn("AIService.generateMockExam API failed, cycling fallback:", error);
      const fallbackIdx = Math.floor(Math.random() * fallbackExams.length);
      return fallbackExams[fallbackIdx];
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

    const previousChapters = StorageService.getGeneratedHistory("course");

    const fallbacks = [
      {
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
      {
        title: "Kapitel 2: Wohnungssuche & Mietvertrag",
        introduction: "Learn key vocabulary for finding an apartment in Germany, reading lease contracts (Mietvertrag), and reporting repair issues.",
        grammar: {
          concept: "Wechselpräpositionen mit Dativ & Akkusativ",
          explanation: "Two-way prepositions (an, auf, hinter, in, neben, über, unter, vor, zwischen) take Dative for position (location) and Accusative for movement (direction).",
          examples: [
            { de: "Das Bild hängt an der Wand. (Dativ - Wo?)", en: "The picture hangs on the wall." },
            { de: "Ich hänge das Bild an die Wand. (Akkusativ - Wohin?)", en: "I hang the picture onto the wall." }
          ]
        },
        reading: {
          text: "Sehr geehrte Frau Schneider, ich interessiere mich für Ihre 2-Zimmer-Wohnung in Berlin-Neukölln. Ich bin berufstätig als Softwareentwickler und rauche nicht. Gerne würde ich einen Besichtigungstermin vereinbaren.",
          translation: "Dear Ms. Schneider, I am interested in your 2-room apartment in Berlin-Neukölln. I am employed as a software developer and do not smoke. I would like to arrange a viewing appointment.",
          vocabulary: [
            { word: "die Besichtigung", meaning: "the viewing / inspection" },
            { word: "die Kaution", meaning: "the security deposit" },
            { word: "berufstätig", meaning: "employed / working" }
          ]
        },
        speaking_writing_tips: {
          tip: "When writing formal emails to landlords or official agencies, always start with 'Sehr geehrte Damen und Herren' or 'Sehr geehrte(r) Frau/Herr...'.",
          phrases: [
            { de: "Ich bewerbe mich um die Wohnung...", en: "I am applying for the apartment..." },
            { de: "Mit freundlichen Grüßen", en: "Sincerely yours" }
          ]
        }
      },
      {
        title: "Kapitel 3: Zukunft der Arbeitswelt & Digitalisierung",
        introduction: "Lernen Sie, wie Sie komplexe argumentative Diskussionen über die Mobilitätswende führen und zweiteilige Konnektoren einsetzen.",
        grammar: {
          concept: "Zweiteilige Konnektoren (Correlative Conjunctions)",
          explanation: "Correlative connectors link two clauses or options together. Examples include 'sowohl... als auch' (both... and) and 'weder... noch' (neither... nor).",
          examples: [
            { de: "Die Mobilitätswende ist sowohl ökologisch notwendig als auch ökonomisch herausfordernd.", en: "The mobility transition is both ecologically necessary and economically challenging." }
          ]
        },
        reading: {
          text: "Die Reduzierung des Individualverkehrs in deutschen Großstädten wird kontrovers diskutiert. Befürworter plädieren für einen massiven Ausbau des Schienennetzes und kostenlosen Personennahverkehr. Kritiker hingegen befürchten erhebliche Einschränkungen der persönlichen Freiheit.",
          translation: "The reduction of individual traffic in major German cities is controversially discussed. Supporters advocate for a massive expansion of the rail network and free public transport. Critics, on the other hand, fear significant restrictions on personal freedom.",
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
    ];

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = this.getModel(genAI);

      const avoidText = previousChapters.length > 0 
        ? `CRITICAL NON-REPETITION CONSTRAINT: Do NOT repeat or recycle any of these previously generated chapter topics or titles: [${previousChapters.join(", ")}].`
        : "";

      const prompt = `Act as an expert German textbook author creating a COMPLETELY NEW daily lesson for level ${cefrLevel}. 
      Entropy seed: ${Date.now()}_${Math.random()}.
      ${avoidText}
      Choose a distinct topic for ${cefrLevel} (e.g., job interview, medical consultation, environmental policy, train travel, university admission, cultural etiquette, etc.).
      
      Return ONLY a raw JSON object with this exact structure:
      {
        "title": "A unique chapter title (e.g., 'Kapitel 5: ...')",
        "introduction": "A brief intro in English to what we are learning today.",
        "grammar": {
          "concept": "The grammar rule being taught.",
          "explanation": "Clear explanation in English.",
          "examples": [
            { "de": "German sentence", "en": "English translation" }
          ]
        },
        "reading": {
          "text": "A fresh, level-appropriate German text.",
          "translation": "Full English translation of the text.",
          "vocabulary": [ { "word": "der Begriff", "meaning": "the concept" } ]
        },
        "speaking_writing_tips": {
          "tip": "A practical tip for the telc exam regarding this topic.",
          "phrases": [ { "de": "Useful phrase", "en": "Translation" } ]
        }
      }
      Ensure high linguistic accuracy for level ${cefrLevel}. Do not wrap in markdown code blocks. Output raw JSON only.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();

      if (text.startsWith("```")) {
        text = text.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      }

      const parsed = JSON.parse(text);
      if (parsed.title) {
        StorageService.addGeneratedHistory("course", parsed.title);
      }
      return parsed;
    } catch (error) {
      console.warn("AIService.generateDailyCourse API failed, cycling fallback:", error);
      const fallbackIdx = Math.floor(Math.random() * fallbacks.length);
      return fallbacks[fallbackIdx];
    }
  }
}
