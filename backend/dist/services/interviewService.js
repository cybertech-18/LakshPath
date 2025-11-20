"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.interviewService = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const geminiService_1 = require("./geminiService");
const errorHandler_1 = require("../middleware/errorHandler");
exports.interviewService = {
    /**
     * Start a new interview session
     */
    async startSession(userId, type, difficulty, role) {
        const session = await prisma_1.default.interviewSession.create({
            data: {
                userId,
                type,
                difficulty,
                role,
                status: 'IN_PROGRESS',
            },
        });
        // Generate initial questions using AI
        const questionCount = type === 'CODING' ? 1 : 5;
        const questionsResult = await geminiService_1.geminiService.generateInterviewQuestions({
            type,
            difficulty,
            role,
            count: questionCount,
        });
        // Save questions to database
        const questions = await Promise.all(questionsResult.parsed.questions.map((q) => prisma_1.default.interviewQuestion.create({
            data: {
                sessionId: session.id,
                questionText: q.questionText,
                questionType: q.questionType,
                difficulty: q.difficulty,
                expectedAnswer: q.expectedAnswer,
            },
        })));
        return {
            session,
            questions,
        };
    },
    /**
     * Submit answer to a question
     */
    async submitAnswer(questionId, userId, answer, timeTaken) {
        const question = await prisma_1.default.interviewQuestion.findUnique({
            where: { id: questionId },
            include: { session: true },
        });
        if (!question) {
            throw new errorHandler_1.AppError('Question not found', 404);
        }
        if (question.session.userId !== userId) {
            throw new errorHandler_1.AppError('Unauthorized', 403);
        }
        if (question.session.status !== 'IN_PROGRESS') {
            throw new errorHandler_1.AppError('Session is not active', 400);
        }
        // Evaluate answer using AI
        const evaluation = await geminiService_1.geminiService.evaluateInterviewAnswer({
            questionText: question.questionText,
            questionType: question.questionType,
            userAnswer: answer,
            expectedAnswer: question.expectedAnswer || undefined,
        });
        // Update question with answer and evaluation
        const updatedQuestion = await prisma_1.default.interviewQuestion.update({
            where: { id: questionId },
            data: {
                userAnswer: answer,
                answerScore: evaluation.parsed.score,
                aiFeedback: evaluation.parsed.feedback,
                strengths: JSON.stringify(evaluation.parsed.strengths),
                improvements: JSON.stringify(evaluation.parsed.improvements),
                starAnalysis: evaluation.parsed.starAnalysis
                    ? JSON.stringify(evaluation.parsed.starAnalysis)
                    : null,
                codeQuality: evaluation.parsed.codeQuality
                    ? JSON.stringify(evaluation.parsed.codeQuality)
                    : null,
                timeTaken,
                answeredAt: new Date(),
            },
        });
        return {
            question: updatedQuestion,
            evaluation: evaluation.parsed,
        };
    },
    /**
     * Complete interview session
     */
    async completeSession(sessionId, userId, speechTranscript) {
        const session = await prisma_1.default.interviewSession.findUnique({
            where: { id: sessionId },
            include: { questions: true },
        });
        if (!session) {
            throw new errorHandler_1.AppError('Session not found', 404);
        }
        if (session.userId !== userId) {
            throw new errorHandler_1.AppError('Unauthorized', 403);
        }
        // Calculate overall score
        const answeredQuestions = session.questions.filter((q) => q.answerScore !== null);
        const overallScore = answeredQuestions.length > 0
            ? answeredQuestions.reduce((sum, q) => sum + (q.answerScore || 0), 0) /
                answeredQuestions.length
            : 0;
        // Analyze speech if transcript provided
        let speechAnalysis = null;
        if (speechTranscript) {
            const totalDuration = session.questions.reduce((sum, q) => sum + (q.timeTaken || 0), 0);
            const speechResult = await geminiService_1.geminiService.analyzeSpeech({
                transcript: speechTranscript,
                duration: totalDuration,
            });
            speechAnalysis = JSON.stringify(speechResult.parsed);
        }
        // Generate overall feedback
        const feedback = this.generateOverallFeedback(session.questions, overallScore);
        // Update session
        const updatedSession = await prisma_1.default.interviewSession.update({
            where: { id: sessionId },
            data: {
                status: 'COMPLETED',
                overallScore,
                feedback,
                speechAnalysis,
                duration: session.questions.reduce((sum, q) => sum + (q.timeTaken || 0), 0),
                completedAt: new Date(),
            },
            include: { questions: true },
        });
        return updatedSession;
    },
    /**
     * Get interview session details
     */
    async getSession(sessionId, userId) {
        const session = await prisma_1.default.interviewSession.findUnique({
            where: { id: sessionId },
            include: { questions: true },
        });
        if (!session) {
            throw new errorHandler_1.AppError('Session not found', 404);
        }
        if (session.userId !== userId) {
            throw new errorHandler_1.AppError('Unauthorized', 403);
        }
        return session;
    },
    /**
     * Get all sessions for a user
     */
    async getUserSessions(userId, limit = 10) {
        const sessions = await prisma_1.default.interviewSession.findMany({
            where: { userId },
            include: {
                questions: {
                    select: {
                        id: true,
                        questionText: true,
                        answerScore: true,
                        answeredAt: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
        return sessions;
    },
    /**
     * Get interview statistics for a user
     */
    async getUserStats(userId) {
        const sessions = await prisma_1.default.interviewSession.findMany({
            where: { userId, status: 'COMPLETED' },
            include: { questions: true },
        });
        const totalSessions = sessions.length;
        const totalQuestions = sessions.reduce((sum, s) => sum + s.questions.length, 0);
        const avgScore = sessions.length > 0
            ? sessions.reduce((sum, s) => sum + (s.overallScore || 0), 0) / sessions.length
            : 0;
        const typeBreakdown = sessions.reduce((acc, s) => {
            acc[s.type] = (acc[s.type] || 0) + 1;
            return acc;
        }, {});
        const recentImprovement = sessions.length >= 2
            ? (sessions[0].overallScore || 0) - (sessions[sessions.length - 1].overallScore || 0)
            : 0;
        return {
            totalSessions,
            totalQuestions,
            avgScore: Math.round(avgScore * 10) / 10,
            typeBreakdown,
            recentImprovement: Math.round(recentImprovement * 10) / 10,
            sessions: sessions.slice(0, 5).map((s) => ({
                id: s.id,
                type: s.type,
                difficulty: s.difficulty,
                score: s.overallScore,
                completedAt: s.completedAt,
            })),
        };
    },
    /**
     * Generate overall feedback based on performance
     */
    generateOverallFeedback(questions, overallScore) {
        const answered = questions.filter((q) => q.userAnswer);
        const unanswered = questions.length - answered.length;
        let feedback = `You completed ${answered.length} out of ${questions.length} questions with an overall score of ${Math.round(overallScore)}%.\n\n`;
        if (overallScore >= 80) {
            feedback += '🎉 Excellent performance! You demonstrated strong knowledge and communication skills.';
        }
        else if (overallScore >= 60) {
            feedback += '👍 Good work! You showed solid understanding with room for improvement in some areas.';
        }
        else {
            feedback += '💪 Keep practicing! Focus on the feedback provided for each question to improve.';
        }
        if (unanswered > 0) {
            feedback += `\n\nNote: ${unanswered} question(s) were not answered. Try to complete all questions in your next session.`;
        }
        return feedback;
    },
    /**
     * Get next question recommendation
     */
    async getNextQuestion(sessionId, userId) {
        const session = await prisma_1.default.interviewSession.findUnique({
            where: { id: sessionId },
            include: { questions: true },
        });
        if (!session) {
            throw new errorHandler_1.AppError('Session not found', 404);
        }
        if (session.userId !== userId) {
            throw new errorHandler_1.AppError('Unauthorized', 403);
        }
        // Find first unanswered question
        const nextQuestion = session.questions.find((q) => !q.userAnswer);
        if (!nextQuestion) {
            return { message: 'All questions completed', completed: true };
        }
        return {
            question: nextQuestion,
            completed: false,
            progress: {
                answered: session.questions.filter((q) => q.userAnswer).length,
                total: session.questions.length,
            },
        };
    },
};
