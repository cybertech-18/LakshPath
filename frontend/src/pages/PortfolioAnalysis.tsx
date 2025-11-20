import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Github, Star, Code, FileCode, AlertCircle,
  Loader2, ArrowLeft, Sparkles, TrendingUp, Award,
  X, CheckCircle2, AlertTriangle, Zap, BarChart3,
  BookOpen, Package
} from 'lucide-react';
import { portfolioAPI } from '../services/api';

interface Repository {
  id: string;
  repoName: string;
  language?: string;
  stars: number;
  codeQualityScore?: number;
  improvements: string[];
  highlights: string[];
}

interface PortfolioAnalysis {
  id: string;
  githubUsername?: string;
  overallScore: number;
  codeQualityScore?: number;
  diversityScore?: number;
  contributionScore?: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  missingProjectTypes: string[];
  recommendations: any[];
  repositories: Repository[];
  createdAt: string;
  badges?: string[];
  userProfile?: {
    name?: string;
    bio?: string;
    company?: string;
    location?: string;
    blog?: string;
    followers?: number;
    following?: number;
    publicRepos?: number;
  };
  projectIdeas?: Array<{
    title: string;
    description: string;
    techStack: string[];
    impact: string;
  }>;
  developerType?: string;
  tag?: {
    tagName: string;
    description: string;
  };
  originalReposCount?: number;
  authoredForksCount?: number;
  totalForksCount?: number;
}

export default function PortfolioAnalysisNew() {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<PortfolioAnalysis[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<PortfolioAnalysis | null>(null);
  const [githubUsername, setGithubUsername] = useState('');
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoadingData(true);
    setError('');
    try {
      const [analysesRes, statsRes] = await Promise.all([
        portfolioAPI.getAnalyses(10),
        portfolioAPI.getStats(),
      ]);
      setAnalyses(analysesRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to load portfolio data:', error);
      setError('Failed to load data. Please refresh.');
    } finally {
      setLoadingData(false);
    }
  };

  const analyzeGitHub = async () => {
    if (!githubUsername.trim()) {
      setError('Please enter a GitHub username');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await portfolioAPI.analyzeGitHub(githubUsername, targetRole);
      setSelectedAnalysis(response.data);
      loadData();
    } catch (error: any) {
      console.error('Failed to analyze portfolio:', error);
      setError(error.response?.data?.error || 'Failed to analyze GitHub portfolio. Please check the username.');
    } finally {
      setLoading(false);
    }
  };

  const viewAnalysis = (analysis: PortfolioAnalysis) => {
    setSelectedAnalysis(analysis);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const getPriorityColor = (priority: string) => {
    if (priority === 'HIGH') return 'from-red-500 to-pink-500';
    if (priority === 'MEDIUM') return 'from-yellow-500 to-orange-500';
    return 'from-blue-500 to-cyan-500';
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
              <Github className="w-8 h-8 text-primary-500" />
              <h1 className="text-2xl font-black tracking-tight">PORTFOLIO ANALYSIS</h1>
            </div>
          </div>
          {selectedAnalysis && (
            <motion.div 
              className="flex items-center gap-2 px-4 py-2 bg-primary-500/20 border border-primary-500/40 rounded-sm"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-4 h-4 text-primary-400" />
              <span className="text-sm font-bold text-primary-300">AI ANALYZED</span>
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
            {stats && !selectedAnalysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
              >
                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 p-6 rounded-sm relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl" />
                  <Award className="w-10 h-10 text-green-400 mb-3" />
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">TOTAL ANALYSES</p>
                  <p className="text-4xl font-black">{stats.totalAnalyses}</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 p-6 rounded-sm relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
                  <BarChart3 className="w-10 h-10 text-blue-400 mb-3" />
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">AVG SCORE</p>
                  <p className="text-4xl font-black">{stats.avgScore}<span className="text-2xl text-gray-500">/100</span></p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 p-6 rounded-sm relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
                  <Package className="w-10 h-10 text-purple-400 mb-3" />
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">REPOS ANALYZED</p>
                  <p className="text-4xl font-black">{stats.totalRepositories}</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 p-6 rounded-sm relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl" />
                  <TrendingUp className="w-10 h-10 text-orange-400 mb-3" />
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">IMPROVEMENT</p>
                  <p className="text-4xl font-black">
                    {stats.improvement > 0 && '+'}{stats.improvement}
                  </p>
                </motion.div>
              </motion.div>
            )}

            {/* Analysis Form */}
            {!selectedAnalysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 p-8 rounded-sm mb-12"
              >
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                  <Zap className="w-6 h-6 text-primary-500" />
                  ANALYZE GITHUB PROFILE
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                      GITHUB USERNAME *
                    </label>
                    <input
                      type="text"
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                      placeholder="e.g., octocat"
                      className="w-full p-4 bg-white/5 border border-white/20 rounded-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500"
                      onKeyPress={(e) => e.key === 'Enter' && analyzeGitHub()}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                      TARGET ROLE (Optional)
                    </label>
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g., Software Engineer"
                      className="w-full p-4 bg-white/5 border border-white/20 rounded-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <motion.button
                  onClick={analyzeGitHub}
                  disabled={loading || !githubUsername.trim()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-sm font-black uppercase tracking-wider hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      AI ANALYZING...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      ANALYZE PORTFOLIO
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}

            {/* Selected Analysis Details */}
            {selectedAnalysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-black">
                    @{selectedAnalysis.githubUsername}
                  </h2>
                  <button
                    onClick={() => setSelectedAnalysis(null)}
                    className="px-4 py-2 border border-white/20 text-white rounded-sm hover:bg-white/10 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Score Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="p-6 bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-sm"
                  >
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">OVERALL SCORE</p>
                    <div className={`text-5xl font-black bg-gradient-to-r ${getScoreColor(selectedAnalysis.overallScore)} bg-clip-text text-transparent`}>
                      {selectedAnalysis.overallScore}
                    </div>
                    <p className="text-gray-500 text-sm">/100</p>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="p-6 bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-sm"
                  >
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">CODE QUALITY</p>
                    <div className={`text-5xl font-black bg-gradient-to-r ${getScoreColor(selectedAnalysis.codeQualityScore || 0)} bg-clip-text text-transparent`}>
                      {selectedAnalysis.codeQualityScore}
                    </div>
                    <p className="text-gray-500 text-sm">/100</p>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="p-6 bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-sm"
                  >
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">DIVERSITY</p>
                    <div className={`text-5xl font-black bg-gradient-to-r ${getScoreColor(selectedAnalysis.diversityScore || 0)} bg-clip-text text-transparent`}>
                      {selectedAnalysis.diversityScore}
                    </div>
                    <p className="text-gray-500 text-sm">/100</p>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="p-6 bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-sm"
                  >
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">CONTRIBUTIONS</p>
                    <div className={`text-5xl font-black bg-gradient-to-r ${getScoreColor(selectedAnalysis.contributionScore || 0)} bg-clip-text text-transparent`}>
                      {selectedAnalysis.contributionScore}
                    </div>
                    <p className="text-gray-500 text-sm">/100</p>
                  </motion.div>
                </div>

                {/* Summary */}
                <div className="p-6 bg-gradient-to-br from-primary-500/10 to-blue-500/10 border border-primary-500/20 rounded-sm">
                  <h3 className="text-lg font-black mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary-400" />
                    AI SUMMARY
                  </h3>
                  <p className="text-gray-300 leading-relaxed">{selectedAnalysis.summary}</p>
                  
                  {/* Developer Type & Tag */}
                  {(selectedAnalysis.developerType || selectedAnalysis.tag) && (
                    <div className="mt-4 flex flex-wrap gap-3">
                      {selectedAnalysis.developerType && (
                        <div className="px-4 py-2 bg-primary-500/20 border border-primary-500/40 rounded-full">
                          <span className="text-sm font-bold text-primary-400">
                            🚀 {selectedAnalysis.developerType}
                          </span>
                        </div>
                      )}
                      {selectedAnalysis.tag && (
                        <div className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/40 rounded-full" title={selectedAnalysis.tag.description}>
                          <span className="text-sm font-bold text-yellow-400">
                            😎 {selectedAnalysis.tag.tagName}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* GitHub Badges */}
                {selectedAnalysis.badges && selectedAnalysis.badges.length > 0 && (
                  <div className="p-6 bg-white/5 border border-white/10 rounded-sm">
                    <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5 text-yellow-400" />
                      ACHIEVEMENT BADGES ({selectedAnalysis.badges.length})
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {selectedAnalysis.badges.map((badge, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          className="px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/40 rounded-full"
                        >
                          <span className="text-sm font-bold text-yellow-300">
                            🏆 {badge.replace(/-/g, ' ').toUpperCase()}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Repository Stats */}
                {(selectedAnalysis.originalReposCount !== undefined || selectedAnalysis.authoredForksCount !== undefined) && (
                  <div className="p-6 bg-white/5 border border-white/10 rounded-sm">
                    <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary-400" />
                      REPOSITORY BREAKDOWN
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-black text-primary-400">
                          {selectedAnalysis.originalReposCount || 0}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Original Repos</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-black text-green-400">
                          {selectedAnalysis.authoredForksCount || 0}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Authored Forks</p>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-black text-gray-500">
                          {(selectedAnalysis.totalForksCount || 0) - (selectedAnalysis.authoredForksCount || 0)}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Empty Forks</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-white/5 border border-green-500/20 rounded-sm">
                    <h3 className="text-lg font-black mb-4 flex items-center gap-2 text-green-400">
                      <CheckCircle2 className="w-5 h-5" />
                      STRENGTHS
                    </h3>
                    <ul className="space-y-3">
                      {selectedAnalysis.strengths.map((strength, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-start gap-3"
                        >
                          <div className="w-2 h-2 bg-green-400 rounded-full mt-2" />
                          <span className="text-gray-300">{strength}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-6 bg-white/5 border border-orange-500/20 rounded-sm">
                    <h3 className="text-lg font-black mb-4 flex items-center gap-2 text-orange-400">
                      <AlertTriangle className="w-5 h-5" />
                      AREAS TO IMPROVE
                    </h3>
                    <ul className="space-y-3">
                      {selectedAnalysis.weaknesses.map((weakness, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-start gap-3"
                        >
                          <div className="w-2 h-2 bg-orange-400 rounded-full mt-2" />
                          <span className="text-gray-300">{weakness}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="p-6 bg-white/5 border border-white/10 rounded-sm">
                  <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary-400" />
                    AI RECOMMENDATIONS
                  </h3>
                  <div className="space-y-4">
                    {selectedAnalysis.recommendations.map((rec: any, idx: number) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-4 bg-white/5 border border-white/10 rounded-sm hover:border-primary-500/40 transition"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-bold text-white">{rec.title}</h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getPriorityColor(rec.priority)} bg-clip-text text-transparent border border-white/20`}>
                            {rec.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mb-2">{rec.description}</p>
                        <p className="text-xs text-primary-400 font-semibold">💡 Impact: {rec.impact}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Project Ideas */}
                {selectedAnalysis.projectIdeas && selectedAnalysis.projectIdeas.length > 0 && (
                  <div className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-sm">
                    <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-purple-400" />
                      PROJECT IDEAS TO STRENGTHEN PORTFOLIO
                    </h3>
                    <div className="space-y-4">
                      {selectedAnalysis.projectIdeas.map((idea, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="p-4 bg-white/5 border border-purple-500/20 rounded-sm hover:border-purple-500/40 transition"
                        >
                          <h4 className="font-bold text-white mb-2">💡 {idea.title}</h4>
                          <p className="text-sm text-gray-400 mb-3">{idea.description}</p>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {idea.techStack.map((tech, i) => (
                              <span key={i} className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-xs text-purple-300">
                                {tech}
                              </span>
                            ))}
                          </div>
                          <p className="text-xs text-purple-400 font-semibold">🎯 Impact: {idea.impact}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Repositories */}
                <div className="p-6 bg-white/5 border border-white/10 rounded-sm">
                  <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary-400" />
                    REPOSITORIES ({selectedAnalysis.repositories.length})
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {selectedAnalysis.repositories.map((repo, idx) => (
                      <motion.div
                        key={repo.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="p-4 bg-white/5 border border-white/10 rounded-sm hover:border-primary-500/40 transition"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-bold text-white mb-1 flex items-center gap-2">
                              <FileCode className="w-4 h-4 text-primary-400" />
                              {repo.repoName}
                            </h4>
                            <div className="flex items-center gap-3 text-xs text-gray-400">
                              {repo.language && (
                                <span className="flex items-center gap-1">
                                  <Code className="w-3 h-3" />
                                  {repo.language}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-400" />
                                {repo.stars}
                              </span>
                            </div>
                          </div>
                          {repo.codeQualityScore && (
                            <div className={`text-2xl font-black bg-gradient-to-r ${getScoreColor(repo.codeQualityScore)} bg-clip-text text-transparent`}>
                              {repo.codeQualityScore}
                            </div>
                          )}
                        </div>
                        {repo.highlights.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs text-green-400 font-bold mb-1">✓ HIGHLIGHTS</p>
                            <ul className="space-y-1">
                              {repo.highlights.map((h, i) => (
                                <li key={i} className="text-xs text-gray-400 pl-4">• {h}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {repo.improvements.length > 0 && (
                          <div>
                            <p className="text-xs text-orange-400 font-bold mb-1">⚡ IMPROVEMENTS</p>
                            <ul className="space-y-1">
                              {repo.improvements.map((imp, i) => (
                                <li key={i} className="text-xs text-gray-400 pl-4">• {imp}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Recent Analyses */}
            {!selectedAnalysis && analyses.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 p-8 rounded-sm"
              >
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                  <BarChart3 className="w-6 h-6 text-primary-500" />
                  RECENT ANALYSES
                </h2>
                <div className="space-y-4">
                  {analyses.map((analysis, idx) => (
                    <motion.div
                      key={analysis.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ scale: 1.02, x: 10 }}
                      onClick={() => viewAnalysis(analysis)}
                      className="p-4 bg-white/5 border border-white/10 rounded-sm hover:border-primary-500/40 transition cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-white mb-1">
                            @{analysis.githubUsername}
                          </p>
                          <p className="text-sm text-gray-400">
                            {analysis.repositories.length} repositories analyzed
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`text-3xl font-black bg-gradient-to-r ${getScoreColor(analysis.overallScore)} bg-clip-text text-transparent mb-1`}>
                            {analysis.overallScore}
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(analysis.createdAt).toLocaleDateString()}
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
      </div>
    </div>
  );
}
