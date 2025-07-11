// src/components/TasksList.jsx
import React, { useEffect, useState } from 'react';
import { Container, Spinner, Alert, ListGroup } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { getTasksForFamily, updateTask } from '../api/firebaseTasks';
import TaskItem from './TaskItem';
import { useTaskContext } from '../context/TaskContext';

function TasksList() {
  const { user, loading } = useAuth();
  const { refreshTasks } = useTaskContext();
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    const fetchTasks = async () => {
      try {
        const tasksData = await getTasksForFamily(user.familyId, user.token);
        setTasks(tasksData);
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
        setError('Could not load tasks.');
      }
    };

    fetchTasks();
  }, [user]);

  const handleUpdateTask = async (taskId, updatedData) => {
    await updateTask(taskId, {
      title: updatedData.title,
      description: updatedData.description,
      time: +updatedData.time,
    }, user.token);
    setTasks((prevTasks) =>
    prevTasks.map((task) =>
      task.id === taskId ? { ...task, ...updatedData } : task
    )
  );
    await refreshTasks();
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
