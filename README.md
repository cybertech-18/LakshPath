<div align="center"><div align="center"><div align="center">## Unified dev scripts



# 🎯 LakshPath



### AI-Powered Career Intelligence Platform# 🎯 LakshPath  <img src="https://github.com/user-attachments/assets/e8b32e6b-05f3-46c4-8e50-fe6a56156b4c" alt="LakshPath Banner" width="720" /><div align="center">



**Empowering students with personalized career guidance through AI**



[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)### AI-Powered Career Intelligence Platform  <h1>LakshPath</h1>  <img src="https://github.com/user-attachments/assets/e8b32e6b-05f3-46c4-8e50-fe6a56156b4c" alt="LakshPath Banner" width="720" />

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-3178C6.svg)](https://www.typescriptlang.org/)

[![React](https://img.shields.io/badge/React-18.2-61DAFB.svg)](https://reactjs.org)

[![Gemini AI](https://img.shields.io/badge/Gemini-2.0--flash-4285F4.svg)](https://ai.google.dev)*Personalized assessments · Smart job matching · Adaptive learning roadmaps*  <p><strong>AI-Powered Career Intelligence Platform</strong></p>  <h1> LakshPath · AI-Powered Career Intelligence </h1>



[✨ Features](#-features) • [🚀 Quick Start](#-quick-start) • [📖 Workflow](#-workflow-guide) • [🔌 API Docs](#-api-reference) • [🌐 Deploy](#-deployment)



</div>[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)  <p>Personalized assessments · Smart job matching · Adaptive learning roadmaps</p>  <p>Personalized assessments, live market intelligence, and adaptive roadmaps for every student.</p>



---[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)



## 📖 What is LakshPath?[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-3178C6.svg)](https://www.typescriptlang.org/)  </div>



LakshPath is an intelligent career guidance platform that combines **AI-powered assessments**, **real-time job market analysis**, and **personalized learning roadmaps** to help students make informed career decisions.[![React](https://img.shields.io/badge/React-18.2-61DAFB.svg)](https://reactjs.org/)



### The Problem We Solve[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#-contributing)  [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)



- 🎓 Students struggle to identify career paths aligned with their skills

- 💼 Job descriptions don't match student profiles effectively

- 📊 Lack of real-time market intelligence for career planning[Features](#-key-features) • [Getting Started](#-getting-started) • [Documentation](#-api-documentation) • [Deployment](#-deployment)  [![Node](https://img.shields.io/badge/node-18+-green.svg)](https://nodejs.org)## Overview

- 🛤️ Generic roadmaps that don't adapt to individual needs



### Our Solution

</div>  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

- 🧠 **AI Assessments** - Multi-dimensional skill evaluation using Google Gemini

- 🔍 **Smart Job Matching** - Auto-scout jobs based on user profiles with gap analysis

- 📈 **Market Intelligence** - Real-time salary trends, demand metrics, and skills analysis

- 🎯 **Personalized Roadmaps** - AI-generated learning paths tailored to individual goals---</div>LakshPath pairs a TypeScript/Express API with a React + Vite dashboard to deliver AI-powered career planning. Students complete a multi-step assessment, receive Gemini-backed insights, auto-scouted job matches, and roadmap nudges that synch with live labor-market data.

- 🔐 **Secure & Simple** - Google OAuth authentication with seamless onboarding



---

## 📋 Table of Contents

## ✨ Features



<table>

<tr>- [Overview](#-overview)---## Feature highlights

<td width="50%">

- [Key Features](#-key-features)

### 🧠 Intelligent Assessments

- Multi-dimensional skill evaluation- [Tech Stack](#-tech-stack)

- Technical, communication, analytical & creativity scoring

- Gemini AI-powered insights- [Getting Started](#-getting-started)

- Career path recommendations

- Strength & gap analysis  - [Prerequisites](#prerequisites)## 📋 Table of Contents- **Adaptive assessments:** Quiz answers trigger Gemini prompts that output strengths, blindspots, and a tailored learning plan.



</td>  - [Installation](#installation)

<td width="50%">

  - [Running Locally](#running-the-application)- **Auto-scouted jobs:** `/api/jobs/auto-scout/:userId` and `/api/jobs/compare` surface JD matches even when the learner hasn’t finished an assessment.

### 🔍 Smart Job Matching

- Automatic job discovery (Auto-Scout)- [Project Structure](#-project-structure)

- Manual job description comparison

- Skills match & gap identification- [API Documentation](#-api-documentation)- [Overview](#-overview)- **Market dashboards:** Real-time salary, demand, and skills trends feed the frontend insight widgets.

- Graceful fallbacks for new users

- Cached & real-time modes- [Deployment](#-deployment)



</td>- [Troubleshooting](#-troubleshooting)- [Key Features](#-key-features)- **Smart profile fallbacks:** Brand-new users still receive contextual summaries so JD comparison never crashes.

</tr>

<tr>- [Contributing](#-contributing)

<td width="50%">

- [License](#-license)- [Tech Stack](#-tech-stack)- **Unified developer ops:** Shell helpers (`scripts/start-dev.sh`, `scripts/stop-dev.sh`, `scripts/setup-env.sh`) cover setup, boot, and teardown in one command.

### 📊 Market Intelligence

- Real-time salary trends by domain

- Industry demand metrics

- Top skills analysis---- [Getting Started](#-getting-started)

- Growth projections

- Location-based insights



</td>## 🎯 Overview- [Project Structure](#-project-structure)## Architecture snapshot

<td width="50%">



### 🛤️ Personalized Roadmaps

- AI-generated learning paths**LakshPath** is an AI-powered career intelligence platform that helps students and professionals navigate their career journey through personalized assessments, smart job matching, and adaptive learning roadmaps.- [API Documentation](#-api-documentation)

- Course & certification recommendations

- Project suggestions

- Milestone tracking

- Resource curationBuilt with **Google Gemini AI**, the platform delivers:- [Deployment](#-deployment)| Layer | Details |



</td>- 🧠 **Intelligent assessments** that analyze skills across multiple dimensions

</tr>

</table>- 🔍 **Auto-scout job matching** with gap analysis and recommendations- [Contributing](#-contributing)| --- | --- |



---- 📊 **Real-time market intelligence** for salary trends and demand metrics



## 🏗️ Architecture- 🛤️ **Personalized roadmaps** with curated learning resources- [License](#-license)| Frontend | React 18, Vite, TypeScript, Tailwind, React Router, Google Identity Services |



```mermaid

graph TD

    A[User Browser] -->|HTTPS| B[React Frontend - Vite]### Architecture Overview| Backend | Node 18, Express, Prisma (SQLite), Zod validation, Google OAuth, Gemini SDK |

    B -->|Google OAuth| C[Google Identity]

    B -->|REST API| D[Express Backend]

    D -->|JWT Verify| E[Auth Middleware]

    D -->|AI Prompts| F[Gemini 2.0 Flash]| Layer | Technology |---| AI | `backend/src/services/geminiService.ts` centralizes prompts for assessments, chat, market insight, and JD analysis |

    D -->|ORM| G[Prisma Client]

    G -->|SQL| H[(SQLite/PostgreSQL)]|-------|-----------|

    F -->|Career Insights| D

    D -->|JSON Response| B| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, React Router, Framer Motion || Auth | Google Sign-In token exchange + JWT session cookies |

```

| **Backend** | Node.js 18, Express, Prisma ORM, Zod validation |

### Tech Stack

| **Database** | SQLite (dev) / PostgreSQL (production) |## 🎯 Overview| Infra | Local dev via npm scripts, deploy-ready for Netlify (SPA) + Render/Fly (API) |

| Layer | Technologies |

|-------|-------------|| **AI Engine** | Google Gemini 2.0 Flash API |

| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, React Router, Framer Motion, Recharts |

| **Backend** | Node.js 18, Express, TypeScript, Zod validation || **Authentication** | Google OAuth 2.0 + JWT sessions |

| **Database** | Prisma ORM, SQLite (dev), PostgreSQL (prod) |

| **AI/ML** | Google Gemini 2.0 Flash API || **Deployment** | Netlify (frontend) + Render/Railway (backend) |

| **Authentication** | Google OAuth 2.0, JWT sessions |

| **Deployment** | Netlify (frontend), Render/Railway (backend) |**LakshPath** is an AI-powered career intelligence platform designed to help students and professionals navigate their career journey through personalized assessments, smart job matching, and adaptive learning roadmaps.## Repository layout



------



## 🚀 Quick Start



### Prerequisites## ✨ Key Features



```bashThe platform combines:```

# Required

✅ Node.js 18+### 🧠 AI-Powered Assessments

✅ npm 9+

✅ Git- Multi-dimensional skill evaluation (technical, communication, analytical, creativity)- **Gemini AI** for intelligent career guidance and assessmentsLakshpath/

✅ Google Cloud Project (OAuth + Gemini API)

```- Gemini-based analysis generating personalized insights



### Installation (5 minutes)- Career path recommendations based on individual strengths- **Real-time job market analysis** with auto-scout matching├── backend/           # Express API + Prisma schema/migrations



```bash

# 1. Clone repository

git clone https://github.com/cybertech-18/LakshPath.git### 🔍 Smart Job Matching- **Personalized learning roadmaps** tailored to individual skills and goals├── frontend/          # React + Vite SPA

cd LakshPath

- **Auto-Scout**: Automatic job matching based on user profile

# 2. Install dependencies

npm install --prefix backend- **Manual Comparison**: Paste any job description for instant gap analysis- **Smart profile management** with fallback mechanisms for seamless user experience├── scripts/           # Setup/start/stop helpers

npm install --prefix frontend

- Intelligent fallbacks for users without completed assessments

# 3. Setup environment files

chmod +x scripts/setup-env.sh├── DOCUMENTATION.md   # Deep product and UX notes

./scripts/setup-env.sh

### 📊 Market Intelligence

# 4. Configure your API keys

# Edit backend/.env and frontend/.env with your credentials- Real-time salary trends and demand metrics---├── PROJECT_SUMMARY.md # Pitch / summary deck text



# 5. Initialize database- Skills gap analysis for target careers

cd backend

npm run prisma:generate- Industry insights and growth projections├── STATUS.md          # Engineering health log

npm run prisma:migrate

cd ..



# 6. Start development servers### 🛤️ Personalized Roadmaps## ✨ Key Features└── README.md          # You are here

chmod +x scripts/start-dev.sh

./scripts/start-dev.sh- Step-by-step learning plans generated by AI

```

- Resource recommendations (courses, certifications, projects)```

### Access the Application

- Progress tracking and milestone management

- 🌐 **Frontend**: http://localhost:3001

- 🔌 **Backend API**: http://localhost:5001### 🧠 AI-Powered Assessments

- ✅ **Health Check**: http://localhost:5001/health

### 🔐 Secure Authentication

---

- Google OAuth 2.0 integration- Multi-dimensional skill evaluation (technical, communication, analytical, creativity)## Prerequisites

## 📖 Workflow Guide

- JWT-based session management

For a comprehensive understanding of the platform workflow, see **[WORKFLOW.md](WORKFLOW.md)**

- Protected routes and data privacy- Gemini-based analysis generating personalized insights

### Quick Workflow Overview



```

1. User Sign-In (Google OAuth)---- Career path recommendations based on individual strengths- Node.js 18+

   ↓

2. Complete Career Assessment (Quiz)

   ↓

3. Gemini AI Analysis## 🛠️ Tech Stack- npm 9+

   ↓

4. Receive Personalized Insights & Roadmap

   ↓

5. Auto-Scout Job Matching<div align="center">### 🔍 Smart Job Matching- Google Cloud project with OAuth credentials + Gemini API access

   ↓

6. View Market Trends & Skills Gap

   ↓

7. Access Learning Resources & Mentorship Chat### Frontend- **Auto-Scout**: Automatic job-description matching based on user profile- Git, cURL, jq (for quick smoke tests)

```

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)

---

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)- **Manual Comparison**: Paste any job description for instant gap analysis

## 📁 Project Structure

![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

```

LakshPath/![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)- Handles users without assessments gracefully with intelligent defaults## Setup

│

├── 📂 backend/                 # Express + TypeScript API

│   ├── src/

│   │   ├── config/            # Environment configuration### Backend

│   │   ├── controllers/       # Request handlers

│   │   ├── services/          # Business logic layer![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

│   │   │   ├── geminiService.ts      # AI integration

│   │   │   ├── assessmentService.ts  # Assessment logic![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)### 📊 Market Intelligence### 1. Clone and install

│   │   │   ├── jobsService.ts        # Job matching

│   │   │   └── marketService.ts      # Market data![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)

│   │   ├── routes/            # API endpoints

│   │   ├── middleware/        # Auth & error handling![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)- Real-time salary trends and demand metrics

│   │   ├── lib/               # Utilities (Prisma, engines)

│   │   └── types/             # TypeScript definitions

│   ├── prisma/

│   │   ├── schema.prisma      # Database models### AI & Services- Skills gap analysis for target careers```bash

│   │   └── migrations/        # Version-controlled migrations

│   └── package.json![Google Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)

│

├── 📂 frontend/                # React SPA![OAuth](https://img.shields.io/badge/OAuth_2.0-3C873A?style=for-the-badge&logo=auth0&logoColor=white)- Industry insights and growth projectionsgit clone https://github.com/iayus-grow/ayush18.git

│   ├── src/

│   │   ├── components/        # Reusable UI components

│   │   ├── pages/             # Route components

│   │   │   ├── LandingPageNew.tsx    # Landing</div>cd ayush18/Lakshpath

│   │   │   ├── LoginNew.tsx          # Authentication

│   │   │   ├── QuizIntro.tsx         # Assessment intro

│   │   │   ├── AssessmentQuiz.tsx    # Quiz flow

│   │   │   └── DashboardNew.tsx      # Main dashboard---### 🛤️ Personalized Roadmapsnpm install --prefix frontend

│   │   ├── services/          # API client

│   │   └── types/             # TypeScript interfaces

│   └── package.json

│## 🚀 Getting Started- Step-by-step learning plans generated by AInpm install --prefix backend

├── 📂 scripts/                 # Developer utilities

│   ├── setup-env.sh           # Environment setup

│   ├── start-dev.sh           # Start both servers

│   └── stop-dev.sh            # Stop all services### Prerequisites- Resource recommendations (courses, certifications, projects)```

│

├── 📄 README.md                # This file

├── 📄 WORKFLOW.md              # Detailed workflow documentation

└── 📄 LICENSE                  # MIT License- **Node.js** 18 or higher- Progress tracking and milestone management

```

- **npm** 9 or higher

---

- **Git**### 2. Create `.env` files

## 🔌 API Reference

- **Google Cloud Project** with:

### Base URL

```  - OAuth 2.0 credentials configured### 🔐 Secure Authentication

Development: http://localhost:5001/api

Production: https://your-api-domain.com/api  - Gemini API access enabled

```

- Google OAuth 2.0 integration```bash

### Endpoints Overview

### Installation

| Method | Endpoint | Description | Auth Required |

|--------|----------|-------------|---------------|- JWT-based session managementchmod +x scripts/setup-env.sh

| POST | `/auth/google` | Google OAuth login | ❌ |

| POST | `/assessment` | Submit assessment | ✅ |1. **Clone the repository**

| GET | `/assessment/me` | Get user's latest assessment | ✅ |

| GET | `/jobs/auto-scout/:userId` | Auto-match jobs | ✅ |- Protected routes and user data privacyscripts/setup-env.sh

| POST | `/jobs/compare` | Compare job description | ✅ |

| GET | `/market/trends/:domain` | Get market trends | ✅ |   ```bash

| POST | `/roadmap/generate` | Generate learning roadmap | ✅ |

| POST | `/chat/mentor` | AI mentorship chat | ✅ |   git clone https://github.com/cybertech-18/LakshPath.git```

| GET | `/user/profile` | Get user profile | ✅ |

   cd LakshPath

### Example: Submit Assessment

   ```---

```bash

curl -X POST http://localhost:5001/api/assessment \

  -H "Content-Type: application/json" \

  -H "Authorization: Bearer YOUR_JWT_TOKEN" \2. **Install dependencies**The helper copies every `*.env.example`, then tells you which secrets still need real values.

  -d '{

    "answers": {

      "educationLevel": "College",

      "fieldInterest": "Software",   ```bash## 🛠️ Tech Stack

      "technicalSkill": 4,

      "communicationSkill": 4,   # Frontend

      "analyticalSkill": 4,

      "creativitySkill": 3   npm install --prefix frontend### 3. Configure environment variables

    }

  }'   

```

   # Backend### Frontend

**Response:**

```json   npm install --prefix backend

{

  "id": "assessment_id",   ```- **React 18** - Modern UI library| File | Key | Notes |

  "insights": "Based on your assessment...",

  "roadmap": "Step 1: Learn React...",

  "domain": "Software Development",

  "recommendations": [3. **Set up environment variables**- **TypeScript** - Type-safe development| --- | --- | --- |

    {

      "career": "Full Stack Developer",

      "match": 85,

      "reason": "Strong technical and analytical skills"   ```bash- **Vite** - Fast build tool and dev server| `backend/.env` | `PORT` | Defaults to `5001` in scripts (or `5000` manually). |

    }

  ]   chmod +x scripts/setup-env.sh

}

```   ./scripts/setup-env.sh- **Tailwind CSS** - Utility-first styling|  | `CLIENT_ORIGIN` | Frontend origin for CORS (`http://localhost:3001` or `5173`). |



For complete API documentation, see **[API.md](API.md)** (coming soon)   ```



---- **React Router** - Client-side routing|  | `DATABASE_URL` | Prisma DB URI. Default SQLite file checked into `backend/prisma`. |



## 🌐 Deployment   This creates `.env` files from templates. Configure the following:



### Backend (Render/Railway/Fly.io)- **Framer Motion** - Smooth animations|  | `GEMINI_API_KEY` | Required – generate in Google AI Studio. |



```bash   **`backend/.env`**:

# Build command

npm run build   ```env- **Recharts** - Data visualization|  | `GEMINI_MODEL` | Defaults to `gemini-2.0-flash`. |



# Start command   PORT=5001

npm start

   GEMINI_API_KEY=your_gemini_api_key_here|  | `GOOGLE_CLIENT_ID` | Matches the OAuth Web client used in the SPA. |

# Environment variables required

PORT=5001   GEMINI_MODEL=gemini-2.0-flash

DATABASE_URL=postgresql://...

GEMINI_API_KEY=...   GOOGLE_CLIENT_ID=your_google_client_id### Backend|  | `JWT_SECRET` | Any long random string. |

GOOGLE_CLIENT_ID=...

CLIENT_ORIGIN=https://your-frontend.com   CLIENT_ORIGIN=http://localhost:3001

JWT_SECRET=...

```   JWT_SECRET=your_secure_random_string- **Node.js 18+** - Runtime environment| `frontend/.env` | `VITE_API_BASE_URL` | Usually `http://localhost:5001/api`. |



### Frontend (Netlify/Vercel)   DATABASE_URL=file:./prisma/dev.db



```bash   ```- **Express** - Web framework|  | `VITE_GOOGLE_CLIENT_ID` | Same as backend `GOOGLE_CLIENT_ID`. |

# Build command

npm run build



# Publish directory   **`frontend/.env`**:- **TypeScript** - Type-safe backend

dist

   ```env

# Environment variables

VITE_API_BASE_URL=https://your-api.com/api   VITE_API_BASE_URL=http://localhost:5001/api- **Prisma** - Database ORMRestart servers after changing any `.env` file.

VITE_GOOGLE_CLIENT_ID=...

```   VITE_GOOGLE_CLIENT_ID=your_google_client_id



### Deploy with One Click   ```- **SQLite** - Development database



[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/cybertech-18/LakshPath)



---4. **Set up the database**- **Zod** - Schema validation## Running locally



## 🧪 Testing



```bash   ```bash

# Backend health check

curl http://localhost:5001/health   cd backend



# Run demo assessment   npm run prisma:generate### AI & Services### Preferred: unified dev scripts

npm run test:assessment

   npm run prisma:migrate

# Test job matching

npm run test:jobs   cd ..- **Google Gemini API** - AI-powered insights



# Frontend E2E tests (coming soon)   ```

npm run test:e2e

```- **Google OAuth** - Authentication```bash



---### Running the Application



## 🐛 Troubleshooting- **JWT** - Session tokenschmod +x scripts/start-dev.sh scripts/stop-dev.sh  # one-time



<details>#### ⚡ Option 1: Unified Scripts (Recommended)

<summary><strong>Port Already in Use</strong></summary>

scripts/start-dev.sh      # boots backend on PORT (default 5001) + frontend on 3001

```bash

# Find process on port 5001```bash

lsof -i :5001

# Make scripts executable (one-time)---scripts/stop-dev.sh       # stops both using the PID files

# Kill the process

kill -9 <PID>chmod +x scripts/start-dev.sh scripts/stop-dev.sh

```

</details>```



<details># Start both backend and frontend

<summary><strong>Google OAuth Failed</strong></summary>

./scripts/start-dev.sh## 🚀 Getting Started

- Verify `GOOGLE_CLIENT_ID` matches in both frontend and backend

- Check authorized origins in Google Cloud Console

- Ensure redirect URIs are configured correctly

</details># Stop all servicesEnvironment overrides:



<details>./scripts/stop-dev.sh

<summary><strong>Gemini API Errors</strong></summary>

```### Prerequisites

- Verify API key at [Google AI Studio](https://aistudio.google.com/app/apikey)

- Check quota limits

- Ensure model name is `gemini-2.0-flash` or `gemini-1.5-flash`

</details>**Environment overrides**:- `PORT=5002 scripts/start-dev.sh`



<details>```bash

<summary><strong>Database Connection Failed</strong></summary>

PORT=5002 ./scripts/start-dev.sh- **Node.js** 18 or higher- `FRONTEND_PORT=5173 scripts/start-dev.sh`

```bash

# Reset databaseFRONTEND_PORT=5173 ./scripts/start-dev.sh

cd backend

rm -f prisma/dev.db```- **npm** 9 or higher- `API_BASE_URL=https://api.dev.lakshpath.in scripts/start-dev.sh`

npm run prisma:migrate

npm run prisma:generate

```

</details>**Logs**: Check `backend-dev.log` and `frontend-dev.log`- **Git**



---



## 🤝 Contributing#### 🔧 Option 2: Manual Start- **Google Cloud Project** with:Diagnostics:



We welcome contributions! Here's how you can help:



1. 🍴 Fork the repository**Terminal 1 - Backend**:  - OAuth 2.0 credentials configured

2. 🌿 Create a feature branch (`git checkout -b feature/amazing-feature`)

3. 💾 Commit your changes (`git commit -m 'Add amazing feature'`)```bash

4. 📤 Push to branch (`git push origin feature/amazing-feature`)

5. 🔃 Open a Pull Requestcd backend  - Gemini API access enabled- Logs → `backend-dev.log` and `frontend-dev.log`



### Contribution Guidelinesnpm run dev



- ✅ Follow existing code style```- Process IDs → `backend-dev.pid`, `frontend-dev.pid`

- ✅ Write meaningful commit messages

- ✅ Add tests for new features

- ✅ Update documentation

- ✅ Run `npm run lint` before committing**Terminal 2 - Frontend**:### Installation



---```bash



## 📊 Roadmapcd frontend### Manual alternative



- [x] Core assessment enginenpm run dev -- --port 3001

- [x] Google OAuth integration

- [x] Gemini AI integration```1. **Clone the repository**

- [x] Job auto-scout feature

- [x] Market intelligence dashboard

- [ ] Skills endorsement system

- [ ] Peer-to-peer mentorship### Access the Application   ```bash```bash

- [ ] Mobile app (React Native)

- [ ] Advanced analytics dashboard

- [ ] Multi-language support

- 🌐 **Frontend**: http://localhost:3001   git clone https://github.com/cybertech-18/LakshPath.git# Terminal 1 (API – defaults to PORT in backend/.env, usually 5000)

---

- 🔌 **Backend API**: http://localhost:5001

## 📄 License

- ✅ **Health Check**: http://localhost:5001/health   cd LakshPathcd backend

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.



---

---   ```npm run dev

## 👥 Team



**Lead Developer**: [Ayush Pathak](https://github.com/cybertech-18)

## 📁 Project Structure

**Contact**:

- 📧 Email: ayushap18@lakshpath.in

- 💼 LinkedIn: [LakshPath](https://linkedin.com/company/lakshpath)

- 🐙 GitHub: [@cybertech-18](https://github.com/cybertech-18)```2. **Install dependencies**# Terminal 2 (SPA)



---LakshPath/



## 🙏 Acknowledgments├── backend/                    # Express API server   ```bashcd ../frontend



- **Google Gemini AI** - Powering intelligent insights│   ├── src/

- **Prisma Team** - Exceptional ORM

- **Vercel** - Amazing deployment platform│   │   ├── config/            # Environment & configuration   # Frontendnpm run dev -- --port 3001

- **React Community** - Incredible ecosystem

│   │   ├── controllers/       # Request handlers

---

│   │   ├── services/          # Business logic & AI services   npm install --prefix frontend```

<div align="center">

│   │   ├── routes/            # API route definitions

### 🌟 If you find this project helpful, please star it!

│   │   ├── middleware/        # Auth & error handling   

[![GitHub stars](https://img.shields.io/github/stars/cybertech-18/LakshPath?style=social)](https://github.com/cybertech-18/LakshPath/stargazers)

│   │   ├── lib/               # Utilities (Prisma, AI engines)

<p>

  <a href="https://github.com/cybertech-18/LakshPath/issues/new?labels=bug">🐛 Report Bug</a>│   │   └── types/             # TypeScript definitions   # Backend## Quick validation

  ·

  <a href="https://github.com/cybertech-18/LakshPath/issues/new?labels=enhancement">✨ Request Feature</a>│   ├── prisma/

  ·

  <a href="WORKFLOW.md">📖 Read Workflow Guide</a>│   │   ├── schema.prisma      # Database schema   npm install --prefix backend

</p>

│   │   └── migrations/        # Database migrations

**Built with ❤️ to empower careers through AI**

│   └── package.json   ``````bash

Made in India 🇮🇳 | Empowering 130M+ students

│

</div>

├── frontend/                   # React application# API health

│   ├── src/

│   │   ├── components/        # Reusable UI components3. **Set up environment variables**curl -s http://localhost:5001/health | jq

│   │   ├── pages/             # Route pages

│   │   ├── services/          # API client   ```bash

│   │   └── types/             # TypeScript interfaces

│   └── package.json   chmod +x scripts/setup-env.sh# Trigger demo assessment payload

│

├── scripts/                    # Development utilities   ./scripts/setup-env.shnode -e "fetch('http://localhost:5001/api/assessment', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({demo: true, answers: {educationLevel: 'College', fieldInterest: 'Software', technicalSkill: 4, communicationSkill: 4, analyticalSkill: 4, creativitySkill: 3}})}).then(r => r.json()).then(console.log)"

│   ├── setup-env.sh           # Environment setup

│   ├── start-dev.sh           # Start all services   ```

│   └── stop-dev.sh            # Stop all services

│   # Auto-scout sample (replace USER_ID)

└── README.md                   # This file

```   This creates `.env` files from templates. You'll need to add:curl -s "http://localhost:5001/api/jobs/auto-scout/USER_ID?refresh=true" | jq



---   ```



## 🔌 API Documentation   **`backend/.env`**:



### Base URL   ```env## Database & Prisma

```

http://localhost:5001/api   PORT=5001

```

   GEMINI_API_KEY=your_gemini_api_key_here- Prisma schema: `backend/prisma/schema.prisma`

### Authentication

   GEMINI_MODEL=gemini-2.0-flash- Local SQLite file: `backend/prisma/dev.db`

#### `POST /api/auth/google`

Authenticate user with Google OAuth token.   GOOGLE_CLIENT_ID=your_google_client_id- Apply migrations:



**Request**:   CLIENT_ORIGIN=http://localhost:3001  ```bash

```json

{   JWT_SECRET=your_secure_random_string  cd backend

  "credential": "google_oauth_token"

}   DATABASE_URL=file:./prisma/dev.db  npm run prisma:migrate

```

   ```  ```

**Response**:

```json   - Regenerate Prisma Client: `npm run prisma:generate`

{

  "token": "jwt_token",   **`frontend/.env`**:- Open Prisma Studio: `npm run prisma:studio`

  "user": {

    "id": "user_id",   ```env

    "email": "user@example.com",

    "name": "User Name"   VITE_API_BASE_URL=http://localhost:5001/apiDelete `backend/prisma/dev.db` if you need a clean slate before rerunning migrations.

  }

}   VITE_GOOGLE_CLIENT_ID=your_google_client_id

```

   ```## Useful npm scripts

### Assessment



#### `POST /api/assessment`

Submit career assessment and receive AI-powered insights.4. **Set up the database**| Location | Script | Does |



**Request**:   ```bash| --- | --- | --- |

```json

{   cd backend| `backend` | `npm run dev` | ts-node-dev watcher on Express server |

  "demo": false,

  "answers": {   npm run prisma:generate|  | `npm run build` | Type-check + emit to `dist/` with path alias fixes |

    "educationLevel": "College",

    "fieldInterest": "Software",   npm run prisma:migrate|  | `npm run lint` | Strict TypeScript compile without emit |

    "technicalSkill": 4,

    "communicationSkill": 4,   cd ..| `frontend` | `npm run dev` | Vite dev server |

    "analyticalSkill": 4,

    "creativitySkill": 3   ```|  | `npm run build` | Production bundle |

  }

}|  | `npm run preview` | Serve the built frontend |

```

### Running the Application

**Response**:

```json## Troubleshooting tips

{

  "insights": "AI-generated career insights...",#### Option 1: Unified Scripts (Recommended)

  "roadmap": "Personalized learning path...",

  "recommendations": ["Career 1", "Career 2"]- **Port already in use:** Change `PORT`/`FRONTEND_PORT` or kill the conflicting process via `lsof -i :<port>`.

}

``````bash- **Google sign-in fails (`invalid_client`):** Ensure OAuth credentials include your dev origin and that frontend + backend share the same Client ID.



#### `GET /api/assessment/me`# Make scripts executable (one-time)- **Gemini errors:** Verify API key access to the chosen model (`gemini-2.0-flash`) and watch quota in Google AI Studio.

Get authenticated user's latest assessment.

chmod +x scripts/start-dev.sh scripts/stop-dev.sh- **Stale JD comparison data:** Call `/api/jobs/auto-scout/:userId?refresh=true` to bypass the cache.

**Headers**: `Authorization: Bearer <token>`



### Jobs

# Start both backend and frontend## Documentation map

#### `GET /api/jobs/auto-scout/:userId`

Get AI-matched jobs for a user../scripts/start-dev.sh



**Query Parameters**:- `DOCUMENTATION.md` – detailed UX flows, backlog, design principles.

- `refresh=true` - Force fresh job scan (bypasses cache)

# Stop all services- `PROJECT_SUMMARY.md` – pitch-friendly summary + differentiators.

**Response**:

```json./scripts/stop-dev.sh- `PROCESS_PLAYBOOK.md` – daily rituals and operating cadence.

{

  "matches": [```- `STATUS.md` – latest engineering tasks and checkpoints.

    {

      "summary": "Job overview",

      "matches": ["Matching skill 1", "Matching skill 2"],

      "gaps": ["Missing skill 1"],**Environment overrides**:## Contributing

      "jobMeta": {

        "title": "Software Engineer",```bash

        "location": "Remote",

        "salary": "₹10-15 LPA"PORT=5002 ./scripts/start-dev.sh1. Fork the repo and create a feature branch.

      }

    }FRONTEND_PORT=5173 ./scripts/start-dev.sh2. Keep TypeScript lint clean (`npm run lint` in backend, `npm run lint` in frontend if configured).

  ]

}```3. Include tests or smoke steps for behavior changes.

```

4. Open a PR with screenshots/logs where relevant.

#### `POST /api/jobs/compare`

Compare a job description against user profile.Logs are saved to `backend-dev.log` and `frontend-dev.log`.



**Request**:## License

```json

{#### Option 2: Manual Start

  "userId": "user_id",

  "jobDescription": "Full job description text..."LakshPath is currently proprietary; please contact the maintainers before reusing any code or assets.

}

```**Terminal 1 - Backend**:



### Market Insights```bash## Contact



#### `GET /api/market/trends/:domain`cd backend

Get market trends for a specific domain.

npm run dev- GitHub: [@iayus-grow](https://github.com/iayus-grow)

**Response**:

```json```- Email: ayushap18@lakshpath.in

{

  "domain": "Software Development",- LinkedIn: [LakshPath](https://linkedin.com/company/lakshpath)

  "salary": {

    "average": "₹12 LPA",**Terminal 2 - Frontend**:

    "range": "₹6-25 LPA"

  },```bash---

  "demand": "High",

  "topSkills": ["React", "Node.js", "TypeScript"]cd frontend

}

```npm run dev -- --port 3001**LakshPath** is built to close the skill-opportunity gap for 130M+ Indian students. Star the repo, share feedback, and let’s ship better career intelligence together.



---```**The Paradox:**



## 🌐 Deployment

### Access the Application

### Backend Deployment (Render/Railway/Fly.io)

- **Frontend**: http://localhost:3001

1. **Set environment variables** in your hosting platform- **Backend API**: http://localhost:5001

2. **Build command**: `npm run build`- **Health Check**: http://localhost:5001/health

3. **Start command**: `npm start`

4. **Update `DATABASE_URL`** for production database (PostgreSQL recommended)---



**Required Environment Variables**:## 📁 Project Structure

```env

PORT=5001```

GEMINI_API_KEY=your_gemini_api_keyLakshPath/

GEMINI_MODEL=gemini-2.0-flash├── backend/                    # Express API server

GOOGLE_CLIENT_ID=your_google_client_id│   ├── src/

CLIENT_ORIGIN=https://your-frontend-url.com│   │   ├── config/            # Environment & configuration

JWT_SECRET=your_secure_random_string│   │   ├── controllers/       # Request handlers

DATABASE_URL=postgresql://...│   │   ├── services/          # Business logic & AI services

```│   │   ├── routes/            # API route definitions

│   │   ├── middleware/        # Auth & error handling

### Frontend Deployment (Netlify/Vercel)│   │   ├── lib/               # Utilities (Prisma, AI engines)

│   │   └── types/             # TypeScript definitions

1. **Build command**: `npm run build`│   ├── prisma/

2. **Publish directory**: `dist`│   │   ├── schema.prisma      # Database schema

3. **Set environment variables**:│   │   └── migrations/        # Database migrations

   - `VITE_API_BASE_URL`: Your backend API URL│   └── package.json

   - `VITE_GOOGLE_CLIENT_ID`: Your Google OAuth Client ID│

├── frontend/                   # React application

**Netlify Configuration** (`netlify.toml`):│   ├── src/

```toml│   │   ├── components/        # Reusable UI components

[build]│   │   ├── pages/             # Route pages

  command = "npm run build"│   │   ├── services/          # API client

  publish = "dist"│   │   └── types/             # TypeScript interfaces

│   └── package.json

[[redirects]]│

  from = "/*"├── scripts/                    # Development utilities

  to = "/index.html"│   ├── setup-env.sh           # Environment setup

  status = 200│   ├── start-dev.sh           # Start all services

```│   └── stop-dev.sh            # Stop all services

│

### Important: Update CORS Origins└── README.md                   # This file

```

Update `CLIENT_ORIGIN` in backend `.env` to match your production frontend URL.

---

---

## 🔌 API Documentation

## 🧪 Testing

### Authentication

### Backend API Health Check

#### `POST /api/auth/google`

```bashAuthenticate user with Google OAuth token.

curl -s http://localhost:5001/health | jq

```**Request**:

```json

### Demo Assessment{

  "credential": "google_oauth_token"

```bash}

curl -X POST http://localhost:5001/api/assessment \```

  -H "Content-Type: application/json" \

  -d '{**Response**:

    "demo": true,```json

    "answers": {{

      "educationLevel": "College",  "token": "jwt_token",

      "fieldInterest": "Software",  "user": {

      "technicalSkill": 4,    "id": "user_id",

      "communicationSkill": 4,    "email": "user@example.com",

      "analyticalSkill": 4,    "name": "User Name"

      "creativitySkill": 3  }

    }}

  }'```

```

### Assessment

### Auto-Scout Jobs

#### `POST /api/assessment`

```bashSubmit career assessment and receive AI-powered insights.

curl -s "http://localhost:5001/api/jobs/auto-scout/USER_ID?refresh=true" | jq

```**Request**:

```json

---{

  "demo": false,

## 🐛 Troubleshooting  "answers": {

    "educationLevel": "College",

### Port Already in Use    "fieldInterest": "Software",

    "technicalSkill": 4,

```bash    "communicationSkill": 4,

# Find and kill process using port 5001    "analyticalSkill": 4,

lsof -i :5001    "creativitySkill": 3

kill -9 <PID>  }

```}

```

### Google OAuth Errors

**Response**:

- ✅ Verify OAuth credentials in Google Cloud Console```json

- ✅ Ensure authorized JavaScript origins include your dev URL{

- ✅ Check that `GOOGLE_CLIENT_ID` matches in both frontend and backend  "insights": "AI-generated career insights...",

  "roadmap": "Personalized learning path...",

### Gemini API Errors  "recommendations": ["Career 1", "Career 2"]

}

- ✅ Verify API key in [Google AI Studio](https://aistudio.google.com/app/apikey)```

- ✅ Check API quota limits

- ✅ Ensure correct model name (`gemini-2.0-flash`)### Jobs



### Database Issues#### `GET /api/jobs/auto-scout/:userId`

Get AI-matched jobs for a user.

```bash

# Reset database**Query Parameters**:

cd backend- `refresh=true` - Force fresh job scan (bypasses cache)

rm -f prisma/dev.db

npm run prisma:migrate**Response**:

npm run prisma:generate```json

```{

  "matches": [

### Build Errors    {

      "summary": "Job overview",

```bash      "matches": ["Matching skill 1", "Matching skill 2"],

# Clear dependencies and reinstall      "gaps": ["Missing skill 1"],

rm -rf node_modules package-lock.json      "jobMeta": {

npm install        "title": "Software Engineer",

        "location": "Remote",

# Backend build        "salary": "₹10-15 LPA"

cd backend      }

npm run build    }

  ]

# Frontend build}

cd frontend```

npm run build

```#### `POST /api/jobs/compare`

Compare a job description against user profile.

---

**Request**:

## 🤝 Contributing```json

{

We welcome contributions! Please follow these steps:  "userId": "user_id",

  "jobDescription": "Full job description text..."

1. **Fork the repository**}

2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)```

3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)

4. **Push to the branch** (`git push origin feature/AmazingFeature`)### Market Insights

5. **Open a Pull Request**

#### `GET /api/market/trends/:domain`

### Development GuidelinesGet market trends for a specific domain.



- ✅ Follow TypeScript best practices**Response**:

- ✅ Run linting before commits: `npm run lint````json

- ✅ Write meaningful commit messages{

- ✅ Update documentation for new features  "domain": "Software Development",

- ✅ Test thoroughly before submitting PR  "salary": {

    "average": "₹12 LPA",

---    "range": "₹6-25 LPA"

  },

## 📄 License  "demand": "High",

  "topSkills": ["React", "Node.js", "TypeScript"]

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.}

```

---

---

## 👥 Team

## 🌐 Deployment

**Project Lead & Developer**: [Ayush Pathak](https://github.com/cybertech-18)

### Backend Deployment (Render/Railway/Fly.io)

---

1. **Set environment variables** in your hosting platform

## 🙏 Acknowledgments2. **Build command**: `npm run build`

3. **Start command**: `npm start`

- **Google Gemini AI** - Powering intelligent career insights4. **Update `DATABASE_URL`** for production database (PostgreSQL recommended)

- **Prisma** - Modern database ORM

- **React & Vite** - Fast, modern frontend tooling### Frontend Deployment (Netlify/Vercel)

- **Tailwind CSS** - Utility-first styling framework

1. **Build command**: `npm run build`

---2. **Publish directory**: `dist`

3. **Set environment variables**:

<div align="center">   - `VITE_API_BASE_URL`: Your backend API URL

   - `VITE_GOOGLE_CLIENT_ID`: Your Google OAuth Client ID

### 🌟 Star this repo if you find it helpful!

### Important: Update CORS Origins

<p>

  <a href="https://github.com/cybertech-18/LakshPath/issues">Report Bug</a>Update `CLIENT_ORIGIN` in backend `.env` to match your production frontend URL.

  ·

  <a href="https://github.com/cybertech-18/LakshPath/issues">Request Feature</a>---

  ·

  <a href="#-contributing">Contribute</a>## 🧪 Testing

</p>

### Backend API Health Check

**Built with ❤️ to empower careers through AI**

```bash

</div>curl -s http://localhost:5001/health | jq

```

### Demo Assessment

```bash
node -e "fetch('http://localhost:5001/api/assessment', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    demo: true,
    answers: {
      educationLevel: 'College',
      fieldInterest: 'Software',
      technicalSkill: 4,
      communicationSkill: 4,
      analyticalSkill: 4,
      creativitySkill: 3
    }
  })
}).then(r => r.json()).then(console.log)"
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find and kill process using port 5001
lsof -i :5001
kill -9 <PID>
```

### Google OAuth Errors
- Verify OAuth credentials in Google Cloud Console
- Ensure authorized JavaScript origins include your dev URL
- Check that `GOOGLE_CLIENT_ID` matches in both frontend and backend

### Gemini API Errors
- Verify API key in Google AI Studio
- Check API quota limits
- Ensure correct model name (`gemini-2.0-flash`)

### Database Issues
```bash
# Reset database
cd backend
rm -f prisma/dev.db
npm run prisma:migrate
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Run linting before commits: `npm run lint`
- Write meaningful commit messages
- Update documentation for new features

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**Project Lead & Developer**: Ayush Pathak

---

## 🙏 Acknowledgments

- **Google Gemini AI** - Powering intelligent career insights
- **Prisma** - Database ORM
- **React & Vite** - Modern frontend tooling
- **Tailwind CSS** - Utility-first styling

---

<div align="center">
  <p><strong>Built with ❤️ to empower careers through AI</strong></p>
  <p>
    <a href="https://github.com/cybertech-18/LakshPath/issues">Report Bug</a>
    ·
    <a href="https://github.com/cybertech-18/LakshPath/issues">Request Feature</a>
  </p>
</div>
