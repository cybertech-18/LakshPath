# n8n Resume Analyzer Workflow Guide

**Project:** LakshPath Resume Analyzer  
**Tool:** n8n (Workflow Automation)  
**Purpose:** Automated resume analysis with AI-powered insights

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Workflow Architecture](#workflow-architecture)
4. [Step-by-Step Setup](#step-by-step-setup)
5. [Node Configuration](#node-configuration)
6. [Integration with LakshPath](#integration-with-lakshpath)
7. [Testing](#testing)
8. [Advanced Features](#advanced-features)

---

## 🎯 Overview

This n8n workflow will:
- Accept resume files (PDF, DOCX, TXT)
- Extract text content from resumes
- Analyze using Gemini AI (same as LakshPath backend)
- Score resumes on multiple criteria
- Generate improvement suggestions
- Store results in your database
- Send analysis reports via email

---

## 📦 Prerequisites

### 1. Install n8n

**Option A: Using npm**
```bash
npm install -g n8n
```

**Option B: Using Docker**
```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

### 2. Required API Keys
- ✅ Gemini API Key (you already have this in `.env`)
- Email service credentials (optional for sending reports)
- Database connection details (SQLite from LakshPath)

### 3. n8n Nodes to Install
- **HTTP Request** (built-in)
- **Code** (built-in)
- **Google Gemini** (community node)
- **PDF Parser** (community node or custom)
- **SQLite** (for database integration)

---

## 🏗️ Workflow Architecture

```
┌─────────────────┐
│  Webhook/API    │  ← Resume Upload Endpoint
│  (Trigger)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  File Validation│  ← Check file type & size
│  (IF Node)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Extract Text   │  ← Parse PDF/DOCX to text
│  (PDF/DOCX)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Gemini AI      │  ← Analyze resume content
│  Analysis       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Parse Results  │  ← Structure AI response
│  (Code Node)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Save to DB     │  ← Store in SQLite/PostgreSQL
│  (Database)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Send Email     │  ← Email report to user
│  (Optional)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Return JSON    │  ← API Response
│  Response       │
└─────────────────┘
```

---

## 🚀 Step-by-Step Setup

### Step 1: Start n8n

```bash
# If installed via npm
n8n start

# Access at: http://localhost:5678
```

### Step 2: Create New Workflow

1. Open n8n dashboard: `http://localhost:5678`
2. Click **"New Workflow"**
3. Name it: `Resume Analyzer`

### Step 3: Add Webhook Trigger

1. Click **"+"** → Search **"Webhook"**
2. Configure:
   - **Webhook Type:** `POST`
   - **Path:** `/resume-analyze`
   - **Response Mode:** `Last Node`
   - **Authentication:** `None` (or use Header Auth)

**Example Request:**
```json
{
  "userId": "user123",
  "resumeUrl": "https://example.com/resume.pdf",
  "jobDescription": "Senior Software Engineer role..."
}
```

---

## 🔧 Node Configuration

### Node 1: Webhook (Trigger)

**Purpose:** Receive resume upload requests

```javascript
// Webhook Configuration
{
  "httpMethod": "POST",
  "path": "resume-analyze",
  "responseMode": "lastNode",
  "options": {}
}
```

### Node 2: IF - File Validation

**Purpose:** Validate file type and size

```javascript
// Conditions
{
  "conditions": {
    "string": [
      {
        "value1": "={{$json.resumeUrl}}",
        "operation": "contains",
        "value2": ".pdf"
      }
    ]
  }
}
```

### Node 3: HTTP Request - Download Resume

**Purpose:** Download the resume file

```javascript
// HTTP Request Configuration
{
  "method": "GET",
  "url": "={{$json.resumeUrl}}",
  "responseFormat": "file",
  "options": {
    "response": {
      "response": {
        "responseFormat": "file"
      }
    }
  }
}
```

### Node 4: Code - Extract Text from PDF

**Purpose:** Parse PDF/DOCX to plain text

```javascript
// Install pdf-parse in n8n
const pdfParse = require('pdf-parse');

// For each item
const items = $input.all();
const results = [];

for (const item of items) {
  const buffer = Buffer.from(item.binary.data, 'base64');
  const data = await pdfParse(buffer);
  
  results.push({
    json: {
      userId: item.json.userId,
      resumeText: data.text,
      pages: data.numpages,
      jobDescription: item.json.jobDescription
    }
  });
}

return results;
```

### Node 5: HTTP Request - Gemini AI Analysis

**Purpose:** Send resume text to Gemini for analysis

```javascript
// HTTP Request to Gemini API
{
  "method": "POST",
  "url": "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
  "authentication": "headerAuth",
  "sendHeaders": true,
  "headerParameters": {
    "parameters": [
      {
        "name": "x-goog-api-key",
        "value": "YOUR_GEMINI_API_KEY"
      }
    ]
  },
  "sendBody": true,
  "bodyParameters": {
    "parameters": [
      {
        "name": "contents",
        "value": "={{[{\"parts\": [{\"text\": \"Analyze this resume...\" + $json.resumeText}]}]}}"
      }
    ]
  }
}
```

**Gemini Prompt Template:**
```javascript
const prompt = `You are an expert resume analyzer for LakshPath career platform.

Analyze the following resume and provide a detailed assessment:

RESUME CONTENT:
${resumeText}

${jobDescription ? `TARGET JOB: ${jobDescription}` : ''}

Provide analysis in JSON format:
{
  "overallScore": 85,
  "strengths": ["Strong technical skills", "Clear progression"],
  "weaknesses": ["Missing leadership examples", "No certifications"],
  "sections": {
    "experience": {
      "score": 90,
      "feedback": "Detailed work history with quantifiable achievements"
    },
    "skills": {
      "score": 80,
      "feedback": "Good technical skills, but missing soft skills"
    },
    "education": {
      "score": 85,
      "feedback": "Relevant degree with good GPA"
    },
    "format": {
      "score": 75,
      "feedback": "Clean format but could improve readability"
    }
  },
  "keySkills": ["Python", "React", "AWS", "Leadership"],
  "missingSkills": ["Docker", "Kubernetes", "CI/CD"],
  "atsScore": 78,
  "recommendations": [
    "Add quantifiable metrics to achievements",
    "Include relevant certifications",
    "Optimize for ATS with better keywords"
  ],
  "matchScore": ${jobDescription ? '85' : 'null'}
}`;
```

### Node 6: Code - Parse Gemini Response

**Purpose:** Extract structured data from AI response

```javascript
const items = $input.all();
const results = [];

for (const item of items) {
  try {
    // Extract JSON from Gemini response
    const geminiResponse = item.json.candidates[0].content.parts[0].text;
    
    // Remove markdown code blocks if present
    const jsonText = geminiResponse
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '');
    
    const analysis = JSON.parse(jsonText);
    
    results.push({
      json: {
        userId: item.json.userId,
        analysis: analysis,
        timestamp: new Date().toISOString(),
        resumePages: item.json.pages
      }
    });
  } catch (error) {
    results.push({
      json: {
        error: 'Failed to parse AI response',
        details: error.message
      }
    });
  }
}

return results;
```

### Node 7: SQLite - Save to Database

**Purpose:** Store analysis in LakshPath database

```javascript
// SQLite Query Configuration
{
  "operation": "executeQuery",
  "query": `
    INSERT INTO ResumeAnalysis (
      id, userId, overallScore, strengths, weaknesses, 
      sections, keySkills, missingSkills, atsScore, 
      recommendations, matchScore, createdAt
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `,
  "values": [
    "={{$json.id}}",
    "={{$json.userId}}",
    "={{$json.analysis.overallScore}}",
    "={{JSON.stringify($json.analysis.strengths)}}",
    "={{JSON.stringify($json.analysis.weaknesses)}}",
    "={{JSON.stringify($json.analysis.sections)}}",
    "={{JSON.stringify($json.analysis.keySkills)}}",
    "={{JSON.stringify($json.analysis.missingSkills)}}",
    "={{$json.analysis.atsScore}}",
    "={{JSON.stringify($json.analysis.recommendations)}}",
    "={{$json.analysis.matchScore}}",
    "={{$json.timestamp}}"
  ]
}
```

### Node 8: Send Email (Optional)

**Purpose:** Email report to user

```javascript
// Email Configuration
{
  "fromEmail": "noreply@lakshpath.ai",
  "toEmail": "={{$json.userEmail}}",
  "subject": "Your Resume Analysis is Ready!",
  "emailType": "html",
  "text": `
    <h2>Resume Analysis Complete</h2>
    <p>Overall Score: <strong>{{$json.analysis.overallScore}}/100</strong></p>
    <p>ATS Score: <strong>{{$json.analysis.atsScore}}/100</strong></p>
    
    <h3>Strengths:</h3>
    <ul>
      {{#each $json.analysis.strengths}}
        <li>{{this}}</li>
      {{/each}}
    </ul>
    
    <h3>Recommendations:</h3>
    <ul>
      {{#each $json.analysis.recommendations}}
        <li>{{this}}</li>
      {{/each}}
    </ul>
  `
}
```

### Node 9: Respond - Return JSON

**Purpose:** Send response back to client

```javascript
// Response Configuration
{
  "respondWith": "json",
  "responseBody": {
    "success": true,
    "analysisId": "={{$json.id}}",
    "overallScore": "={{$json.analysis.overallScore}}",
    "atsScore": "={{$json.analysis.atsScore}}",
    "summary": {
      "strengths": "={{$json.analysis.strengths}}",
      "weaknesses": "={{$json.analysis.weaknesses}}",
      "recommendations": "={{$json.analysis.recommendations}}"
    }
  }
}
```

---

## 🔗 Integration with LakshPath

### Backend API Endpoint

Add this to your LakshPath backend (`backend/src/routes/resume.routes.ts`):

```typescript
import { Router } from 'express';
import axios from 'axios';

const router = Router();

router.post('/analyze', async (req, res) => {
  try {
    const { userId, resumeUrl, jobDescription } = req.body;
    
    // Call n8n webhook
    const response = await axios.post('http://localhost:5678/webhook/resume-analyze', {
      userId,
      resumeUrl,
      jobDescription
    });
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Resume analysis failed' });
  }
});

export default router;
```

### Frontend Component

Add resume upload to frontend:

```typescript
// frontend/src/pages/ResumeAnalyzer.tsx
import { useState } from 'react';
import axios from 'axios';

export default function ResumeAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!file) return;
    
    setLoading(true);
    try {
      // Upload file first
      const formData = new FormData();
      formData.append('resume', file);
      
      const uploadRes = await axios.post('/api/upload', formData);
      
      // Trigger n8n analysis
      const analysisRes = await axios.post('/api/resume/analyze', {
        userId: localStorage.getItem('userId'),
        resumeUrl: uploadRes.data.url
      });
      
      setAnalysis(analysisRes.data);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6">Resume Analyzer</h2>
      
      <input
        type="file"
        accept=".pdf,.docx"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-4"
      />
      
      <button
        onClick={handleAnalyze}
        disabled={!file || loading}
        className="bg-primary-600 text-white px-6 py-2 rounded"
      >
        {loading ? 'Analyzing...' : 'Analyze Resume'}
      </button>
      
      {analysis && (
        <div className="mt-8 p-6 bg-white/5 rounded-lg">
          <h3 className="text-2xl font-bold mb-4">Analysis Results</h3>
          <p className="text-lg">
            Overall Score: <strong>{analysis.overallScore}/100</strong>
          </p>
          <p className="text-lg">
            ATS Score: <strong>{analysis.atsScore}/100</strong>
          </p>
          {/* Display full analysis */}
        </div>
      )}
    </div>
  );
}
```

---

## 🧪 Testing

### Test with cURL

```bash
# Test n8n webhook directly
curl -X POST http://localhost:5678/webhook/resume-analyze \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "resumeUrl": "https://example.com/sample-resume.pdf",
    "jobDescription": "Software Engineer with 3+ years experience"
  }'
```

### Test via LakshPath API

```bash
curl -X POST http://localhost:5001/api/resume/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "userId": "user123",
    "resumeUrl": "https://your-storage.com/resume.pdf"
  }'
```

---

## 🚀 Advanced Features

### 1. Batch Processing

Add a **Schedule Trigger** to process multiple resumes:

```javascript
// Code Node for batch processing
const resumes = await db.query('SELECT * FROM PendingResumes');

const results = [];
for (const resume of resumes) {
  // Process each resume
  results.push({
    userId: resume.userId,
    resumeUrl: resume.url
  });
}

return results;
```

### 2. Real-time Progress Updates

Use **Webhook** + **WebSocket** for live updates:

```javascript
// In n8n workflow, add webhook calls
await axios.post('http://localhost:5001/api/progress', {
  userId: $json.userId,
  status: 'Processing resume...',
  progress: 50
});
```

### 3. Resume Comparison

Compare multiple resumes for the same job:

```javascript
const prompt = `Compare these resumes for the position:
JOB: ${jobDescription}

RESUME 1:
${resume1}

RESUME 2:
${resume2}

Rank them and explain why.`;
```

### 4. Custom Scoring Models

Train custom models based on successful hires:

```javascript
// Use historical data
const successfulResumes = await getSuccessfulHires();
const prompt = `Based on these successful resumes: ${successfulResumes}
Analyze this new resume: ${currentResume}`;
```

---

## 📊 Database Schema

Add this table to your Prisma schema:

```prisma
model ResumeAnalysis {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  overallScore    Int
  atsScore        Int
  strengths       String   // JSON array
  weaknesses      String   // JSON array
  sections        String   // JSON object
  keySkills       String   // JSON array
  missingSkills   String   // JSON array
  recommendations String   // JSON array
  matchScore      Int?
  resumeUrl       String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

Run migration:
```bash
cd backend
npx prisma migrate dev --name add_resume_analysis
```

---

## 🎨 Frontend UI Example

```tsx
// Professional Analysis Display
<div className="grid md:grid-cols-2 gap-6">
  {/* Score Cards */}
  <div className="bg-gradient-to-br from-primary-500/20 to-blue-500/20 p-6 rounded-lg">
    <h3 className="text-lg font-bold mb-2">Overall Score</h3>
    <div className="text-5xl font-black">{analysis.overallScore}</div>
    <div className="text-sm text-gray-400">out of 100</div>
  </div>
  
  <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-6 rounded-lg">
    <h3 className="text-lg font-bold mb-2">ATS Compatibility</h3>
    <div className="text-5xl font-black">{analysis.atsScore}</div>
    <div className="text-sm text-gray-400">ATS-friendly</div>
  </div>
</div>
```

---

## 🔒 Security Best Practices

1. **Authentication:** Add API key auth to n8n webhook
2. **File Validation:** Check file size (max 10MB) and type
3. **Rate Limiting:** Limit requests per user
4. **Virus Scanning:** Scan uploaded files
5. **Data Encryption:** Encrypt sensitive resume data

---

## 📚 Resources

- [n8n Documentation](https://docs.n8n.io)
- [Gemini API Docs](https://ai.google.dev/docs)
- [PDF Parse Library](https://www.npmjs.com/package/pdf-parse)
- [LakshPath API Docs](./WORKFLOW.md)

---

## 🎯 Next Steps

1. ✅ Set up n8n locally
2. ✅ Create webhook trigger
3. ✅ Add Gemini AI node
4. ✅ Configure database storage
5. ✅ Test with sample resumes
6. ✅ Integrate with LakshPath frontend
7. ✅ Deploy to production

---

**Questions?** Check the main README or open an issue on GitHub!

**Happy Automating! 🚀**
