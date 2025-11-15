# LakshPath Frontend

This is the frontend application for LakshPath - an AI-powered career guidance platform for Indian students.

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **Recharts** for data visualization
- **Axios** for API calls
- **Prisma-backed API** for assessments and insights

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn installed
- Backend API running on `http://localhost:5000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update the `.env` file with your backend API URL.

### Development

Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── pages/              # Page components
│   ├── LandingPage.tsx
│   ├── AssessmentQuiz.tsx
│   └── Dashboard.tsx
├── App.tsx            # Main app component with routing
├── main.tsx           # Application entry point
└── index.css          # Global styles

```

## Features

- **Landing Page**: Hero section with features showcase
- **Assessment Quiz**: 10-question interactive assessment that now talks to the Node/Express backend
- **Dashboard**: Personalized career recommendations, roadmaps, and live data pulled from the backend
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Smooth Animations**: Framer Motion for delightful user experience

## Environment Variables

- `VITE_API_BASE_URL` (required): Base URL for the LakshPath backend (defaults to `http://localhost:5000/api` if omitted)
- `VITE_GOOGLE_CLIENT_ID` (required): OAuth client ID from Google Cloud Console. Must match the backend's `GOOGLE_CLIENT_ID` for verifying ID tokens.

Create `frontend/.env` and set these variables if your backend runs on a different host/port or when deploying (Netlify + Render, etc.).

## Backend Integration Notes

- Run the backend from `../backend` with `npm run dev` (expects a valid `GEMINI_API_KEY`).
- The assessment quiz posts answers and user metadata to `/api/assessment`.
- The dashboard automatically fetches the latest assessment snapshot via `/api/assessment/:userId` when a user session is available.

## License

MIT
