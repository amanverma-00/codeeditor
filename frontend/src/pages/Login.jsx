import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router-dom';
import { loginUser } from "../authSlice";
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

const loginSchema = z.object({
  emailId: z.string().email("Invalid Email"),
  password: z.string().min(1, "Password is required")
});

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const onSubmit = (data) => {
    dispatch(loginUser(data));
  };

  return (
    <div 
      className="min-h-screen text-[#e0e0e0] overflow-hidden relative flex items-center justify-center p-4"
      style={{
        fontFamily: "'IBM Plex Mono', 'Fira Code', monospace",
        backgroundColor: '#0a0a0f',
      }}
    >
      {/* Animated grid background */}
      <div 
        className="fixed inset-0"
        style={{
          opacity: 0.03,
          backgroundImage: `
            linear-gradient(rgba(0, 255, 136, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 136, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)`,
          transition: 'transform 0.3s ease-out',
        }}
      />

      {/* Scanline effect */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 50,
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.1) 2px, rgba(0, 0, 0, 0.1) 4px)',
        }}
      />

      {/* Glowing orb */}
      <div 
        className="fixed pointer-events-none"
        style={{
          width: '500px',
          height: '500px',
          zIndex: 0,
          left: `${mousePos.x * 100}%`,
          top: `${mousePos.y * 100}%`,
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(0, 255, 136, 0.08) 0%, transparent 70%)',
          transition: 'left 0.5s ease-out, top 0.5s ease-out',
        }}
      />

      {/* Navigation */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 px-8 py-6"
        style={{ zIndex: 40 }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.02 }}
          >
            <div 
              className="w-10 h-10 flex items-center justify-center"
              style={{ border: '2px solid #00ff88' }}
            >
              <span className="font-bold text-lg" style={{ color: '#00ff88' }}>C</span>
            </div>
            <span className="text-xl font-bold tracking-wider">
              CODE<span style={{ color: '#00ff88' }}>OPS</span>
            </span>
          </motion.div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="w-full max-w-md relative" style={{ zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="p-8"
          style={{
            backgroundColor: 'rgba(10, 10, 15, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 255, 136, 0.2)',
          }}
        >
          <div className="mb-8">
            <h1 
              className="text-3xl font-bold mb-2"
              style={{ 
                fontFamily: "'Orbitron', sans-serif",
                color: '#e0e0e0',
              }}
            >
              WELCOME BACK
            </h1>
            <p style={{ color: '#808080' }}>
              Sign in to continue to your dashboard
            </p>
          </div>

          {error && (
            <motion.div 
              className="mb-6 p-4"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-2">
                <span>⚠</span>
                <span>{error}</span>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label 
                className="block text-sm mb-2 tracking-wider"
                style={{ color: '#808080' }}
              >
                EMAIL
              </label>
              <div className="relative">
                <Mail 
                  className="absolute left-3 top-3.5 w-5 h-5" 
                  style={{ color: '#808080' }}
                />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 transition-all"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${errors.emailId ? '#ef4444' : 'rgba(128, 128, 128, 0.3)'}`,
                    color: '#e0e0e0',
                  }}
                  {...register('emailId')}
                  onFocus={(e) => e.target.style.borderColor = '#00ff88'}
                  onBlur={(e) => e.target.style.borderColor = errors.emailId ? '#ef4444' : 'rgba(128, 128, 128, 0.3)'}
                />
              </div>
              {errors.emailId && (
                <motion.span 
                  className="text-xs mt-1 flex items-center gap-1"
                  style={{ color: '#ef4444' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {errors.emailId.message}
                </motion.span>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label 
                className="block text-sm mb-2 tracking-wider"
                style={{ color: '#808080' }}
              >
                PASSWORD
              </label>
              <div className="relative">
                <Lock 
                  className="absolute left-3 top-3.5 w-5 h-5" 
                  style={{ color: '#808080' }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 transition-all"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${errors.password ? '#ef4444' : 'rgba(128, 128, 128, 0.3)'}`,
                    color: '#e0e0e0',
                  }}
                  {...register('password')}
                  onFocus={(e) => e.target.style.borderColor = '#00ff88'}
                  onBlur={(e) => e.target.style.borderColor = errors.password ? '#ef4444' : 'rgba(128, 128, 128, 0.3)'}
                />
                <motion.button
                  type="button"
                  className="absolute right-3 top-3"
                  onClick={() => setShowPassword(!showPassword)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  style={{ color: '#808080' }}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </motion.button>
              </div>
              {errors.password && (
                <motion.span 
                  className="text-xs mt-1 flex items-center gap-1"
                  style={{ color: '#ef4444' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {errors.password.message}
                </motion.span>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 font-bold tracking-wider transition-all disabled:opacity-50 relative overflow-hidden group"
                style={{ 
                  backgroundColor: '#00ff88',
                  color: '#0a0a0f',
                }}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative flex items-center justify-center gap-2" style={{ zIndex: 10 }}>
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-[#0a0a0f] border-t-transparent rounded-full"
                      />
                      SIGNING IN...
                    </>
                  ) : (
                    <>
                      SIGN IN
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </span>
                <div 
                  className="absolute inset-0 translate-x-full group-hover:translate-x-0 transition-transform duration-300" 
                  style={{ backgroundColor: '#00cc6f' }}
                />
              </motion.button>
            </motion.div>
          </form>

          <motion.div 
            className="mt-8 pt-6 text-center"
            style={{ borderTop: '1px solid rgba(128, 128, 128, 0.2)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <p style={{ color: '#808080' }}>
              Don't have an account?{' '}
              <NavLink 
                to="/signup"
                style={{ color: '#00ff88', fontWeight: 600 }}
                className="hover:underline"
              >
                Sign up
              </NavLink>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;