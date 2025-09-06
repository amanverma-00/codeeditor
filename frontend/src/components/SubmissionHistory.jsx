import { useState, useEffect } from 'react';
import axiosClient from '../utils/axiosClient';

const SubmissionHistory = ({ problemId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get(`/problem/submittedProblem/${problemId}`);

        if (Array.isArray(response.data)) {
          setSubmissions(response.data);
        } else {
          
          setSubmissions([]);
        }
        setError(null);
      } catch (err) {
        console.error('Fetch submissions error:', err);
        setError('Failed to fetch submission history');
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [problemId]);

  const formatMemory = (memory) => {
    if (memory < 1024) return `${memory} kB`;
    return `${(memory / 1024).toFixed(2)} MB`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-gray-400">Loading submission history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 my-4">
        <div className="flex items-center space-x-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-red-300">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-center text-white">Submission History</h2>
      
      {submissions.length === 0 ? (
        <div className="bg-gray-800/50 border border-gray-600/50 rounded-lg p-6 text-center">
          <div className="flex flex-col items-center space-y-4">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-16 w-16 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-gray-300 mb-2">No Submissions Yet</h3>
              <p className="text-gray-400">You haven't submitted any solutions for this problem yet.</p>
              <p className="text-gray-500 text-sm mt-2">Your submission history will appear here once you submit your first solution.</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-gray-800/50 border border-gray-600/50 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr className="text-left">
                    <th className="px-4 py-3 text-gray-300 font-semibold">#</th>
                    <th className="px-4 py-3 text-gray-300 font-semibold">Language</th>
                    <th className="px-4 py-3 text-gray-300 font-semibold">Status</th>
                    <th className="px-4 py-3 text-gray-300 font-semibold">Runtime</th>
                    <th className="px-4 py-3 text-gray-300 font-semibold">Memory</th>
                    <th className="px-4 py-3 text-gray-300 font-semibold">Test Cases</th>
                    <th className="px-4 py-3 text-gray-300 font-semibold">Submitted</th>
                    <th className="px-4 py-3 text-gray-300 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600/50">
                  {submissions.map((sub, index) => (
                    <tr key={sub._id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3 text-gray-300">{index + 1}</td>
                      <td className="px-4 py-3 font-mono text-blue-400">{sub.language}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          sub.status === 'accepted' 
                            ? 'bg-green-500/20 text-green-400' 
                            : sub.status === 'wrong'
                            ? 'bg-red-500/20 text-red-400'
                            : sub.status === 'error'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-gray-300">{sub.runtime}sec</td>
                      <td className="px-4 py-3 font-mono text-gray-300">{formatMemory(sub.memory)}</td>
                      <td className="px-4 py-3 font-mono text-gray-300">{sub.testCasesPassed}/{sub.testCasesTotal}</td>
                      <td className="px-4 py-3 text-gray-400 text-sm">{formatDate(sub.createdAt)}</td>
                      <td className="px-4 py-3">
                        <button 
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                          onClick={() => setSelectedSubmission(sub)}
                        >
                          View Code
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="mt-4 text-sm text-gray-400 text-center">
            Showing {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
          </p>
        </>
      )}

      {/* Code View Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-600 rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-600">
              <h3 className="text-xl font-bold text-white">
                Submission Details: <span className="text-blue-400">{selectedSubmission.language}</span>
              </h3>
              <button 
                className="text-gray-400 hover:text-white transition-colors"
                onClick={() => setSelectedSubmission(null)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex flex-wrap gap-3 mb-6">
                <span className={`px-3 py-1 rounded text-sm font-medium ${
                  selectedSubmission.status === 'accepted' 
                    ? 'bg-green-500/20 text-green-400' 
                    : selectedSubmission.status === 'wrong'
                    ? 'bg-red-500/20 text-red-400'
                    : selectedSubmission.status === 'error'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {selectedSubmission.status.charAt(0).toUpperCase() + selectedSubmission.status.slice(1)}
                </span>
                <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded text-sm">
                  Runtime: {selectedSubmission.runtime}s
                </span>
                <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded text-sm">
                  Memory: {formatMemory(selectedSubmission.memory)}
                </span>
                <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded text-sm">
                  Test Cases: {selectedSubmission.testCasesPassed}/{selectedSubmission.testCasesTotal}
                </span>
              </div>
              
              {selectedSubmission.errorMessage && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                  <h4 className="text-red-400 font-semibold mb-2">Error Message:</h4>
                  <p className="text-red-300 text-sm">{selectedSubmission.errorMessage}</p>
                </div>
              )}
              
              <div className="bg-gray-900 border border-gray-600 rounded-lg overflow-hidden">
                <div className="bg-gray-700/50 px-4 py-2 border-b border-gray-600">
                  <span className="text-gray-300 text-sm font-medium">Code</span>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <pre className="p-4 text-gray-100 text-sm">
                    <code>{selectedSubmission.code}</code>
                  </pre>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end p-6 border-t border-gray-600">
              <button 
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                onClick={() => setSelectedSubmission(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionHistory;