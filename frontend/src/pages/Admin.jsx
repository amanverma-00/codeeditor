import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Video, ArrowLeft, Code, Database } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

function Admin() {
  const navigate = useNavigate();

  const adminOptions = [
    {
      id: 'create',
      title: 'Create Problem',
      description: 'Add a new coding problem to the platform',
      icon: Plus,
      route: '/admin/create',
      gradient: 'from-green-500/20 to-emerald-500/20',
      iconColor: '#4ade80'
    },
    {
      id: 'delete',
      title: 'Delete Problem',
      description: 'Remove problems from the platform',
      icon: Trash2,
      route: '/admin/delete',
      gradient: 'from-red-500/20 to-rose-500/20',
      iconColor: '#ef4444'
    },
    {
      id: 'video',
      title: 'Manage Videos',
      description: 'Upload and delete solution videos',
      icon: Video,
      route: '/admin/video',
      gradient: 'from-blue-500/20 to-cyan-500/20',
      iconColor: '#3b82f6'
    }
  ];

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

      {/* Scanline Effect */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(0, 255, 136, 0.1) 0px, transparent 2px)',
          backgroundSize: '100% 4px'
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
                onClick={() => navigate('/home')}
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
                <span>Back to Dashboard</span>
              </motion.button>
              
              <div className="flex items-center gap-3">
                <Code className="w-8 h-8" style={{ color: '#00ff88' }} />
                <div>
                  <h1 className="text-2xl font-bold" style={{ color: '#e0e0e0', fontFamily: 'Orbitron, monospace' }}>
                    ADMIN PANEL
                  </h1>
                  <p className="text-sm" style={{ color: '#808080' }}>
                    Manage platform content
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{
              backgroundColor: 'rgba(0, 255, 136, 0.1)',
              border: '1px solid rgba(0, 255, 136, 0.3)',
            }}>
              <Database className="w-4 h-4" style={{ color: '#00ff88' }} />
              <span className="text-sm font-medium" style={{ color: '#00ff88' }}>
                Administrator
              </span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 relative" style={{ zIndex: 1 }}>
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold mb-4" style={{ color: '#e0e0e0', fontFamily: 'Orbitron, monospace' }}>
            Content Management
          </h2>
          <p className="text-lg" style={{ color: '#808080' }}>
            Select an action to manage coding problems and solutions
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {adminOptions.map((option, index) => {
            const IconComponent = option.icon;
            return (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <NavLink to={option.route}>
                  <motion.div
                    className="rounded-2xl p-8 cursor-pointer h-full"
                    style={{
                      backgroundColor: 'rgba(10, 10, 15, 0.8)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(0, 255, 136, 0.2)',
                    }}
                    whileHover={{ 
                      scale: 1.05,
                      borderColor: 'rgba(0, 255, 136, 0.5)',
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex flex-col items-center text-center">
                      <motion.div
                        className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 bg-gradient-to-br ${option.gradient}`}
                        style={{
                          border: '2px solid rgba(0, 255, 136, 0.3)',
                        }}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <IconComponent className="w-10 h-10" style={{ color: option.iconColor }} />
                      </motion.div>

                      <h3 className="text-xl font-bold mb-3" style={{ color: '#e0e0e0' }}>
                        {option.title}
                      </h3>
                      
                      <p className="text-sm mb-6" style={{ color: '#808080' }}>
                        {option.description}
                      </p>

                      <motion.div
                        className="px-6 py-2 rounded-lg font-medium"
                        style={{
                          backgroundColor: 'rgba(0, 255, 136, 0.1)',
                          border: '1px solid rgba(0, 255, 136, 0.3)',
                          color: '#00ff88',
                        }}
                        whileHover={{ 
                          backgroundColor: 'rgba(0, 255, 136, 0.2)',
                        }}
                      >
                        Open
                      </motion.div>
                    </div>
                  </motion.div>
                </NavLink>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Admin;