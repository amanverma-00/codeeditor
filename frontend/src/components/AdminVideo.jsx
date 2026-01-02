import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Video, Upload, Trash2, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import axiosClient from '../utils/axiosClient';

const AdminVideo = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get('/problem/getAllProblem');
      setProblems(data);
    } catch (err) {
      setError('Failed to fetch problems');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    
    try {
      await axiosClient.delete(`/video/delete/${id}`);
      alert('Video deleted successfully');
      fetchProblems();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to delete video');
      console.log(err);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return '#4ade80';
      case 'medium': return '#fbbf24';
      case 'hard': return '#ef4444';
      default: return '#808080';
    }
  };

  const getDifficultyBg = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'rgba(74, 222, 128, 0.1)';
      case 'medium': return 'rgba(251, 191, 36, 0.1)';
      case 'hard': return 'rgba(239, 68, 68, 0.1)';
      default: return 'rgba(128, 128, 128, 0.1)';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0a0f' }}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: '#00ff88' }} />
          <p style={{ color: '#808080' }}>Loading problems...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: '#0a0a0f' }}>
      {/* Grid Background */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#00ff88 1px, transparent 1px), linear-gradient(90deg, #00ff88 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}
      />

      {/* Header */}
      <motion.header
        className="relative border-b"
        style={{
          backgroundColor: 'rgba(10, 10, 15, 0.8)',
          backdropFilter: 'blur(20px)',
          borderColor: 'rgba(0, 255, 136, 0.2)',
          zIndex: 10,
        }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
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
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Admin</span>
              </motion.button>
              
              <div className="flex items-center gap-3">
                <Video className="w-8 h-8" style={{ color: '#3b82f6' }} />
                <div>
                  <h1 className="text-2xl font-bold" style={{ color: '#e0e0e0', fontFamily: 'Orbitron, monospace' }}>
                    VIDEO MANAGEMENT
                  </h1>
                  <p className="text-sm" style={{ color: '#808080' }}>
                    Upload and manage solution videos
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 relative" style={{ zIndex: 1 }}>
        {error && (
          <motion.div
            className="mb-6 p-4 rounded-lg flex items-center gap-3"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle className="w-5 h-5" style={{ color: '#ef4444' }} />
            <span style={{ color: '#ef4444' }}>{error}</span>
          </motion.div>
        )}

        <motion.div
          className="rounded-2xl overflow-hidden"
          style={{
            backgroundColor: 'rgba(10, 10, 15, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 255, 136, 0.2)',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{
                backgroundColor: 'rgba(0, 255, 136, 0.05)',
                borderBottom: '1px solid rgba(0, 255, 136, 0.2)',
              }}>
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#e0e0e0' }}>#</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#e0e0e0' }}>Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#e0e0e0' }}>Difficulty</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#e0e0e0' }}>Tags</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#e0e0e0' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((problem, index) => (
                  <motion.tr
                    key={problem._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    style={{
                      borderBottom: '1px solid rgba(128, 128, 128, 0.1)',
                    }}
                    whileHover={{
                      backgroundColor: 'rgba(0, 255, 136, 0.05)',
                    }}
                  >
                    <td className="px-6 py-4" style={{ color: '#808080' }}>{index + 1}</td>
                    <td className="px-6 py-4" style={{ color: '#e0e0e0' }}>{problem.title}</td>
                    <td className="px-6 py-4">
                      <span 
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: getDifficultyBg(problem.difficulty),
                          color: getDifficultyColor(problem.difficulty),
                          border: `1px solid ${getDifficultyColor(problem.difficulty)}40`,
                        }}
                      >
                        {problem.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span 
                        className="px-3 py-1 rounded-full text-sm"
                        style={{
                          backgroundColor: 'rgba(0, 255, 136, 0.1)',
                          color: '#00ff88',
                          border: '1px solid rgba(0, 255, 136, 0.3)',
                        }}
                      >
                        {problem.tags}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <NavLink to={`/admin/upload/${problem._id}`}>
                          <motion.button
                            className="px-4 py-2 rounded-lg flex items-center gap-2"
                            style={{
                              backgroundColor: 'rgba(59, 130, 246, 0.1)',
                              border: '1px solid rgba(59, 130, 246, 0.3)',
                              color: '#3b82f6',
                            }}
                            whileHover={{
                              scale: 1.05,
                              backgroundColor: 'rgba(59, 130, 246, 0.2)',
                            }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Upload className="w-4 h-4" />
                            Upload
                          </motion.button>
                        </NavLink>
                        
                        <motion.button
                          onClick={() => handleDelete(problem._id)}
                          className="px-4 py-2 rounded-lg flex items-center gap-2"
                          style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#ef4444',
                          }}
                          whileHover={{
                            scale: 1.05,
                            backgroundColor: 'rgba(239, 68, 68, 0.2)',
                          }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminVideo;