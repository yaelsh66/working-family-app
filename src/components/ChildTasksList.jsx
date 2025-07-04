// src/components/TaskList.jsx
import React, { useEffect, useState } from 'react';
import { Container, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { getTasksForChild } from '../api/firebaseTasks';
import TaskItem from './TaskItem';

function ChildTasksList() {
  const { user, loading } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    const fetchTasks = async () => {
      try {
        const tasksData = await getTasksForChild(user.uid, user.familyId, user.token);
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

  const handleComplete = async (task) => {
  try {
    await addToPendingTime(task.time);  // ✅ update time context
    await sendApprovalRequest(task.parentId, task, user.uid, user.token);  // ✅ send to parent
    alert("✅ Task submitted for approval!");
  } catch (err) {
    console.error("❌ Failed to complete task:", err);
  }
};

  return (
    <Container className="mt-5" style={{ maxWidth: '800px' }}>
      <h2 className="mb-4">📋 Task List</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {tasks.length === 0 ? (
        <Alert variant="info">No tasks available yet.</Alert>
      ) : (
        tasks.map((task, idx) => (
          <div>
        <TaskItem key={idx} task={task} />
         <Button variant="outline-primary" onClick={() => handleComplete(task)}>
      ✅ Complete
        </Button>
        </div>
      ))
      )}
    </Container>
  );
}

export default ChildTasksList;
