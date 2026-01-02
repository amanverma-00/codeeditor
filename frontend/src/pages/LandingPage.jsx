import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Code, Zap, Users, Trophy, ArrowRight, Terminal, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/home');
    } else {
      navigate('/signup');
    }
  };

  useEffect(() => {
    document.body.style.overflow = 'auto';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const features = [
    {
      icon: <Code className="w-8 h-8" />,
      title: "Practice & Compete",
      description: "Solve coding challenges across multiple difficulty levels and programming languages"
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "AI-Powered Hints",
      description: "Get intelligent assistance when stuck with our advanced AI doubt solver"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Learn Together",
      description: "Join a vibrant community of developers sharing knowledge and solutions"
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Track Your Growth",
      description: "Monitor your progress with detailed stats and maintain your coding streak"
    }
  ];

  const stats = [
    { number: "500+", label: "Coding Problems" },
    { number: "10K+", label: "Active Users" },
    { number: "100K+", label: "Solutions Submitted" },
    { number: "24/7", label: "AI Support" }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#e0e0e0] relative overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,136,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,136,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000,transparent)]" />
      
      {/* Scanlines */}
      <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,255,136,0.02)_50%)] bg-[length:100%_4px] pointer-events-none animate-[scan_8s_linear_infinite]" />

      {/* Navigation */}
      <nav className="relative z-50 border-b border-[rgba(0,255,136,0.2)] bg-[rgba(10,10,15,0.8)] backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Terminal className="w-6 h-6 text-[#00ff88]" />
            <span className="text-2xl font-['Orbitron'] font-bold text-[#00ff88]">CodeOps</span>
          </motion.div>
          
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <motion.button
                onClick={() => navigate('/home')}
                className="px-6 py-2 bg-[#00ff88] text-[#0a0a0f] font-['IBM_Plex_Mono'] font-semibold rounded hover:bg-[#00cc6f] transition-colors"
                whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0,255,136,0.5)' }}
                whileTap={{ scale: 0.95 }}
              >
                Dashboard
              </motion.button>
            ) : (
              <>
                <motion.button
                  onClick={() => navigate('/login')}
                  className="px-6 py-2 text-[#e0e0e0] font-['IBM_Plex_Mono'] hover:text-[#00ff88] transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Login
                </motion.button>
                <motion.button
                  onClick={() => navigate('/signup')}
                  className="px-6 py-2 bg-[#00ff88] text-[#0a0a0f] font-['IBM_Plex_Mono'] font-semibold rounded hover:bg-[#00cc6f] transition-colors"
                  whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0,255,136,0.5)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign Up
                </motion.button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1 
            className="text-6xl md:text-8xl font-['Orbitron'] font-bold mb-6 text-[#00ff88]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Master Coding
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-[#808080] mb-12 max-w-3xl mx-auto font-['IBM_Plex_Mono']"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Level up your programming skills with <span className="text-[#00ff88]">AI-powered guidance</span>, 
            track your progress, and join a thriving developer community
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.button
              onClick={handleGetStarted}
              className="px-10 py-4 bg-[#00ff88] text-[#0a0a0f] font-['IBM_Plex_Mono'] font-bold text-lg rounded flex items-center gap-3 hover:bg-[#00cc6f] transition-all group"
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0,255,136,0.6)' }}
              whileTap={{ scale: 0.95 }}
            >
              Start Your Journey
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Terminal Card */}
        <motion.div 
          className="mt-20 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="bg-[rgba(10,10,15,0.9)] border border-[rgba(0,255,136,0.3)] rounded-lg overflow-hidden backdrop-blur-xl shadow-[0_0_30px_rgba(0,255,136,0.2)]">
            {/* Terminal Header */}
            <div className="bg-[rgba(0,255,136,0.1)] border-b border-[rgba(0,255,136,0.3)] px-4 py-3 flex items-center gap-2">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
              </div>
              <span className="text-[#808080] text-sm font-['IBM_Plex_Mono'] ml-2">codeops-terminal</span>
            </div>
            
            {/* Terminal Body */}
            <div className="p-6 font-['IBM_Plex_Mono'] text-sm space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[#00ff88]">$</span>
                <span className="text-[#e0e0e0]">echo "Welcome to CodeOps, Developer!"</span>
              </div>
              <div className="text-[#00ff88] ml-4">Welcome to CodeOps, Developer!</div>
              
              <div className="flex items-center gap-2 mt-4">
                <span className="text-[#00ff88]">$</span>
                <span className="text-[#e0e0e0]">codeops --status</span>
              </div>
              <div className="text-[#808080] ml-4">
                <div>✓ AI Assistant: Online</div>
                <div>✓ Problem Database: 500+ challenges ready</div>
                <div>✓ Community: 10K+ active developers</div>
                <div>✓ Real-time Code Execution: Ready</div>
              </div>
              
              <div className="flex items-center gap-2 mt-4">
                <span className="text-[#00ff88]">$</span>
                <span className="text-[#e0e0e0]">codeops --motivation</span>
              </div>
              <div className="text-[#00ff88] ml-4">"Every expert was once a beginner. Start coding today!"</div>
              
              <div className="flex items-center gap-2 mt-4">
                <span className="text-[#00ff88]">$</span>
                <span className="text-[#e0e0e0] animate-pulse">_</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-24"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="text-center p-6 rounded-lg bg-[rgba(10,10,15,0.8)] border border-[rgba(0,255,136,0.2)] backdrop-blur-xl hover:border-[rgba(0,255,136,0.5)] transition-all"
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className="text-4xl font-['Orbitron'] font-bold text-[#00ff88] mb-2">
                {stat.number}
              </div>
              <div className="text-[#808080] font-['IBM_Plex_Mono']">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Features */}
        <motion.div 
          className="mt-32"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <h2 className="text-4xl md:text-5xl font-['Orbitron'] font-bold text-center mb-16 text-[#00ff88]">
            Why Choose CodeOps?
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="p-8 rounded-lg bg-[rgba(10,10,15,0.8)] border border-[rgba(0,255,136,0.2)] backdrop-blur-xl hover:border-[rgba(0,255,136,0.5)] transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -10 }}
              >
                <div className="inline-flex p-4 rounded-lg bg-[rgba(0,255,136,0.1)] border border-[rgba(0,255,136,0.3)] mb-6">
                  <div className="text-[#00ff88]">{feature.icon}</div>
                </div>
                <h3 className="text-xl font-['Orbitron'] font-semibold mb-4 text-[#e0e0e0]">
                  {feature.title}
                </h3>
                <p className="text-[#808080] font-['IBM_Plex_Mono'] leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          className="text-center mt-32"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-['Orbitron'] font-bold mb-8 text-[#00ff88]">
            Ready to Code?
          </h2>
          <p className="text-xl text-[#808080] mb-12 max-w-2xl mx-auto font-['IBM_Plex_Mono']">
            Join thousands of developers mastering their craft with CodeOps
          </p>
          
          <motion.button
            onClick={handleGetStarted}
            className="px-12 py-5 bg-[#00ff88] text-[#0a0a0f] font-['IBM_Plex_Mono'] font-bold text-xl rounded flex items-center gap-3 mx-auto hover:bg-[#00cc6f] transition-all group"
            whileHover={{ scale: 1.1, boxShadow: '0 0 40px rgba(0,255,136,0.8)' }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started Free
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </motion.button>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[rgba(0,255,136,0.2)] bg-[rgba(10,10,15,0.8)] backdrop-blur-xl py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Terminal className="w-6 h-6 text-[#00ff88]" />
            <span className="text-2xl font-['Orbitron'] font-bold text-[#00ff88]">CodeOps</span>
          </div>
          <p className="text-[#808080] font-['IBM_Plex_Mono']">
            © 2026 CodeOps. Empowering developers worldwide.
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes scan {
          0% { background-position: 0 0; }
          100% { background-position: 0 100%; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
