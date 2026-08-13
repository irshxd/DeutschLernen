# DeutschLernen

A web application for learning German (A1 through C2) and preparing for telc language certification exams. Built with React, Vite, Ant Design, and the Google Gemini API.

## Overview

DeutschLernen combines structured CEFR syllabus tracking with AI-generated study tools. Instead of relying on static courseware, it uses Gemini 2.5 Flash to generate custom daily textbook chapters, evaluate mock exams, translate text with grammatical breakdowns, and power an interactive conversational tutor.

All user state—including syllabus progress, flashcard mastery, target level preferences, and API keys—is saved directly in the browser using `localStorage`, eliminating the need for an external database or account setup.

## Features

### Syllabus Explorer
Tracks progress across all CEFR levels (A1 to C2) based on telc exam frameworks. Each topic includes granular sub-point checklists that automatically update topic mastery meters as tasks are completed.

### Daily Course Generator
Generates fresh, level-specific German textbook chapters on demand. To prevent content reuse, generation requests track previously created titles and append random entropy seeds to ensure new reading passages, vocabulary tables, and grammar concepts every time.

### 3D Flashcards
Vocabulary cards featuring 3D flip animations, noun article color-coding (der, die, das), example sentences, and spaced retention tracking.

### AI Conversation Tutor
An interactive tutor matching your selected CEFR level. Supports native German audio playback via browser Web Speech Synthesis.

### Quick Translation
Bi-directional translation (EN ↔ DE) that automatically identifies noun genders, plural forms, and register formality (Sie vs. du).

### telc Mock Exam Simulator
Full exam practice covering Reading, Listening, Writing, and Speaking:
- Audio playback for listening transcripts
- Voice-to-text recording for speaking responses via browser SpeechRecognition
- AI evaluation providing objective scoring, writing/speaking feedback, grammar corrections, and an overall score out of 100

## Tech Stack

- Frontend: React 19, Vite, Ant Design
- Styling: Custom CSS with dark and light theme tokens
- AI Integration: `@google/generative-ai` (Gemini 2.5 Flash)
- Audio/Speech: Browser Web Speech API (Synthesis & Recognition)
- Server: Node.js with Express (`server.js`)

## Getting Started

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Configure your API key:
   Click "API Keys" in the top navigation header and enter a Gemini API key from Google AI Studio.

### Production Build & Server

To build the static bundle and run the Node server locally:

```bash
npm run build
npm start
```

The Express server runs on `http://localhost:3000` (or `process.env.PORT`).

## Deployment

### Vercel
```bash
npx vercel --prod
```
Set the build command to `npm run build` and output directory to `dist`.

### Netlify
```bash
npx netlify-cli deploy --prod
```
Set the build command to `npm run build` and publish directory to `dist`.

### Render / Railway / Cloud VPS
Set the build command to `npm run build` and start command to `node server.js`. The host environment provides the `PORT` variable.
