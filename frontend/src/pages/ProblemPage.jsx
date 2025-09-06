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
  Zap
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
    switch (difficulty) {
      case 'easy': return 'bg-green-500/20 border-green-500/50 text-green-400';
      case 'medium': return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400';
      case 'hard': return 'bg-red-500/20 border-red-500/50 text-red-400';
      default: return 'bg-gray-500/20 border-gray-500/50 text-gray-400';
    }
  };

  if (loading && !problem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex justify-center items-center">
        <div className="flex flex-col items-center space-y-4">
          <motion.div
            className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-gray-300 text-lg">Loading problem...</p>
        </div>
      </div>
    );
  }

  if (!loading && !problem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex justify-center items-center">
        <div className="flex flex-col items-center space-y-4">
          <motion.div
            className="w-16 h-16 bg-red-500/20 border border-red-500/50 rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <XCircle className="w-8 h-8 text-red-400" />
          </motion.div>
          <p className="text-red-400 text-lg font-semibold">Problem not found</p>
          <p className="text-gray-400 text-sm">The problem you're looking for doesn't exist or failed to load.</p>
          <motion.button
            onClick={() => navigate('/home')}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
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
                <span>Back to Problems</span>
              </motion.button>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Code className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                CodeOps
              </span>
            </div>
          </div>
        </div>
      </motion.header><div className="h-[calc(100vh-80px)] flex"><motion.div 
          className="w-1/2 flex flex-col border-r border-gray-700/50"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        ><div className="flex items-center bg-gray-800/70 border-b border-gray-700/50 px-6">
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
                  className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${
                    activeLeftTab === tab.id
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{tab.label}</span>
                </motion.button>
              );
            })}
          </div><div className="flex-1 overflow-y-auto p-6 bg-gray-800/30">
            {problem ? (
              <>
                {activeLeftTab === 'description' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  ><div className="mb-8">
                      <div className="flex items-center gap-4 mb-4">
                        <h1 className="text-2xl font-bold text-white">{problem.title || 'Untitled Problem'}</h1>
                        <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getDifficultyBadge(problem.difficulty || 'easy')}`}>
                          {(problem.difficulty || 'easy').charAt(0).toUpperCase() + (problem.difficulty || 'easy').slice(1)}
                        </span>
                        {problem.tags && (
                          <span className="inline-flex px-3 py-1 text-sm font-medium bg-blue-500/20 border border-blue-500/50 text-blue-300 rounded-full">
                            {Array.isArray(problem.tags) ? problem.tags.join(', ') : problem.tags}
                          </span>
                        )}
                      </div>
                    </div><div className="mb-8">
                      <div className="prose prose-invert max-w-none">
                        <div className="text-gray-300 text-base leading-relaxed whitespace-pre-wrap">
                          {problem.description || 'No description available.'}
                        </div>
                      </div>
                    </div>{problem.visibleTestCases && problem.visibleTestCases.length > 0 && (
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-white mb-6">Examples</h3>
                        <div className="space-y-6">
                          {problem.visibleTestCases.map((example, index) => (
                            <motion.div 
                              key={index} 
                              className="bg-gray-700/50 border border-gray-600/50 rounded-lg p-6"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                              <h4 className="font-semibold text-white mb-4">Example {index + 1}</h4>
                              <div className="space-y-3">
                                <div className="bg-gray-800/50 p-3 rounded border-l-4 border-blue-500">
                                  <span className="text-blue-400 font-medium text-sm">Input: </span>
                                  <pre className="text-gray-300 font-mono text-sm whitespace-pre-wrap inline">{example.input || 'No input'}</pre>
                                </div>
                                <div className="bg-gray-800/50 p-3 rounded border-l-4 border-green-500">
                                  <span className="text-green-400 font-medium text-sm">Output: </span>
                                  <span className="text-gray-300 font-mono text-sm">{example.output || 'No output'}</span>
                                </div>
                                {example.explanation && (
                                  <div className="bg-gray-800/50 p-3 rounded border-l-4 border-purple-500">
                                    <span className="text-purple-400 font-medium text-sm">Explanation: </span>
                                    <span className="text-gray-300 text-sm">{example.explanation}</span>
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
                    <h2 className="text-xl font-bold mb-6 text-white">Solutions</h2>
                    <div className="space-y-6">
                      {problem.referenceSolution?.map((solution, index) => (
                        <motion.div 
                          key={index} 
                          className="bg-gray-700/50 border border-gray-600/50 rounded-lg overflow-hidden"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <div className="bg-gray-600/50 px-6 py-3 border-b border-gray-600/50">
                            <h3 className="font-semibold text-white">{problem?.title} - {solution?.language}</h3>
                          </div>
                          <div className="p-6">
                            <pre className="bg-gray-800/70 p-4 rounded text-sm overflow-x-auto text-gray-300">
                              <code>{solution?.completeCode}</code>
                            </pre>
                          </div>
                        </motion.div>
                      )) || <p className="text-gray-400">Solutions will be available after you solve the problem.</p>}
                    </div>
                  </motion.div>
                )}

                {activeLeftTab === 'submissions' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className="text-xl font-bold mb-6 text-white">My Submissions</h2>
                    <div className="bg-gray-700/50 rounded-lg p-6">
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
                    <h2 className="text-xl font-bold mb-6 text-white">Chat with AI</h2>
                    <div className="bg-gray-700/50 rounded-lg p-6">
                      <ChatAi problem={problem}></ChatAi>
                    </div>
                  </motion.div>
                )}
            </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <motion.div
                    className="w-16 h-16 bg-gray-700/50 border border-gray-600/50 rounded-full flex items-center justify-center mx-auto mb-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <FileText className="w-8 h-8 text-gray-400" />
                  </motion.div>
                  <p className="text-gray-400 text-lg">No problem data available</p>
                  <p className="text-gray-500 text-sm">Please check your connection and try again.</p>
                </div>
              </div>
            )}
        </div>
        </motion.div><motion.div 
          className="w-1/2 flex flex-col"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        ><div className="flex items-center bg-gray-800/70 border-b border-gray-700/50 px-6">
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
                  className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${
                    activeRightTab === tab.id
                      ? 'border-green-500 text-green-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{tab.label}</span>
                </motion.button>
              );
            })}
          </div><div className="flex-1 flex flex-col bg-gray-800/30">
            {activeRightTab === 'code' && (
              <motion.div 
                className="flex-1 flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              ><div className="flex justify-between items-center p-4 border-b border-gray-700/50 bg-gray-800/50">
                  <div className="flex gap-2">
                    {['javascript', 'java', 'cpp'].map((lang) => (
                      <motion.button
                        key={lang}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                          selectedLanguage === lang
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                        onClick={() => handleLanguageChange(lang)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {displayNameMap[lang]}
                      </motion.button>
                    ))}
                  </div>
                </div><div className="flex-1 border border-gray-700/50 rounded-lg m-4 overflow-hidden">
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
                </div><div className="p-4 border-t border-gray-700/50 bg-gray-800/50 flex justify-between">
                  <div className="flex gap-2">
                    <motion.button 
                      className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
                      onClick={() => setActiveRightTab('testcase')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Terminal className="w-4 h-4" />
                      <span>Console</span>
                    </motion.button>
                  </div>
                  <div className="flex gap-3">
                    <motion.button
                      className={`flex items-center space-x-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg ${
                        loading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      onClick={handleRun}
                      disabled={loading}
                      whileHover={{ scale: loading ? 1 : 1.05 }}
                      whileTap={{ scale: loading ? 1 : 0.95 }}
                    >
                      {loading ? (
                        <motion.div
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      <span>Run</span>
                    </motion.button>
                    <motion.button
                      className={`flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg ${
                        loading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      onClick={handleSubmitCode}
                      disabled={loading}
                      whileHover={{ scale: loading ? 1 : 1.05 }}
                      whileTap={{ scale: loading ? 1 : 0.95 }}
                    >
                      {loading ? (
                        <motion.div
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
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
                <h3 className="text-lg font-semibold text-white mb-6">Test Results</h3>
                {runResult ? (
                  <motion.div 
                    className={`p-6 rounded-lg border ${
                      runResult.success 
                        ? 'bg-green-900/30 border-green-500/50 text-green-300' 
                        : 'bg-red-900/30 border-red-500/50 text-red-300'
                    }`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {runResult.success ? (
                      <div>
                        <div className="flex items-center space-x-2 mb-4">
                          <CheckCircle className="w-6 h-6 text-green-400" />
                          <h4 className="text-xl font-bold text-green-400">All test cases passed!</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="bg-gray-800/50 p-3 rounded-lg">
                            <span className="text-gray-400 text-sm">Runtime:</span>
                            <p className="text-green-300 font-semibold">{runResult.runtime + " sec"}</p>
                          </div>
                          <div className="bg-gray-800/50 p-3 rounded-lg">
                            <span className="text-gray-400 text-sm">Memory:</span>
                            <p className="text-green-300 font-semibold">{runResult.memory + " KB"}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          {runResult.testCases && runResult.testCases.length > 0 ? (
                            runResult.testCases.map((tc, i) => (
                              <motion.div 
                                key={i} 
                                className="bg-gray-700/50 border border-gray-600/50 rounded-lg p-4"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: i * 0.1 }}
                              >
                                <div className="font-mono text-sm space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-gray-400 font-medium">Input:</span>
                                    <span className="text-blue-300">{tc.stdin}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-gray-400 font-medium">Expected:</span>
                                    <span className="text-yellow-300">{tc.expected_output}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-gray-400 font-medium">Output:</span>
                                    <span className="text-green-300">{tc.stdout}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                    <span className="text-green-400 font-medium">Passed</span>
                                  </div>
                                </div>
                              </motion.div>
                            ))
                          ) : (
                            <div className="bg-gray-700/50 border border-gray-600/50 rounded-lg p-4">
                              <p className="text-gray-400">No test case results available</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center space-x-2 mb-4">
                          <XCircle className="w-6 h-6 text-red-400" />
                          <h4 className="text-xl font-bold text-red-400">Error</h4>
                        </div>
                        <div className="space-y-4">
                          {runResult.testCases && runResult.testCases.length > 0 ? (
                            runResult.testCases.map((tc, i) => (
                            <motion.div 
                              key={i} 
                              className="bg-gray-700/50 border border-gray-600/50 rounded-lg p-4"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: i * 0.1 }}
                            >
                              <div className="font-mono text-sm space-y-2">
                                <div className="flex items-center space-x-2">
                                  <span className="text-gray-400 font-medium">Input:</span>
                                  <span className="text-blue-300">{tc.stdin}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-gray-400 font-medium">Expected:</span>
                                  <span className="text-yellow-300">{tc.expected_output}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-gray-400 font-medium">Output:</span>
                                  <span className="text-red-300">{tc.stdout}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {tc.status_id == 3 ? (
                                    <>
                                      <CheckCircle className="w-4 h-4 text-green-400" />
                                      <span className="text-green-400 font-medium">Passed</span>
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="w-4 h-4 text-red-400" />
                                      <span className="text-red-400 font-medium">Failed</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ))
                          ) : (
                            <div className="bg-gray-700/50 border border-gray-600/50 rounded-lg p-4">
                              <p className="text-red-400">Error: {runResult.error || 'No test case results available'}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="text-center py-12">
                    <Terminal className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">Click "Run" to test your code</p>
                    <p className="text-gray-500 text-sm">Test your solution with the example test cases</p>
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
                <h3 className="text-lg font-semibold text-white mb-6">Submission Result</h3>
                {submitResult ? (
                  <motion.div 
                    className={`p-6 rounded-lg border ${
                      submitResult.accepted 
                        ? 'bg-green-900/30 border-green-500/50' 
                        : 'bg-red-900/30 border-red-500/50'
                    }`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {submitResult.accepted ? (
                      <div>
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="text-2xl font-bold text-green-400">Accepted</h4>
                            <p className="text-green-300">Congratulations! Your solution is correct.</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-gray-800/50 p-4 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <CheckCircle className="w-5 h-5 text-green-400" />
                              <span className="text-gray-400 text-sm">Test Cases</span>
                            </div>
                            <p className="text-green-300 text-xl font-bold">
                              {submitResult.passedTestCases}/{submitResult.totalTestCases}
                            </p>
                          </div>
                          
                          <div className="bg-gray-800/50 p-4 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <Clock className="w-5 h-5 text-blue-400" />
                              <span className="text-gray-400 text-sm">Runtime</span>
                            </div>
                            <p className="text-blue-300 text-xl font-bold">{submitResult.runtime + " sec"}</p>
                          </div>
                          
                          <div className="bg-gray-800/50 p-4 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <Zap className="w-5 h-5 text-purple-400" />
                              <span className="text-gray-400 text-sm">Memory</span>
                            </div>
                            <p className="text-purple-300 text-xl font-bold">{submitResult.memory + "KB"}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                            <XCircle className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="text-2xl font-bold text-red-400">{submitResult.error}</h4>
                            <p className="text-red-300">Your solution needs improvement.</p>
                          </div>
                        </div>
                        
                        <div className="bg-gray-800/50 p-4 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <XCircle className="w-5 h-5 text-red-400" />
                            <span className="text-gray-400 text-sm">Test Cases Passed</span>
                          </div>
                          <p className="text-red-300 text-xl font-bold">
                            {submitResult.passedTestCases}/{submitResult.totalTestCases}
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="text-center py-12">
                    <Send className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">Click "Submit" to submit your solution</p>
                    <p className="text-gray-500 text-sm">Your code will be evaluated against all test cases</p>
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