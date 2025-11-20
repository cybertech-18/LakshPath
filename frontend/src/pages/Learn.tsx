import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Play, 
  Star, 
  TrendingUp,
  Award,
  Target,
  Zap,
  Lock,
  ArrowRight,
  ExternalLink,
  Filter,
  Search,
  Lightbulb,
  Brain,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Code,
  FileText,
  Video,
  Book,
  ExternalLink as LinkIcon,
  CheckCircle,
  XCircle,
  HelpCircle,
  Calendar,
  BarChart3,
  Flame,
  MessageSquare,
  Briefcase,
  GraduationCap,
  Loader2,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { learningEnhancedAPI, nsqfAPI } from '../services/api';

interface Course {
  id: string;
  title: string;
  platform: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  rating: number;
  enrolled: number;
  thumbnail: string;
  url: string;
  cost: 'free' | 'paid';
  price?: string;
  skillTag: string;
  progress?: number;
  isRecommended: boolean;
}

interface SkillProgress {
  skillName: string;
  currentLevel: number;
  targetLevel: number;
  progress: number;
  courses: Course[];
  priority: 'high' | 'medium' | 'low';
}

const Learn = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'in-progress' | 'completed'>('all');
  const [skillProgress, setSkillProgress] = useState<SkillProgress[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // AI Features State
  const [showConceptExplainer, setShowConceptExplainer] = useState(false);
  const [showQuizGenerator, setShowQuizGenerator] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [showNSQFPathway, setShowNSQFPathway] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const [nextAction, setNextAction] = useState<any>(null);
  const [aiResources, setAiResources] = useState<any[]>([]);

  useEffect(() => {
    fetchLearningData();
    fetchAIFeatures();
  }, []);

  const fetchLearningData = async () => {
    try {
      // Use mock data for now - can be replaced with real API
      setSkillProgress(mockSkillProgress);
      setRecommendedCourses(mockCourses);
    } catch (error) {
      console.error('Failed to fetch learning data:', error);
      setSkillProgress(mockSkillProgress);
      setRecommendedCourses(mockCourses);
    } finally {
      setLoading(false);
    }
  };

  const fetchAIFeatures = async () => {
    try {
      // Fetch insights
      const insightsRes = await learningEnhancedAPI.getInsights();
      setInsights(insightsRes.data.data);

      // Fetch next action
      const actionRes = await learningEnhancedAPI.getNextAction();
      setNextAction(actionRes.data.data);
    } catch (error) {
      console.error('Failed to fetch AI features:', error);
    }
  };

  const handleEnrollCourse = async (courseId: string) => {
    try {
      // Enroll logic here
      fetchLearningData();
    } catch (error) {
      console.error('Failed to enroll:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Your Learning Journey
            </h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Master the skills you need to achieve your career goals with AI-powered recommendations
            </p>
          </motion.div>

          {/* Progress Overview */}
          <div className="grid md:grid-cols-4 gap-6 mt-12">
            <StatCard
              icon={<BookOpen className="w-6 h-6" />}
              value="12"
              label="Courses Enrolled"
              color="bg-blue-500"
            />
            <StatCard
              icon={<CheckCircle2 className="w-6 h-6" />}
              value="8"
              label="Completed"
              color="bg-green-500"
            />
            <StatCard
              icon={<Clock className="w-6 h-6" />}
              value="4"
              label="In Progress"
              color="bg-yellow-500"
            />
            <StatCard
              icon={<Award className="w-6 h-6" />}
              value="67%"
              label="Overall Progress"
              color="bg-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 -mt-8">
        {/* AI-Powered Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <AIQuickAction
            icon={<Brain className="w-6 h-6" />}
            title="AI Concept Explainer"
            description="Get instant explanations at any depth"
            color="bg-gradient-to-r from-blue-500 to-cyan-500"
            onClick={() => setShowConceptExplainer(true)}
          />
          <AIQuickAction
            icon={<Sparkles className="w-6 h-6" />}
            title="Generate Quiz"
            description="Practice with AI-generated questions"
            color="bg-gradient-to-r from-purple-500 to-pink-500"
            onClick={() => setShowQuizGenerator(true)}
          />
          <AIQuickAction
            icon={<BarChart3 className="w-6 h-6" />}
            title="Learning Insights"
            description="View your progress and recommendations"
            color="bg-gradient-to-r from-green-500 to-emerald-500"
            onClick={() => setShowInsights(true)}
          />
          <AIQuickAction
            icon={<GraduationCap className="w-6 h-6" />}
            title="NSQF Vocational Path"
            description="AI-powered skill certification pathway"
            color="bg-gradient-to-r from-orange-500 to-red-500"
            onClick={() => setShowNSQFPathway(true)}
          />
        </div>

        {/* Next Best Action Card */}
        {nextAction && (
          <NextBestActionCard action={nextAction} />
        )}

        {/* 8-Step Journey Flow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Target className="w-7 h-7 text-purple-400" />
            Your Career Roadmap Progress
          </h2>

          <div className="space-y-4">
            <JourneyStep
              stepNumber={1}
              title="SIGN UP"
              status="completed"
              description="Account created successfully"
            />
            <JourneyStep
              stepNumber={2}
              title="TAKE QUIZ or UPLOAD RESUME"
              status="completed"
              description="Assessment completed with 92% match accuracy"
            />
            <JourneyStep
              stepNumber={3}
              title="AI ANALYZES YOUR PROFILE"
              status="completed"
              description="Profile analyzed against 10,000+ careers"
            />
            <JourneyStep
              stepNumber={4}
              title="GET TOP CAREER RECOMMENDATIONS"
              status="completed"
              description="5 career matches identified"
            />
            <JourneyStep
              stepNumber={5}
              title="CHOOSE YOUR PATH"
              status="completed"
              description="Software Developer path selected"
            />
            <JourneyStep
              stepNumber={6}
              title="GET PERSONALIZED ROADMAP"
              status="completed"
              description="6-month learning roadmap generated"
            />
            <JourneyStep
              stepNumber={7}
              title="START LEARNING & TRACK PROGRESS"
              status="in-progress"
              description="4 courses in progress, 8 completed"
              progress={67}
            />
            <JourneyStep
              stepNumber={8}
              title="AI UPDATES YOUR PLAN AS MARKET CHANGES"
              status="active"
              description="Real-time updates via Pathway Framework"
            />
          </div>
        </motion.div>

        {/* Skills You're Working On */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white">Skills You're Improving</h2>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-lg border border-white/20 hover:border-purple-400 text-white hover:text-purple-400 transition">
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {skillProgress.map((skill, index) => (
              <SkillProgressCard key={index} skill={skill} />
            ))}
          </div>
        </section>

        {/* Recommended Courses */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white">Recommended for You</h2>
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-4 mb-6">
            <FilterButton
              active={activeFilter === 'all'}
              onClick={() => setActiveFilter('all')}
            >
              All Courses
            </FilterButton>
            <FilterButton
              active={activeFilter === 'in-progress'}
              onClick={() => setActiveFilter('in-progress')}
            >
              In Progress
            </FilterButton>
            <FilterButton
              active={activeFilter === 'completed'}
              onClick={() => setActiveFilter('completed')}
            >
              Completed
            </FilterButton>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedCourses
              .filter(course => 
                searchQuery === '' || 
                course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.skillTag.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((course) => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  onEnroll={handleEnrollCourse}
                />
              ))}
          </div>
        </section>
      </div>

      {/* AI Feature Modals */}
      <ConceptExplainerModal 
        isOpen={showConceptExplainer} 
        onClose={() => setShowConceptExplainer(false)} 
      />
      
      <QuizGeneratorModal 
        isOpen={showQuizGenerator} 
        onClose={() => setShowQuizGenerator(false)} 
      />
      
      <InsightsModal 
        isOpen={showInsights} 
        onClose={() => setShowInsights(false)} 
        insights={insights}
      />

      <NSQFPathwayModal 
        isOpen={showNSQFPathway} 
        onClose={() => setShowNSQFPathway(false)} 
      />
    </div>
  );
};

// Component: Journey Step
interface JourneyStepProps {
  stepNumber: number;
  title: string;
  status: 'completed' | 'in-progress' | 'active' | 'locked';
  description: string;
  progress?: number;
}

const JourneyStep = ({ stepNumber, title, status, description, progress }: JourneyStepProps) => {
  const getStatusColor = () => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-yellow-500';
      case 'active': return 'bg-purple-600';
      case 'locked': return 'bg-gray-300';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-white" />;
      case 'in-progress': return <Clock className="w-5 h-5 text-white animate-pulse" />;
      case 'active': return <Zap className="w-5 h-5 text-white" />;
      case 'locked': return <Lock className="w-5 h-5 text-white" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: stepNumber * 0.1 }}
      className={`flex items-start gap-4 p-4 rounded-lg ${
        status === 'in-progress' ? 'bg-yellow-500/10 border border-yellow-500/30' : 
        status === 'active' ? 'bg-purple-500/10 border border-purple-500/30' : 
        'bg-white/5 border border-white/10'
      }`}
    >
      {/* Step Number with Icon */}
      <div className={`${getStatusColor()} rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0`}>
        {getStatusIcon()}
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-sm font-semibold text-gray-400">STEP {stepNumber}</span>
          {status === 'in-progress' && (
            <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full font-semibold">
              IN PROGRESS
            </span>
          )}
          {status === 'active' && (
            <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full font-semibold">
              ACTIVE
            </span>
          )}
        </div>
        <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
        <p className="text-sm text-gray-400">{description}</p>

        {/* Progress Bar for in-progress steps */}
        {progress !== undefined && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Arrow for non-last steps */}
      {stepNumber < 8 && (
        <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-3" />
      )}
    </motion.div>
  );
};

// Component: Skill Progress Card
const SkillProgressCard = ({ skill }: { skill: SkillProgress }) => {
  const getPriorityColor = () => {
    switch (skill.priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white/5 backdrop-blur-xl rounded-xl shadow-lg p-6 border border-white/10"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">{skill.skillName}</h3>
        <span className={`text-xs px-3 py-1 rounded-full font-semibold uppercase ${getPriorityColor()}`}>
          {skill.priority} Priority
        </span>
      </div>

      {/* Skill Level Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-300 mb-2">
          <span>Current: Level {skill.currentLevel}/10</span>
          <span>Target: Level {skill.targetLevel}/10</span>
        </div>
        <div className="relative w-full bg-white/10 rounded-full h-3">
          <div
            className="absolute top-0 left-0 h-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"
            style={{ width: `${skill.progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">{skill.progress}% to target level</p>
      </div>

      {/* Courses for this skill */}
      <div>
        <h4 className="text-sm font-semibold text-gray-300 mb-2">Recommended Courses:</h4>
        <div className="space-y-2">
          {skill.courses.slice(0, 2).map((course) => (
            <div key={course.id} className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-purple-400" />
              <span className="text-gray-300">{course.title}</span>
              {course.cost === 'free' && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">FREE</span>
              )}
            </div>
          ))}
        </div>
        <button className="mt-3 text-purple-400 hover:text-purple-300 text-sm font-semibold flex items-center gap-1">
          View all courses <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

// Component: Course Card
const CourseCard = ({ course, onEnroll }: { course: Course; onEnroll: (id: string) => void }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white/5 backdrop-blur-xl rounded-xl shadow-lg overflow-hidden border border-white/10"
    >
      {/* Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-purple-100 to-blue-100">
        {course.isRecommended && (
          <div className="absolute top-3 right-3 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" />
            Recommended
          </div>
        )}
        <div className="absolute bottom-3 left-3 flex gap-2">
          <span className={`px-2 py-1 rounded text-xs font-semibold ${
            course.cost === 'free' 
              ? 'bg-green-500 text-white' 
              : 'bg-blue-500 text-white'
          }`}>
            {course.cost === 'free' ? 'FREE' : course.price}
          </span>
          <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-2 py-1 rounded text-xs font-semibold">
            {course.level.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
          <span>{course.platform}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {course.duration}
          </span>
        </div>

        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
          {course.title}
        </h3>

        <div className="flex items-center gap-4 mb-4 text-sm text-gray-300">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{course.rating}</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span>{course.enrolled.toLocaleString()} enrolled</span>
          </div>
        </div>

        {/* Skill Tag */}
        <div className="mb-4">
          <span className="inline-block bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs font-semibold border border-purple-500/30">
            {course.skillTag}
          </span>
        </div>

        {/* Progress (if enrolled) */}
        {course.progress !== undefined && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Progress</span>
              <span>{course.progress}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {course.progress !== undefined ? (
            <button className="flex-1 py-2 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center gap-2">
              <Play className="w-4 h-4" />
              Continue Learning
            </button>
          ) : (
            <>
              <button
                onClick={() => onEnroll(course.id)}
                className="flex-1 py-2 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
              >
                Enroll Now
              </button>
              <a
                href={course.url}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-4 border border-white/20 rounded-lg hover:border-purple-400 hover:text-purple-400 text-white transition flex items-center justify-center"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Component: Stat Card
const StatCard = ({ icon, value, label, color }: any) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
  >
    <div className={`${color} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3`}>
      {icon}
    </div>
    <div className="text-3xl font-bold mb-1">{value}</div>
    <div className="text-sm opacity-90">{label}</div>
  </motion.div>
);

// Component: Filter Button
const FilterButton = ({ active, onClick, children }: any) => (
  <button
    onClick={onClick}
    className={`px-6 py-2 rounded-lg font-semibold transition ${
      active
        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
        : 'bg-white/5 text-gray-300 border border-white/20 hover:border-purple-400 hover:text-white'
    }`}
  >
    {children}
  </button>
);

// Component: AI Quick Action Card
const AIQuickAction = ({ icon, title, description, color, onClick }: any) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`${color} text-white rounded-xl p-6 shadow-lg text-left transition-all hover:shadow-2xl`}
  >
    <div className="flex items-start gap-4">
      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-lg mb-1">{title}</h3>
        <p className="text-sm opacity-90">{description}</p>
      </div>
    </div>
  </motion.button>
);

// Component: Next Best Action Card
const NextBestActionCard = ({ action }: any) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-500/10';
      case 'medium': return 'border-yellow-500 bg-yellow-500/10';
      case 'low': return 'border-green-500 bg-green-500/10';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border-l-4 ${getPriorityColor(action.priority)} rounded-xl shadow-lg p-6 mb-8 backdrop-blur-xl`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Lightbulb className="w-8 h-8 text-purple-400" />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-white">Next Best Action</h3>
              <span className={`text-xs px-2 py-1 rounded-full font-semibold uppercase ${getPriorityBadge(action.priority)}`}>
                {action.priority}
              </span>
            </div>
            <p className="text-sm text-gray-400">AI-recommended based on your progress</p>
          </div>
        </div>
        <div className="text-sm text-gray-400 flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {action.estimatedTime}
        </div>
      </div>

      <div className="mb-4">
        <h4 className="font-bold text-lg text-white mb-2">{action.action}</h4>
        <p className="text-gray-300 mb-3">{action.reasoning}</p>
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <p className="text-sm text-gray-400 mb-1">Expected Outcome:</p>
          <p className="text-white font-semibold">{action.expectedOutcome}</p>
        </div>
      </div>

      {action.resources && action.resources.length > 0 && (
        <div>
          <h5 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Recommended Resources
          </h5>
          <div className="grid gap-3">
            {action.resources.slice(0, 2).map((resource: any, idx: number) => (
              <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-purple-400 transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h6 className="font-semibold text-white mb-1">{resource.title}</h6>
                    <p className="text-sm text-gray-300 mb-2">{resource.aiReasoning}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {resource.duration}
                      </span>
                      <span className="capitalize">{resource.difficulty}</span>
                      {resource.cost === 'free' && (
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">FREE</span>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex items-center gap-2">
                    <div className="text-sm font-bold text-purple-400">{resource.relevanceScore}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button className="mt-4 w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center gap-2">
        <Zap className="w-5 h-5" />
        Start This Action
      </button>
    </motion.div>
  );
};

// Component: Concept Explainer Modal
const ConceptExplainerModal = ({ isOpen, onClose }: any) => {
  const [concept, setConcept] = useState('');
  const [depth, setDepth] = useState('intermediate');
  const [explanation, setExplanation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const handleExplain = async () => {
    if (!concept.trim()) return;
    
    setLoading(true);
    try {
      const response = await learningEnhancedAPI.explainConcept({
        concept,
        depth: depth as any,
        context: 'Learning for career growth'
      });
      setExplanation(response.data.data);
    } catch (error) {
      console.error('Failed to explain concept:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">AI Concept Explainer</h2>
                <p className="text-sm opacity-90">Get explanations at any depth level</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white/20 rounded-lg p-2 transition">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Input Section */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              What concept do you want to understand?
            </label>
            <input
              type="text"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="e.g., Closures in JavaScript, React Hooks, Binary Search Tree..."
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              onKeyPress={(e) => e.key === 'Enter' && handleExplain()}
            />

            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Depth Level
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['beginner', 'intermediate', 'advanced', 'expert'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setDepth(level)}
                    className={`py-2 px-4 rounded-lg font-semibold capitalize transition ${
                      depth === level
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleExplain}
              disabled={loading || !concept.trim()}
              className="mt-4 w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  Explaining...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Explain with AI
                </>
              )}
            </button>
          </div>

          {/* Explanation Display */}
          {explanation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 text-lg mb-2">{explanation.concept}</h3>
                <p className="text-gray-700 font-semibold mb-1">Summary:</p>
                <p className="text-gray-600">{explanation.summary}</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-2">Detailed Explanation</h4>
                <p className="text-gray-700 whitespace-pre-line">{explanation.explanation}</p>
              </div>

              {/* Key Points */}
              <ExpandableSection
                title="Key Points"
                icon={<CheckCircle className="w-5 h-5 text-green-600" />}
                isExpanded={expandedSection === 'keyPoints'}
                onToggle={() => setExpandedSection(expandedSection === 'keyPoints' ? null : 'keyPoints')}
              >
                <ul className="space-y-2">
                  {explanation.keyPoints.map((point: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-600 mt-2 flex-shrink-0" />
                      <span className="text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </ExpandableSection>

              {/* Code Examples */}
              {explanation.examples && explanation.examples.length > 0 && (
                <ExpandableSection
                  title="Code Examples"
                  icon={<Code className="w-5 h-5 text-purple-600" />}
                  isExpanded={expandedSection === 'examples'}
                  onToggle={() => setExpandedSection(expandedSection === 'examples' ? null : 'examples')}
                >
                  <div className="space-y-4">
                    {explanation.examples.map((example: any, idx: number) => (
                      <div key={idx} className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
                        <p className="text-sm font-semibold text-purple-400 mb-2">{example.title}</p>
                        <pre className="text-sm"><code>{example.code}</code></pre>
                        <p className="text-sm text-gray-400 mt-2 italic">{example.explanation}</p>
                      </div>
                    ))}
                  </div>
                </ExpandableSection>
              )}

              {/* Common Mistakes */}
              {explanation.commonMistakes && explanation.commonMistakes.length > 0 && (
                <ExpandableSection
                  title="Common Mistakes"
                  icon={<XCircle className="w-5 h-5 text-red-600" />}
                  isExpanded={expandedSection === 'mistakes'}
                  onToggle={() => setExpandedSection(expandedSection === 'mistakes' ? null : 'mistakes')}
                >
                  <ul className="space-y-2">
                    {explanation.commonMistakes.map((mistake: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-600 mt-1 flex-shrink-0" />
                        <span className="text-gray-700">{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </ExpandableSection>
              )}

              {/* Practice Exercises */}
              {explanation.practiceExercises && explanation.practiceExercises.length > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    Practice Exercises
                  </h4>
                  <ul className="space-y-2">
                    {explanation.practiceExercises.map((exercise: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-600 mt-2 flex-shrink-0" />
                        <span className="text-gray-700">{exercise}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// Component: Expandable Section
const ExpandableSection = ({ title, icon, isExpanded, onToggle, children }: any) => (
  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
    >
      <div className="flex items-center gap-2 font-bold text-gray-900">
        {icon}
        {title}
      </div>
      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
    </button>
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-gray-200 p-4"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// Component: Quiz Generator Modal
const QuizGeneratorModal = ({ isOpen, onClose }: any) => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [submittedAnswers, setSubmittedAnswers] = useState<any>({});

  const handleGenerateQuiz = async () => {
    if (!topic.trim()) return;
    
    setLoading(true);
    try {
      const response = await learningEnhancedAPI.generateQuiz({
        topic,
        difficulty: difficulty as any,
        questionCount: 5,
        types: ['multiple_choice', 'short_answer']
      });
      setQuiz(response.data.data);
      setCurrentQuestionIndex(0);
      setSubmittedAnswers({});
    } catch (error) {
      console.error('Failed to generate quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!quiz || !userAnswer.trim()) return;
    
    const currentQuestion = quiz.questions[currentQuestionIndex];
    
    try {
      const response = await learningEnhancedAPI.assessAnswer({
        questionId: currentQuestion.id,
        question: currentQuestion.question,
        userAnswer,
        correctAnswer: currentQuestion.correctAnswer,
        topic: quiz.topic
      });
      
      setSubmittedAnswers({
        ...submittedAnswers,
        [currentQuestionIndex]: {
          userAnswer,
          assessment: response.data.data
        }
      });
      
      setUserAnswer('');
    } catch (error) {
      console.error('Failed to assess answer:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">AI Quiz Generator</h2>
                <p className="text-sm opacity-90">Practice with AI-generated questions</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white/20 rounded-lg p-2 transition">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {!quiz ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Topic
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., React Hooks, Data Structures, Python OOP..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Difficulty
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['beginner', 'intermediate', 'advanced', 'expert'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`py-2 px-4 rounded-lg font-semibold capitalize transition ${
                        difficulty === level
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerateQuiz}
                disabled={loading || !topic.trim()}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    Generating Quiz...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Quiz
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{quiz.topic}</h3>
                  <p className="text-sm text-gray-600">Question {currentQuestionIndex + 1} of {quiz.questions.length}</p>
                </div>
                <button
                  onClick={() => setQuiz(null)}
                  className="text-sm text-purple-600 hover:text-purple-700 font-semibold"
                >
                  New Quiz
                </button>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all"
                  style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
                />
              </div>

              {/* Current Question */}
              {quiz.questions[currentQuestionIndex] && (
                <div className="space-y-4">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="font-semibold text-gray-900">{quiz.questions[currentQuestionIndex].question}</p>
                  </div>

                  {!submittedAnswers[currentQuestionIndex] ? (
                    <>
                      {quiz.questions[currentQuestionIndex].type === 'multiple_choice' ? (
                        <div className="space-y-2">
                          {quiz.questions[currentQuestionIndex].options?.map((option: string, idx: number) => (
                            <button
                              key={idx}
                              onClick={() => setUserAnswer(option)}
                              className={`w-full text-left p-4 rounded-lg border-2 transition ${
                                userAnswer === option
                                  ? 'border-purple-600 bg-purple-50'
                                  : 'border-gray-200 hover:border-purple-300'
                              }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <textarea
                          value={userAnswer}
                          onChange={(e) => setUserAnswer(e.target.value)}
                          placeholder="Type your answer here..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none min-h-[120px]"
                        />
                      )}

                      <button
                        onClick={handleSubmitAnswer}
                        disabled={!userAnswer.trim()}
                        className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50"
                      >
                        Submit Answer
                      </button>
                    </>
                  ) : (
                    <div className="space-y-4">
                      {/* Assessment Result */}
                      <div className={`border-2 rounded-lg p-4 ${
                        submittedAnswers[currentQuestionIndex].assessment.isCorrect
                          ? 'border-green-500 bg-green-50'
                          : 'border-yellow-500 bg-yellow-50'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          {submittedAnswers[currentQuestionIndex].assessment.isCorrect ? (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          ) : (
                            <HelpCircle className="w-6 h-6 text-yellow-600" />
                          )}
                          <span className="font-bold text-lg">
                            Score: {submittedAnswers[currentQuestionIndex].assessment.score}/{submittedAnswers[currentQuestionIndex].assessment.maxScore}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-2">{submittedAnswers[currentQuestionIndex].assessment.feedback}</p>
                        <p className="text-sm text-gray-600">{submittedAnswers[currentQuestionIndex].assessment.detailedExplanation}</p>
                      </div>

                      {/* Navigation */}
                      <div className="flex gap-2">
                        {currentQuestionIndex < quiz.questions.length - 1 && (
                          <button
                            onClick={() => {
                              setCurrentQuestionIndex(currentQuestionIndex + 1);
                              setUserAnswer('');
                            }}
                            className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
                          >
                            Next Question
                          </button>
                        )}
                        {currentQuestionIndex === quiz.questions.length - 1 && (
                          <button
                            onClick={() => setQuiz(null)}
                            className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                          >
                            Finish Quiz
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// Component: Insights Modal
const InsightsModal = ({ isOpen, onClose, insights }: any) => {
  if (!isOpen || !insights) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Learning Insights</h2>
                <p className="text-sm opacity-90">Your progress and AI recommendations</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white/20 rounded-lg p-2 transition">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Overall Progress */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Overall Progress</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-gradient-to-r from-green-600 to-emerald-600 h-4 rounded-full transition-all"
                    style={{ width: `${insights.overallProgress}%` }}
                  />
                </div>
              </div>
              <div className="text-3xl font-bold text-green-600">{insights.overallProgress}%</div>
            </div>
          </div>

          {/* Strength Areas */}
          {insights.strengthAreas && insights.strengthAreas.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Strength Areas
              </h3>
              <div className="grid gap-3">
                {insights.strengthAreas.map((area: any, idx: number) => (
                  <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">{area.skill}</span>
                      <span className="text-sm font-bold text-green-600">{area.score}%</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        area.trend === 'improving' ? 'bg-green-100 text-green-700' :
                        area.trend === 'stable' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {area.trend}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Improvement Areas */}
          {insights.improvementAreas && insights.improvementAreas.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-yellow-600" />
                Areas to Improve
              </h3>
              <div className="grid gap-3">
                {insights.improvementAreas.map((area: any, idx: number) => (
                  <div key={idx} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">{area.skill}</span>
                      <span className="text-sm text-yellow-700">Gap: {area.gap} points</span>
                    </div>
                    <ul className="space-y-1 mt-2">
                      {area.suggestions.map((suggestion: string, sIdx: number) => (
                        <li key={sIdx} className="text-sm text-gray-700 flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-yellow-600 mt-1.5 flex-shrink-0" />
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Study Patterns */}
          {insights.studyPatterns && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Study Patterns
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Average Study Time</p>
                  <p className="text-lg font-bold text-gray-900">{insights.studyPatterns.averageStudyTime}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Most Productive Time</p>
                  <p className="text-lg font-bold text-gray-900">{insights.studyPatterns.mostProductiveTime}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Consistency Score</p>
                  <p className="text-lg font-bold text-gray-900">{insights.studyPatterns.consistencyScore}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Flame className="w-4 h-4 text-orange-500" />
                    Current Streak
                  </p>
                  <p className="text-lg font-bold text-gray-900">{insights.studyPatterns.streakDays} days</p>
                </div>
              </div>
            </div>
          )}

          {/* Motivational Insights */}
          {insights.motivationalInsights && insights.motivationalInsights.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-600" />
                Achievements
              </h3>
              <div className="space-y-2">
                {insights.motivationalInsights.map((insight: string, idx: number) => (
                  <div key={idx} className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-gray-800">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {insights.recommendations && insights.recommendations.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-purple-600" />
                AI Recommendations
              </h3>
              <div className="space-y-2">
                {insights.recommendations.map((rec: string, idx: number) => (
                  <div key={idx} className="bg-white border border-gray-200 rounded-lg p-3 flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-600 mt-2 flex-shrink-0" />
                    <p className="text-gray-700">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// Component: NSQF Vocational Pathway Modal
const NSQFPathwayModal = ({ isOpen, onClose }: any) => {
  const [step, setStep] = useState<'form' | 'results'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    educationLevel: 'secondary',
    currentNSQFLevel: 1,
    targetNSQFLevel: 5,
    interests: [] as string[],
    skills: [] as string[],
    location: '',
    preferredLanguage: 'en',
    experience: 0,
    learningMode: 'online',
    budget: 'medium'
  });

  // Results state
  const [pathway, setPathway] = useState<any>(null);
  const [employability, setEmployability] = useState<any>(null);
  const [skillGap, setSkillGap] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);

  // Available options
  const interestOptions = ['Technology', 'Healthcare', 'Manufacturing', 'Retail', 'Hospitality', 'Agriculture', 'Automotive', 'Construction', 'Finance', 'Media', 'Logistics', 'Tourism'];
  const skillOptions = ['Communication', 'Problem Solving', 'Technical Skills', 'Leadership', 'Teamwork', 'Time Management', 'Computer Skills', 'Customer Service', 'Sales', 'Quality Control'];

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleGenerate = async () => {
    if (formData.interests.length === 0) {
      setError('Please select at least one interest area');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Generate vocational pathway
      const pathwayResponse = await nsqfAPI.generatePathway({
        currentEducationLevel: formData.educationLevel,
        currentNSQFLevel: formData.currentNSQFLevel,
        targetNSQFLevel: formData.targetNSQFLevel,
        interests: formData.interests,
        skills: formData.skills,
        location: formData.location,
        preferredLanguage: formData.preferredLanguage,
        experienceYears: formData.experience,
        learningMode: formData.learningMode as 'online' | 'offline' | 'hybrid',
        budget: formData.budget as 'free' | 'low' | 'medium' | 'high'
      });
      setPathway(pathwayResponse.data.data);

      // Predict employability
      const employabilityResponse = await nsqfAPI.predictEmployability({
        profile: {
          currentNSQFLevel: formData.currentNSQFLevel,
          targetNSQFLevel: formData.targetNSQFLevel,
          skills: formData.skills,
          experienceYears: formData.experience,
          location: formData.location
        },
        targetSector: formData.interests[0]
      });
      setEmployability(employabilityResponse.data.data);

      // Analyze skill gap
      const skillGapResponse = await nsqfAPI.analyzeSkillGap({
        currentSkills: formData.skills,
        targetRole: 'Vocational Specialist',
        targetSector: formData.interests[0]
      });
      setSkillGap(skillGapResponse.data.data);

      // Recommend courses
      const coursesResponse = await nsqfAPI.recommendCourses({
        profile: {
          currentNSQFLevel: formData.currentNSQFLevel,
          targetNSQFLevel: formData.targetNSQFLevel,
          interests: formData.interests,
          skills: formData.skills,
          location: formData.location,
          learningMode: formData.learningMode as 'online' | 'offline' | 'hybrid',
          budget: formData.budget as 'free' | 'low' | 'medium' | 'high',
          preferredLanguage: formData.preferredLanguage
        },
        limit: 10
      });
      setCourses(coursesResponse.data.data || []);

      setStep('results');
    } catch (err: any) {
      console.error('Error generating pathway:', err);
      setError(err.response?.data?.message || 'Failed to generate pathway. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('form');
    setPathway(null);
    setEmployability(null);
    setSkillGap(null);
    setCourses([]);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">NSQF Vocational Pathway</h2>
                <p className="text-sm opacity-90">AI-powered certification roadmap for your career</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white/20 rounded-lg p-2 transition">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'form' ? (
            <div className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
                  {error}
                </div>
              )}

              {/* Education Level */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Education Level</label>
                <select
                  value={formData.educationLevel}
                  onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="primary">Primary (Class 1-5)</option>
                  <option value="secondary">Secondary (Class 6-10)</option>
                  <option value="senior_secondary">Senior Secondary (Class 11-12)</option>
                  <option value="diploma">Diploma</option>
                  <option value="bachelors">Bachelor's Degree</option>
                  <option value="masters">Master's Degree</option>
                </select>
              </div>

              {/* NSQF Levels */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Current NSQF Level</label>
                  <select
                    value={formData.currentNSQFLevel}
                    onChange={(e) => setFormData({ ...formData, currentNSQFLevel: parseInt(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                      <option key={level} value={level}>Level {level}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Target NSQF Level</label>
                  <select
                    value={formData.targetNSQFLevel}
                    onChange={(e) => setFormData({ ...formData, targetNSQFLevel: parseInt(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                      <option key={level} value={level}>Level {level}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Interests */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Interest Areas (Select at least one)</label>
                <div className="flex flex-wrap gap-2">
                  {interestOptions.map(interest => (
                    <button
                      key={interest}
                      onClick={() => handleInterestToggle(interest)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                        formData.interests.includes(interest)
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Skills (Optional)</label>
                <div className="flex flex-wrap gap-2">
                  {skillOptions.map(skill => (
                    <button
                      key={skill}
                      onClick={() => handleSkillToggle(skill)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                        formData.skills.includes(skill)
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location & Experience */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Location (Optional)</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Mumbai, Delhi"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Experience (years)</label>
                  <input
                    type="number"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
                    min="0"
                    max="50"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Learning Mode & Budget */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Learning Mode</label>
                  <div className="flex gap-2">
                    {['online', 'offline', 'hybrid'].map(mode => (
                      <button
                        key={mode}
                        onClick={() => setFormData({ ...formData, learningMode: mode })}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition ${
                          formData.learningMode === mode
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Budget</label>
                  <div className="flex gap-2">
                    {['free', 'low', 'medium', 'high'].map(budget => (
                      <button
                        key={budget}
                        onClick={() => setFormData({ ...formData, budget })}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition ${
                          formData.budget === budget
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {budget.charAt(0).toUpperCase() + budget.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Your Pathway...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Generate NSQF Pathway
                  </span>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Results Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Your Vocational Pathway</h3>
                <button
                  onClick={handleReset}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
                >
                  <RefreshCw className="w-4 h-4" />
                  Generate New
                </button>
              </div>

              {/* Employability Score */}
              {employability && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Employability Score
                  </h4>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-4xl font-bold text-green-600">
                      {employability.score}%
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-gradient-to-r from-green-600 to-emerald-600 h-4 rounded-full transition-all"
                          style={{ width: `${employability.score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  {employability.factors && employability.factors.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-700">Key Factors:</p>
                      {employability.factors.map((factor: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{factor.name}</span>
                          <span className="font-semibold text-green-600">{factor.impact}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Pathway Stages */}
              {pathway && pathway.stages && pathway.stages.length > 0 && (
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-orange-600" />
                    Learning Pathway
                  </h4>
                  <div className="space-y-3">
                    {pathway.stages.map((stage: any, idx: number) => (
                      <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900 mb-1">{stage.title}</h5>
                            <p className="text-sm text-gray-600 mb-2">{stage.description || `NSQF Level ${stage.nsqfLevel} - ${stage.duration}`}</p>
                            {stage.duration && (
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Duration: {stage.duration}
                              </p>
                            )}
                            {stage.courses && stage.courses.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {stage.courses.map((course: any, certIdx: number) => (
                                  <span key={certIdx} className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                                    {course.title}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skill Gap Analysis */}
              {skillGap && (
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    Skill Gap Analysis
                  </h4>
                  
                  {skillGap.gapPercentage !== undefined && (
                    <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">Skill Gap</span>
                        <span className="text-2xl font-bold text-yellow-700">{skillGap.gapPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-yellow-500 h-3 rounded-full transition-all"
                          style={{ width: `${skillGap.gapPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {skillGap.missingSkills && skillGap.missingSkills.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Missing Skills:</p>
                      <div className="flex flex-wrap gap-2">
                        {skillGap.missingSkills.map((skill: string, idx: number) => (
                          <span key={idx} className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {skillGap.prioritySkills && skillGap.prioritySkills.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Priority Skills to Learn:</p>
                      {skillGap.prioritySkills.map((item: any, idx: number) => (
                        <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-gray-900">{item.skill}</span>
                            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                              item.importance === 'critical' ? 'bg-red-100 text-red-700' :
                              item.importance === 'high' ? 'bg-orange-100 text-orange-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {item.importance}
                            </span>
                          </div>
                          {item.estimatedTime && (
                            <p className="text-sm text-gray-600 mb-2">⏱️ {item.estimatedTime}</p>
                          )}
                          {item.learningPath && item.learningPath.length > 0 && (
                            <div className="text-sm text-gray-700">
                              <p className="font-medium mb-1">Learning Path:</p>
                              <ul className="list-disc list-inside space-y-1">
                                {item.learningPath.map((step: string, stepIdx: number) => (
                                  <li key={stepIdx}>{step}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Recommended Courses */}
              {courses && courses.length > 0 && (
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    Recommended Courses
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {courses.slice(0, 6).map((course: any, idx: number) => (
                      <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-orange-300 transition">
                        <h5 className="font-semibold text-gray-900 mb-2">{course.title}</h5>
                        {course.description && (
                          <p className="text-xs text-gray-600 mb-3">{course.description}</p>
                        )}
                        <div className="space-y-2 text-sm text-gray-600">
                          {course.courseProvider && <p>📚 Provider: {course.courseProvider}</p>}
                          {course.duration && <p>⏱️ Duration: {course.duration}</p>}
                          {course.cost && <p>💰 Cost: {course.cost}</p>}
                          {course.avgSalaryRange && <p>💼 Avg Salary: {course.avgSalaryRange}</p>}
                          <div className="flex items-center gap-2 flex-wrap mt-2">
                            {course.nsqfLevel && (
                              <span className="inline-block bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-semibold">
                                NSQF Level {course.nsqfLevel}
                              </span>
                            )}
                            {course.employabilityScore && (
                              <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">
                                {course.employabilityScore}% Employability
                              </span>
                            )}
                            {course.mode && (
                              <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">
                                {course.mode}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// Mock Data
const mockSkillProgress: SkillProgress[] = [
  {
    skillName: 'React & Frontend Development',
    currentLevel: 6,
    targetLevel: 9,
    progress: 67,
    priority: 'high',
    courses: [
      {
        id: 'c1',
        title: 'Advanced React Patterns',
        platform: 'Udemy',
        duration: '12 hours',
        level: 'advanced',
        rating: 4.8,
        enrolled: 15420,
        thumbnail: '',
        url: '#',
        cost: 'paid',
        price: '₹499',
        skillTag: 'React',
        isRecommended: true
      }
    ]
  },
  {
    skillName: 'TypeScript',
    currentLevel: 4,
    targetLevel: 8,
    progress: 50,
    priority: 'high',
    courses: []
  },
  {
    skillName: 'Data Structures & Algorithms',
    currentLevel: 5,
    targetLevel: 9,
    progress: 56,
    priority: 'medium',
    courses: []
  },
  {
    skillName: 'System Design',
    currentLevel: 3,
    targetLevel: 7,
    progress: 43,
    priority: 'medium',
    courses: []
  }
];

const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Complete React Developer Course',
    platform: 'Udemy',
    duration: '40 hours',
    level: 'intermediate',
    rating: 4.7,
    enrolled: 45000,
    thumbnail: '',
    url: '#',
    cost: 'paid',
    price: '₹499',
    skillTag: 'React',
    progress: 45,
    isRecommended: true
  },
  {
    id: '2',
    title: 'TypeScript Fundamentals',
    platform: 'Frontend Masters',
    duration: '8 hours',
    level: 'beginner',
    rating: 4.9,
    enrolled: 12000,
    thumbnail: '',
    url: '#',
    cost: 'free',
    skillTag: 'TypeScript',
    isRecommended: true
  },
  {
    id: '3',
    title: 'Data Structures & Algorithms in JavaScript',
    platform: 'Coursera',
    duration: '35 hours',
    level: 'intermediate',
    rating: 4.6,
    enrolled: 28000,
    thumbnail: '',
    url: '#',
    cost: 'paid',
    price: '₹799',
    skillTag: 'DSA',
    progress: 20,
    isRecommended: false
  },
  {
    id: '4',
    title: 'System Design Interview Preparation',
    platform: 'Educative',
    duration: '25 hours',
    level: 'advanced',
    rating: 4.8,
    enrolled: 18000,
    thumbnail: '',
    url: '#',
    cost: 'paid',
    price: '₹1299',
    skillTag: 'System Design',
    isRecommended: true
  },
  {
    id: '5',
    title: 'Full Stack Web Development Bootcamp',
    platform: 'Udemy',
    duration: '65 hours',
    level: 'beginner',
    rating: 4.5,
    enrolled: 95000,
    thumbnail: '',
    url: '#',
    cost: 'paid',
    price: '₹599',
    skillTag: 'Full Stack',
    isRecommended: false
  },
  {
    id: '6',
    title: 'Advanced CSS & Tailwind CSS',
    platform: 'YouTube',
    duration: '5 hours',
    level: 'intermediate',
    rating: 4.7,
    enrolled: 8000,
    thumbnail: '',
    url: '#',
    cost: 'free',
    skillTag: 'CSS',
    isRecommended: false
  }
];

export default Learn;
