import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Plus, Trash2, ArrowLeft, Save, Code, FileText, TestTube, Eye, EyeOff } from 'lucide-react';
import axiosClient from '../utils/axiosClient';
import { useNavigate } from 'react-router';

const problemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.enum(['array', 'linkedList', 'graph', 'dp']),
  visibleTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required'),
      explanation: z.string().min(1, 'Explanation is required')
    })
  ).min(1, 'At least one visible test case required'),
  hiddenTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required')
    })
  ).min(1, 'At least one hidden test case required'),
  startCode: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      initialCode: z.string().min(1, 'Initial code is required')
    })
  ).length(3, 'All three languages required'),
  referenceSolution: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      completeCode: z.string().min(1, 'Complete code is required')
    })
  ).length(3, 'All three languages required')
});

function AdminPanel() {
  const navigate = useNavigate();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      startCode: [
        { language: 'C++', initialCode: '' },
        { language: 'Java', initialCode: '' },
        { language: 'JavaScript', initialCode: '' }
      ],
      referenceSolution: [
        { language: 'C++', completeCode: '' },
        { language: 'Java', completeCode: '' },
        { language: 'JavaScript', completeCode: '' }
      ]
    }
  });

  const {
    fields: visibleFields,
    append: appendVisible,
    remove: removeVisible
  } = useFieldArray({
    control,
    name: 'visibleTestCases'
  });

  const {
    fields: hiddenFields,
    append: appendHidden,
    remove: removeHidden
  } = useFieldArray({
    control,
    name: 'hiddenTestCases'
  });

  const onSubmit = async (data) => {
    try {
      await axiosClient.post('/problem/create', data);
      alert('Problem created successfully!');
      navigate('/admin');
    } catch (error) {
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

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
                <Plus className="w-8 h-8" style={{ color: '#4ade80' }} />
                <div>
                  <h1 className="text-2xl font-bold" style={{ color: '#e0e0e0', fontFamily: 'Orbitron, monospace' }}>
                    CREATE PROBLEM
                  </h1>
                  <p className="text-sm" style={{ color: '#808080' }}>
                    Add a new coding challenge
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 relative" style={{ zIndex: 1 }}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <motion.div
            className="rounded-2xl p-6"
            style={{
              backgroundColor: 'rgba(10, 10, 15, 0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 255, 136, 0.2)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <FileText className="w-5 h-5" style={{ color: '#00ff88' }} />
              <h2 className="text-xl font-semibold" style={{ color: '#e0e0e0' }}>Basic Information</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#e0e0e0' }}>
                  Title
                </label>
                <input
                  {...register('title')}
                  className="w-full px-4 py-3 rounded-lg outline-none transition-all"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: errors.title ? '1px solid #ef4444' : '1px solid rgba(128, 128, 128, 0.3)',
                    color: '#e0e0e0',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#00ff88'}
                  onBlur={(e) => e.target.style.borderColor = errors.title ? '#ef4444' : 'rgba(128, 128, 128, 0.3)'}
                />
                {errors.title && (
                  <span className="text-sm mt-1 block" style={{ color: '#ef4444' }}>
                    {errors.title.message}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#e0e0e0' }}>
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg outline-none transition-all"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: errors.description ? '1px solid #ef4444' : '1px solid rgba(128, 128, 128, 0.3)',
                    color: '#e0e0e0',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#00ff88'}
                  onBlur={(e) => e.target.style.borderColor = errors.description ? '#ef4444' : 'rgba(128, 128, 128, 0.3)'}
                />
                {errors.description && (
                  <span className="text-sm mt-1 block" style={{ color: '#ef4444' }}>
                    {errors.description.message}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#e0e0e0' }}>
                    Difficulty
                  </label>
                  <select
                    {...register('difficulty')}
                    className="w-full px-4 py-3 rounded-lg outline-none cursor-pointer"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(128, 128, 128, 0.3)',
                      color: '#e0e0e0',
                    }}
                  >
                    <option value="easy" style={{ backgroundColor: '#0a0a0f', color: '#4ade80' }}>Easy</option>
                    <option value="medium" style={{ backgroundColor: '#0a0a0f', color: '#fbbf24' }}>Medium</option>
                    <option value="hard" style={{ backgroundColor: '#0a0a0f', color: '#ef4444' }}>Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#e0e0e0' }}>
                    Tag
                  </label>
                  <select
                    {...register('tags')}
                    className="w-full px-4 py-3 rounded-lg outline-none cursor-pointer"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(128, 128, 128, 0.3)',
                      color: '#e0e0e0',
                    }}
                  >
                    <option value="array" style={{ backgroundColor: '#0a0a0f' }}>Array</option>
                    <option value="linkedList" style={{ backgroundColor: '#0a0a0f' }}>Linked List</option>
                    <option value="graph" style={{ backgroundColor: '#0a0a0f' }}>Graph</option>
                    <option value="dp" style={{ backgroundColor: '#0a0a0f' }}>DP</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Test Cases */}
          <motion.div
            className="rounded-2xl p-6"
            style={{
              backgroundColor: 'rgba(10, 10, 15, 0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 255, 136, 0.2)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <TestTube className="w-5 h-5" style={{ color: '#00ff88' }} />
              <h2 className="text-xl font-semibold" style={{ color: '#e0e0e0' }}>Test Cases</h2>
            </div>

            {/* Visible Test Cases */}
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" style={{ color: '#00ff88' }} />
                  <h3 className="font-medium" style={{ color: '#e0e0e0' }}>Visible Test Cases</h3>
                </div>
                <motion.button
                  type="button"
                  onClick={() => appendVisible({ input: '', output: '', explanation: '' })}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg"
                  style={{
                    backgroundColor: 'rgba(0, 255, 136, 0.1)',
                    border: '1px solid rgba(0, 255, 136, 0.3)',
                    color: '#00ff88',
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-4 h-4" />
                  Add Case
                </motion.button>
              </div>
              
              {visibleFields.map((field, index) => (
                <motion.div 
                  key={field.id} 
                  className="p-4 rounded-lg space-y-3"
                  style={{
                    backgroundColor: 'rgba(0, 255, 136, 0.05)',
                    border: '1px solid rgba(0, 255, 136, 0.2)',
                  }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium" style={{ color: '#808080' }}>Case {index + 1}</span>
                    <motion.button
                      type="button"
                      onClick={() => removeVisible(index)}
                      className="px-3 py-1 rounded-lg flex items-center gap-1"
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#ef4444',
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Trash2 className="w-3 h-3" />
                      Remove
                    </motion.button>
                  </div>
                  
                  <input
                    {...register(`visibleTestCases.${index}.input`)}
                    placeholder="Input"
                    className="w-full px-3 py-2 rounded-lg outline-none"
                    style={{
                      backgroundColor: 'rgba(10, 10, 15, 0.8)',
                      border: '1px solid rgba(128, 128, 128, 0.3)',
                      color: '#e0e0e0',
                    }}
                  />
                  
                  <input
                    {...register(`visibleTestCases.${index}.output`)}
                    placeholder="Output"
                    className="w-full px-3 py-2 rounded-lg outline-none"
                    style={{
                      backgroundColor: 'rgba(10, 10, 15, 0.8)',
                      border: '1px solid rgba(128, 128, 128, 0.3)',
                      color: '#e0e0e0',
                    }}
                  />
                  
                  <textarea
                    {...register(`visibleTestCases.${index}.explanation`)}
                    placeholder="Explanation"
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg outline-none"
                    style={{
                      backgroundColor: 'rgba(10, 10, 15, 0.8)',
                      border: '1px solid rgba(128, 128, 128, 0.3)',
                      color: '#e0e0e0',
                    }}
                  />
                </motion.div>
              ))}
            </div>

            {/* Hidden Test Cases */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <EyeOff className="w-4 h-4" style={{ color: '#808080' }} />
                  <h3 className="font-medium" style={{ color: '#e0e0e0' }}>Hidden Test Cases</h3>
                </div>
                <motion.button
                  type="button"
                  onClick={() => appendHidden({ input: '', output: '' })}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg"
                  style={{
                    backgroundColor: 'rgba(128, 128, 128, 0.1)',
                    border: '1px solid rgba(128, 128, 128, 0.3)',
                    color: '#808080',
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-4 h-4" />
                  Add Case
                </motion.button>
              </div>
              
              {hiddenFields.map((field, index) => (
                <motion.div 
                  key={field.id} 
                  className="p-4 rounded-lg space-y-3"
                  style={{
                    backgroundColor: 'rgba(128, 128, 128, 0.05)',
                    border: '1px solid rgba(128, 128, 128, 0.2)',
                  }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium" style={{ color: '#808080' }}>Hidden Case {index + 1}</span>
                    <motion.button
                      type="button"
                      onClick={() => removeHidden(index)}
                      className="px-3 py-1 rounded-lg flex items-center gap-1"
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#ef4444',
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Trash2 className="w-3 h-3" />
                      Remove
                    </motion.button>
                  </div>
                  
                  <input
                    {...register(`hiddenTestCases.${index}.input`)}
                    placeholder="Input"
                    className="w-full px-3 py-2 rounded-lg outline-none"
                    style={{
                      backgroundColor: 'rgba(10, 10, 15, 0.8)',
                      border: '1px solid rgba(128, 128, 128, 0.3)',
                      color: '#e0e0e0',
                    }}
                  />
                  
                  <input
                    {...register(`hiddenTestCases.${index}.output`)}
                    placeholder="Output"
                    className="w-full px-3 py-2 rounded-lg outline-none"
                    style={{
                      backgroundColor: 'rgba(10, 10, 15, 0.8)',
                      border: '1px solid rgba(128, 128, 128, 0.3)',
                      color: '#e0e0e0',
                    }}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Code Templates */}
          <motion.div
            className="rounded-2xl p-6"
            style={{
              backgroundColor: 'rgba(10, 10, 15, 0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 255, 136, 0.2)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <Code className="w-5 h-5" style={{ color: '#00ff88' }} />
              <h2 className="text-xl font-semibold" style={{ color: '#e0e0e0' }}>Code Templates</h2>
            </div>
            
            <div className="space-y-6">
              {[0, 1, 2].map((index) => (
                <div key={index} className="space-y-3">
                  <h3 className="font-semibold" style={{ color: '#00ff88' }}>
                    {index === 0 ? 'C++' : index === 1 ? 'Java' : 'JavaScript'}
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#808080' }}>
                      Initial Code
                    </label>
                    <textarea
                      {...register(`startCode.${index}.initialCode`)}
                      rows={6}
                      className="w-full px-4 py-3 rounded-lg outline-none font-mono text-sm"
                      style={{
                        backgroundColor: 'rgba(10, 10, 15, 0.8)',
                        border: '1px solid rgba(128, 128, 128, 0.3)',
                        color: '#e0e0e0',
                      }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#808080' }}>
                      Reference Solution
                    </label>
                    <textarea
                      {...register(`referenceSolution.${index}.completeCode`)}
                      rows={6}
                      className="w-full px-4 py-3 rounded-lg outline-none font-mono text-sm"
                      style={{
                        backgroundColor: 'rgba(10, 10, 15, 0.8)',
                        border: '1px solid rgba(128, 128, 128, 0.3)',
                        color: '#e0e0e0',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-semibold"
            style={{
              backgroundColor: 'rgba(0, 255, 136, 0.2)',
              border: '1px solid rgba(0, 255, 136, 0.5)',
              color: '#00ff88',
            }}
            whileHover={{ 
              scale: 1.02,
              backgroundColor: 'rgba(0, 255, 136, 0.3)',
            }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Save className="w-5 h-5" />
            Create Problem
          </motion.button>
        </form>
      </div>
    </div>
  );
}

export default AdminPanel;