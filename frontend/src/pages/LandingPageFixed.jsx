import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ChevronRight, Code, Zap, Users, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const LandingPageSimple = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [bubbles, setBubbles] = useState([]);
  const containerRef = useRef(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x);
  const mouseY = useSpring(y);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/home');
    } else {
      navigate('/signup');
    }
  };

  useEffect(() => {
    const initialBubbles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 40 + 20,
      speed: Math.random() * 2 + 1,
      opacity: Math.random() * 0.6 + 0.2,
      originalX: Math.random() * window.innerWidth,
      originalY: Math.random() * window.innerHeight,
    }));
    setBubbles(initialBubbles);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
      x.set(e.clientX);
      y.set(e.clientY);

      setBubbles(prevBubbles => 
        prevBubbles.map(bubble => {
          const distance = Math.sqrt(
            Math.pow(e.clientX - bubble.x, 2) + Math.pow(e.clientY - bubble.y, 2)
          );
          
          if (distance < 150) {
            
            const angle = Math.atan2(bubble.y - e.clientY, bubble.x - e.clientX);
            const force = Math.max(0, (150 - distance) / 150) * 50;
            
            return {
              ...bubble,
              x: bubble.x + Math.cos(angle) * force * 0.3,
              y: bubble.y + Math.sin(angle) * force * 0.3,
            };
          } else {
            
            return {
              ...bubble,
              x: bubble.x + (bubble.originalX - bubble.x) * 0.02,
              y: bubble.y + (bubble.originalY - bubble.y) * 0.02,
            };
          }
        })
      );
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [x, y]);

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
    <div 
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden relative"
      style={{ perspective: '1000px' }}
    ><div className="fixed inset-0 pointer-events-none z-10">
        {bubbles.map((bubble) => (
          <motion.div
            key={bubble.id}
            className="absolute rounded-full bg-gradient-to-r from-purple-400/20 to-pink-400/20 backdrop-blur-sm border border-white/10"
            style={{
              width: bubble.size,
              height: bubble.size,
              left: bubble.x - bubble.size / 2,
              top: bubble.y - bubble.size / 2,
              opacity: bubble.opacity,
            }}
            animate={{
              y: [0, -20, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: bubble.speed * 2 + 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: bubble.id * 0.2,
            }}
          />
        ))}
      </div><div className="relative z-20"><motion.nav 
          className="p-6"
          whileHover={{ 
            z: -20,
            transition: { duration: 0.3 }
          }}
        >
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <motion.div 
              className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent cursor-pointer"
              whileHover={{ 
                scale: 1.05,
                z: -30,
                transition: { duration: 0.3 }
              }}
              onHoverStart={() => setIsHovering(true)}
              onHoverEnd={() => setIsHovering(false)}
              onClick={() => navigate('/')}
            >
              CodeOps
            </motion.div>
            <div className="space-x-6">
              {isAuthenticated ? (
                <motion.button
                  onClick={() => navigate('/home')}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold hover:shadow-lg transition-all"
                  whileHover={{ 
                    scale: 1.05,
                    z: -20,
                    transition: { duration: 0.3 }
                  }}
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
                    whileHover={{ 
                      scale: 1.05,
                      z: -15,
                      transition: { duration: 0.3 }
                    }}
                    onHoverStart={() => setIsHovering(true)}
                    onHoverEnd={() => setIsHovering(false)}
                  >
                    Login
                  </motion.button>
                  <motion.button
                    onClick={() => navigate('/signup')}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold hover:shadow-lg transition-all"
                    whileHover={{ 
                      scale: 1.05,
                      z: -20,
                      transition: { duration: 0.3 }
                    }}
                    onHoverStart={() => setIsHovering(true)}
                    onHoverEnd={() => setIsHovering(false)}
                  >
                    Sign Up
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </motion.nav><motion.div 
          className="max-w-7xl mx-auto px-6 pt-20"
          whileHover={{ 
            z: -25,
            transition: { duration: 0.4 }
          }}
        >
          <div className="text-center">
            <motion.h1 
              className="text-6xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent"
              whileHover={{ 
                scale: 1.02,
                z: -40,
                transition: { duration: 0.3 }
              }}
            >
              CodeOps
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed"
              whileHover={{ 
                z: -20,
                transition: { duration: 0.3 }
              }}
            >
              Master coding challenges, compete with developers worldwide, and enhance your skills with AI-powered assistance
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20"
              whileHover={{ 
                z: -30,
                transition: { duration: 0.3 }
              }}
            >
              <motion.button
                onClick={handleGetStarted}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold text-lg flex items-center gap-2 hover:shadow-2xl transition-all"
                whileHover={{ 
                  scale: 1.05,
                  z: -35,
                  boxShadow: "0 25px 50px -12px rgba(147, 51, 234, 0.5)",
                  transition: { duration: 0.3 }
                }}
                whileTap={{ scale: 0.95 }}
                onHoverStart={() => setIsHovering(true)}
                onHoverEnd={() => setIsHovering(false)}
              >
                Get Started
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.div>
              </motion.button>
            </motion.div>
          </div><motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20"
            whileHover={{ 
              z: -15,
              transition: { duration: 0.3 }
            }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center p-6 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/15 transition-all"
                whileHover={{ 
                  scale: 1.05,
                  z: -25,
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  transition: { duration: 0.3 }
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
            whileHover={{ 
              z: -10,
              transition: { duration: 0.3 }
            }}
          >
            <motion.h2 
              className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
              whileHover={{ 
                scale: 1.02,
                z: -20,
                transition: { duration: 0.3 }
              }}
            >
              Why Choose CodeOps?
            </motion.h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="p-8 rounded-2xl bg-white/10 border border-white/20 text-center hover:bg-white/15 transition-all"
                  whileHover={{ 
                    scale: 1.05,
                    z: -30,
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    boxShadow: "0 20px 40px -12px rgba(147, 51, 234, 0.3)",
                    transition: { duration: 0.3 }
                  }}
                  onHoverStart={() => setIsHovering(true)}
                  onHoverEnd={() => setIsHovering(false)}
                >
                  <motion.div 
                    className="inline-flex p-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 mb-6"
                    whileHover={{ 
                      rotate: 360,
                      scale: 1.1,
                      transition: { duration: 0.6 }
                    }}
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
            whileHover={{ 
              z: -20,
              transition: { duration: 0.3 }
            }}
          >
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent"
              whileHover={{ 
                scale: 1.02,
                z: -25,
                transition: { duration: 0.3 }
              }}
            >
              Ready to Level Up?
            </motion.h2>
            <motion.p 
              className="text-xl text-white/80 mb-12 max-w-2xl mx-auto"
              whileHover={{ 
                z: -15,
                transition: { duration: 0.3 }
              }}
            >
              Join thousands of developers who are already improving their coding skills with CodeOps
            </motion.p>
            
            <motion.button
              onClick={handleGetStarted}
              className="px-12 py-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-bold text-xl flex items-center gap-3 mx-auto hover:shadow-2xl transition-all"
              whileHover={{ 
                scale: 1.1,
                z: -40,
                y: -5,
                boxShadow: "0 30px 60px -12px rgba(147, 51, 234, 0.6)",
                transition: { duration: 0.3 }
              }}
              whileTap={{ scale: 0.95 }}
              onHoverStart={() => setIsHovering(true)}
              onHoverEnd={() => setIsHovering(false)}
            >
              Start Coding Now
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ChevronRight className="w-6 h-6" />
              </motion.div>
            </motion.button>
          </motion.div>
        </motion.div><motion.footer 
          className="border-t border-white/20 py-12"
          whileHover={{ 
            z: -10,
            transition: { duration: 0.3 }
          }}
        >
          <div className="max-w-7xl mx-auto px-6 text-center">
            <motion.div 
              className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4"
              whileHover={{ 
                scale: 1.05,
                z: -15,
                transition: { duration: 0.3 }
              }}
            >
              CodeOps
            </motion.div>
            <p className="text-white/60">
              © 2024 CodeOps. Empowering developers worldwide.
            </p>
          </div>
        </motion.footer>
      </div>
    </div>
  );
};

export default LandingPageSimple;