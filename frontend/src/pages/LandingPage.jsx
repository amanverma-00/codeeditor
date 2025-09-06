import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ChevronRight, Code, Zap, Users, Trophy, Play, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x);
  const mouseY = useSpring(y);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
      x.set(e.clientX);
      y.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [x, y]);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/home');
    } else {
      navigate('/signup');
    }
  };

  const features = [
    {
      icon: <Code className="w-8 h-8" />,
      title: "Code & Compete",
      description: "Solve challenging problems in multiple programming languages"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "AI Assistant",
      description: "Get intelligent hints and guidance powered by advanced AI"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community",
      description: "Learn from others and share your solutions with the community"
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Track Progress",
      description: "Monitor your coding journey with detailed analytics and achievements"
    }
  ];

  const stats = [
    { number: "1000+", label: "Problems" },
    { number: "50k+", label: "Developers" },
    { number: "500k+", label: "Submissions" },
    { number: "99.9%", label: "Uptime" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden relative"><div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-50">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-white rounded-full"
              style={{
                width: Math.random() * 4 + 1,
                height: Math.random() * 4 + 1,
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div><motion.div
        className="fixed w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full pointer-events-none z-50 mix-blend-difference"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isHovering ? 2 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28,
        }}
      /><nav className="relative z-10 p-6">
        <motion.div 
          className="flex justify-between items-center max-w-7xl mx-auto"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
            whileHover={{ scale: 1.05 }}
          >
            CodeOps
          </motion.div>
          <div className="space-x-6">
            {isAuthenticated ? (
              <motion.button
                onClick={() => navigate('/home')}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold hover:shadow-lg transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onHoverStart={() => setIsHovering(true)}
                onHoverEnd={() => setIsHovering(false)}
              >
                Dashboard
              </motion.button>
            ) : (
              <>
                <motion.button
                  onClick={() => navigate('/login')}
                  className="px-6 py-2 text-white/80 hover:text-white transition-colors"
                  whileHover={{ scale: 1.05 }}
                  onHoverStart={() => setIsHovering(true)}
                  onHoverEnd={() => setIsHovering(false)}
                >
                  Login
                </motion.button>
                <motion.button
                  onClick={() => navigate('/signup')}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold hover:shadow-lg transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onHoverStart={() => setIsHovering(true)}
                  onHoverEnd={() => setIsHovering(false)}
                >
                  Sign Up
                </motion.button>
              </>
            )}
          </div>
        </motion.div>
      </nav><div className="relative z-10 max-w-7xl mx-auto px-6 pt-20">
        <div className="text-center">
          <motion.h1 
            className="text-6xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            CodeOps
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Master coding challenges, compete with developers worldwide, and enhance your skills with AI-powered assistance
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <motion.button
              onClick={handleGetStarted}
              className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold text-lg flex items-center gap-2 hover:shadow-2xl transition-all"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onHoverStart={() => setIsHovering(true)}
              onHoverEnd={() => setIsHovering(false)}
            >
              Get Started
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            </motion.button>
            
            <motion.button
              className="group px-8 py-4 border border-white/30 rounded-full font-semibold text-lg flex items-center gap-2 hover:bg-white/10 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onHoverStart={() => setIsHovering(true)}
              onHoverEnd={() => setIsHovering(false)}
            >
              <Play className="w-5 h-5" />
              Watch Demo
            </motion.button>
          </motion.div>
        </div><motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="text-center p-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20"
              whileHover={{ 
                scale: 1.05, 
                backgroundColor: "#ffffff26" 
              }}
              onHoverStart={() => setIsHovering(true)}
              onHoverEnd={() => setIsHovering(false)}
            >
              <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">
                {stat.number}
              </div>
              <div className="text-white/70">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div><motion.div 
          className="mb-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.1 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Why Choose CodeOps?
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 text-center group"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.3 + index * 0.1 }}
                whileHover={{ 
                  scale: 1.05, 
                  y: -10,
                  backgroundColor: "#ffffff26" 
                }}
                onHoverStart={() => setIsHovering(true)}
                onHoverEnd={() => setIsHovering(false)}
              >
                <motion.div 
                  className="inline-flex p-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 mb-6"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-semibold mb-4 text-white">
                  {feature.title}
                </h3>
                <p className="text-white/70 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div><motion.div 
          className="text-center py-20"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.5 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            Ready to Level Up?
          </h2>
          <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
            Join thousands of developers who are already improving their coding skills with CodeOps
          </p>
          
          <motion.button
            onClick={handleGetStarted}
            className="px-12 py-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-bold text-xl flex items-center gap-3 mx-auto hover:shadow-2xl transition-all"
            whileHover={{ scale: 1.1, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onHoverStart={() => setIsHovering(true)}
            onHoverEnd={() => setIsHovering(false)}
          >
            Start Coding Now
            <ChevronRight className="w-6 h-6" />
          </motion.button>
        </motion.div>
      </div><footer className="relative z-10 border-t border-white/20 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div 
            className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4"
            whileHover={{ scale: 1.05 }}
          >
            CodeOps
          </motion.div>
          <p className="text-white/60">
            © 2024 CodeOps. Empowering developers worldwide.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;