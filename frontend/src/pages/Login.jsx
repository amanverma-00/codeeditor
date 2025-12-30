import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router-dom';
import { loginUser } from "../authSlice";
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Mail, Lock } from 'lucide-react';

const loginSchema = z.object({
  emailId: z.string().email("Invalid Email"),
  password: z.string().min(8, "Password is too weak") 
});

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
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

  const onSubmit = async (data) => {
    const result = await dispatch(loginUser(data));
    
    // Check if login failed due to unverified email
    if (result.type === 'auth/login/rejected' && result.payload?.includes('verify')) {
      // Extract email from the form data and redirect to OTP verification
      navigate('/verify-otp', { 
        state: { 
          emailId: data.emailId 
        } 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden relative flex items-center justify-center p-4"><div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-30">
          {[...Array(30)].map((_, i) => (
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
        className="absolute top-6 left-6 z-10"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div 
          className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent cursor-pointer"
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate('/')}
          onHoverStart={() => setIsHovering(true)}
          onHoverEnd={() => setIsHovering(false)}
        >
          CodeOps
        </motion.div>
      </motion.div><motion.div 
        className="relative z-10 w-full max-w-md"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl"><motion.div 
            className="text-center mb-8"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-2">
              Welcome Back
            </h1>
            <p className="text-white/70">
              Sign in to continue your coding journey
            </p>
          </motion.div>{error && (
            <motion.div 
              className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6"><motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <label className="block text-sm font-medium text-white/80 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-white/40" />
                </div>
                <motion.input
                  type="email"
                  placeholder="john@example.com"
                  className={`w-full pl-10 pr-4 py-3 bg-white/10 border ${
                    errors.emailId ? 'border-red-400' : 'border-white/20'
                  } rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all`}
                  {...register('emailId')}
                  whileFocus={{ scale: 1.02 }}
                  onFocus={() => setIsHovering(true)}
                  onBlur={() => setIsHovering(false)}
                />
              </div>
              {errors.emailId && (
                <motion.span 
                  className="text-red-300 text-sm mt-1 block"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {errors.emailId.message}
                </motion.span>
              )}
            </motion.div><motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <label className="block text-sm font-medium text-white/80 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-white/40" />
                </div>
                <motion.input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-12 py-3 bg-white/10 border ${
                    errors.password ? 'border-red-400' : 'border-white/20'
                  } rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all`}
                  {...register('password')}
                  whileFocus={{ scale: 1.02 }}
                  onFocus={() => setIsHovering(true)}
                  onBlur={() => setIsHovering(false)}
                />
                <motion.button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white/60 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onHoverStart={() => setIsHovering(true)}
                  onHoverEnd={() => setIsHovering(false)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </motion.button>
              </div>
              {errors.password && (
                <motion.span 
                  className="text-red-300 text-sm mt-1 block"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {errors.password.message}
                </motion.span>
              )}
            </motion.div><motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold text-white flex items-center justify-center gap-2 hover:shadow-2xl transition-all disabled:opacity-50"
                whileHover={{ scale: loading ? 1 : 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onHoverStart={() => setIsHovering(true)}
                onHoverEnd={() => setIsHovering(false)}
              >
                {loading ? (
                  <>
                    <motion.div 
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </>
                )}
              </motion.button>
            </motion.div>
          </form><motion.div 
            className="text-center mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <p className="text-white/60">
              Don't have an account?{' '}
              <NavLink 
                to="/signup" 
                className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                Sign Up
              </NavLink>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;