# ✈️ LuxTravel AI — Premium Concierge

> **Experience the future of travel planning.**
> A sophisticated AI agent integrated with the Monde system, designed for elite travel agencies.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google-bard&logoColor=white)

---

## 🌟 Overview

**LuxTravel AI** is an intelligent virtual agent built for **Clube Turismo Jardinópolis**. It combines the power of **Google Gemini 2.5 Flash** with the robust **Monde** travel system to provide instant, accurate, and personalized assistance to agents and clients.

### ✨ Key Capabilities
- **🧠 Natural Language Understanding**: Conversational interface for complex travel queries.
- **🏢 Monde Integration**: seamlessly creates clients, consults tasks, and updates records.
- **📄 PDF Voucher Analysis**: Reads and extracts data from travel vouchers automatically.
- **📍 Geo-Grounding**: Visualizes destinations and routes using Google Maps data.
- **💎 Premium UX**: A refined, responsive interface designed for professional use.

---

## 🚀 Getting Started

Follow these steps to set up your premium experience.

### Prerequisites
- **Node.js** (v18 or higher)
- **Google Gemini API Key**
- **Monde API Credentials**

### 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/luxtravel-ai.git
   cd luxtravel-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create a `.env` file in the root directory (copy from `.env.example`):
   ```env
   # .env
   GEMINI_API_KEY=your_google_api_key_here
   MONDE_LOGIN=your_monde_email
   MONDE_PASSWORD=your_monde_password
   ```

4. **Launch the Concierge**
   ```bash
   npm run dev
   ```
   Access the refined interface at `http://localhost:3000`.

---

## 📂 Project Structure

A meticulously organized codebase for scalability and maintainability.

```graphql
LuxTravel-AI/
├── 📁 components/       # UI Components (Chat, Layout, Bubbles)
│   ├── ChatInterface.tsx
│   ├── Layout.tsx
│   └── MessageBubble.tsx
├── 📁 services/         # Core Logic & Integrations
│   ├── geminiService.ts   # AI Orchestration
│   └── toolDefinitions.ts # Monde System Tools
├── 📄 App.tsx           # Application Entry Point
├── 📄 index.html        # HTML Root
├── 📄 vite.config.ts    # Build Configuration
└── 📄 types.ts          # TypeScript Definitions
```

---

## 🛠️ Tech Stack Details

| Technology | Purpose |
|------------|---------|
| **React 19** | Ultra-responsive UI rendering |
| **Vite** | Lightning-fast development server |
| **Google GenAI SDK** | Advanced reasoning and multimodal inputs |
| **Lucide React** | elegant, lightweight iconography |
| **Tailwind CSS** | Utility-first precise styling |

---

## 🛡️ Security & Stability

- **Environment Safety**: API keys are protected and never hardcoded.
- **Error Boundaries**: Graceful handling of network or service interruptions.
- **Type Safety**: Full TypeScript implementation for robust reliability.

---

> Built with precision by the **Antigravity Team**.
