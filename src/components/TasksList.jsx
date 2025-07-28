// src/components/TasksList.jsx
import React, { useEffect, useState } from 'react';
import { Container, Spinner, Alert, ListGroup } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

import TaskItem from './TaskItem';
import { useTaskContext } from '../context/TaskContext';

function TasksList() {
  const { allFamilyTasks: tasks, refreshTasks } = useTaskContext();

  const { user, loading } = useAuth();
  
  const [error, setError] = useState('');

  const handleUpdateTask = async (taskId, updatedData) => {
  await updateTask(taskId, {
    title: updatedData.title,
    description: updatedData.description,
    time: +updatedData.time,
  }, user.token);
  
  await refreshTasks(); // context will update
};


  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (!user) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">🚫 Please log in to view tasks.</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-5" style={{ maxWidth: '800px' }}>
      <h2 className="mb-4">📋 Task List</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {tasks.length === 0 ? (
        <Alert variant="info">No tasks available yet.</Alert>
      ) : (
        <ListGroup>
          {tasks.map((task, idx) => (
            <ListGroup.Item key={idx}>
              <TaskItem task={task} onStartUpdate={handleUpdateTask} />
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </Container>
  );
}

export default TasksList;