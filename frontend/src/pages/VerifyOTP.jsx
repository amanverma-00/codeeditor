import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { verifyOTP, resendOTP } from '../authSlice';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, RefreshCw, CheckCircle } from 'lucide-react';

function VerifyOTP() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isHovering, setIsHovering] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSuccess, setResendSuccess] = useState(false);
  const inputRefs = useRef([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const emailId = location.state?.emailId || '';
  const userId = location.state?.userId || '';

  useEffect(() => {
    if (!emailId) {
      navigate('/signup');
    }
  }, [emailId, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);
    
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length === 6) {
      dispatch(verifyOTP({ emailId, otp: otpString }));
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    
    setResendSuccess(false);
    const result = await dispatch(resendOTP({ emailId }));
    
    if (result.type === 'auth/resendOTP/fulfilled') {
      setResendCooldown(60);
      setResendSuccess(true);
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => setResendSuccess(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden relative flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
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
      </div>

      <motion.div 
        className="absolute top-6 left-6 z-10"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div 
          className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent cursor-pointer"
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate('/')}
        >
          CodeOps
        </motion.div>
      </motion.div>

      <motion.div 
        className="relative z-10 w-full max-w-md"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
          <motion.div 
            className="text-center mb-8"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-purple-500/20 border border-purple-500/30">
                <Mail className="h-8 w-8 text-purple-400" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-2">
              Verify Your Email
            </h1>
            <p className="text-white/70">
              We've sent a 6-digit code to
            </p>
            <p className="text-purple-400 font-semibold mt-1">
              {emailId}
            </p>
          </motion.div>

          {error && (
            <motion.div 
              className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          {resendSuccess && (
            <motion.div 
              className="mb-6 p-4 rounded-lg bg-green-500/20 border border-green-500/30 text-green-200 flex items-center gap-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <CheckCircle className="h-5 w-5" />
              OTP sent successfully!
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <label className="block text-sm font-medium text-white/80 mb-4 text-center">
                Enter 6-digit code
              </label>
              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <motion.input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-12 text-center text-2xl font-bold bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                    whileFocus={{ scale: 1.1 }}
                    autoFocus={index === 0}
                  />
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <motion.button
                type="submit"
                disabled={loading || otp.join('').length !== 6}
                className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold text-white flex items-center justify-center gap-2 hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: loading ? 1 : 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <>
                    <motion.div 
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify Email
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
          </form>

          <motion.div 
            className="text-center mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <p className="text-white/60 mb-3">
              Didn't receive the code?
            </p>
            <motion.button
              onClick={handleResendOTP}
              disabled={resendCooldown > 0}
              className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: resendCooldown > 0 ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className={`w-4 h-4 ${resendCooldown > 0 ? '' : 'hover:rotate-180 transition-transform duration-500'}`} />
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
            </motion.button>
          </motion.div>

          <motion.div 
            className="text-center mt-8 pt-6 border-t border-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <p className="text-white/60">
              Wrong email?{' '}
              <NavLink 
                to="/signup" 
                className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
              >
                Go Back
              </NavLink>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default VerifyOTP;
