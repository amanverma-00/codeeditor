import React, { useState } from 'react';
import { Plus, Edit, Trash2, Home, RefreshCw, Zap,Video } from 'lucide-react';
import { NavLink } from 'react-router-dom';

function Admin() {
  const [selectedOption, setSelectedOption] = useState(null);

  const adminOptions = [
    {
      id: 'create',
      title: 'Create Problem',
      description: 'Add a new coding problem to the platform',
      icon: Plus,
      color: 'btn-success',
      bgColor: 'bg-success/10',
      route: '/admin/create'
    },
    {
      id: 'update',
      title: 'Update Problem',
      description: 'Edit existing problems and their details',
      icon: Edit,
      color: 'btn-warning',
      bgColor: 'bg-warning/10',
      route: '/admin/update'
    },
    {
      id: 'delete',
      title: 'Delete Problem',
      description: 'Remove problems from the platform',
      icon: Trash2,
      color: 'btn-error',
      bgColor: 'bg-error/10',
      route: '/admin/delete'
    },
    {
      id: 'video',
      title: 'Video Problem',
      description: 'Upload And Delete Videos',
      icon: Video,
      color: 'btn-success',
      bgColor: 'bg-success/10',
      route: '/admin/video'
    }
  ];

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8"><div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-base-content mb-4">
            Admin Panel
          </h1>
          <p className="text-base-content/70 text-lg">
            Manage coding problems on your platform
          </p>
        </div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {adminOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <div
                key={option.id}
                className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
              >
                <div className="card-body items-center text-center p-8"><div className={`${option.bgColor} p-4 rounded-full mb-4`}>
                    <IconComponent size={32} className="text-base-content" />
                  </div><h2 className="card-title text-xl mb-2">
                    {option.title}
                  </h2><p className="text-base-content/70 mb-6">
                    {option.description}
                  </p><div className="card-actions">
                    <div className="card-actions">
                    <NavLink 
                    to={option.route}
                   className={`btn ${option.color} btn-wide`}
                   >
                   {option.title}
                   </NavLink>
                   </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default Admin;