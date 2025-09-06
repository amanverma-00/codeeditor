import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code, 
  Trophy, 
  Target, 
  Search, 
  Filter,
  CheckCircle,
  User,
  LogOut,
  Settings,
  BarChart3,
  BookOpen,
  Calendar,
  Award,
  Compass,
  Zap,
  Medal,
  Flame,
  Tag,
  ChevronLeft,
  ChevronRight,
  ChevronDown
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
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [userStreak, setUserStreak] = useState(0);
  const [openTagDropdowns, setOpenTagDropdowns] = useState({});
  const problemsPerPage = 20;
  const [activeTab, setActiveTab] = useState('problems');

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

    fetchProblems();
    if (user) {
      fetchSolvedProblems();
      fetchUserStreak();
    }
  }, [user]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]);
    navigate('/');
  };

  const filteredProblems = problems.filter(problem => {
    const difficultyMatch = selectedDifficulty === 'all' || problem.difficulty === selectedDifficulty;
    const tagMatch = selectedTag === 'all' || problem.tags === selectedTag;
    const searchMatch = searchQuery === '' || 
      problem.title.toLowerCase().includes(searchQuery.toLowerCase());
    return difficultyMatch && tagMatch && searchMatch;
  });

  const indexOfLastProblem = currentPage * problemsPerPage;
  const indexOfFirstProblem = indexOfLastProblem - problemsPerPage;
  const currentProblems = filteredProblems.slice(indexOfFirstProblem, indexOfLastProblem);
  const totalPages = Math.ceil(filteredProblems.length / problemsPerPage);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getDifficultyBadgeColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    solved: solvedProblems.length,
    total: problems.length,
    easy: solvedProblems.filter(p => p.difficulty === 'easy').length,
    medium: solvedProblems.filter(p => p.difficulty === 'medium').length,
    hard: solvedProblems.filter(p => p.difficulty === 'hard').length,
    streak: userStreak 
  };

  const uniqueTags = [...new Set(problems.map(p => p.tags))].filter(Boolean);

  const difficultyColors = {
    easy: 'text-green-400 bg-green-900/50 border-green-500/50',
    medium: 'text-yellow-400 bg-yellow-900/50 border-yellow-500/50',
    hard: 'text-red-400 bg-red-900/50 border-red-500/50'
  };

  const toggleTagDropdown = (problemId) => {
    setOpenTagDropdowns(prev => ({
      ...prev,
      [problemId]: !prev[problemId]
    }));
  };

  const closeAllTagDropdowns = () => {
    setOpenTagDropdowns({});
  };

  useEffect(() => {
    const handleClickOutside = () => {
      closeAllTagDropdowns();
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const parseTagsToArray = (tags) => {
    if (Array.isArray(tags)) return tags;
    if (typeof tags === 'string') {
      
      return tags.split(',').map(tag => tag.trim()).filter(Boolean);
    }
    return [];
  };

  const TagDropdown = ({ problem, index }) => {
    try {
      if (!problem || !problem._id) {
        return (
          <span className="inline-flex px-3 py-1 text-sm font-medium bg-gray-700 text-gray-400 rounded-full">
            No data
          </span>
        );
      }

      const tags = parseTagsToArray(problem.tags);
      const isOpen = openTagDropdowns?.[problem._id] || false;

      const handleDropdownClick = (e) => {
        e.stopPropagation();
        toggleTagDropdown(problem._id);
      };

      const handleTagClick = (tag, e) => {
        e.stopPropagation();
        setSelectedTag(tag);
        closeAllTagDropdowns();
      };

      if (tags.length === 0) {
        return (
          <span className="inline-flex px-3 py-1 text-sm font-medium bg-gray-700 text-gray-400 rounded-full">
            No tags
          </span>
        );
      }

      if (tags.length === 1) {
        return (
          <button
            onClick={(e) => handleTagClick(tags[0], e)}
            className="inline-flex px-3 py-1 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors cursor-pointer"
          >
            {tags[0]}
          </button>
        );
      }

      return (
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={handleDropdownClick}
            className="inline-flex items-center px-3 py-1 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors cursor-pointer space-x-1"
          >
            <span>{tags.length} tags</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`} />
          </button>
          
          <AnimatePresence>
            {isOpen && (
              <motion.div
                className="absolute top-full left-0 mt-1 bg-gray-800 rounded-lg shadow-xl border border-gray-600 z-[100] min-w-32"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <div className="p-1">
                  {tags.map((tag, tagIndex) => (
                    <button
                      key={tagIndex}
                      onClick={(e) => handleTagClick(tag, e)}
                      className="w-full text-left px-3 py-2 rounded-md transition-colors text-gray-200 hover:bg-gray-700 block"
                    >
                      {tag}
                    </button>
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
        <span className="inline-flex px-3 py-1 text-sm font-medium bg-red-700 text-red-200 rounded-full">
          Error
        </span>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900"><motion.header 
        className="bg-gray-800/80 backdrop-blur-lg shadow-lg border-b border-gray-700/50 sticky top-0 z-50"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between"><div className="flex items-center space-x-6"><motion.div 
                className="flex items-center space-x-3"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Code className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  CodeOps
                </span>
              </motion.div><div className="flex items-center space-x-2">
                <motion.button
                  onClick={() => setActiveTab('problems')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    activeTab === 'problems'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-blue-600/20 hover:text-blue-400'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <BookOpen className="w-4 h-4 inline mr-2" />
                  Problems
                </motion.button>
                
                <motion.button
                  onClick={() => setActiveTab('explore')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    activeTab === 'explore'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-purple-600/20 hover:text-purple-400'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Compass className="w-4 h-4 inline mr-2" />
                  Explore
                </motion.button>
                
                <motion.button
                  onClick={() => setActiveTab('contest')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    activeTab === 'contest'
                      ? 'bg-orange-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-orange-600/20 hover:text-orange-400'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Medal className="w-4 h-4 inline mr-2" />
                  Contest
                </motion.button>
              </div>
            </div><div className="flex items-center space-x-4"><motion.div
                className="flex items-center space-x-2 bg-gradient-to-r from-orange-400 to-red-500 text-white px-4 py-2 rounded-full shadow-lg"
                whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)" }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Flame className="w-4 h-4" />
                <span className="font-bold">{stats.streak}</span>
                <span className="text-sm">Day Streak</span>
              </motion.div>{user?.role === 'admin' && (
                <motion.button
                  onClick={() => navigate('/admin')}
                  className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Settings className="w-5 h-5" />
                </motion.button>
              )}<motion.div 
                className="flex items-center space-x-3 bg-gray-700/50 backdrop-blur-sm border border-gray-600 rounded-full px-4 py-2 shadow-lg cursor-pointer"
                whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)" }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                onClick={() => navigate('/profile')}
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white">{user?.firstName || 'User'}</span>
                  <span className="text-xs text-gray-300">{stats.solved} solved</span>
                </div>
                <motion.button
                  onClick={handleLogout}
                  className="p-1 text-red-500 hover:text-red-700 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <LogOut className="w-4 h-4" />
                </motion.button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header><div className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'problems' && (
            <motion.div
              key="problems"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            ><motion.div 
                className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <motion.div
                  className="bg-gray-800/70 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-xl"
                  whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <Trophy className="w-8 h-8 text-yellow-400" />
                    <span className="text-2xl font-bold text-white">{stats.solved}</span>
                  </div>
                  <p className="text-gray-300 font-medium">Problems Solved</p>
                  <div className="mt-2 text-sm text-gray-400">Total: {stats.total}</div>
                </motion.div>

                <motion.div
                  className="bg-gray-800/70 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-xl"
                  whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-green-400">{stats.easy}</span>
                  </div>
                  <p className="text-gray-300 font-medium">Easy</p>
                  <div className="mt-2 text-sm text-gray-400">{problems.filter(p => p.difficulty === 'easy').length} total</div>
                </motion.div>

                <motion.div
                  className="bg-gray-800/70 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-xl"
                  whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Target className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-yellow-400">{stats.medium}</span>
                  </div>
                  <p className="text-gray-300 font-medium">Medium</p>
                  <div className="mt-2 text-sm text-gray-400">{problems.filter(p => p.difficulty === 'medium').length} total</div>
                </motion.div>

                <motion.div
                  className="bg-gray-800/70 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-xl"
                  whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <Award className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-red-400">{stats.hard}</span>
                  </div>
                  <p className="text-gray-300 font-medium">Hard</p>
                  <div className="mt-2 text-sm text-gray-400">{problems.filter(p => p.difficulty === 'hard').length} total</div>
                </motion.div>
              </motion.div><motion.div
                className="bg-gray-800/70 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-xl mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="flex flex-wrap items-center gap-4"><motion.button
                    onClick={() => setShowSearchBar(!showSearchBar)}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Search className="w-4 h-4" />
                    <span>Search Problems</span>
                  </motion.button><div className="relative">
                    <motion.button
                      onClick={() => setShowTagDropdown(!showTagDropdown)}
                      className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-purple-700 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Tag className="w-4 h-4" />
                      <span>{selectedTag === 'all' ? 'All Tags' : selectedTag}</span>
                    </motion.button><AnimatePresence>
                      {showTagDropdown && (
                        <motion.div
                          className="absolute top-full left-0 mt-2 bg-gray-800 rounded-lg shadow-xl border border-gray-600 z-50 min-w-48"
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="p-2">
                            <button
                              onClick={() => { setSelectedTag('all'); setShowTagDropdown(false); }}
                              className={`w-full text-left px-3 py-2 rounded-md transition-colors text-gray-200 ${
                                selectedTag === 'all' ? 'bg-purple-600 text-white' : 'hover:bg-gray-700'
                              }`}
                            >
                              All Tags
                            </button>
                            {uniqueTags.map(tag => (
                              <button
                                key={tag}
                                onClick={() => { setSelectedTag(tag); setShowTagDropdown(false); }}
                                className={`w-full text-left px-3 py-2 rounded-md transition-colors text-gray-200 ${
                                  selectedTag === tag ? 'bg-purple-600 text-white' : 'hover:bg-gray-700'
                                }`}
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div><select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="all">All Difficulties</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select><div className="text-gray-300 font-medium ml-auto">
                    {filteredProblems.length} problems found
                  </div>
                </div><AnimatePresence>
                  {showSearchBar && (
                    <motion.div
                      className="mt-4"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search problems by title..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-700 text-white placeholder-gray-400"
                          autoFocus
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div><motion.div
                className="bg-gray-800/70 backdrop-blur-lg rounded-2xl border border-gray-700/50 shadow-xl overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-700 to-gray-800 border-b border-gray-600">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">#</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Title</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Difficulty</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200">Tags</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentProblems.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center">
                            <div className="text-gray-400">
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
                              className="border-b border-gray-700 hover:bg-gray-700/50 transition-all duration-200"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                              whileHover={{ scale: 1.01 }}
                            >
                              <td className="px-6 py-4">
                                <span className="text-gray-300 font-medium">{globalIndex}</span>
                              </td>
                              <td className="px-6 py-4">
                                <motion.div
                                  initial={false}
                                  animate={{ scale: isSolved ? 1.1 : 1 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                >
                                  {isSolved ? (
                                    <CheckCircle className="w-6 h-6 text-green-500" />
                                  ) : (
                                    <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                                  )}
                                </motion.div>
                              </td>
                              <td className="px-6 py-4">
                                <NavLink
                                  to={`/problem/${problem._id}`}
                                  className="text-blue-400 hover:text-blue-300 font-medium hover:underline transition-colors"
                                >
                                  {problem.title}
                                </NavLink>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${
                                  difficultyColors[problem.difficulty] || 'text-gray-400 bg-gray-700 border-gray-600'
                                }`}>
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
                </div>{totalPages > 1 && (
                  <motion.div
                    className="px-6 py-4 border-t border-gray-600 bg-gradient-to-r from-gray-700 to-gray-800"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-300">
                        Showing {indexOfFirstProblem + 1} to {Math.min(indexOfLastProblem, filteredProblems.length)} of {filteredProblems.length} problems
                      </div>
                      <div className="flex items-center space-x-2">
                        <motion.button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="flex items-center px-3 py-2 text-sm border border-gray-600 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-300"
                          whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
                          whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
                        >
                          <ChevronLeft className="w-4 h-4 mr-1" />
                          Previous
                        </motion.button>
                        
                        <span className="text-sm text-gray-300 px-4">
                          Page {currentPage} of {totalPages}
                        </span>
                        
                        <motion.button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="flex items-center px-3 py-2 text-sm border border-gray-600 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-300"
                          whileHover={{ scale: currentPage === totalPages ? 1 : 1.05 }}
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
            </motion.div>
          )}

          {activeTab === 'explore' && (
            <motion.div
              key="explore"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center py-20"
            >
              <Compass className="w-16 h-16 text-purple-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">Explore Section</h2>
              <p className="text-gray-300 text-lg">Coming Soon! Discover new topics and learning paths.</p>
            </motion.div>
          )}

          {activeTab === 'contest' && (
            <motion.div
              key="contest"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center py-20"
            >
              <Medal className="w-16 h-16 text-orange-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">Contest Arena</h2>
              <p className="text-gray-300 text-lg">Coming Soon! Compete with other developers in coding contests.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Homepage;