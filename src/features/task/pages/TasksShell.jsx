// src/features/tasks/pages/TasksShell.jsx
// Drop this into your router as the parent for the /tasks route.
// It manages which view is visible (list vs create/edit) without
// requiring react-router changes — but you can swap it for real routes if preferred.

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import TasksListPage from './TasksListPage';
import TaskCreation from './TaskCreation';
import { createTask, fetchTask, updateTask } from '../api/taskApi';

export default function TasksShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { taskId } = useParams();
  const isCreateRoute = location.pathname.endsWith('/new');
  const isEditRoute = Boolean(taskId) && !isCreateRoute;
  const [editTask, setEditTask] = useState(null);
  const [loadingTask, setLoadingTask] = useState(Boolean(taskId));

  useEffect(() => {
    let active = true;

    if (isCreateRoute && !taskId) {
      setEditTask(null);
      setLoadingTask(false);
      return () => {
        active = false;
      };
    }

    const loadTask = async () => {
      if (!taskId) {
        setLoadingTask(false);
        return;
      }

      try {
        setLoadingTask(true);
        const data = await fetchTask(taskId);
        if (active) {
          if (!data?.id) {
            setEditTask(null);
            navigate('/tasks');
            return;
          }

          setEditTask(data);
        }
      } catch {
        if (active) {
          setEditTask(null);
          navigate('/tasks');
        }
      } finally {
        if (active) {
          setLoadingTask(false);
        }
      }
    };

    loadTask();

    return () => {
      active = false;
    };
  }, [taskId, isCreateRoute, navigate]);

  function handleNewTask() {
    navigate('/tasks/new');
  }

  function handleEditTask(task) {
    if (task?.id) {
      navigate(`/tasks/${task.id}/edit`);
    }
  }

  function handleBack() {
    setEditTask(null);
    navigate('/tasks');
  }

  if (!taskId && !isCreateRoute) {
    return (
      <TasksListPage
        onNewTask={handleNewTask}
        onEditTask={handleEditTask}
      />
    );
  }

  if (taskId && loadingTask && !editTask) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: '#64748b' }}>
        Loading task...
      </div>
    );
  }

  // Both create and edit use TaskCreation — pass initialValues for edit
  return (
    <TaskCreation
      initialValues={editTask}   // null → create mode; task object → edit mode
      onCancel={handleBack}
      onSubmit={async (payload, formData) => {
        if (isEditRoute && editTask?.id) {
          await updateTask(editTask.id, formData);
        } else {
          await createTask(formData);
        }

        handleBack();
      }}
    />
  );
}
