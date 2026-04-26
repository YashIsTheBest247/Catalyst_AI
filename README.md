# Catalyst AI

> **Real Skills. Real Plans.**

Catalyst AI is an **AI-powered skill assessment and personalized learning platform** that goes beyond resumes to evaluate real proficiency through adaptive, conversational interviews.

---

## Why Catalyst AI?

Traditional hiring relies heavily on resumes, which often fail to reflect a candidate’s true abilities. This leads to inconsistent evaluations, biased decision-making, and inefficient hiring processes. Catalyst AI addresses this gap by combining intelligent skill extraction, adaptive AI-driven interviews, and data-backed scoring to measure real proficiency instead of claimed experience. It provides a standardized, objective, and scalable way to assess candidates while also offering personalized learning paths, helping both recruiters make better decisions and candidates understand and improve their actual skills.

---

## 🌐 Live 

👉 **Live Link:** _[(https://catalystplus.vercel.app/)]_\
👉 **Live Demo:** _[(https://drive.google.com/file/d/1ltlg4aMdqIU6dmxDrJPaj_bXauC9isp8/view?usp=drivesdk)]_

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
git clone https://github.com/YashIsTheBest247/Catalyst_AI.git
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


---

### 🧩 Scoring Logic

#### 1. Skill Match (40%)
- JD vs Resume similarity  
- Measures:
  - Coverage of required skills  
  - Relevance  

---

#### 2. Assessment Performance (40%)
- Based on AI interview
- Evaluates:
  - Correctness  
  - Depth  
  - Problem-solving ability  

---

#### 3. Confidence (20%)
- Communication clarity  
- Answer structure  
- Consistency  

---

### 📈 Skill-Level Classification

| Score Range | Level        |
|------------|-------------|
| 0–40       | Beginner     |
| 40–70      | Intermediate |
| 70–100     | Advanced     |

---
### Final Score
```bash
Final Score =(Skill Match × 0.4) +(Assessment Performance × 0.4) +(Confidence × 0.2)
```
---
### Adaptive Interview
```bash
if answer_score > 0.8:
increase difficulty
elif answer_score < 0.4:
decrease difficulty
else:
maintain level
```
---
### Skill Match Score (0-100)
```bash
Skill Match Score = Σ (Skill_i_weight × Skill_i_match) / Σ (Skill_i_weight) × 100
```
---
### Assessment Score (0-100) (Per answer)
```bash
Answer Score = (Correctness × 0.5) +(Depth × 0.3) +(Relevance × 0.2)
```
---
### Aggregation
```bash
Assessment Score = (Σ Answer Scores / Number of Questions) × 100
```
---
### Confidence Score (0-100)
```bash
Confidence Score = (Clarity × 0.4) + (Structure × 0.3) + (Consistency × 0.3)
```
---
### ⚙️ Architecture Overview

- **Frontend (React + TypeScript)**
  - Handles user interaction (JD input, resume upload, AI interview UI)
  - Uses streaming (SSE/WebSockets) for real-time responses

- **API Gateway (Node.js + Express)**
  - Central entry point for all client requests
  - Handles routing, validation, and authentication

- **Resume Parser**
  - Extracts structured data (skills, experience) using NLP + LLM

- **Assessment Engine**
  - Compares Job Description vs Resume
  - Identifies skill matches and gaps

- **Interview Engine (SkillLens AI)**
  - Conducts adaptive AI interviews
  - Dynamically adjusts question difficulty

- **AI Model Gateway**
  - OpenAI-compatible interface
  - Config:
    ```
    AI_MODEL=google/gemini-3-flash-preview
    ```
  - Handles prompt orchestration and responses

- **Scoring Engine**
  - Computes multi-factor evaluation scores
  - Aggregates interview + skill data

- **Learning Plan Generator**
  - Creates personalized improvement roadmap
  - Suggests resources and timelines

- **Database Layer**
  - PostgreSQL → structured data (scores, reports)

- **Analytics / Dashboard**
  - Visualizes:
    - Skill scores
    - Progress
    - Weak areas

---

### Data Flow

1. User submits JD + Resume  
2. Resume Parser extracts skills  
3. Assessment Engine compares JD vs Resume  
4. Interview Engine conducts AI-based assessment  
5. AI responses processed via Model Gateway  
6. Scoring Engine computes final scores  
7. Learning Plan Generator builds roadmap  
8. Results stored in Database  
9. Dashboard displays analytics  

---

### Key Design Principles

- **Modular Services** → Easy to scale and maintain  
- **AI-First Design** → LLM-driven evaluation pipeline  
- **Real-Time Interaction** → Streaming interview experience  
- **Extensible** → Plug-and-play AI models and services  
- **Data-Driven** → Objective scoring & analytics  

---

# System Architecture
```bash
Frontend (React / Next.js)
        │
        ▼
    API Gateway
        │
 ┌──────┼───────────────┐
 ▼      ▼               ▼
Seed   Assessment     Resume Parser
       Engine         (NLP/LLM)
        │
        ▼
Interview Engine (LLM Orchestrator)
        │
        ▼
Scoring Engine
        │
        ▼
Learning Plan Generator
        │
        ▼
   Database Layer
(PostgreSQL-Supabase)
        │
        ▼
Analytics / Dashboard
        │
        ▼
  Report Export
```

## 🤝 Contributing

Contributions are welcome! Feel free to fork the repo and submit a PR.

---

## 📄 License

This project is open-source and available under the **MIT License**.

---
