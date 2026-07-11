# Smart AI Checklist & Workspace

A state-of-the-art, secure, full-stack checklist companion designed for seamless productivity. The application pairs a robust, high-contrast user interface with an intelligent server-side AI agent. It delivers direct, real-time database sync with **Google Sheets**, voice dictation for instant hands-free task adding, voice audio feedback (text-to-speech), and state-of-the-art secure session handling.

---

## Key Features

- **Real-Time Google Sheets Synchronization**: Integrates directly with a designated Google Sheet database. All task creations, updates, and status toggles synchronize instantly with your spreadsheet in Google Drive.
- **AI Workspace Workspace**: Includes an intelligent assistant that analyzes your pending checklist tasks, creates daily automated agendas, summarizes performance, and guides task organization.
- **Quick-Action AI Queries**: Instant one-click visual buttons to run smart analysis such as:
  - *Analyze my day's pending workload*
  - *Generate an efficient order of execution*
  - *Summarize completed achievements*
- **Acoustic Voice Dictation (STT)**: Built-in Speech-to-Text allows users to dictate new tasks using their voice directly through the browser.
- **Automated Speech Feedback (TTS)**: Features integrated browser Text-to-Speech to read back newly added tasks or read-aloud dictated inputs on demand, enhancing accessibility.
- **Secure Session Management**: Protected by secure 1-hour automatic session limits, featuring a prominent warning banner when expiration is approaching to prevent unsaved task loss.
- **Modern Responsive Bento Grid**: Formatted using elegant negative space, Inter and JetBrains Mono typography, clean color states, and high-contrast micro-interactions built with Tailwind CSS.

---

## Tech Stack & Architecture

The application is structured as a full-stack Node.js and React client-server system:

### 1. Frontend Client (Single-Page App)
- **Framework**: React 18+ with TypeScript, bundled using Vite.
- **Styling**: Tailwind CSS for high-fidelity responsive utility styling.
- **Iconography**: Clean, sharp, responsive SVG vectors powered by `lucide-react`.
- **Component Design**: Highly modular architecture, featuring:
  - `TaskTable`: Primary control dashboard for task filtering, search, and overview.
  - `TaskRow`: Individual checklist item rendering with status toggles.
  - `TaskFilters`: Intuitive task filtering (Pending Today, Completed Today, Pending Next, All) and keyword lookup.
  - `QuickAddTask`: Form controller for task generation with speech-to-text dictation and text-to-speech feedback.
  - `WorkspaceHeader`: Secure countdown session tracker, real-time status, and profile indicators.
  - `DatabaseSyncBanner`: Status header and direct anchor links to the connected Google Sheet.
  - `VoiceInput`: Interactive conversational panel with message history and error fallback.

### 2. Full-Stack Backend (Express Server)
- **Runtime**: Node.js and Express (`server.ts`).
- **Database Proxy & API Routes**: Proxies and authenticates all external Google Workspace calls on behalf of the user to keep credentials hidden from the browser.
- **Build Toolchain**: Features modern asset building via `esbuild` to compile TypeScript to self-contained CJS scripts under `dist/server.cjs` for robust deployment in production.

---

## Data Schema & Persistence

The task database relies on a structured schema written and read directly from Google Sheets:

| Column Name | Type | Description |
| :--- | :--- | :--- |
| **ID** | String (UUID) | Unique task identifier |
| **Description** | String | Detailed text description of the checklist task |
| **Status** | String (`Pending` \| `Completed`) | Current checkbox state of the task |
| **Date** | String (`YYYY-MM-DD`) | Target scheduling date |
| **Timestamp** | String (`HH:mm:ss`) | Exact time of task entry |

---

## Installation & Setup

To run this application locally, follow these steps:

### Prerequisites
- **Node.js**: Version 18.x or above
- **NPM**: Version 9.x or above

### Step-by-Step Installation

1. **Clone the project & Navigate into Workspace**:
   ```bash
   cd smart-ai-checklist
   ```

2. **Install Project Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a local `.env` file based on `.env.example`:
   ```env
   # Google Client Credentials
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here

   # Server Gemini Key
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Boot Development Environment**:
   Starts the combined Express-Vite backend and hot module reloading preview server on port `3000`.
   ```bash
   npm run dev
   ```

5. **Build for Production**:
   Compiles static assets into the `dist/` directory and bundles the custom Express database server to CJS.
   ```bash
   npm run build
   ```

6. **Start Production Instance**:
   ```bash
   npm start
   ```

---

## Usability Guidelines

- **Dictation**: Click the **Mic** icon next to the quick add input, grant browser audio permissions, and speak. Click again or wait for silence to stop.
- **Audio Previews**: Click the **Speaker** icon next to your written text to hear a synthetic readback of the task.
- **Synchronizing**: Click the **Sync Now** button at any time to pull fresh spreadsheet records if they were modified on Google Drive externally.
- **Manual Sheet Editing**: Use the **View Sheet** button to open the spreadsheet directly in Google Sheets in a separate browser tab.
