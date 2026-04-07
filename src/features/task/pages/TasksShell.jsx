// src/features/tasks/pages/TasksShell.jsx
// Drop this into your router as the parent for the /tasks route.
// It manages which view is visible (list vs create/edit) without
// requiring react-router changes — but you can swap it for real routes if preferred.

import React, { useState } from 'react';
import TasksListPage from './TasksListPage';
import TaskCreation from './TaskCreation';

export default function TasksShell() {
  // view: 'list' | 'create' | 'edit'
  const [view, setView] = useState('list');
  const [editTask, setEditTask] = useState(null);

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
        console.log(view === 'edit' ? 'Updating task:' : 'Creating task:', payload);
        console.log('Task multipart payload:', Array.from(formData.entries()));
        // TODO: POST or PATCH to your API, then:
        handleBack();
      }}
    />
  );
}
