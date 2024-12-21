"use client";

import React, { useState, useEffect } from 'react';
import { IProject } from '@/types';
import { toast } from 'sonner';

interface UpdateProjectModalProps {
  project: Partial<IProject>;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedProject: IProject) => void;
}

const UpdateProjectModal: React.FC<UpdateProjectModalProps> = ({ project, isOpen, onClose, onUpdate }) => {
  const [formData, setFormData] = useState<Partial<IProject>>(project);
  const [loading, setLoading] = useState<boolean>(false);
  const [managers, setManagers] = useState<{ id: string; name: string }[]>([]); // List of available managers

  // Fetch the list of managers on component mount
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await fetch('/api/employees/getemployees');
        if (!response.ok) throw new Error('Failed to fetch managers');
        const data = await response.json();
        const managerOptions = data.map((employee: any) => ({
          id: employee.employeeId,
          name: `${employee.name} (${employee.role})`,
        }));
        setManagers(managerOptions);
      } catch (error) {
        console.error('Error fetching managers:', error);
        toast.error('Failed to fetch managers.');
      }
    };

    if (isOpen) {
      fetchManagers();
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const allowedFields = [
        'name', 
        'description', 
        'startDate', 
        'endDate', 
        'extendedDate', 
        'location', 
        'status', 
        'managerId' // 👈 Include managerId in allowed fields
      ];
  
      const filteredData = Object.fromEntries(
        Object.entries(formData).filter(([key]) => allowedFields.includes(key))
      );
  
      const response = await fetch(`/api/projects/${project._id}/update`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filteredData),
      });
  
      if (!response.ok) throw new Error('Failed to update project');
  
      const updatedProject: IProject = await response.json();
      onUpdate(updatedProject);
      toast.success('Project updated successfully!');
      onClose();
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Error updating project.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-2xl rounded-lg bg-white p-8 shadow-xl">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Update Project</h2>

        <div className="space-y-6">
          {/* Project Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Project Name</label>
            <input 
              type="text" 
              id="name"
              name="name" 
              value={formData.name || ''} 
              onChange={handleInputChange} 
              placeholder="Enter project name" 
              className="mt-1 w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Project Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Project Description</label>
            <textarea 
              id="description"
              name="description" 
              value={formData.description || ''} 
              onChange={handleInputChange} 
              placeholder="Enter project description" 
              rows={3}
              className="mt-1 w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
              <input 
                type="date" 
                id="startDate"
                name="startDate" 
                value={formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : ''} 
                onChange={handleInputChange} 
                className="mt-1 w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
              <input 
                type="date" 
                id="endDate"
                name="endDate" 
                value={formData.endDate ? new Date(formData.endDate).toISOString().split('T')[0] : ''} 
                onChange={handleInputChange} 
                className="mt-1 w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="extendedDate" className="block text-sm font-medium text-gray-700">Extended Date</label>
              <input 
                type="date" 
                id="extendedDate"
                name="extendedDate" 
                value={formData.extendedDate ? new Date(formData.extendedDate).toISOString().split('T')[0] : ''} 
                onChange={handleInputChange} 
                className="mt-1 w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Manager Selection */}
          <div>
            <label htmlFor="managerId" className="block text-sm font-medium text-gray-700">Manager</label>
            <select 
              id="managerId"
              name="managerId" 
              value={formData.managerId || ''} 
              onChange={handleInputChange} 
              className="mt-1 w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select a Manager</option>
              {managers.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
            <select 
              id="status"
              name="status" 
              value={formData.status || 'PLANNING'} 
              onChange={handleInputChange} 
              className="mt-1 w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="PLANNING">Planning</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-4">
          <button onClick={onClose} className="rounded-md bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-800">
            {loading ? 'Updating...' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateProjectModal;
