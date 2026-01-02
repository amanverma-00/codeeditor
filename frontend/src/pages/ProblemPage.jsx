import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Play, 
  Send, 
  Code, 
  FileText, 
  MessageSquare, 
  History, 
  Lightbulb,
  ArrowLeft,
  Clock,
  Database,
  CheckCircle,
  XCircle,
  RotateCcw,
  Terminal,
  Trophy,
  Zap,
  Copy,
  Check,
  Video,
  PlayCircle
} from 'lucide-react';
import axiosClient from "../utils/axiosClient"
import SubmissionHistory from "../components/SubmissionHistory"
import ChatAi from '../components/ChatAi';

const langMap = {
    cpp: 'c++',
    java: 'java', 
    javascript: 'javascript'
};

const displayNameMap = {
    cpp: 'C++',
    java: 'Java',
    javascript: 'JavaScript'
};

const normalizeLanguage = (dbLang) => {
    const lang = dbLang.toLowerCase();
    if (lang === 'c++' || lang === 'cpp') return 'cpp';
    if (lang === 'java') return 'java';
    if (lang === 'javascript' || lang === 'js') return 'javascript';
    return 'javascript'; 
};

const defaultStarterCode = {
    'cpp': '// C++ starter code\nclass Solution {\npublic:\n    // Your solution here\n};',
    'java': '// Java starter code\nclass Solution {\n    // Your solution here\n}',
    'javascript': '// JavaScript starter code\nvar solution = function() {\n    // Your solution here\n};'
};

const ProblemPage = () => {
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('code');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [videoSolution, setVideoSolution] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const editorRef = useRef(null);
  const navigate = useNavigate();
  let {problemId}  = useParams();

  const { handleSubmit } = useForm();

 useEffect(() => {
    const fetchProblem = async () => {
      if (!problemId) {
        console.error('Problem ID is missing');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await axiosClient.get(`/problem/problemById/${problemId}`);
        
        if (!response.data) {
          throw new Error('No problem data received');
        }

        if (!response.data.startCode || !Array.isArray(response.data.startCode)) {
          throw new Error('Invalid problem data: missing startCode');
        }

        let startCodeEntry = response.data.startCode.find(sc => {
          const normalizedScLang = normalizeLanguage(sc.language);
          return normalizedScLang === selectedLanguage;
        });
        
        console.log('Available languages:', response.data.startCode.map(sc => sc.language));
        console.log('Looking for language:', selectedLanguage);
        console.log('Found matching entry:', !!startCodeEntry);
        
        if (!startCodeEntry) {
          console.log('No exact match found, using first available language');
          startCodeEntry = response.data.startCode[0];
          if (startCodeEntry) {
            const fallbackLang = normalizeLanguage(startCodeEntry.language);
            console.log('Setting fallback language to:', fallbackLang);
            setSelectedLanguage(fallbackLang);
          }
        }
        
        if (startCodeEntry && startCodeEntry.initialCode) {
          setCode(startCodeEntry.initialCode);
        } else {
          setCode(defaultStarterCode[selectedLanguage] || '// No starter code available');
        }

        setProblem(response.data);
        setLoading(false);
        
      } catch (error) {
        console.error('Error fetching problem:', error);
        setLoading(false);

        setProblem({
          title: 'Error Loading Problem',
          description: 'Failed to load problem data. Please try refreshing the page.',
          difficulty: 'easy',
          tags: 'array',
          visibleTestCases: [],
          startCode: [
            {
              language: 'JavaScript',
              initialCode: '// Error loading - please refresh'
            }
          ]
        });
        setCode('// Error loading starter code - please refresh the page');
      }
    };

    fetchProblem();
  }, [problemId]);

  useEffect(() => {
    const fetchVideo = async () => {
      if (!problemId) return;
      
      setVideoLoading(true);
      try {
        const response = await axiosClient.get(`/video/${problemId}`);
        setVideoSolution(response.data.video);
      } catch (error) {
        // Video not found is okay - not all problems have videos
        if (error.response?.status !== 404) {
          console.error('Error fetching video:', error);
        }
        setVideoSolution(null);
      } finally {
        setVideoLoading(false);
      }
    };

    fetchVideo();
  }, [problemId]);

  useEffect(() => {
    if (problem && problem.startCode && Array.isArray(problem.startCode)) {
      const startCodeEntry = problem.startCode.find(sc => {
        const normalizedScLang = normalizeLanguage(sc.language);
        return normalizedScLang === selectedLanguage;
      });
      
      if (startCodeEntry && startCodeEntry.initialCode) {
        setCode(startCodeEntry.initialCode);
      } else {
        setCode(defaultStarterCode[selectedLanguage] || '// No starter code available');
      }
    }
  }, [selectedLanguage, problem]);

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const handleRun = async () => {
    setLoading(true);
    setRunResult(null);
    
    try {
      const response = await axiosClient.post(`/submission/run/${problemId}`, {
        code,
        language: selectedLanguage
      });

      setRunResult(response.data);
      setLoading(false);
      setActiveRightTab('testcase');
      
    } catch (error) {
      console.error('Error running code:', error);
      setRunResult({
        success: false,
        error: 'Internal server error'
      });
      setLoading(false);
      setActiveRightTab('testcase');
    }
  };

  const handleSubmitCode = async () => {
    setLoading(true);
    setSubmitResult(null);
    
    try {
        const response = await axiosClient.post(`/submission/submit/${problemId}`, {
        code:code,
        language: selectedLanguage
      });

       setSubmitResult(response.data);
       setLoading(false);
       setActiveRightTab('result');
      
    } catch (error) {
      console.error('Error submitting code:', error);
      setSubmitResult(null);
      setLoading(false);
      setActiveRightTab('result');
    }
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case 'javascript': return 'javascript';
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      default: return 'javascript';
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

  const getDifficultyBadge = (difficulty) => {
    const baseStyle = 'inline-flex px-3 py-1 text-sm font-medium rounded-full';
    switch (difficulty) {
      case 'easy': 
        return `${baseStyle} bg-green-500/10 border border-green-500/30 text-green-400`;
      case 'medium': 
        return `${baseStyle} bg-yellow-500/10 border border-yellow-500/30 text-yellow-400`;
      case 'hard': 
        return `${baseStyle} bg-red-500/10 border border-red-500/30 text-red-400`;
      default: 
        return `${baseStyle} bg-gray-500/10 border border-gray-500/30 text-gray-400`;
    }
  };

  const handleCopyCode = async (code, index) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  if (loading && !problem) {
    return (
      <div 
        className="min-h-screen flex justify-center items-center"
        style={{
          fontFamily: "'IBM Plex Mono', 'Fira Code', monospace",
          backgroundColor: '#0a0a0f',
        }}
      >
        <div className="flex flex-col items-center space-y-4">
          <motion.div
            className="w-12 h-12 rounded-full"
            style={{
              border: '4px solid rgba(0, 255, 136, 0.3)',
              borderTopColor: '#00ff88',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-lg" style={{ color: '#e0e0e0' }}>Loading problem...</p>
        </div>
      </div>
    );
  }

  if (!loading && !problem) {
    return (
      <div 
        className="min-h-screen flex justify-center items-center"
        style={{
          fontFamily: "'IBM Plex Mono', 'Fira Code', monospace",
          backgroundColor: '#0a0a0f',
        }}
      >
        <div className="flex flex-col items-center space-y-4">
          <motion.div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <XCircle className="w-8 h-8" style={{ color: '#ef4444' }} />
          </motion.div>
          <p className="text-lg font-semibold" style={{ color: '#ef4444' }}>Problem not found</p>
          <p className="text-sm" style={{ color: '#808080' }}>The problem you're looking for doesn't exist or failed to load.</p>
          <motion.button
            onClick={() => navigate('/home')}
            className="mt-4 px-6 py-2 rounded-lg transition-all"
            style={{
              backgroundColor: '#00ff88',
              color: '#0a0a0f',
              fontWeight: '600',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Back to Problems
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen text-[#e0e0e0]"
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

      <motion.header 
        className="sticky top-0 px-8 py-6"
        style={{ 
          zIndex: 40,
          backgroundColor: 'rgba(10, 10, 15, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 255, 136, 0.1)',
        }}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.button
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 transition-all"
            style={{ color: '#808080' }}
            whileHover={{ scale: 1.05, color: '#00ff88' }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Problems</span>
          </motion.button>
          
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #00ff88 0%, #00cc70 100%)',
              }}
            >
              <Code className="w-5 h-5" style={{ color: '#0a0a0f' }} />
            </div>
            <span 
              className="text-xl font-bold"
              style={{ 
                fontFamily: "'Orbitron', sans-serif",
                color: '#e0e0e0',
              }}
            >
              CODEOPS
            </span>
          </div>
        </div>
      </motion.header>

      <div className="h-[calc(100vh-80px)] flex gap-4 px-8 py-6" style={{ position: 'relative', zIndex: 10 }}>
        <motion.div 
          className="w-1/2 flex flex-col rounded-2xl overflow-hidden"
          style={{
            backgroundColor: 'rgba(10, 10, 15, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 255, 136, 0.2)',
          }}
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >

          <div className="flex items-center px-6" style={{ borderBottom: '1px solid rgba(0, 255, 136, 0.1)' }}>
            {[
              { id: 'description', label: 'Description', icon: FileText },
              { id: 'solutions', label: 'Solutions', icon: Code },
              { id: 'submissions', label: 'Submissions', icon: History },
              { id: 'chatAI', label: 'AI Chat', icon: MessageSquare }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveLeftTab(tab.id)}
                  className="flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all"
                  style={{
                    borderBottom: activeLeftTab === tab.id ? '2px solid #00ff88' : '2px solid transparent',
                    color: activeLeftTab === tab.id ? '#00ff88' : '#808080',
                    backgroundColor: activeLeftTab === tab.id ? 'rgba(0, 255, 136, 0.05)' : 'transparent',
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    backgroundColor: activeLeftTab === tab.id ? 'rgba(0, 255, 136, 0.05)' : 'rgba(0, 255, 136, 0.02)',
                    color: '#00ff88',
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{tab.label}</span>
                </motion.button>
              );
            })}
          </div>

<div className="flex-1 overflow-y-auto p-6">
            {problem ? (
              <>
                {activeLeftTab === 'description' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >

                    <div className="mb-8">
                      <div className="flex items-center gap-4 mb-4">
                        <h1 className="text-2xl font-bold" style={{ color: '#e0e0e0' }}>{problem.title || 'Untitled Problem'}</h1>
                        <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getDifficultyBadge(problem.difficulty || 'easy')}`}>
                          {(problem.difficulty || 'easy').charAt(0).toUpperCase() + (problem.difficulty || 'easy').slice(1)}
                        </span>
                        {problem.tags && (
                          <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full" style={{
                            backgroundColor: 'rgba(0, 255, 136, 0.1)',
                            border: '1px solid rgba(0, 255, 136, 0.2)',
                            color: '#00ff88',
                          }}>
                            {Array.isArray(problem.tags) ? problem.tags.join(', ') : problem.tags}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mb-8">
                      <div className="prose prose-invert max-w-none">
                        <div className="text-base leading-relaxed whitespace-pre-wrap" style={{ color: '#b0b0b0' }}>
                          {problem.description || 'No description available.'}
                        </div>
                      </div>
                    </div>

                    {problem.visibleTestCases && problem.visibleTestCases.length > 0 && (
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-6" style={{ color: '#e0e0e0' }}>Examples</h3>
                        <div className="space-y-6">
                          {problem.visibleTestCases.map((example, index) => (
                            <motion.div 
                              key={index} 
                              className="rounded-lg p-6"
                              style={{
                                backgroundColor: 'rgba(0, 255, 136, 0.05)',
                                border: '1px solid rgba(0, 255, 136, 0.2)',
                              }}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                              <h4 className="font-semibold mb-4" style={{ color: '#00ff88' }}>Example {index + 1}</h4>
                              <div className="space-y-3">
                                <div className="p-3 rounded" style={{ 
                                  backgroundColor: 'rgba(10, 10, 15, 0.6)', 
                                  borderLeft: '4px solid #00ff88' 
                                }}>
                                  <span className="font-medium text-sm" style={{ color: '#00ff88' }}>Input: </span>
                                  <pre className="font-mono text-sm whitespace-pre-wrap inline" style={{ color: '#e0e0e0' }}>{example.input || 'No input'}</pre>
                                </div>
                                <div className="p-3 rounded" style={{ 
                                  backgroundColor: 'rgba(10, 10, 15, 0.6)', 
                                  borderLeft: '4px solid #00ff88' 
                                }}>
                                  <span className="font-medium text-sm" style={{ color: '#00ff88' }}>Output: </span>
                                  <span className="font-mono text-sm" style={{ color: '#e0e0e0' }}>{example.output || 'No output'}</span>
                                </div>
                                {example.explanation && (
                                  <div className="p-3 rounded" style={{ 
                                    backgroundColor: 'rgba(10, 10, 15, 0.6)', 
                                    borderLeft: '4px solid rgba(0, 255, 136, 0.5)' 
                                  }}>
                                    <span className="font-medium text-sm" style={{ color: '#00ff88' }}>Explanation: </span>
                                    <span className="text-sm" style={{ color: '#b0b0b0' }}>{example.explanation}</span>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeLeftTab === 'solutions' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className="text-xl font-bold mb-6" style={{ color: '#e0e0e0' }}>Solutions</h2>
                    <div className="space-y-6">
                      
                      {/* Video Solution Section */}
                      {videoLoading ? (
                        <motion.div 
                          className="rounded-lg p-6 text-center"
                          style={{
                            backgroundColor: 'rgba(0, 255, 136, 0.05)',
                            border: '1px solid rgba(0, 255, 136, 0.2)',
                          }}
                        >
                          <p style={{ color: '#808080' }}>Loading video solution...</p>
                        </motion.div>
                      ) : videoSolution ? (
                        <motion.div 
                          className="rounded-lg overflow-hidden"
                          style={{
                            backgroundColor: 'rgba(0, 255, 136, 0.05)',
                            border: '1px solid rgba(0, 255, 136, 0.2)',
                          }}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="px-6 py-3 flex items-center gap-3" style={{ 
                            backgroundColor: 'rgba(0, 255, 136, 0.1)', 
                            borderBottom: '1px solid rgba(0, 255, 136, 0.2)' 
                          }}>
                            <Video className="w-5 h-5" style={{ color: '#00ff88' }} />
                            <h3 className="font-semibold" style={{ color: '#00ff88' }}>Video Solution</h3>
                            <span className="text-sm ml-auto" style={{ color: '#808080' }}>
                              Duration: {Math.floor(videoSolution.duration / 60)}:{String(Math.floor(videoSolution.duration % 60)).padStart(2, '0')}
                            </span>
                          </div>
                          <div className="p-6">
                            <div className="relative rounded-lg overflow-hidden" style={{ backgroundColor: '#000' }}>
                              <video 
                                controls 
                                className="w-full"
                                style={{ maxHeight: '400px' }}
                                poster={videoSolution.thumbnailUrl}
                              >
                                <source src={videoSolution.secureUrl} type="video/mp4" />
                                Your browser does not support the video tag.
                              </video>
                            </div>
                            <p className="text-sm mt-3" style={{ color: '#808080' }}>
                              Uploaded: {new Date(videoSolution.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </motion.div>
                      ) : null}

                      {/* Code Solutions Section */}
                      {problem.referenceSolution?.map((solution, index) => (
                        <motion.div 
                          key={index} 
                          className="rounded-lg overflow-hidden"
                          style={{
                            backgroundColor: 'rgba(0, 255, 136, 0.05)',
                            border: '1px solid rgba(0, 255, 136, 0.2)',
                          }}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <div className="px-6 py-3 flex items-center justify-between" style={{ 
                            backgroundColor: 'rgba(0, 255, 136, 0.1)', 
                            borderBottom: '1px solid rgba(0, 255, 136, 0.2)' 
                          }}>
                            <h3 className="font-semibold" style={{ color: '#00ff88' }}>{problem?.title} - {solution?.language}</h3>
                            <motion.button
                              onClick={() => handleCopyCode(solution?.completeCode, index)}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-md transition-all"
                              style={{
                                backgroundColor: copiedIndex === index ? 'rgba(0, 255, 136, 0.2)' : 'rgba(0, 255, 136, 0.1)',
                                border: '1px solid rgba(0, 255, 136, 0.3)',
                                color: copiedIndex === index ? '#00ff88' : '#e0e0e0'
                              }}
                              whileHover={{ 
                                scale: 1.05,
                                backgroundColor: 'rgba(0, 255, 136, 0.2)'
                              }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {copiedIndex === index ? (
                                <>
                                  <Check className="w-4 h-4" />
                                  <span className="text-sm">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4" />
                                  <span className="text-sm">Copy Code</span>
                                </>
                              )}
                            </motion.button>
                          </div>
                          <div className="p-6">
                            <pre className="p-4 rounded text-sm overflow-x-auto" style={{ 
                              backgroundColor: 'rgba(10, 10, 15, 0.8)', 
                              color: '#e0e0e0' 
                            }}>
                              <code>{solution?.completeCode}</code>
                            </pre>
                          </div>
                        </motion.div>
                      )) || <p style={{ color: '#808080' }}>Solutions will be available after you solve the problem.</p>}
                    </div>
                  </motion.div>
                )}

                {activeLeftTab === 'submissions' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className="text-xl font-bold mb-6" style={{ color: '#e0e0e0' }}>My Submissions</h2>
                    <div className="rounded-lg p-6" style={{
                      backgroundColor: 'rgba(0, 255, 136, 0.05)',
                      border: '1px solid rgba(0, 255, 136, 0.2)',
                    }}>
                      <SubmissionHistory problemId={problemId} />
                    </div>
                  </motion.div>
                )}

                {activeLeftTab === 'chatAI' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="prose prose-invert max-w-none"
                  >
                    <h2 className="text-xl font-bold mb-6" style={{ color: '#e0e0e0' }}>Chat with AI</h2>
                    <div className="rounded-lg p-6" style={{
                      backgroundColor: 'rgba(0, 255, 136, 0.05)',
                      border: '1px solid rgba(0, 255, 136, 0.2)',
                    }}>
                      <ChatAi problem={problem}></ChatAi>
                    </div>
                  </motion.div>
                )}
            </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <motion.div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{
                      backgroundColor: 'rgba(0, 255, 136, 0.1)',
                      border: '1px solid rgba(0, 255, 136, 0.3)',
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <FileText className="w-8 h-8" style={{ color: '#00ff88' }} />
                  </motion.div>
                  <p className="text-lg" style={{ color: '#808080' }}>No problem data available</p>
                  <p className="text-sm" style={{ color: '#606060' }}>Please check your connection and try again.</p>
                </div>
              </div>
            )}
        </div>
        </motion.div>

        <motion.div 
          className="w-1/2 flex flex-col rounded-2xl overflow-hidden"
          style={{
            backgroundColor: 'rgba(10, 10, 15, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 255, 136, 0.2)',
          }}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >

          <div className="flex items-center px-6" style={{ borderBottom: '1px solid rgba(0, 255, 136, 0.1)' }}>
            {[
              { id: 'code', label: 'Code', icon: Code },
              { id: 'testcase', label: 'Test Cases', icon: Play },
              { id: 'result', label: 'Results', icon: CheckCircle }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveRightTab(tab.id)}
                  className="flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all"
                  style={{
                    borderBottom: activeRightTab === tab.id ? '2px solid #00ff88' : '2px solid transparent',
                    color: activeRightTab === tab.id ? '#00ff88' : '#808080',
                    backgroundColor: activeRightTab === tab.id ? 'rgba(0, 255, 136, 0.05)' : 'transparent',
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    backgroundColor: activeRightTab === tab.id ? 'rgba(0, 255, 136, 0.05)' : 'rgba(0, 255, 136, 0.02)',
                    color: '#00ff88',
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{tab.label}</span>
                </motion.button>
              );
            })}
          </div>

          <div className="flex-1 flex flex-col">
            {activeRightTab === 'code' && (
              <motion.div 
                className="flex-1 flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >

                <div className="flex justify-between items-center p-4" style={{ borderBottom: '1px solid rgba(0, 255, 136, 0.1)' }}>
                  <div className="flex gap-2">
                    {['javascript', 'java', 'cpp'].map((lang) => (
                      <motion.button
                        key={lang}
                        className="px-3 py-1.5 text-sm font-medium rounded-lg transition-all"
                        style={{
                          backgroundColor: selectedLanguage === lang ? '#00ff88' : 'rgba(0, 255, 136, 0.1)',
                          color: selectedLanguage === lang ? '#0a0a0f' : '#00ff88',
                          border: selectedLanguage === lang ? 'none' : '1px solid rgba(0, 255, 136, 0.2)',
                        }}
                        onClick={() => handleLanguageChange(lang)}
                        whileHover={{ scale: 1.05, backgroundColor: selectedLanguage === lang ? '#00ff88' : 'rgba(0, 255, 136, 0.15)' }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {displayNameMap[lang]}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 rounded-lg m-4 overflow-hidden" style={{ border: '1px solid rgba(0, 255, 136, 0.2)' }}>
                  <Editor
                    height="100%"
                    language={getLanguageForMonaco(selectedLanguage)}
                    value={code}
                    onChange={handleEditorChange}
                    onMount={handleEditorDidMount}
                    theme="vs-dark"
                    options={{
                      fontSize: 14,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                      insertSpaces: true,
                      wordWrap: 'on',
                      lineNumbers: 'on',
                      glyphMargin: false,
                      folding: true,
                      lineDecorationsWidth: 10,
                      lineNumbersMinChars: 3,
                      renderLineHighlight: 'line',
                      selectOnLineNumbers: true,
                      roundedSelection: false,
                      readOnly: false,
                      cursorStyle: 'line',
                      mouseWheelZoom: true,
                      padding: { top: 16, bottom: 16 },
                      fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
                    }}
                  />
                </div>

                <div className="p-4 flex justify-between" style={{ borderTop: '1px solid rgba(0, 255, 136, 0.1)' }}>
                  <div className="flex gap-2">
                    <motion.button 
                      className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
                      style={{
                        color: '#808080',
                        border: '1px solid rgba(0, 255, 136, 0.2)',
                      }}
                      onClick={() => setActiveRightTab('testcase')}
                      whileHover={{ scale: 1.05, backgroundColor: 'rgba(0, 255, 136, 0.1)', color: '#00ff88' }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Terminal className="w-4 h-4" />
                      <span>Console</span>
                    </motion.button>
                  </div>
                  <div className="flex gap-3">
                    <motion.button
                      className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all"
                      style={{
                        backgroundColor: loading ? 'rgba(0, 255, 136, 0.5)' : '#00ff88',
                        color: '#0a0a0f',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.5 : 1,
                      }}
                      onClick={handleRun}
                      disabled={loading}
                      whileHover={{ scale: loading ? 1 : 1.05 }}
                      whileTap={{ scale: loading ? 1 : 0.95 }}
                    >
                      {loading ? (
                        <motion.div
                          className="w-4 h-4 rounded-full"
                          style={{
                            border: '2px solid #0a0a0f',
                            borderTopColor: 'transparent',
                          }}
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      <span>Run</span>
                    </motion.button>
                    <motion.button
                      className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all"
                      style={{
                        backgroundColor: loading ? 'rgba(0, 255, 136, 0.7)' : 'rgba(0, 255, 136, 0.8)',
                        color: '#0a0a0f',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.5 : 1,
                      }}
                      onClick={handleSubmitCode}
                      disabled={loading}
                      whileHover={{ scale: loading ? 1 : 1.05 }}
                      whileTap={{ scale: loading ? 1 : 0.95 }}
                    >
                      {loading ? (
                        <motion.div
                          className="w-4 h-4 rounded-full"
                          style={{
                            border: '2px solid #0a0a0f',
                            borderTopColor: 'transparent',
                          }}
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      <span>Submit</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeRightTab === 'testcase' && (
              <motion.div 
                className="flex-1 p-6 overflow-y-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="text-lg font-semibold mb-6" style={{ color: '#e0e0e0' }}>Test Results</h3>
                {runResult ? (
                  <motion.div 
                    className="p-6 rounded-lg"
                    style={{
                      backgroundColor: runResult.success ? 'rgba(0, 255, 136, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      border: runResult.success ? '1px solid rgba(0, 255, 136, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                    }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {runResult.success ? (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <CheckCircle className="w-6 h-6" style={{ color: '#00ff88' }} />
                          <h4 className="text-xl font-bold" style={{ color: '#00ff88' }}>All test cases passed!</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(10, 10, 15, 0.6)' }}>
                            <span className="text-sm" style={{ color: '#808080' }}>Runtime:</span>
                            <p className="font-semibold" style={{ color: '#00ff88' }}>{runResult.runtime + " sec"}</p>
                          </div>
                          <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(10, 10, 15, 0.6)' }}>
                            <span className="text-sm" style={{ color: '#808080' }}>Memory:</span>
                            <p className="font-semibold" style={{ color: '#00ff88' }}>{runResult.memory + " KB"}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          {runResult.testCases && runResult.testCases.length > 0 ? (
                            runResult.testCases.map((tc, i) => (
                              <motion.div 
                                key={i} 
                                className="rounded-lg p-4"
                                style={{
                                  backgroundColor: 'rgba(0, 255, 136, 0.05)',
                                  border: '1px solid rgba(0, 255, 136, 0.2)',
                                }}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: i * 0.1 }}
                              >
                                <div className="font-mono text-sm space-y-2">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium" style={{ color: '#808080' }}>Input:</span>
                                    <span style={{ color: '#00ff88' }}>{tc.stdin}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium" style={{ color: '#808080' }}>Expected:</span>
                                    <span style={{ color: '#e0e0e0' }}>{tc.expected_output}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium" style={{ color: '#808080' }}>Output:</span>
                                    <span style={{ color: '#00ff88' }}>{tc.stdout}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" style={{ color: '#00ff88' }} />
                                    <span className="font-medium" style={{ color: '#00ff88' }}>Passed</span>
                                  </div>
                                </div>
                              </motion.div>
                            ))
                          ) : (
                            <div className="rounded-lg p-4" style={{
                              backgroundColor: 'rgba(0, 255, 136, 0.05)',
                              border: '1px solid rgba(0, 255, 136, 0.2)',
                            }}>
                              <p style={{ color: '#808080' }}>No test case results available</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <XCircle className="w-6 h-6" style={{ color: '#ef4444' }} />
                          <h4 className="text-xl font-bold" style={{ color: '#ef4444' }}>Error</h4>
                        </div>
                        <div className="space-y-4">
                          {runResult.testCases && runResult.testCases.length > 0 ? (
                            runResult.testCases.map((tc, i) => (
                            <motion.div 
                              key={i} 
                              className="rounded-lg p-4"
                              style={{
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                              }}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: i * 0.1 }}
                            >
                              <div className="font-mono text-sm space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium" style={{ color: '#808080' }}>Input:</span>
                                  <span style={{ color: '#00ff88' }}>{tc.stdin}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium" style={{ color: '#808080' }}>Expected:</span>
                                  <span style={{ color: '#e0e0e0' }}>{tc.expected_output}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium" style={{ color: '#808080' }}>Output:</span>
                                  <span style={{ color: '#ef4444' }}>{tc.stdout}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {tc.status_id == 3 ? (
                                    <>
                                      <CheckCircle className="w-4 h-4" style={{ color: '#00ff88' }} />
                                      <span className="font-medium" style={{ color: '#00ff88' }}>Passed</span>
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="w-4 h-4" style={{ color: '#ef4444' }} />
                                      <span className="font-medium" style={{ color: '#ef4444' }}>Failed</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ))
                          ) : (
                            <div className="rounded-lg p-4" style={{
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                              border: '1px solid rgba(239, 68, 68, 0.2)',
                            }}>
                              <p style={{ color: '#ef4444' }}>Error: {runResult.error || 'No test case results available'}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="text-center py-12">
                    <Terminal className="w-16 h-16 mx-auto mb-4" style={{ color: '#606060' }} />
                    <p className="text-lg" style={{ color: '#808080' }}>Click "Run" to test your code</p>
                    <p className="text-sm" style={{ color: '#606060' }}>Test your solution with the example test cases</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeRightTab === 'result' && (
              <motion.div 
                className="flex-1 p-6 overflow-y-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="text-lg font-semibold mb-6" style={{ color: '#e0e0e0' }}>Submission Result</h3>
                {submitResult ? (
                  <motion.div 
                    className="p-6 rounded-lg"
                    style={{
                      backgroundColor: submitResult.accepted ? 'rgba(0, 255, 136, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      border: submitResult.accepted ? '1px solid rgba(0, 255, 136, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                    }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {submitResult.accepted ? (
                      <div>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#00ff88' }}>
                            <Trophy className="w-6 h-6" style={{ color: '#0a0a0f' }} />
                          </div>
                          <div>
                            <h4 className="text-2xl font-bold" style={{ color: '#00ff88' }}>Accepted</h4>
                            <p style={{ color: '#b0b0b0' }}>Congratulations! Your solution is correct.</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(10, 10, 15, 0.6)' }}>
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="w-5 h-5" style={{ color: '#00ff88' }} />
                              <span className="text-sm" style={{ color: '#808080' }}>Test Cases</span>
                            </div>
                            <p className="text-xl font-bold" style={{ color: '#00ff88' }}>
                              {submitResult.passedTestCases}/{submitResult.totalTestCases}
                            </p>
                          </div>
                          
                          <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(10, 10, 15, 0.6)' }}>
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="w-5 h-5" style={{ color: '#00ff88' }} />
                              <span className="text-sm" style={{ color: '#808080' }}>Runtime</span>
                            </div>
                            <p className="text-xl font-bold" style={{ color: '#00ff88' }}>{submitResult.runtime + " sec"}</p>
                          </div>
                          
                          <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(10, 10, 15, 0.6)' }}>
                            <div className="flex items-center gap-2 mb-2">
                              <Zap className="w-5 h-5" style={{ color: '#00ff88' }} />
                              <span className="text-sm" style={{ color: '#808080' }}>Memory</span>
                            </div>
                            <p className="text-xl font-bold" style={{ color: '#00ff88' }}>{submitResult.memory + "KB"}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#ef4444' }}>
                            <XCircle className="w-6 h-6" style={{ color: '#ffffff' }} />
                          </div>
                          <div>
                            <h4 className="text-2xl font-bold" style={{ color: '#ef4444' }}>{submitResult.error}</h4>
                            <p style={{ color: '#b0b0b0' }}>Your solution needs improvement.</p>
                          </div>
                        </div>
                        
                        <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(10, 10, 15, 0.6)' }}>
                          <div className="flex items-center gap-2 mb-2">
                            <XCircle className="w-5 h-5" style={{ color: '#ef4444' }} />
                            <span className="text-sm" style={{ color: '#808080' }}>Test Cases Passed</span>
                          </div>
                          <p className="text-xl font-bold" style={{ color: '#ef4444' }}>
                            {submitResult.passedTestCases}/{submitResult.totalTestCases}
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="text-center py-12">
                    <Send className="w-16 h-16 mx-auto mb-4" style={{ color: '#606060' }} />
                    <p className="text-lg" style={{ color: '#808080' }}>Click "Submit" to submit your solution</p>
                    <p className="text-sm" style={{ color: '#606060' }}>Your code will be evaluated against all test cases</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProblemPage;