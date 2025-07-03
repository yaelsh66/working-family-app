// src/components/TaskItem.jsx
import React from 'react';
import { Card } from 'react-bootstrap';


function TaskItem({ task , showCompleteButton}) {
  return (
    <Card className="mb-3 shadow-sm">
      <Card.Body>
        <Card.Title>{task.title}</Card.Title>
        <Card.Text>{task.description}</Card.Text>
        <Card.Text>
          <strong>Reward:</strong> ₪{task.amount}
        </Card.Text>
         
      </Card.Body>
    </Card>
  );
}

export default TaskItem;
