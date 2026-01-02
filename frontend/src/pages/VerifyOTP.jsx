import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { verifyOTP, resendOTP } from '../authSlice';
import { motion } from 'framer-motion';
import { Mail, RefreshCw, CheckCircle, ArrowRight } from 'lucide-react';

function VerifyOTP() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
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
          <div className="mb-8 text-center">
            <motion.div
              className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(0, 255, 136, 0.1)', border: '2px solid #00ff88' }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <Mail className="w-8 h-8" style={{ color: '#00ff88' }} />
            </motion.div>
            <h1 
              className="text-3xl font-bold mb-2"
              style={{ 
                fontFamily: "'Orbitron', sans-serif",
                color: '#e0e0e0',
              }}
            >
              VERIFY EMAIL
            </h1>
            <p className="text-sm" style={{ color: '#808080' }}>
              Enter the 6-digit code sent to<br />
              <span style={{ color: '#00ff88' }}>{emailId}</span>
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

          {resendSuccess && (
            <motion.div 
              className="mb-6 p-4"
              style={{
                backgroundColor: 'rgba(0, 255, 136, 0.1)',
                border: '1px solid rgba(0, 255, 136, 0.3)',
                color: '#00ff88',
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>New code sent successfully!</span>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="flex justify-center gap-3 mb-8">
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
                  onPaste={handlePaste}
                  className="w-12 h-14 text-center text-2xl font-bold transition-all"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: `2px solid ${digit ? '#00ff88' : 'rgba(128, 128, 128, 0.3)'}`,
                    color: '#e0e0e0',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#00ff88'}
                  onBlur={(e) => e.target.style.borderColor = digit ? '#00ff88' : 'rgba(128, 128, 128, 0.3)'}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                />
              ))}
            </div>

            <motion.button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              className="w-full py-3.5 font-bold tracking-wider transition-all disabled:opacity-50 relative overflow-hidden group mb-6"
              style={{ 
                backgroundColor: '#00ff88',
                color: '#0a0a0f',
              }}
              whileHover={{ scale: loading || otp.join('').length !== 6 ? 1 : 1.02 }}
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
                    VERIFYING...
                  </>
                ) : (
                  <>
                    VERIFY CODE
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </span>
              <div 
                className="absolute inset-0 translate-x-full group-hover:translate-x-0 transition-transform duration-300" 
                style={{ backgroundColor: '#00cc6f' }}
              />
            </motion.button>

            <div className="text-center">
              <p className="text-sm mb-3" style={{ color: '#808080' }}>
                Didn't receive the code?
              </p>
              <motion.button
                type="button"
                onClick={handleResendOTP}
                disabled={resendCooldown > 0}
                className="text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
                style={{ color: resendCooldown > 0 ? '#808080' : '#00ff88' }}
                whileHover={{ scale: resendCooldown > 0 ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                {resendCooldown > 0 
                  ? `Resend in ${resendCooldown}s` 
                  : 'Resend Code'}
              </motion.button>
            </div>
          </form>

          <motion.div 
            className="mt-8 pt-6 text-center"
            style={{ borderTop: '1px solid rgba(128, 128, 128, 0.2)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p style={{ color: '#808080' }}>
              Wrong email?{' '}
              <NavLink 
                to="/signup"
                style={{ color: '#00ff88', fontWeight: 600 }}
                className="hover:underline"
              >
                Go back
              </NavLink>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
export default VerifyOTP;
