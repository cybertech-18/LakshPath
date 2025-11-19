import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { Target, User } from 'lucide-react';

import { authAPI } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [oauthLoading, setOauthLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const persistSession = (token: string, user: { id: string; name?: string | null; email?: string | null }) => {
    const fallbackName = user.email ? user.email.split('@')[0] : 'Explorer';
    const safeName = user.name?.length ? user.name : fallbackName;

    localStorage.setItem('token', token);
    localStorage.setItem('userId', user.id);
    localStorage.setItem('userName', safeName);
    if (user.email) localStorage.setItem('userEmail', user.email);
    localStorage.setItem('loginDate', new Date().toISOString());
  };

  const navigateAfterLogin = () => {
    const hasAssessment = localStorage.getItem('assessmentCompleted') === 'true';
    if (hasAssessment) {
      navigate('/dashboard');
    } else {
      navigate('/quiz-intro');
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      alert('Missing Google credential. Please try again.');
      return;
    }

    setOauthLoading(true);
    try {
      const { data } = await authAPI.googleLogin(credentialResponse.credential);
      persistSession(data.token, data.user);
      navigateAfterLogin();
    } catch (error) {
      console.error('Google sign-in failed', error);
      alert('Google sign-in failed. Please try again.');
    } finally {
      setOauthLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    try {
      const { data } = await authAPI.demoLogin();
      persistSession(data.token, data.user);
      navigateAfterLogin();
    } catch (error) {
      console.error('Demo login failed', error);
      alert('Unable to start demo session. Please check your connection.');
    } finally {
      setDemoLoading(false);
    }
  };

  const handleGoogleError = () => {
    alert('Unable to connect to Google at the moment. Please try again later.');
  };
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)]"></div>
        
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600 rounded-full opacity-20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600 rounded-full opacity-20 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link to="/" className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-blue-600 flex items-center justify-center">
              <Target className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-black">LAKSHPATH</span>
          </Link>
          <p className="text-gray-400 text-lg">Welcome back</p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          className="bg-white/5 backdrop-blur-md border border-white/10 p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h2 className="text-3xl font-black mb-6 text-center">SIGN IN</h2>

          <div className="flex flex-col gap-4">
            <div className="flex justify-center relative">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                shape="pill"
                logo_alignment="center"
                theme="outline"
                width="280"
                text="signin_with"
              />
              {oauthLoading && (
                <div className="absolute inset-0 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-xs font-semibold">
                  Connecting...
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 my-2">
              <span className="h-px flex-1 bg-white/10" />
              <span className="text-xs uppercase tracking-[0.3em] text-gray-500">or</span>
              <span className="h-px flex-1 bg-white/10" />
            </div>

            <motion.button
              onClick={handleDemoLogin}
              disabled={demoLoading}
              className="w-full bg-white/10 border border-white/20 hover:bg-white/20 text-white font-bold py-3 px-4 rounded-full flex items-center justify-center gap-2 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <User className="w-5 h-5" />
              {demoLoading ? 'Starting Demo...' : 'Continue as Guest'}
            </motion.button>
          </div>

          {/* Test Credentials Info */}
          <motion.div
            className="mt-6 p-4 bg-white/5 border border-white/10 text-center text-sm text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Use <strong>Guest Mode</strong> to explore the app instantly without a Google account.
          </motion.div>
        </motion.div>

        {/* Sign Up Link */}
        <motion.p
          className="text-center mt-8 text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Don't have an account?{' '}
          <Link to="/register" className="text-white font-bold hover:text-primary-400 transition">
            SIGN UP
          </Link>
        </motion.p>

        {/* Back to Home */}
        <motion.div
          className="text-center mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Link 
            to="/" 
            className="text-gray-500 text-sm hover:text-gray-300 transition inline-flex items-center gap-2"
          >
            ← Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
