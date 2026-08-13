# 🇩🇪 DeutschLernen — AI German Learning & telc Exam Prep Platform

**DeutschLernen** is a modern, high-performance web application designed to help students master German from level **A1 to C2** and prepare for official **telc examinations**. Powered by **React 19**, **Vite**, **Ant Design**, and **Google Gemini 2.5 Flash**, it provides dynamic textbook lessons, AI speech practice, flashcards, interactive translation, and full mock exam simulations.

---

## 🌟 Key Features

### 1. 📊 Syllabus Explorer (A1 – C2)
- Complete CEFR level breakdowns (A1 Breakthrough through C2 Mastery).
- Granular sub-point checklists with auto-mastery progress meters.
- Permanent progress saving stored locally in the browser.

### 2. 📚 Dynamic AI Daily Course Generator
- Generates brand new, authentic textbook chapter lessons on-demand via **Gemini 2.5 Flash**.
- **Anti-Repetition Engine**: Automatically tracks generated chapter history and uses dynamic entropy seeds so you never get repeated lessons or duplicate readings.
- Features grammar concepts, context examples, reading comprehensions with full English translations, vocabulary helpers, and official telc strategy guides.
- Curated YouTube video lectures mapped to each CEFR level.

### 3. 🎴 3D Tactile Flashcards
- Interactive 3D flip card animations with noun article color indicators (`der` cobalt blue, `die` crimson red, `das` emerald green).
- Deck mastery tracking ("Kenne ich" vs. "Noch lernen").
- Real-world context sentences for every word.

### 4. 🤖 AI Conversation Tutor & Speech Synthesis
- Chat naturally with **Tutor Lukas**, an AI German tutor configured specifically for your target CEFR level.
- Integrated **Web Speech Synthesis (`de-DE`)** so you can listen to natural native German pronunciations of tutor messages.

### 5. 🌐 Quick Translation Box with Grammar Insights
- Bi-directional translation (English ↔ German) with instant clipboard paste & copy helpers.
- Deep grammatical analysis: automatically detects noun genders (`der/die/das`), plural forms, and formal (`Sie`) vs. informal (`du`) registers.

### 6. 📝 telc Mock Exam Simulator & AI Examiner
- Full multi-part exam simulator covering:
  - **Leseverstehen (Reading)**: Matching notices and comprehension questions.
  - **Hörverstehen (Listening)**: Audio voice transcripts powered by Web Speech API.
  - **Schreiben (Writing)**: Formally structured email/letter writing tasks.
  - **Sprechen (Speaking)**: Voice recording input using **Web Speech Recognition** (`de-DE`).
- **AI Examiner Grading**: Evaluates responses under official telc criteria, providing objective score breakdowns, writing/speaking feedback, grammatical corrections, and a final score out of 100.

### 7. 👤 Permanent Local Profile & Multi API Key Sandbox
- **Zero Database Required**: User names, target CEFR levels, progress, and Gemini API keys are permanently saved in client-side browser `localStorage`.
- Support for managing multiple Google Gemini API keys with active key switching.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Ant Design (Custom Golden Amber & Obsidian Dark theme).
- **AI Engine**: `@google/generative-ai` (Gemini 2.5 Flash).
- **Audio & Speech**: Browser Web Speech API (`SpeechSynthesis` & `SpeechRecognition`).
- **Backend Server**: Node.js Express static server ([`server.js`](file:///Users/irshadmohd/Desktop/deutsch-site/server.js)).

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Local Development

1. **Clone & Install Dependencies**:
   ```bash
   git clone https://github.com/your-username/deutsch-site.git
   cd deutsch-site
   npm install
   ```

2. **Run Dev Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

3. **Configure API Key**:
   - Open the app, click **API Keys** in the header, and add your free **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/).

---

## 📦 Production Build & Local Server

To build the static application and serve it via Node.js Express:

```bash
# 1. Build production static bundle
npm run build

# 2. Start Node production server
npm start
# OR: node server.js
```
The server will run on `http://localhost:3000` (or `process.env.PORT`).

---

## 🌐 Deployment Instructions

### Vercel (Recommended Static Hosting)
```bash
# Install Vercel CLI & deploy
npx vercel --prod
```
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Netlify
```bash
# Deploy with Netlify CLI
npx netlify-cli deploy --prod
```
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`

### Render / Railway / Heroku / Cloud VPS (Node.js)
- **Build Command**: `npm run build`
- **Start Command**: `node server.js` or `npm start`
- Host platform will automatically assign `process.env.PORT`.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
