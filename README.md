# MEMORYSCAPE: Interactive 3D Knowledge Map & Revision Lab

MEMORYSCAPE is an interactive learning web application that transforms lecture notes, textbook excerpts, and study guides into an explorable 3D concept universe. It helps students understand how concepts connect, trace explanations back to specific paragraphs in their notes, and diagnose learning gaps through grounded active-recall quizzes.

> **Live demo:** [memoryscape-3d-m2um.vercel.app](https://memoryscape-3d-m2um.vercel.app/) · **Repository:** [github.com/parthkumar10/memoryscape-3d](https://github.com/parthkumar10/memoryscape-3d)

---

## 🏛️ System Architecture

- **Client Frontend**: React 19 SPA running on Vite, styled with Tailwind CSS v4 and Lucide icons.
- **3D Visualization**: Built with Three.js (`WebGLRenderer`, `OrbitControls`, procedural geometries, and canvas-rendered billboard sprites) with soft midnight-blue atmospheric depth and click-to-focus camera interpolation.
- **2D Accessible Fallback**: An interactive matrix and list view for mobile devices, screen readers, and environments where WebGL is unsupported.
- **Backend Server**: Express API runs on Vercel Functions in production and alongside Vite middleware locally (`tsx server.ts`).
- **LLM Provider Adapter**: Server-side integration behind `LLMProvider` interface (`GeminiLLMProvider` using `@google/genai` and `gemini-3.8-flash`).
- **Structured Validation**: Zod schemas (`AIGeneratedMapSchema`, `AIConceptSchema`, `AIQuizQuestionSchema`) validating all AI outputs prior to client rendering.
- **Document Processing**: `pdfjs-dist` text extraction preserves page and paragraph references; scanned PDFs use in-browser Tesseract.js OCR.
- **Local Persistence**: Browser `localStorage` caching for the active map and user revision states.

---

## 🚀 Getting Started

### 1. Installation

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Set `GEMINI_API_KEY` in `.env` if you want custom note generation and the Gemini tutor:
```env
GEMINI_API_KEY=your_google_ai_studio_key
PORT=3000
```

> **Keep API keys private.** Never commit `.env`, paste a key into source code, or use a `VITE_`-prefixed key (which would expose it to browsers). `.env` is ignored by Git. For Vercel, add the key in Project Settings → Environment Variables using the exact name `GEMINI_API_KEY`.

An API key is **not** required to explore the Java OOP sample map, quiz, tour, and other local study features. A valid key is required for Gemini-powered features.

### 3. Development Server

Start the full-stack server (runs Express with Vite connect middleware on port 3000):

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Deploy the full app on Vercel

The Vite frontend and Express API are served from the same Vercel project. Vercel builds the function in `api/[...route].ts`; no separate Render service or cross-origin API URL is needed.

1. Import the GitHub repository into Vercel with the repository root as the root directory.
2. Use the Vite framework preset, build command `npm run build`, and output directory `dist`.
3. In Vercel Project Settings → Environment Variables, add `GEMINI_API_KEY` with a Google AI Studio key. Do not prefix it with `VITE_` or commit it to Git.
4. Remove `VITE_API_URL` if it points to a separate backend. The default empty value sends API requests to the same Vercel domain.
5. Redeploy after changing environment variables or pushing code.

The sample map works without a Gemini key. Custom note generation and AI chat require a valid key and are subject to Google AI Studio quotas. PDF uploads are limited to **4.2 MB and 25 pages** to fit Vercel Function request-size limits. Scanned PDF OCR runs locally in the browser in English for up to **10 pages**. The OCR engine and language model are downloaded from a public CDN; PDF page content is not sent to that CDN.

---

## 🎯 Demo vs. AI Functionality

### 1. Deterministic Java OOP Demo (No API Key Required)
- Features 10 foundational concepts: `Class`, `Object`, `Constructor`, `Encapsulation`, `Inheritance`, `Polymorphism`, `Method Overriding`, `Abstract Class`, `Interface`, and `Composition`.
- Derived from a realistic CS 108 lecture note document (`src/data/demoData.ts`).
- Every single concept contains a verified, verbatim quotation matching the source text.
- Includes a 5-question grounded diagnostic quiz with exact paragraph citations, a self-reported confidence check, and a targeted revision path.

### 2. Generative Custom Note Processing (Requires `GEMINI_API_KEY`)
- **Input Methods**: Pasted text or uploaded text-based/scanned PDF.
- **Paragraph & Page Anchors**: Automatically splits notes into `Page X, ¶Y` references.
- **Scanned PDF OCR**: Detects image-only PDFs and runs English OCR locally in the browser for up to 10 pages.
- **Grounded Verification**: Analyzes each generated concept's `sourceExcerpt` against the source text to ensure the model did not hallucinate citations.
- **Safe Transmission**: PDFs are sent to this app for text extraction. OCR runs in the browser, and extracted notes are sent to Gemini only when the user explicitly clicks **"Generate Knowledge Map"**.

---

## ✨ Features

- Explore a prepared Java OOP knowledge map in an interactive Three.js 3D view, or switch to a 2D list view.
- Select concepts to review explanations, examples, relationships, and verified excerpts linked to their source notes.
- Upload pasted notes or a PDF to generate a custom concept map, grounded citations, and a five-question quiz with Gemini.
- Extract searchable PDF text on the server, or recognize scanned English text locally in the browser with OCR progress feedback.
- Ask the Gemini tutor follow-up questions with map and concept context.
- Take a diagnostic quiz, record confidence, review results, and follow a targeted revision path.
- Use the guided 3D tour, Study Sheet, search, mastery view, custom concept editing, and optional study sounds.
- Keep the sample map and local study state available without configuring an API key.

### PDF and AI limits

- PDF file size: **4.2 MB maximum**; document length: **25 pages maximum**.
- Scanned PDF OCR: English, first **10 pages**. OCR is CPU-intensive and may take longer on mobile devices.
- Gemini features depend on API key validity, model availability, network connectivity, and Google AI Studio quotas.
- Generated maps are limited to notes the app can process; extracted text is capped at 40,000 characters in the UI.

---

## 🧭 Hackathon Demo Walkthrough

The Java OOP sample map is the reliable, offline-first demo path: it does not require a Gemini API key or network access for map exploration, citations, the cinematic 3D tour, diagnostic quiz, or optional study soundscapes. If a custom map is already open, choose **Sample map** in the 3D toolbar to return to the prepared demo.

1. **Start with the sample map** from onboarding, or use **Sample map** if a custom map is open.
2. **Play the 3D tour** to fly across the concepts in sequence. Pause, resume, skip between concepts, and turn voice narration on or off. The tour finishes at the last concept and can be replayed.
3. **Inspect Inheritance** on the map to show its explanation, Java example, verified source excerpt (`Page 2, ¶1`), and directional links to related concepts.
4. **Open the source notes** from the concept details to show the cited paragraph in context.
5. **Take the five-question diagnostic quiz** and rate your confidence on each answer. The result shows the answer breakdown, a confidence reflection, and a suggested revision path; missed concepts are highlighted on the map.
6. **Open Study Sounds** from the 3D toolbar for optional white noise, 40 Hz binaural beats, or an original generated lo-fi instrumental. Playback starts only after the learner presses play; closing the panel keeps audio playing, while **Pause** stops it. Volume and the chosen sound are saved locally. Binaural beats require stereo headphones and are not presented as a proven focus treatment.

Custom map generation from pasted notes or text-based PDFs requires `GEMINI_API_KEY` and a working provider connection. If that is unavailable during a presentation, use the sample map; it remains fully interactive.

---

## 🛡️ Privacy & Grounding Guarantees

1. **Source-grounded prompts**: The Gemini prompt asks the model to derive explanations and citations from the learner's notes; as with any generative AI, outputs should still be reviewed.
2. **Citation Verification**: Every concept's `sourceExcerpt` is checked with normalization and substring matching. Unmatched quotes are visibly marked as *"Synthesis Note: Concept inferred from context, exact phrase differs"* rather than faking a verified badge.
3. **Revision Signal vs. Mastery**: The quiz explicitly reminds students: *"This score is a localized study feedback signal based on your notes, not an accredited standard exam."*
4. **Clear Local Data**: A trash icon in the top header lets students purge their custom maps and reset to the clean demo at any moment.

---

## 🧰 Scripts

| Command | Purpose |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Start the local Express + Vite development server |
| `npm run lint` | Run the TypeScript check |
| `npm run build` | Build the production frontend |
| `npm run preview` | Preview the Vite production build |

## 🔐 Before making this repository public

- Keep `.env` and all real API keys out of Git. If a key was ever exposed, revoke it in Google AI Studio and create a replacement.
- Vercel environment variables are separate from local `.env`; set `GEMINI_API_KEY` in Vercel and redeploy.
- Review the repository's **entire Git history**, not only the current files, for credentials and private data before changing visibility.
- Never put a secret in a frontend `VITE_*` variable. The Gemini key must remain server-side.
