import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, Trophy, Target, TrendingUp, Clock, 
  X, AlertCircle, Loader2, Sparkles,
  ArrowRight, BarChart3, Zap, Brain, ArrowLeft, Play,
  CheckCircle2
} from 'lucide-react';
import { interviewAPI } from '../services/api';

interface InterviewSession {
  id: string;
  type: string;
  difficulty: string;
  role?: string;
  overallScore?: number;
  completedAt?: string;
}

interface InterviewQuestion {
  id: string;
  questionText: string;
  questionType: string;
  userAnswer?: string;
  answerScore?: number;
  aiFeedback?: string;
}

export default function InterviewPracticeNew() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<any>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Form for starting new session
  const [newSessionType, setNewSessionType] = useState('TECHNICAL');
  const [newSessionDifficulty, setNewSessionDifficulty] = useState('MEDIUM');
  const [newSessionRole, setNewSessionRole] = useState('Software Engineer');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoadingData(true);
    setError('');
    try {
      const [sessionsRes, statsRes] = await Promise.all([
        interviewAPI.getSessions(10),
        interviewAPI.getStats(),
      ]);
      setSessions(sessionsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to load interview data:', error);
      setError('Failed to load data. Please refresh.');
    } finally {
      setLoadingData(false);
    }
  };

  const startNewSession = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await interviewAPI.startSession(
        newSessionType,
        newSessionDifficulty,
        newSessionRole
      );
      setActiveSession(response.data.session);
      if (response.data.questions && response.data.questions.length > 0) {
        setCurrentQuestion(response.data.questions[0]);
        setStartTime(Date.now());
      }
      loadData();
    } catch (error) {
      console.error('Failed to start session:', error);
      setError('Failed to start interview session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!currentQuestion || !answer.trim()) return;

    setLoading(true);
    setError('');
    try {
      const timeTaken = startTime ? Math.floor((Date.now() - startTime) / 1000) : undefined;
      const response = await interviewAPI.submitAnswer(
        currentQuestion.id,
        answer,
        timeTaken
      );

      // Show feedback
      setFeedback(response.data.evaluation);
      setShowFeedback(true);

      // Wait for user to review feedback, then auto-advance
      setTimeout(async () => {
        setShowFeedback(false);
        
        // Load next question
        try {
          const nextRes = await interviewAPI.getNextQuestion(activeSession.id);
          if (nextRes.data.completed) {
            await completeSession();
          } else {
            setCurrentQuestion(nextRes.data.question);
            setAnswer('');
            setStartTime(Date.now());
            setFeedback(null);
          }
        } catch (err) {
          console.error('Failed to load next question:', err);
          setError('Failed to load next question');
        }
      }, 5000);
    } catch (error) {
      console.error('Failed to submit answer:', error);
      setError('Failed to submit answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const completeSession = async () => {
    if (!activeSession) return;

    setLoading(true);
    try {
      const response = await interviewAPI.completeSession(activeSession.id);
      setFeedback({
        score: response.data.overallScore,
        feedback: response.data.feedback,
        isComplete: true
      });
      setShowFeedback(true);
      
      setTimeout(() => {
        setActiveSession(null);
        setCurrentQuestion(null);
        setAnswer('');
        setFeedback(null);
        setShowFeedback(false);
        loadData();
      }, 6000);
    } catch (error) {
      console.error('Failed to complete session:', error);
      setError('Failed to complete session');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <nav className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-4 py-2 border border-white/20 text-white rounded-sm hover:bg-white/10 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-bold">BACK</span>
            </button>
            <div className="flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-primary-500" />
              <h1 className="text-2xl font-black tracking-tight">INTERVIEW PRACTICE</h1>
            </div>
          </div>
          {activeSession && (
            <motion.div 
              className="flex items-center gap-2 px-4 py-2 bg-primary-500/20 border border-primary-500/40 rounded-sm"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Zap className="w-4 h-4 text-primary-400" />
              <span className="text-sm font-bold text-primary-300">ACTIVE SESSION</span>
            </motion.div>
          )}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 flex items-center gap-3 px-4 py-3 rounded-sm border border-red-500/40 bg-red-500/10 text-red-100"
            >
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
              <button onClick={() => setError('')} className="ml-auto">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {loadingData ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-primary-500" />
          </div>
        ) : (
          <>
            {/* Stats Dashboard */}
            {stats && !activeSession && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
              >
                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 p-6 rounded-sm relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
                  <Trophy className="w-10 h-10 text-purple-400 mb-3" />
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">TOTAL SESSIONS</p>
                  <p className="text-4xl font-black">{stats.totalSessions}</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 p-6 rounded-sm relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
                  <Target className="w-10 h-10 text-blue-400 mb-3" />
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">AVG SCORE</p>
                  <p className="text-4xl font-black">{stats.avgScore}<span className="text-2xl text-gray-500">%</span></p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 p-6 rounded-sm relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl" />
                  <MessageSquare className="w-10 h-10 text-green-400 mb-3" />
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">QUESTIONS ANSWERED</p>
                  <p className="text-4xl font-black">{stats.totalQuestions}</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 p-6 rounded-sm relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl" />
                  <TrendingUp className="w-10 h-10 text-orange-400 mb-3" />
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">IMPROVEMENT</p>
                  <p className="text-4xl font-black">
                    {stats.recentImprovement > 0 && '+'}{stats.recentImprovement}<span className="text-2xl text-gray-500">%</span>
                  </p>
                </motion.div>
              </motion.div>
            )}

            {/* Feedback Modal */}
            <AnimatePresence>
              {showFeedback && feedback && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                  onClick={() => !feedback.isComplete && setShowFeedback(false)}
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-sm p-8 max-w-2xl w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {feedback.isComplete ? (
                      <>
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                            <Trophy className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <h2 className="text-3xl font-black">SESSION COMPLETE!</h2>
                            <p className="text-gray-400">Great work on your interview practice</p>
                          </div>
                        </div>
                        <div className="mb-6">
                          <p className="text-gray-400 text-sm mb-2">OVERALL SCORE</p>
                          <div className={`text-6xl font-black bg-gradient-to-r ${getScoreColor(feedback.score)} bg-clip-text text-transparent`}>
                            {Math.round(feedback.score)}%
                          </div>
                        </div>
                        <div className="p-4 bg-white/5 border border-white/10 rounded-sm">
                          <p className="text-gray-300">{feedback.feedback}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-6">
                          <h2 className="text-2xl font-black">AI FEEDBACK</h2>
                          <button onClick={() => setShowFeedback(false)}>
                            <X className="w-6 h-6" />
                          </button>
                        </div>
                        <div className="mb-4">
                          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">SCORE</p>
                          <div className={`text-4xl font-black bg-gradient-to-r ${getScoreColor(feedback.score)} bg-clip-text text-transparent`}>
                            {feedback.score}/100
                          </div>
                        </div>
                        <div className="p-4 bg-white/5 border border-white/10 rounded-sm mb-4">
                          <p className="text-sm text-gray-400 mb-1">FEEDBACK</p>
                          <p className="text-gray-300">{feedback.feedback}</p>
                        </div>
                        {feedback.strengths && feedback.strengths.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm text-green-400 mb-2 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4" /> STRENGTHS
                            </p>
                            <ul className="space-y-1">
                              {feedback.strengths.map((s: string, i: number) => (
                                <li key={i} className="text-sm text-gray-400">• {s}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {feedback.improvements && feedback.improvements.length > 0 && (
                          <div>
                            <p className="text-sm text-orange-400 mb-2 flex items-center gap-2">
                              <Sparkles className="w-4 h-4" /> IMPROVEMENTS
                            </p>
                            <ul className="space-y-1">
                              {feedback.improvements.map((imp: string, i: number) => (
                                <li key={i} className="text-sm text-gray-400">• {imp}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="mt-6 text-center text-sm text-gray-500">
                          Auto-advancing to next question in 5s...
                        </div>
                      </>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Active Session */}
            {activeSession && currentQuestion ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-white/5 border border-white/10 p-8 rounded-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-black mb-1">
                        {activeSession.type} INTERVIEW
                      </h2>
                      <p className="text-gray-400">
                        {activeSession.difficulty} • {activeSession.role}
                      </p>
                    </div>
                    <motion.button
                      onClick={completeSession}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 bg-red-500/20 border border-red-500/40 text-red-400 rounded-sm font-bold hover:bg-red-500/30 transition"
                    >
                      END SESSION
                    </motion.button>
                  </div>

                  <div className="mb-6 p-6 bg-gradient-to-br from-primary-500/10 to-blue-500/10 border border-primary-500/20 rounded-sm">
                    <div className="flex items-start gap-3 mb-3">
                      <Brain className="w-6 h-6 text-primary-400 mt-1" />
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">QUESTION</p>
                        <p className="text-lg font-medium text-white leading-relaxed">
                          {currentQuestion.questionText}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                      YOUR ANSWER
                    </label>
                    <textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Type your detailed answer here..."
                      className="w-full h-64 p-4 bg-white/5 border border-white/20 rounded-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      disabled={loading || showFeedback}
                    />
                    <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                      <span>{answer.length} characters</span>
                      {startTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Time: {Math.floor((Date.now() - startTime) / 1000)}s
                        </span>
                      )}
                    </div>
                  </div>

                  <motion.button
                    onClick={submitAnswer}
                    disabled={loading || !answer.trim() || showFeedback}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 bg-gradient-to-r from-primary-500 to-blue-500 text-white rounded-sm font-black uppercase tracking-wider hover:from-primary-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        AI EVALUATING...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-5 h-5" />
                        SUBMIT ANSWER
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            ) : !activeSession && (
              <>
                {/* Start New Session */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 border border-white/10 p-8 rounded-sm mb-12"
                >
                  <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                    <Play className="w-6 h-6 text-primary-500" />
                    START NEW INTERVIEW
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                        INTERVIEW TYPE
                      </label>
                      <select
                        value={newSessionType}
                        onChange={(e) => setNewSessionType(e.target.value)}
                        className="w-full p-4 bg-white/5 border border-white/20 rounded-sm text-white font-medium focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="TECHNICAL">Technical</option>
                        <option value="BEHAVIORAL">Behavioral</option>
                        <option value="CODING">Coding</option>
                        <option value="SYSTEM_DESIGN">System Design</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                        DIFFICULTY
                      </label>
                      <select
                        value={newSessionDifficulty}
                        onChange={(e) => setNewSessionDifficulty(e.target.value)}
                        className="w-full p-4 bg-white/5 border border-white/20 rounded-sm text-white font-medium focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="EASY">Easy</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HARD">Hard</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                        TARGET ROLE
                      </label>
                      <input
                        type="text"
                        value={newSessionRole}
                        onChange={(e) => setNewSessionRole(e.target.value)}
                        placeholder="e.g., Software Engineer"
                        className="w-full p-4 bg-white/5 border border-white/20 rounded-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <motion.button
                    onClick={startNewSession}
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 bg-gradient-to-r from-primary-500 to-blue-500 text-white rounded-sm font-black uppercase tracking-wider hover:from-primary-600 hover:to-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        STARTING...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        START INTERVIEW
                      </>
                    )}
                  </motion.button>
                </motion.div>

                {/* Recent Sessions */}
                {sessions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 border border-white/10 p-8 rounded-sm"
                  >
                    <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                      <BarChart3 className="w-6 h-6 text-primary-500" />
                      RECENT SESSIONS
                    </h2>
                    <div className="space-y-4">
                      {sessions.map((session, idx) => (
                        <motion.div
                          key={session.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          whileHover={{ scale: 1.02, x: 10 }}
                          className="p-4 bg-white/5 border border-white/10 rounded-sm hover:border-primary-500/40 transition cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-bold text-white mb-1">
                                {session.type} - {session.difficulty}
                              </p>
                              <p className="text-sm text-gray-400">{session.role}</p>
                            </div>
                            <div className="text-right">
                              {session.overallScore !== null && session.overallScore !== undefined && (
                                <div className={`text-3xl font-black bg-gradient-to-r ${getScoreColor(session.overallScore)} bg-clip-text text-transparent mb-1`}>
                                  {Math.round(session.overallScore)}%
                                </div>
                              )}
                              <p className="text-xs text-gray-500">
                                {session.completedAt && new Date(session.completedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
