import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  User,
  MapPin,
  Github,
  Linkedin,
  Edit3,
  Trophy,
  Calendar,
  Target,
  Award,
  ArrowLeft,
  Clock,
  Code,
  TrendingUp,
  CheckCircle,
  BarChart3
} from 'lucide-react';
import axiosClient from '../utils/axiosClient';

const UserProfile = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    bio: '',
    location: '',
    username: '',
    linkedinProfile: '',
    githubProfile: ''
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosClient.get('/user/profile');
      
      setProfileData(response.data);
      setEditForm({
        bio: response.data.user.bio || '',
        location: response.data.user.location || '',
        username: response.data.user.username || '',
        linkedinProfile: response.data.user.linkedinProfile || '',
        githubProfile: response.data.user.githubProfile || ''
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching profile:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
      }
      
      if (error.response?.status === 401) {
        setError('Authentication failed. Please log in again.');

      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Failed to load profile data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = async () => {
    try {
      await axiosClient.put('/user/profile', editForm);
      setEditMode(false);
      fetchUserProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getDifficultyBg = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/20 border-green-500/50';
      case 'medium': return 'bg-yellow-500/20 border-yellow-500/50';
      case 'hard': return 'bg-red-500/20 border-red-500/50';
      default: return 'bg-gray-500/20 border-gray-500/50';
    }
  };

  const generateContributionGraph = (contributionData) => {
    const weeks = [];
    let currentWeek = [];
    
    contributionData.forEach((day, index) => {
      const date = new Date(day.date);
      currentWeek.push(day);
      
      if (date.getDay() === 6 || index === contributionData.length - 1) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    });

    return weeks;
  };

  const getContributionIntensity = (count) => {
    if (count === 0) return 'bg-gray-800 border-gray-700';
    if (count <= 2) return 'bg-green-800 border-green-700';
    if (count <= 5) return 'bg-green-600 border-green-500';
    if (count <= 10) return 'bg-green-500 border-green-400';
    return 'bg-green-400 border-green-300';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex justify-center items-center">
        <div className="flex flex-col items-center space-y-4">
          <motion.div
            className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-gray-300 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex justify-center items-center">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-8 max-w-md">
          <div className="flex items-center space-x-3 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-red-300">Profile Load Error</h3>
          </div>
          <p className="text-red-200 mb-4">{error}</p>
          <div className="flex space-x-3">
            <button 
              onClick={fetchUserProfile}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              Retry
            </button>
            <button 
              onClick={() => navigate('/home')}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex justify-center items-center">
        <p className="text-red-400 text-lg">Error loading profile data</p>
      </div>
    );
  }

  const weeks = generateContributionGraph(profileData.contributionData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900"><motion.header 
        className="bg-gray-800/80 backdrop-blur-lg shadow-lg border-b border-gray-700/50 sticky top-0 z-50"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={() => navigate('/home')}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </motion.button>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <User className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Profile
              </span>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8"><motion.div 
            className="lg:col-span-1"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-gray-800/70 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-xl"><div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <User className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {profileData.user.firstName} {profileData.user.lastName}
                </h2>
                <p className="text-gray-400 mb-2">@{profileData.user.username}</p>
                <div className="flex items-center justify-center text-gray-400 text-sm mb-4">
                  <span className="bg-gray-700 px-2 py-1 rounded-full">
                    Rank #{Math.floor(Math.random() * 100000) + 50000}
                  </span>
                </div>
              </div><div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">About</h3>
                  <motion.button
                    onClick={() => setEditMode(!editMode)}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Edit3 className="w-4 h-4" />
                  </motion.button>
                </div>
                
                {editMode ? (
                  <div className="space-y-3">
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      rows="3"
                    />
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      placeholder="Location"
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      placeholder="Username"
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    <input
                      type="text"
                      value={editForm.linkedinProfile}
                      onChange={(e) => setEditForm({ ...editForm, linkedinProfile: e.target.value })}
                      placeholder="LinkedIn Profile"
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    <input
                      type="text"
                      value={editForm.githubProfile}
                      onChange={(e) => setEditForm({ ...editForm, githubProfile: e.target.value })}
                      placeholder="GitHub Profile"
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    <div className="flex gap-2">
                      <motion.button
                        onClick={handleEditProfile}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Save
                      </motion.button>
                      <motion.button
                        onClick={() => setEditMode(false)}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-gray-300 text-sm">
                      {profileData.user.bio || "No bio added yet."}
                    </p>
                    {profileData.user.location && (
                      <div className="flex items-center text-gray-400 text-sm">
                        <MapPin className="w-4 h-4 mr-2" />
                        {profileData.user.location}
                      </div>
                    )}
                    <div className="flex gap-3">
                      {profileData.user.githubProfile && (
                        <motion.a
                          href={profileData.user.githubProfile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-white transition-colors"
                          whileHover={{ scale: 1.1 }}
                        >
                          <Github className="w-5 h-5" />
                        </motion.a>
                      )}
                      {profileData.user.linkedinProfile && (
                        <motion.a
                          href={profileData.user.linkedinProfile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-white transition-colors"
                          whileHover={{ scale: 1.1 }}
                        >
                          <Linkedin className="w-5 h-5" />
                        </motion.a>
                      )}
                    </div>
                  </div>
                )}
              </div><div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Contest Rating</h3>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-400 mb-1">
                      {profileData.user.contestRating}
                    </div>
                    <div className="text-sm text-gray-400">Current Rating</div>
                  </div>
                </div>
              </div><div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Acceptance Rate</span>
                  <span className="text-green-400 font-semibold">{profileData.stats.acceptanceRate}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Total Submissions</span>
                  <span className="text-white font-semibold">{profileData.stats.totalSubmissions}</span>
                </div>
              </div>
            </div>
          </motion.div><motion.div 
            className="lg:col-span-3"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          ><div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"><motion.div
                className="bg-gray-800/70 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-xl"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 relative">
                    <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-gray-700"
                      />
                      <path
                        d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray={`${(profileData.stats.problemsSolved / profileData.stats.totalProblems) * 100}, 100`}
                        className="text-blue-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-white">
                        {profileData.stats.problemsSolved}/{profileData.stats.totalProblems}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Problems Solved</h3>
                  <p className="text-gray-400 text-sm">
                    {((profileData.stats.problemsSolved / profileData.stats.totalProblems) * 100).toFixed(1)}% Complete
                  </p>
                </div>
              </motion.div><motion.div
                className="bg-gray-800/70 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-xl"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <h3 className="text-lg font-semibold text-white mb-4">Difficulty Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-green-400 text-sm">Easy</span>
                    <span className="text-white font-semibold">
                      {profileData.stats.solvedByDifficulty.easy}/{profileData.stats.problemCounts.easy}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-yellow-400 text-sm">Medium</span>
                    <span className="text-white font-semibold">
                      {profileData.stats.solvedByDifficulty.medium}/{profileData.stats.problemCounts.medium}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-red-400 text-sm">Hard</span>
                    <span className="text-white font-semibold">
                      {profileData.stats.solvedByDifficulty.hard}/{profileData.stats.problemCounts.hard}
                    </span>
                  </div>
                </div>
              </motion.div><motion.div
                className="bg-gray-800/70 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-xl"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <h3 className="text-lg font-semibold text-white mb-4">Rating Trend</h3>
                <div className="h-24 flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Rating graph coming soon</p>
                  </div>
                </div>
              </motion.div>
            </div><motion.div
              className="bg-gray-800/70 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-xl mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Submission Activity</h3>
                <div className="text-sm text-gray-400">
                  {profileData.stats.acceptedSubmissions} submissions in the past year
                </div>
              </div><div className="overflow-x-auto">
                <div className="flex gap-1" style={{ minWidth: '800px' }}>
                  {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1">
                      {week.map((day, dayIndex) => (
                        <motion.div
                          key={`${weekIndex}-${dayIndex}`}
                          className={`w-3 h-3 rounded-sm border ${getContributionIntensity(day.count)}`}
                          whileHover={{ scale: 1.3 }}
                          title={`${day.date}: ${day.count} submissions`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4 text-xs text-gray-400">
                <span>Less</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-sm bg-gray-800 border border-gray-700"></div>
                  <div className="w-3 h-3 rounded-sm bg-green-800 border border-green-700"></div>
                  <div className="w-3 h-3 rounded-sm bg-green-600 border border-green-500"></div>
                  <div className="w-3 h-3 rounded-sm bg-green-500 border border-green-400"></div>
                  <div className="w-3 h-3 rounded-sm bg-green-400 border border-green-300"></div>
                </div>
                <span>More</span>
              </div>
            </motion.div><motion.div
              className="bg-gray-800/70 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50 shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Recent Submissions</h3>
                <motion.button
                  onClick={() => navigate('/home')}
                  className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  View all submissions →
                </motion.button>
              </div>

              <div className="space-y-4">
                {profileData.recentSubmissions.length === 0 ? (
                  <div className="text-center py-8">
                    <Code className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">No recent submissions found</p>
                    <p className="text-gray-500 text-sm">Start solving problems to see your progress here!</p>
                  </div>
                ) : (
                  profileData.recentSubmissions.map((submission, index) => (
                    <motion.div
                      key={submission.problemId}
                      className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600/50"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex items-center space-x-4">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <div>
                          <h4 className="text-white font-medium">{submission.problemTitle}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`text-xs px-2 py-1 rounded border ${getDifficultyBg(submission.difficulty)} ${getDifficultyColor(submission.difficulty)}`}>
                              {submission.difficulty.charAt(0).toUpperCase() + submission.difficulty.slice(1)}
                            </span>
                            <span className="text-xs text-gray-400">{submission.tags}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-400">
                          {new Date(submission.submittedAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {submission.language}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;