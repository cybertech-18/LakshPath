<div align="center"><div align="center">## Unified dev scripts



# 🎯 LakshPath  <img src="https://github.com/user-attachments/assets/e8b32e6b-05f3-46c4-8e50-fe6a56156b4c" alt="LakshPath Banner" width="720" /><div align="center">



### AI-Powered Career Intelligence Platform  <h1>LakshPath</h1>  <img src="https://github.com/user-attachments/assets/e8b32e6b-05f3-46c4-8e50-fe6a56156b4c" alt="LakshPath Banner" width="720" />



*Personalized assessments · Smart job matching · Adaptive learning roadmaps*  <p><strong>AI-Powered Career Intelligence Platform</strong></p>  <h1> LakshPath · AI-Powered Career Intelligence </h1>



[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)  <p>Personalized assessments · Smart job matching · Adaptive learning roadmaps</p>  <p>Personalized assessments, live market intelligence, and adaptive roadmaps for every student.</p>

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-3178C6.svg)](https://www.typescriptlang.org/)  </div>

[![React](https://img.shields.io/badge/React-18.2-61DAFB.svg)](https://reactjs.org/)

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#-contributing)  [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)



[Features](#-key-features) • [Getting Started](#-getting-started) • [Documentation](#-api-documentation) • [Deployment](#-deployment)  [![Node](https://img.shields.io/badge/node-18+-green.svg)](https://nodejs.org)## Overview



</div>  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)



---</div>LakshPath pairs a TypeScript/Express API with a React + Vite dashboard to deliver AI-powered career planning. Students complete a multi-step assessment, receive Gemini-backed insights, auto-scouted job matches, and roadmap nudges that synch with live labor-market data.



## 📋 Table of Contents



- [Overview](#-overview)---## Feature highlights

- [Key Features](#-key-features)

- [Tech Stack](#-tech-stack)

- [Getting Started](#-getting-started)

  - [Prerequisites](#prerequisites)## 📋 Table of Contents- **Adaptive assessments:** Quiz answers trigger Gemini prompts that output strengths, blindspots, and a tailored learning plan.

  - [Installation](#installation)

  - [Running Locally](#running-the-application)- **Auto-scouted jobs:** `/api/jobs/auto-scout/:userId` and `/api/jobs/compare` surface JD matches even when the learner hasn’t finished an assessment.

- [Project Structure](#-project-structure)

- [API Documentation](#-api-documentation)- [Overview](#-overview)- **Market dashboards:** Real-time salary, demand, and skills trends feed the frontend insight widgets.

- [Deployment](#-deployment)

- [Troubleshooting](#-troubleshooting)- [Key Features](#-key-features)- **Smart profile fallbacks:** Brand-new users still receive contextual summaries so JD comparison never crashes.

- [Contributing](#-contributing)

- [License](#-license)- [Tech Stack](#-tech-stack)- **Unified developer ops:** Shell helpers (`scripts/start-dev.sh`, `scripts/stop-dev.sh`, `scripts/setup-env.sh`) cover setup, boot, and teardown in one command.



---- [Getting Started](#-getting-started)



## 🎯 Overview- [Project Structure](#-project-structure)## Architecture snapshot



**LakshPath** is an AI-powered career intelligence platform that helps students and professionals navigate their career journey through personalized assessments, smart job matching, and adaptive learning roadmaps.- [API Documentation](#-api-documentation)



Built with **Google Gemini AI**, the platform delivers:- [Deployment](#-deployment)| Layer | Details |

- 🧠 **Intelligent assessments** that analyze skills across multiple dimensions

- 🔍 **Auto-scout job matching** with gap analysis and recommendations- [Contributing](#-contributing)| --- | --- |

- 📊 **Real-time market intelligence** for salary trends and demand metrics

- 🛤️ **Personalized roadmaps** with curated learning resources- [License](#-license)| Frontend | React 18, Vite, TypeScript, Tailwind, React Router, Google Identity Services |



### Architecture Overview| Backend | Node 18, Express, Prisma (SQLite), Zod validation, Google OAuth, Gemini SDK |



| Layer | Technology |---| AI | `backend/src/services/geminiService.ts` centralizes prompts for assessments, chat, market insight, and JD analysis |

|-------|-----------|

| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, React Router, Framer Motion || Auth | Google Sign-In token exchange + JWT session cookies |

| **Backend** | Node.js 18, Express, Prisma ORM, Zod validation |

| **Database** | SQLite (dev) / PostgreSQL (production) |## 🎯 Overview| Infra | Local dev via npm scripts, deploy-ready for Netlify (SPA) + Render/Fly (API) |

| **AI Engine** | Google Gemini 2.0 Flash API |

| **Authentication** | Google OAuth 2.0 + JWT sessions |

| **Deployment** | Netlify (frontend) + Render/Railway (backend) |

**LakshPath** is an AI-powered career intelligence platform designed to help students and professionals navigate their career journey through personalized assessments, smart job matching, and adaptive learning roadmaps.## Repository layout

---



## ✨ Key Features

The platform combines:```

### 🧠 AI-Powered Assessments

- Multi-dimensional skill evaluation (technical, communication, analytical, creativity)- **Gemini AI** for intelligent career guidance and assessmentsLakshpath/

- Gemini-based analysis generating personalized insights

- Career path recommendations based on individual strengths- **Real-time job market analysis** with auto-scout matching├── backend/           # Express API + Prisma schema/migrations



### 🔍 Smart Job Matching- **Personalized learning roadmaps** tailored to individual skills and goals├── frontend/          # React + Vite SPA

- **Auto-Scout**: Automatic job matching based on user profile

- **Manual Comparison**: Paste any job description for instant gap analysis- **Smart profile management** with fallback mechanisms for seamless user experience├── scripts/           # Setup/start/stop helpers

- Intelligent fallbacks for users without completed assessments

├── DOCUMENTATION.md   # Deep product and UX notes

### 📊 Market Intelligence

- Real-time salary trends and demand metrics---├── PROJECT_SUMMARY.md # Pitch / summary deck text

- Skills gap analysis for target careers

- Industry insights and growth projections├── STATUS.md          # Engineering health log



### 🛤️ Personalized Roadmaps## ✨ Key Features└── README.md          # You are here

- Step-by-step learning plans generated by AI

- Resource recommendations (courses, certifications, projects)```

- Progress tracking and milestone management

### 🧠 AI-Powered Assessments

### 🔐 Secure Authentication

- Google OAuth 2.0 integration- Multi-dimensional skill evaluation (technical, communication, analytical, creativity)## Prerequisites

- JWT-based session management

- Protected routes and data privacy- Gemini-based analysis generating personalized insights



---- Career path recommendations based on individual strengths- Node.js 18+



## 🛠️ Tech Stack- npm 9+



<div align="center">### 🔍 Smart Job Matching- Google Cloud project with OAuth credentials + Gemini API access



### Frontend- **Auto-Scout**: Automatic job-description matching based on user profile- Git, cURL, jq (for quick smoke tests)

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)- **Manual Comparison**: Paste any job description for instant gap analysis

![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)- Handles users without assessments gracefully with intelligent defaults## Setup



### Backend

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)### 📊 Market Intelligence### 1. Clone and install

![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)

![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)- Real-time salary trends and demand metrics



### AI & Services- Skills gap analysis for target careers```bash

![Google Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)

![OAuth](https://img.shields.io/badge/OAuth_2.0-3C873A?style=for-the-badge&logo=auth0&logoColor=white)- Industry insights and growth projectionsgit clone https://github.com/iayus-grow/ayush18.git



</div>cd ayush18/Lakshpath



---### 🛤️ Personalized Roadmapsnpm install --prefix frontend



## 🚀 Getting Started- Step-by-step learning plans generated by AInpm install --prefix backend



### Prerequisites- Resource recommendations (courses, certifications, projects)```



- **Node.js** 18 or higher- Progress tracking and milestone management

- **npm** 9 or higher

- **Git**### 2. Create `.env` files

- **Google Cloud Project** with:

  - OAuth 2.0 credentials configured### 🔐 Secure Authentication

  - Gemini API access enabled

- Google OAuth 2.0 integration```bash

### Installation

- JWT-based session managementchmod +x scripts/setup-env.sh

1. **Clone the repository**

- Protected routes and user data privacyscripts/setup-env.sh

   ```bash

   git clone https://github.com/cybertech-18/LakshPath.git```

   cd LakshPath

   ```---



2. **Install dependencies**The helper copies every `*.env.example`, then tells you which secrets still need real values.



   ```bash## 🛠️ Tech Stack

   # Frontend

   npm install --prefix frontend### 3. Configure environment variables

   

   # Backend### Frontend

   npm install --prefix backend

   ```- **React 18** - Modern UI library| File | Key | Notes |



3. **Set up environment variables**- **TypeScript** - Type-safe development| --- | --- | --- |



   ```bash- **Vite** - Fast build tool and dev server| `backend/.env` | `PORT` | Defaults to `5001` in scripts (or `5000` manually). |

   chmod +x scripts/setup-env.sh

   ./scripts/setup-env.sh- **Tailwind CSS** - Utility-first styling|  | `CLIENT_ORIGIN` | Frontend origin for CORS (`http://localhost:3001` or `5173`). |

   ```

- **React Router** - Client-side routing|  | `DATABASE_URL` | Prisma DB URI. Default SQLite file checked into `backend/prisma`. |

   This creates `.env` files from templates. Configure the following:

- **Framer Motion** - Smooth animations|  | `GEMINI_API_KEY` | Required – generate in Google AI Studio. |

   **`backend/.env`**:

   ```env- **Recharts** - Data visualization|  | `GEMINI_MODEL` | Defaults to `gemini-2.0-flash`. |

   PORT=5001

   GEMINI_API_KEY=your_gemini_api_key_here|  | `GOOGLE_CLIENT_ID` | Matches the OAuth Web client used in the SPA. |

   GEMINI_MODEL=gemini-2.0-flash

   GOOGLE_CLIENT_ID=your_google_client_id### Backend|  | `JWT_SECRET` | Any long random string. |

   CLIENT_ORIGIN=http://localhost:3001

   JWT_SECRET=your_secure_random_string- **Node.js 18+** - Runtime environment| `frontend/.env` | `VITE_API_BASE_URL` | Usually `http://localhost:5001/api`. |

   DATABASE_URL=file:./prisma/dev.db

   ```- **Express** - Web framework|  | `VITE_GOOGLE_CLIENT_ID` | Same as backend `GOOGLE_CLIENT_ID`. |



   **`frontend/.env`**:- **TypeScript** - Type-safe backend

   ```env

   VITE_API_BASE_URL=http://localhost:5001/api- **Prisma** - Database ORMRestart servers after changing any `.env` file.

   VITE_GOOGLE_CLIENT_ID=your_google_client_id

   ```- **SQLite** - Development database



4. **Set up the database**- **Zod** - Schema validation## Running locally



   ```bash

   cd backend

   npm run prisma:generate### AI & Services### Preferred: unified dev scripts

   npm run prisma:migrate

   cd ..- **Google Gemini API** - AI-powered insights

   ```

- **Google OAuth** - Authentication```bash

### Running the Application

- **JWT** - Session tokenschmod +x scripts/start-dev.sh scripts/stop-dev.sh  # one-time

#### ⚡ Option 1: Unified Scripts (Recommended)

scripts/start-dev.sh      # boots backend on PORT (default 5001) + frontend on 3001

```bash

# Make scripts executable (one-time)---scripts/stop-dev.sh       # stops both using the PID files

chmod +x scripts/start-dev.sh scripts/stop-dev.sh

```

# Start both backend and frontend

./scripts/start-dev.sh## 🚀 Getting Started



# Stop all servicesEnvironment overrides:

./scripts/stop-dev.sh

```### Prerequisites



**Environment overrides**:- `PORT=5002 scripts/start-dev.sh`

```bash

PORT=5002 ./scripts/start-dev.sh- **Node.js** 18 or higher- `FRONTEND_PORT=5173 scripts/start-dev.sh`

FRONTEND_PORT=5173 ./scripts/start-dev.sh

```- **npm** 9 or higher- `API_BASE_URL=https://api.dev.lakshpath.in scripts/start-dev.sh`



**Logs**: Check `backend-dev.log` and `frontend-dev.log`- **Git**



#### 🔧 Option 2: Manual Start- **Google Cloud Project** with:Diagnostics:



**Terminal 1 - Backend**:  - OAuth 2.0 credentials configured

```bash

cd backend  - Gemini API access enabled- Logs → `backend-dev.log` and `frontend-dev.log`

npm run dev

```- Process IDs → `backend-dev.pid`, `frontend-dev.pid`



**Terminal 2 - Frontend**:### Installation

```bash

cd frontend### Manual alternative

npm run dev -- --port 3001

```1. **Clone the repository**



### Access the Application   ```bash```bash



- 🌐 **Frontend**: http://localhost:3001   git clone https://github.com/cybertech-18/LakshPath.git# Terminal 1 (API – defaults to PORT in backend/.env, usually 5000)

- 🔌 **Backend API**: http://localhost:5001

- ✅ **Health Check**: http://localhost:5001/health   cd LakshPathcd backend



---   ```npm run dev



## 📁 Project Structure



```2. **Install dependencies**# Terminal 2 (SPA)

LakshPath/

├── backend/                    # Express API server   ```bashcd ../frontend

│   ├── src/

│   │   ├── config/            # Environment & configuration   # Frontendnpm run dev -- --port 3001

│   │   ├── controllers/       # Request handlers

│   │   ├── services/          # Business logic & AI services   npm install --prefix frontend```

│   │   ├── routes/            # API route definitions

│   │   ├── middleware/        # Auth & error handling   

│   │   ├── lib/               # Utilities (Prisma, AI engines)

│   │   └── types/             # TypeScript definitions   # Backend## Quick validation

│   ├── prisma/

│   │   ├── schema.prisma      # Database schema   npm install --prefix backend

│   │   └── migrations/        # Database migrations

│   └── package.json   ``````bash

│

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
