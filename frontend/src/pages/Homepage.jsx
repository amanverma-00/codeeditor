import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code, 
  Trophy, 
  Target, 
  Search, 
  CheckCircle,
  User,
  LogOut,
  Settings,
  Award,
  Flame,
  Tag,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowRight
} from 'lucide-react';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';

function Homepage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [userStreak, setUserStreak] = useState(0);
  const [openTagDropdowns, setOpenTagDropdowns] = useState({});
  const problemsPerPage = 20;

  const [stats, setStats] = useState({
    solved: 0,
    total: 0,
    easy: 0,
    medium: 0,
    hard: 0,
    streak: 0
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !user) {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/getAllProblem');
        setProblems(data);
      } catch (error) {
        console.error('Error fetching problems:', error);
        if (error.response?.status === 401) {
          console.log('Authentication failed, redirecting to login');
          dispatch(logoutUser());
          navigate('/login');
        }
      }
    };

    const fetchSolvedProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/problemSolvedByUser');
        setSolvedProblems(data);
      } catch (error) {
        console.error('Error fetching solved problems:', error);
        if (error.response?.status === 401) {
          console.log('Authentication failed, redirecting to login');
          dispatch(logoutUser());
          navigate('/login');
        }
      }
    };

    const fetchUserStreak = async () => {
      try {
        const { data } = await axiosClient.get('/user/streak');
        setUserStreak(data.currentStreak || 0);
      } catch (error) {
        console.error('Error fetching user streak:', error);
        if (error.response?.status === 401) {
          console.log('Authentication failed, redirecting to login');
          dispatch(logoutUser());
          navigate('/login');
        } else {
          setUserStreak(0);
        }
      }
    };

    // Only fetch data if user is authenticated
    if (isAuthenticated && user) {
      fetchProblems();
      fetchSolvedProblems();
      fetchUserStreak();
    }
  }, [user, isAuthenticated]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]);
    navigate('/');
  };

  const filteredProblems = problems.filter(problem => {
    const difficultyMatch = selectedDifficulty === 'all' || problem.difficulty === selectedDifficulty;
    
    const problemTags = Array.isArray(problem.tags) 
      ? problem.tags 
      : (typeof problem.tags === 'string' 
          ? problem.tags.split(',').map(tag => tag.trim()) 
          : []);
    const tagMatch = selectedTag === 'all' || problemTags.includes(selectedTag);
    
    const searchMatch = !searchQuery || problem.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    return difficultyMatch && tagMatch && searchMatch;
  });

  const indexOfLastProblem = currentPage * problemsPerPage;
  const indexOfFirstProblem = indexOfLastProblem - problemsPerPage;
  const currentProblems = filteredProblems.slice(indexOfFirstProblem, indexOfLastProblem);
  const totalPages = Math.ceil(filteredProblems.length / problemsPerPage);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/20 border-green-500/50 text-green-400';
      case 'medium': return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400';
      case 'hard': return 'bg-red-500/20 border-red-500/50 text-red-400';
      default: return 'bg-gray-500/20 border-gray-500/50 text-gray-400';
    }
  };

  useEffect(() => {
    const easy = solvedProblems.filter(p => p.difficulty === 'easy').length;
    const medium = solvedProblems.filter(p => p.difficulty === 'medium').length;
    const hard = solvedProblems.filter(p => p.difficulty === 'hard').length;
    
    setStats({
      solved: solvedProblems.length,
      total: problems.length,
      easy,
      medium,
      hard,
      streak: userStreak
    });
  }, [problems, solvedProblems, userStreak]);

  const uniqueTags = [...new Set(problems.flatMap(p => {
    if (Array.isArray(p.tags)) return p.tags;
    if (typeof p.tags === 'string') return p.tags.split(',').map(tag => tag.trim());
    return [];
  }))].filter(Boolean);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showTagDropdown && !e.target.closest('.tag-dropdown-container')) {
        setShowTagDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showTagDropdown]);

  const parseTagsToArray = (tags) => {
    if (Array.isArray(tags)) return tags;
    if (typeof tags === 'string') {
      
      return tags.split(',').map(tag => tag.trim()).filter(Boolean);
    }
    return [];
  };

  const TagDropdown = ({ problem, index }) => {
    try {
      const tags = parseTags(problem.tags);
      const isOpen = openTagDropdowns[index];

      const handleDropdownClick = (e) => {
        e.stopPropagation();
        setOpenTagDropdowns(prev => ({
          ...prev,
          [index]: !prev[index]
        }));
      };

      const handleTagClick = (tag, e) => {
        e.stopPropagation();
        setSelectedTag(tag);
        setOpenTagDropdowns({});
      };

      if (!tags || tags.length === 0) {
        return (
          <span 
            className="inline-flex px-3 py-1 text-sm font-medium rounded-full"
            style={{
              backgroundColor: 'rgba(128, 128, 128, 0.1)',
              color: '#808080',
            }}
          >
            No tags
          </span>
        );
      }

      if (tags.length === 1) {
        return (
          <motion.button
            onClick={(e) => handleTagClick(tags[0], e)}
            className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full transition-all"
            style={{
              backgroundColor: 'rgba(0, 255, 136, 0.1)',
              border: '1px solid rgba(0, 255, 136, 0.3)',
              color: '#00ff88',
            }}
            whileHover={{ 
              scale: 1.05,
              backgroundColor: 'rgba(0, 255, 136, 0.2)',
            }}
            whileTap={{ scale: 0.95 }}
          >
            {tags[0]}
          </motion.button>
        );
      }

      return (
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <motion.button
            onClick={handleDropdownClick}
            className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full transition-all space-x-1"
            style={{
              backgroundColor: 'rgba(0, 255, 136, 0.1)',
              border: '1px solid rgba(0, 255, 136, 0.3)',
              color: '#00ff88',
            }}
            whileHover={{ 
              scale: 1.05,
              backgroundColor: 'rgba(0, 255, 136, 0.2)',
            }}
            whileTap={{ scale: 0.95 }}
          >
            <span>{tags.length} tags</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`} />
          </motion.button>
          
          <AnimatePresence>
            {isOpen && (
              <motion.div
                className="absolute top-full left-0 mt-1 rounded-lg shadow-xl z-[100] min-w-32"
                style={{
                  backgroundColor: 'rgba(10, 10, 15, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(0, 255, 136, 0.2)',
                }}
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <div className="p-1">
                  {tags.map((tag, tagIndex) => (
                    <motion.button
                      key={tagIndex}
                      onClick={(e) => handleTagClick(tag, e)}
                      className="w-full text-left px-3 py-2 rounded-md transition-all block"
                      style={{ color: '#e0e0e0' }}
                      whileHover={{ 
                        backgroundColor: 'rgba(0, 255, 136, 0.1)',
                        color: '#00ff88'
                      }}
                    >
                      {tag}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    } catch (error) {
      console.error('Error in TagDropdown:', error);
      return (
        <span 
          className="inline-flex px-3 py-1 text-sm font-medium rounded-full"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            color: '#ef4444',
          }}
        >
          Error
        </span>
      );
    }
  };

  return (
    <div 
      className="min-h-screen text-[#e0e0e0] overflow-hidden relative"
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

      {/* Header */}
      <motion.header 
        className="sticky top-0 px-8 py-6"
        style={{ 
          zIndex: 40,
          backgroundColor: 'rgba(10, 10, 15, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 255, 136, 0.1)',
        }}
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
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #00ff88 0%, #00cc70 100%)',
              }}
            >
              <Code className="w-6 h-6" style={{ color: '#0a0a0f' }} />
            </div>
            <span 
              className="text-2xl font-bold"
              style={{ 
                fontFamily: "'Orbitron', sans-serif",
                color: '#e0e0e0',
              }}
            >
              CODEOPS
            </span>
          </motion.div>

          <div className="flex items-center gap-4">
            {/* Streak Display */}
            <motion.div
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 136, 0, 0.1) 0%, rgba(255, 68, 68, 0.1) 100%)',
                border: '1px solid rgba(255, 136, 0, 0.3)',
              }}
              whileHover={{ scale: 1.05 }}
            >
              <Flame className="w-4 h-4" style={{ color: '#ff8800' }} />
              <span className="font-bold" style={{ color: '#ff8800' }}>{stats.streak}</span>
              <span className="text-sm" style={{ color: '#808080' }}>Day Streak</span>
            </motion.div>

            {/* Admin Button */}
            {user?.role === 'admin' && (
              <motion.button
                onClick={() => navigate('/admin')}
                className="p-2 rounded-lg transition-all"
                style={{
                  color: '#808080',
                  backgroundColor: 'rgba(128, 128, 128, 0.1)',
                }}
                whileHover={{ 
                  scale: 1.1,
                  backgroundColor: 'rgba(0, 255, 136, 0.1)',
                  color: '#00ff88'
                }}
                whileTap={{ scale: 0.9 }}
              >
                <Settings className="w-5 h-5" />
              </motion.button>
            )}

            {/* User Profile */}
            <motion.div 
              className="flex items-center gap-3 px-4 py-2 rounded-full cursor-pointer"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(128, 128, 128, 0.3)',
              }}
              whileHover={{ 
                scale: 1.02,
                borderColor: 'rgba(0, 255, 136, 0.5)',
              }}
              onClick={() => navigate('/profile')}
            >
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #00ff88 0%, #00cc70 100%)',
                }}
              >
                <User className="w-4 h-4" style={{ color: '#0a0a0f' }} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold" style={{ color: '#e0e0e0' }}>
                  {user?.firstName || 'User'}
                </span>
                <span className="text-xs" style={{ color: '#808080' }}>
                  {stats.solved} solved
                </span>
              </div>
              <motion.button
                onClick={handleLogout}
                className="p-1 transition-colors"
                style={{ color: '#ef4444' }}
                whileHover={{ scale: 1.1, color: '#dc2626' }}
                whileTap={{ scale: 0.9 }}
              >
                <LogOut className="w-4 h-4" />
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-6 py-8 relative" style={{ zIndex: 1 }}>
        {/* Stats Cards */}
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <motion.div
                  className="p-6 rounded-2xl"
                  style={{
                    backgroundColor: 'rgba(10, 10, 15, 0.8)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(0, 255, 136, 0.2)',
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    borderColor: 'rgba(0, 255, 136, 0.5)',
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <Trophy className="w-8 h-8" style={{ color: '#fbbf24' }} />
                    <span className="text-2xl font-bold" style={{ color: '#e0e0e0' }}>
                      {stats.solved}
                    </span>
                  </div>
                  <p className="font-medium" style={{ color: '#e0e0e0' }}>Problems Solved</p>
                  <div className="mt-2 text-sm" style={{ color: '#808080' }}>
                    Total: {stats.total}
                  </div>
                </motion.div>

                <motion.div
                  className="p-6 rounded-2xl"
                  style={{
                    backgroundColor: 'rgba(10, 10, 15, 0.8)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    borderColor: 'rgba(34, 197, 94, 0.5)',
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#22c55e' }}
                    >
                      <CheckCircle className="w-4 h-4" style={{ color: '#0a0a0f' }} />
                    </div>
                    <span className="text-2xl font-bold" style={{ color: '#22c55e' }}>
                      {stats.easy}
                    </span>
                  </div>
                  <p className="font-medium" style={{ color: '#e0e0e0' }}>Easy</p>
                  <div className="mt-2 text-sm" style={{ color: '#808080' }}>
                    {problems.filter(p => p.difficulty === 'easy').length} total
                  </div>
                </motion.div>

                <motion.div
                  className="p-6 rounded-2xl"
                  style={{
                    backgroundColor: 'rgba(10, 10, 15, 0.8)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(234, 179, 8, 0.2)',
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    borderColor: 'rgba(234, 179, 8, 0.5)',
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#eab308' }}
                    >
                      <Target className="w-4 h-4" style={{ color: '#0a0a0f' }} />
                    </div>
                    <span className="text-2xl font-bold" style={{ color: '#eab308' }}>
                      {stats.medium}
                    </span>
                  </div>
                  <p className="font-medium" style={{ color: '#e0e0e0' }}>Medium</p>
                  <div className="mt-2 text-sm" style={{ color: '#808080' }}>
                    {problems.filter(p => p.difficulty === 'medium').length} total
                  </div>
                </motion.div>

                <motion.div
                  className="p-6 rounded-2xl"
                  style={{
                    backgroundColor: 'rgba(10, 10, 15, 0.8)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    borderColor: 'rgba(239, 68, 68, 0.5)',
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#ef4444' }}
                    >
                      <Award className="w-4 h-4" style={{ color: '#0a0a0f' }} />
                    </div>
                    <span className="text-2xl font-bold" style={{ color: '#ef4444' }}>
                      {stats.hard}
                    </span>
                  </div>
                  <p className="font-medium" style={{ color: '#e0e0e0' }}>Hard</p>
                  <div className="mt-2 text-sm" style={{ color: '#808080' }}>
                    {problems.filter(p => p.difficulty === 'hard').length} total
                  </div>
                </motion.div>
              </motion.div>              {/* Filters */}
              <motion.div
                className="p-6 rounded-2xl mb-8 relative"
                style={{
                  backgroundColor: 'rgba(10, 10, 15, 0.8)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(0, 255, 136, 0.2)',
                  zIndex: 10,
                }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="flex flex-wrap items-center gap-4">
                  {/* Search */}
                  <div className="relative flex-1 min-w-[300px]">
                    <Search 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" 
                      style={{ color: '#808080' }}
                    />
                    <input
                      type="text"
                      placeholder="Search problems..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 transition-all outline-none"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(128, 128, 128, 0.3)',
                        borderRadius: '0.5rem',
                        color: '#e0e0e0',
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#00ff88'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(128, 128, 128, 0.3)'}
                    />
                  </div>

                  {/* Tag Filter */}
                  <div className="relative tag-dropdown-container" style={{ zIndex: 100 }}>
                    <motion.button
                      onClick={() => setShowTagDropdown(!showTagDropdown)}
                      className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all"
                      style={{
                        backgroundColor: 'rgba(0, 255, 136, 0.1)',
                        border: '1px solid rgba(0, 255, 136, 0.3)',
                        color: '#00ff88',
                      }}
                      whileHover={{ 
                        scale: 1.05,
                        backgroundColor: 'rgba(0, 255, 136, 0.2)',
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Tag className="w-4 h-4" />
                      <span>{selectedTag === 'all' ? 'All Tags' : selectedTag}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${showTagDropdown ? 'rotate-180' : ''}`} />
                    </motion.button>

                    <AnimatePresence>
                      {showTagDropdown && (
                        <motion.div
                          className="absolute top-full left-0 mt-2 rounded-lg shadow-xl min-w-48 max-h-96 overflow-y-auto"
                          style={{
                            backgroundColor: 'rgba(10, 10, 15, 0.98)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(0, 255, 136, 0.3)',
                            zIndex: 1000,
                          }}
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="p-2">
                            <motion.button
                              onClick={() => { setSelectedTag('all'); setShowTagDropdown(false); }}
                              className="w-full text-left px-3 py-2 rounded-md transition-all"
                              style={{ 
                                color: '#e0e0e0',
                                backgroundColor: selectedTag === 'all' ? 'rgba(0, 255, 136, 0.2)' : 'transparent',
                              }}
                              whileHover={{ 
                                backgroundColor: 'rgba(0, 255, 136, 0.1)',
                                color: '#00ff88'
                              }}
                            >
                              All Tags
                            </motion.button>
                            {uniqueTags.map(tag => (
                              <motion.button
                                key={tag}
                                onClick={() => { setSelectedTag(tag); setShowTagDropdown(false); }}
                                className="w-full text-left px-3 py-2 rounded-md transition-all"
                                style={{ 
                                  color: '#e0e0e0',
                                  backgroundColor: selectedTag === tag ? 'rgba(0, 255, 136, 0.2)' : 'transparent',
                                }}
                                whileHover={{ 
                                  backgroundColor: 'rgba(0, 255, 136, 0.1)',
                                  color: '#00ff88'
                                }}
                              >
                                {tag}
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Difficulty Filter */}
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="px-4 py-3 rounded-lg outline-none cursor-pointer transition-all"
                    style={{
                      backgroundColor: 'rgba(0, 255, 136, 0.1)',
                      border: '1px solid rgba(0, 255, 136, 0.3)',
                      color: '#00ff88',
                    }}
                  >
                    <option value="all" style={{ backgroundColor: '#0a0a0f', color: '#e0e0e0' }}>All Difficulties</option>
                    <option value="easy" style={{ backgroundColor: '#0a0a0f', color: '#4ade80' }}>Easy</option>
                    <option value="medium" style={{ backgroundColor: '#0a0a0f', color: '#fbbf24' }}>Medium</option>
                    <option value="hard" style={{ backgroundColor: '#0a0a0f', color: '#ef4444' }}>Hard</option>
                  </select>

                  <div className="text-sm font-medium ml-auto" style={{ color: '#808080' }}>
                    {filteredProblems.length} problems found
                  </div>
                </div>
              </motion.div>              {/* Problems Table */}
              <motion.div
                className="rounded-2xl overflow-hidden relative"
                style={{
                  backgroundColor: 'rgba(10, 10, 15, 0.8)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(0, 255, 136, 0.2)',
                  zIndex: 1,
                }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead 
                      style={{
                        backgroundColor: 'rgba(0, 255, 136, 0.05)',
                        borderBottom: '1px solid rgba(0, 255, 136, 0.2)',
                      }}
                    >
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#e0e0e0' }}>
                          #
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#e0e0e0' }}>
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#e0e0e0' }}>
                          Title
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#e0e0e0' }}>
                          Difficulty
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#e0e0e0' }}>
                          Tags
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentProblems.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center">
                            <div style={{ color: '#808080' }}>
                              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                              <p className="text-lg">No problems found</p>
                              <p className="text-sm">Try adjusting your search or filters</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        currentProblems.map((problem, index) => {
                          const isSolved = solvedProblems.some(sp => sp._id === problem._id);
                          const globalIndex = indexOfFirstProblem + index + 1;
                          return (
                            <motion.tr
                              key={problem._id}
                              className="transition-all duration-200"
                              style={{
                                borderBottom: '1px solid rgba(128, 128, 128, 0.1)',
                              }}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                              whileHover={{ backgroundColor: 'rgba(0, 255, 136, 0.05)' }}
                            >
                              <td className="px-6 py-4">
                                <span className="font-medium" style={{ color: '#808080' }}>
                                  {globalIndex}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <motion.div
                                  initial={false}
                                  animate={{ scale: isSolved ? 1.1 : 1 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                >
                                  {isSolved ? (
                                    <CheckCircle className="w-6 h-6" style={{ color: '#22c55e' }} />
                                  ) : (
                                    <div 
                                      className="w-6 h-6 rounded-full"
                                      style={{ border: '2px solid #808080' }}
                                    ></div>
                                  )}
                                </motion.div>
                              </td>
                              <td className="px-6 py-4">
                                <NavLink
                                  to={`/problem/${problem._id}`}
                                  className="font-medium hover:underline transition-colors inline-flex items-center gap-2 group"
                                  style={{ color: '#00ff88' }}
                                >
                                  {problem.title}
                                  <ArrowRight 
                                    className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" 
                                  />
                                </NavLink>
                              </td>
                              <td className="px-6 py-4">
                                <span 
                                  className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getDifficultyColor(problem.difficulty)}`}
                                >
                                  {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <TagDropdown problem={problem} index={index} />
                              </td>
                            </motion.tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>                {/* Pagination */}
                {totalPages > 1 && (
                  <motion.div
                    className="px-6 py-4"
                    style={{
                      borderTop: '1px solid rgba(0, 255, 136, 0.2)',
                      backgroundColor: 'rgba(0, 255, 136, 0.05)',
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm" style={{ color: '#808080' }}>
                        Showing {indexOfFirstProblem + 1} to {Math.min(indexOfLastProblem, filteredProblems.length)} of {filteredProblems.length} problems
                      </div>
                      <div className="flex items-center gap-2">
                        <motion.button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="flex items-center px-3 py-2 text-sm rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            border: '1px solid rgba(128, 128, 128, 0.3)',
                            color: '#e0e0e0',
                            backgroundColor: currentPage === 1 ? 'transparent' : 'rgba(0, 255, 136, 0.1)',
                          }}
                          whileHover={{ 
                            scale: currentPage === 1 ? 1 : 1.05,
                            backgroundColor: currentPage === 1 ? 'transparent' : 'rgba(0, 255, 136, 0.2)',
                          }}
                          whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
                        >
                          <ChevronLeft className="w-4 h-4 mr-1" />
                          Previous
                        </motion.button>
                        
                        <span className="text-sm px-4" style={{ color: '#808080' }}>
                          Page {currentPage} of {totalPages}
                        </span>
                        
                        <motion.button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="flex items-center px-3 py-2 text-sm rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            border: '1px solid rgba(128, 128, 128, 0.3)',
                            color: '#e0e0e0',
                            backgroundColor: currentPage === totalPages ? 'transparent' : 'rgba(0, 255, 136, 0.1)',
                          }}
                          whileHover={{ 
                            scale: currentPage === totalPages ? 1 : 1.05,
                            backgroundColor: currentPage === totalPages ? 'transparent' : 'rgba(0, 255, 136, 0.2)',
                          }}
                          whileTap={{ scale: currentPage === totalPages ? 1 : 0.95 }}
                        >
                          Next
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
      </div>
    </div>
  );
}

export default Homepage;