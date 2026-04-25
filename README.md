# Catalyst AI

> **Real Skills. Real Plans.**

Catalyst AI is an **AI-powered skill assessment and personalized learning platform** that goes beyond resumes to evaluate real proficiency through adaptive, conversational interviews.

---

## 🌐 Live Demo

👉 **Live Link:** _[(https://catalystplus.vercel.app/)]_

---

## Overview

Traditional resumes only show what candidates *claim* to know.

**Catalyst AI solves this by:**
- Extracting skills from resumes & job descriptions
- Identifying real skill gaps
- Conducting an **adaptive AI interview**
- Generating **data-driven scores**
- Creating a **personalized learning roadmap**

---

## Core Features

### 1. Flexible Input
Users can:
- Paste **Job Description (JD)**
- Paste **Resume**
- OR upload **PDF files** for both

---

### 2. Skill Extraction & Matching
- Extracts structured skills from JD & resume
- Compares required vs candidate skills
- Categorizes into:
  - Strong
  - Moderate
  - Critical

---

### 3. Gap Analysis
- Identifies **critical skill gaps**
- Provides reasoning behind mismatches
- Highlights improvement areas

---

### 4. SkillLens AI (Assessment Bot)
Inside Catalyst AI, **SkillLens AI** conducts:
- Adaptive, conversational interviews
- Skill-based questioning
- Dynamic difficulty adjustment
- Real-time evaluation of answers

---

### 5. Scoring & Insights
- Overall readiness score
- Per-skill scoring
- Confidence evaluation
- Visual analytics:
  - Radar charts
  - Bar graphs

---

### 6. Skill Breakdown
Each skill is categorized into:
- 🟢 Beginner
- 🟡 Intermediate
- 🔴 Advanced

With:
- Current level → Target level
- Detailed feedback

---

### 7. Personalized Learning Plan
- Step-by-step roadmap
- Timeline-based phases
- Focused skill improvement strategy

---

### 8. Pre-Skill Resources
Curated resources for each skill:
-  Videos
-  Documentation
-  Practice platforms
-  Courses

(All include direct links)

---

### 9. Downloadable Report
- Full report export as **PDF**
- Includes:
  - Scores
  - Graphs
  - Gap analysis
  - Learning plan

---

## Tech Stack

### Frontend
- React / Vite
- Tailwind CSS
- Recharts (Data Visualization)
- Lucide Icons

### Backend
- Node.js (Express)
- Supabase

### AI Layer
- Google Gemini API
- OpenAI-compatible APIs

---

## 🔌 API Endpoints

| Method | Endpoint           | Description |
|--------|------------------|------------|
| GET    | `/health`         | Health check |
| POST   | `/extract-skills` | Extract + compare skills |
| POST   | `/chat-assess`    | AI interview (streaming) |
| POST   | `/generate-plan`  | Score + learning roadmap |

---

## Setup

### 1️⃣ Clone repo

```bash
git clone https://github.com/YashIsTheBest247/Catalyst-AI.git
cd CatalystAI
```
# Backend Setup
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

# Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables
```bash
GEMINI_API_KEY=
OPENAI_API_KEY=
AI_MODEL=google/gemini-3-flash-preview
PORT=8787
```

# Project Structure
```bash 
frontend/
├── public/
├── src/
├── index.html

backend/
├── src/
│   ├── server.js
│   ├── aiClient.js
│   └── routes/
│       ├── extractSkills.js
│       ├── chatAssess.js
│       └── generatePlan.js
├── package.json
├── .env.example
```
