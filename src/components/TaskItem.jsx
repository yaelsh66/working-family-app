// src/components/TaskItem.jsx
import React from 'react';
import { Card, Button } from 'react-bootstrap';

function TaskItem({ task, isAssigned = false, onComplete }) {
  return (
    <Card className="mb-3 shadow-sm">
      <Card.Body>
        <Card.Title>{task.title}</Card.Title>
        <Card.Text>{task.description}</Card.Text>
        <Card.Text>
          <strong>Time:</strong> {task.time}
        </Card.Text>

        {/* Show complete button if task is assigned and onComplete callback exists */}
        {isAssigned && onComplete && (
          <Button
            variant="outline-success"
            onClick={() => onComplete(task)}
            size="sm"
          >
            ✅ Complete
          </Button>
        )}
      </Card.Body>
    </Card>
  );
}

export default TaskItem;
