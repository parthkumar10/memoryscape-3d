# MEMORYSCAPE: Interactive 3D Knowledge Map & Revision Lab

MEMORYSCAPE is an interactive learning web application that transforms lecture notes, textbook excerpts, and study guides into an explorable 3D concept universe. It helps students understand how concepts connect, trace explanations back to specific paragraphs in their notes, and diagnose learning gaps through grounded active-recall quizzes.

---

## 🏛️ System Architecture

- **Client Frontend**: React 19 SPA running on Vite, styled with Tailwind CSS v4 and Lucide icons.
- **3D Visualization**: Built with Three.js (`WebGLRenderer`, `OrbitControls`, procedural geometries, and canvas-rendered billboard sprites) with soft midnight-blue atmospheric depth and click-to-focus camera interpolation.
- **2D Accessible Fallback**: An interactive matrix and list view for mobile devices, screen readers, and environments where WebGL is unsupported.
- **Backend Server**: Full-stack Express server mounted on port 3000 running alongside Vite middleware (`tsx server.ts`).
- **LLM Provider Adapter**: Server-side integration behind `LLMProvider` interface (`GeminiLLMProvider` using `@google/genai` and `gemini-3.8-flash`).
- **Structured Validation**: Zod schemas (`AIGeneratedMapSchema`, `AIConceptSchema`, `AIQuizQuestionSchema`) validating all AI outputs prior to client rendering.
- **Document Processing**: `pdfjs-dist` text extraction preserving page and paragraph references, with heuristic detection of scanned image-only PDFs.
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

Ensure `GEMINI_API_KEY` is defined:
```env
GEMINI_API_KEY="your-gemini-api-key"
PORT=3000
```

> **Note**: An API key is **not** required to explore the full Java OOP demo. The demo is 100% functional out of the box with zero external dependencies. An API key is only needed when generating new knowledge maps from your own custom notes.

### 3. Development Server

Start the full-stack server (runs Express with Vite connect middleware on port 3000):

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎯 Demo vs. AI Functionality

### 1. Deterministic Java OOP Demo (No API Key Required)
- Features 10 foundational concepts: `Class`, `Object`, `Constructor`, `Encapsulation`, `Inheritance`, `Polymorphism`, `Method Overriding`, `Abstract Class`, `Interface`, and `Composition`.
- Derived from a realistic CS 108 lecture note document (`src/data/demoData.ts`).
- Every single concept contains a verified, verbatim quotation matching the source text.
- Includes a 5-question grounded diagnostic quiz with exact paragraph citations.

### 2. Generative Custom Note Processing (Requires `GEMINI_API_KEY`)
- **Input Methods**: Pasted text or uploaded text-based PDF.
- **Paragraph & Page Anchors**: Automatically splits notes into `Page X, ¶Y` references.
- **Scanned PDF Detection**: Flags documents with `< 40` characters of extractable text, guiding the user that scanned image PDFs require OCR.
- **Grounded Verification**: Analyzes each generated concept's `sourceExcerpt` against the source text to ensure the model did not hallucinate citations.
- **Safe Transmission**: Notes are never sent in the background; they are only sent when the user explicitly clicks **"Generate Knowledge Map"**.

---

## 🧭 Complete Demo Walkthrough

1. **Launch App**: Open the application. An onboarding modal offers **"Explore Java OOP Demo"** or **"Add Your Notes"**.
2. **Select "Inheritance"**:
   - In the 3D map or sidebar, click **Inheritance**.
   - The 3D camera smoothly glides into the Inheritance room.
   - The right inspector panel opens, displaying:
     - The brief explanation
     - The beginner-friendly Java code example (`SavingsAccount extends BankAccount`)
     - The exact source quotation: *"Inheritance is the mechanism by which a new subclass adopts the non-private attributes..."*
     - The citation location: `Page 2, ¶1`
     - The verification pill (`✓ Grounding Verified: Excerpt matched verbatim in source notes`)
     - Directional connections: `extends Class`, `enables Method Overriding`, and `alternative to Composition`.
3. **Open Source Notes**: Click **"Read Full Context"** to open the complete course notes modal, which automatically highlights `Page 2, ¶1`.
4. **Take the Diagnostic Quiz**:
   - Click the **"Quiz (5 Qs)"** button in the top bar.
   - Answer the 5 questions testing inheritance, overriding, encapsulation, interfaces, and composition.
5. **Submit & Review Revision Highlights**:
   - Click **"Submit & Analyze Gaps"**.
   - See your score and the explanatory breakdown with paragraph citations.
   - If any questions were missed, those concepts are flagged on the 3D map with red warning beacons and listed in the **Suggested Revision Priority Path**.
   - Click any flagged concept in the revision path to inspect it directly.

---

## 🛡️ Privacy & Grounding Guarantees

1. **Untrusted Academic Content**: Notes are treated strictly as reference text, shielded from prompt injection.
2. **Citation Verification**: Every concept's `sourceExcerpt` is checked with normalization and substring matching. Unmatched quotes are visibly marked as *"Synthesis Note: Concept inferred from context, exact phrase differs"* rather than faking a verified badge.
3. **Revision Signal vs. Mastery**: The quiz explicitly reminds students: *"This score is a localized study feedback signal based on your notes, not an accredited standard exam."*
4. **Clear Local Data**: A trash icon in the top header lets students purge their custom maps and reset to the clean demo at any moment.

---

## 🔍 Truthful Summary of Implementation Status

### What Works Completely
- ✅ Full 3D interactive knowledge map with composite 3–12 part procedural island models (foundation bedrock, stepped upper terrace, luminous rune ring, metallic corner studs, center obelisk plinth, floating dodecahedron core, and procedural radial ground contact shadows).
- ✅ Studio PBR lighting with `ACESFilmicToneMapping`, exposure compensation, cosmic atmospheric fog, and frame-rate independent exponential damping (`1 - Math.exp(-6 * dt)`).
- ✅ Multi-turn Gemini Socratic Tutor (`gemini-3.8-flash`) docked in the viewport with history preservation, context-aware pedagogical guidance, and offline demo fallback.
- ✅ Smooth camera transitions on island selection and OrbitControls for rotation/pan/zoom (with instant jumps under `prefers-reduced-motion`).
- ✅ Fully accessible 2D matrix list view for mobile devices, screen readers, or environments without WebGL.
- ✅ Complete deterministic Java OOP demo with all 10 required concepts and sample course notes.
- ✅ Exact citation verification engine comparing excerpts to source paragraphs.
- ✅ 5-question grounded diagnostic quiz with shuffled options, plausible distractors, and directional prerequisite guided revision.
- ✅ Express backend on port 3000 running Vite middleware and `@google/genai` adapter.
- ✅ PDF text extraction with page detection and scanned-image warning.
- ✅ Ability to edit concepts and customize explanations directly in the UI.

### Scope Deliberately Omitted / Limitations
- ❌ **Client-Side OCR**: Scanned image PDFs are detected and flagged with a user-friendly alert, but OCR is not performed in-browser (requires heavy tesseract binaries).
- ❌ **Vector Embeddings Database**: As requested in the specification, no vector DB or external embeddings were added, as the 8–12 concept scope, exact string verification, and server-side LLM context fulfill requirements reliably without extra operational overhead.
