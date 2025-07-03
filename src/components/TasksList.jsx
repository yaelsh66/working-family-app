// src/components/TaskList.jsx
import React, { useEffect, useState } from 'react';
import { Container, Spinner, Alert, ListGroup } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { getTasksForFamily } from '../api/firebaseAuth';
import TaskItem from './TaskItem';

function TasksList() {
  const { user, loading } = useAuth();
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
              <TaskItem task={task}  />
            </ListGroup.Item>
          ))}
        </ListGroup>
        
      )}
    </Container>
  );
}

export default TasksList;
