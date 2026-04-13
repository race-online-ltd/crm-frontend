// src/features/tasks/pages/TasksShell.jsx
// Drop this into your router as the parent for the /tasks route.
// It manages which view is visible (list vs create/edit) without
// requiring react-router changes — but you can swap it for real routes if preferred.

import React, { useMemo, useState } from 'react';
import TasksListPage from './TasksListPage';
import TaskCreation from './TaskCreation';
import { useUserProfile } from '../../settings/context/UserProfileContext';
import { MOCK_TASKS } from '../data/mockTasks';
import { canAccessTask } from '../utils/taskAssignment';

function toDate(value) {
  return value ? new Date(value) : null;
}

export default function TasksShell() {
  const { profile } = useUserProfile();
  // view: 'list' | 'create' | 'edit'
  const [view, setView] = useState('list');
  const [editTask, setEditTask] = useState(null);
  const [tasks, setTasks] = useState(MOCK_TASKS);

  const visibleTasks = useMemo(
    () => tasks.filter((task) => canAccessTask(task, profile)),
    [profile, tasks],
  );

  function handleNewTask() {
    setEditTask(null);
    setView('create');
  }

  function handleEditTask(task) {
    setEditTask(task);
    setView('edit');
  }

  function handleBack() {
    setEditTask(null);
    setView('list');
  }

  if (view === 'list') {
    return (
      <TasksListPage
        tasks={visibleTasks}
        onTasksChange={setTasks}
        onNewTask={handleNewTask}
        onEditTask={handleEditTask}
      />
    );
  }

  // Both create and edit use TaskCreation — pass initialValues for edit
  return (
    <TaskCreation
      initialValues={editTask}   // null → create mode; task object → edit mode
      onCancel={handleBack}
      onSubmit={(payload, formData) => {
        const nextTask = {
          ...payload,
          id: editTask?.id || `task_${Date.now()}`,
          status: editTask?.status || 'pending',
          assocType: payload.leadId ? 'lead' : 'client',
          lead: payload.leadName || editTask?.lead || null,
          client: payload.clientName || editTask?.client || null,
          scheduledAt: toDate(payload.scheduledAt),
          location: payload.location || null,
          attachment: payload.attachment || [],
        };

        setTasks((prev) => (
          view === 'edit'
            ? prev.map((task) => (task.id === editTask?.id ? { ...task, ...nextTask } : task))
            : [nextTask, ...prev]
        ));

        console.log(view === 'edit' ? 'Updating task:' : 'Creating task:', payload);
        console.log('Task multipart payload:', Array.from(formData.entries()));
        // TODO: POST or PATCH to your API, then:
        handleBack();
      }}
    />
  );
}
