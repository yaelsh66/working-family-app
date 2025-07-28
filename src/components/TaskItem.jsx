// src/components/TaskItem.jsx
import React, { useState } from 'react';
import { Card, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useTaskContext } from '../context/TaskContext';


function TaskItem({ task, isAssigned = false, onComplete, onStartUpdate }) {
  const { user } = useAuth();
  const { deleteTask} = useTaskContext();
  const isParent = user?.role === 'parent';

  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState({ ...task });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!onStartUpdate) return;
    setLoading(true);
    setError('');
    try {
      await onStartUpdate(task.id, editedTask);
      setIsEditing(false);
    } catch (err) {
      console.error('Update failed:', err);
      setError('❌ Failed to update task.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try{
      await deleteTask(task.id);
      setIsEditing(false);
    }catch (err) {
      console.error('Delete task failed: ', err);
    }
  };

  return (
    <Card className="mb-3 shadow-sm">
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        {isEditing ? (
          <>
            <Form.Group className="mb-2">
              <Form.Label>Title</Form.Label>
              <Form.Control
                name="title"
                value={editedTask.title}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Description</Form.Label>
              <Form.Control
                name="description"
                value={editedTask.description}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Time</Form.Label>
              <Form.Control
                name="time"
                type="number"
                value={editedTask.time}
                onChange={handleChange}
              />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button
                variant="success"
                size="sm"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? <Spinner size="sm" animation="border" /> : '💾 Save'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="ms-2"
                onClick={() => setIsEditing(false)}
              >
                ❌ Cancel
              </Button>
              <Button
                variant="delete"
                size="sm"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? <Spinner size="sm" animation="border" /> : 'Delete'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <Card.Title>{task.title}</Card.Title>
            <Card.Text>{task.description}</Card.Text>
            <Card.Text>
              <strong>Time:</strong> {task.time}
            </Card.Text>

            {isAssigned && onComplete && (
              <Button
                variant="outline-success"
                onClick={() => onComplete(task)}
                size="sm"
              >
                ✅ Complete
              </Button>
            )}

            {/* Moved Update logic out! */}
          </>
        )}

        {/* Add this button if onStartUpdate is provided */}
        {!isEditing && onStartUpdate  && (
          <Button
            variant="warning"
            size="sm"
            className="mt-2"
            onClick={() => setIsEditing(true)}
          >
            ✏️ Update
          </Button>
        )}
      </Card.Body>
    </Card>
  );
}

export default TaskItem;
