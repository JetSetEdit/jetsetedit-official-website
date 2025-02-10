'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StripeSyncStatus } from '@/components/StripeSyncStatus';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Project {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  status: 'Active' | 'Completed' | 'On Hold' | 'Cancelled';
  startDate: string;
  dueDate: string | null;
  description: string;
  createdAt: string;
}

interface ActionDropdownProps {
  project: Project;
  onAction: (action: string) => void;
  position?: 'left' | 'right';
}

function ActionDropdown({ project, onAction, position = 'right' }: ActionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getAvailableActions = () => {
    const actions = [];

    if (project.status === 'Active') {
      actions.push({ key: 'complete', label: 'Mark Complete' });
      actions.push({ key: 'hold', label: 'Put On Hold' });
    }

    if (project.status === 'On Hold') {
      actions.push({ key: 'activate', label: 'Resume Project' });
    }

    if (project.status !== 'Cancelled' && project.status !== 'Completed') {
      actions.push({ key: 'cancel', label: 'Cancel Project' });
    }

    actions.push({ key: 'edit', label: 'Edit Details' });

    return actions;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100 focus:outline-none"
      >
        Actions
        <svg
          className="w-4 h-4 ml-1 inline-block"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={`absolute z-20 mt-2 ${position === 'right' ? 'right-0' : 'left-0'} w-48 bg-white rounded-md shadow-lg py-1 border`}
          >
            {getAvailableActions().map(({ key, label }) => (
              <button
                key={key}
                onClick={() => {
                  onAction(key);
                  setIsOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  const { data: session, status } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date>();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      const data = await response.json();
      setProjects(data);
      setLastSyncTime(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProjects();
    }
  }, [status]);

  const handleCreateProject = () => {
    // Will implement project creation modal
    toast.info('Project creation will be implemented soon');
  };

  const handleAction = async (project: Project, action: string) => {
    try {
      let newStatus: Project['status'];
      switch (action) {
        case 'complete':
          newStatus = 'Completed';
          break;
        case 'hold':
          newStatus = 'On Hold';
          break;
        case 'activate':
          newStatus = 'Active';
          break;
        case 'cancel':
          newStatus = 'Cancelled';
          break;
        case 'edit':
          setSelectedProject(project);
          setShowEditModal(true);
          return;
        default:
          return;
      }

      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update project');
      }

      toast.success('Project updated successfully');
      fetchProjects();
    } catch (err) {
      toast.error('Failed to update project');
      console.error(err);
    }
  };

  const getStatusBadgeVariant = (status: Project['status']) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Completed':
        return 'default';
      case 'On Hold':
        return 'warning';
      case 'Cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto py-10">
        <Card className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading projects...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Projects</h1>
            <div className="mt-2">
              <StripeSyncStatus
                onRefresh={fetchProjects}
                lastSyncTime={lastSyncTime}
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              title="Filter projects by status"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <Button onClick={handleCreateProject}>
              Create Project
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects
                .filter(project => filterStatus === 'all' || project.status === filterStatus)
                .map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>{project.clientName}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(project.status)}>
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(project.startDate), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      {project.dueDate ? format(new Date(project.dueDate), 'MMM d, yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(project.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <ActionDropdown
                          project={project}
                          onAction={(action) => handleAction(project, action)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
              ))}
              {projects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500">
                    No projects found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Project Edit Modal will be implemented here */}
    </div>
  );
} 