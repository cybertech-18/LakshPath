-- CreateTable
CREATE TABLE "InterviewSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "role" TEXT,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "overallScore" REAL,
    "feedback" TEXT,
    "speechAnalysis" TEXT,
    "duration" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "InterviewSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InterviewQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionType" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "userAnswer" TEXT,
    "answerScore" REAL,
    "aiFeedback" TEXT,
    "strengths" TEXT,
    "improvements" TEXT,
    "starAnalysis" TEXT,
    "codeQuality" TEXT,
    "expectedAnswer" TEXT,
    "timeTaken" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "answeredAt" DATETIME,
    CONSTRAINT "InterviewQuestion_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InterviewSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PortfolioAnalysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "githubUsername" TEXT,
    "portfolioUrl" TEXT,
    "overallScore" REAL NOT NULL,
    "codeQualityScore" REAL,
    "diversityScore" REAL,
    "contributionScore" REAL,
    "summary" TEXT NOT NULL,
    "strengths" TEXT NOT NULL,
    "weaknesses" TEXT NOT NULL,
    "missingProjectTypes" TEXT,
    "recommendations" TEXT NOT NULL,
    "targetRole" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PortfolioAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RepositoryAnalysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "portfolioId" TEXT NOT NULL,
    "repoName" TEXT NOT NULL,
    "repoUrl" TEXT NOT NULL,
    "description" TEXT,
    "language" TEXT,
    "stars" INTEGER NOT NULL DEFAULT 0,
    "forks" INTEGER NOT NULL DEFAULT 0,
    "lastCommit" DATETIME,
    "codeQualityScore" REAL,
    "complexity" TEXT,
    "hasReadme" BOOLEAN NOT NULL DEFAULT false,
    "hasTests" BOOLEAN NOT NULL DEFAULT false,
    "hasCi" BOOLEAN NOT NULL DEFAULT false,
    "readmeQuality" TEXT,
    "improvements" TEXT,
    "highlights" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RepositoryAnalysis_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "PortfolioAnalysis" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LinkedInOptimization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "targetRole" TEXT,
    "targetIndustry" TEXT,
    "currentHeadline" TEXT,
    "optimizedHeadline" TEXT NOT NULL,
    "currentAbout" TEXT,
    "optimizedAbout" TEXT NOT NULL,
    "currentExperience" TEXT,
    "optimizedExperience" TEXT,
    "keywords" TEXT NOT NULL,
    "overallScore" REAL NOT NULL,
    "beforeScore" REAL,
    "afterScore" REAL NOT NULL,
    "improvements" TEXT NOT NULL,
    "missingElements" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LinkedInOptimization_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "InterviewSession_userId_createdAt_idx" ON "InterviewSession"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "InterviewQuestion_sessionId_idx" ON "InterviewQuestion"("sessionId");

-- CreateIndex
CREATE INDEX "PortfolioAnalysis_userId_createdAt_idx" ON "PortfolioAnalysis"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "RepositoryAnalysis_portfolioId_idx" ON "RepositoryAnalysis"("portfolioId");

-- CreateIndex
CREATE INDEX "LinkedInOptimization_userId_createdAt_idx" ON "LinkedInOptimization"("userId", "createdAt");
