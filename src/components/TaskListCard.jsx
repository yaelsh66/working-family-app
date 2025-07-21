import React from 'react';
import { Card } from 'react-bootstrap';

const TaskListCard = ({ title, children }) => (
  <Card className="mb-4 shadow-sm" style={{ minHeight: '400px' }}>
    <Card.Header as="h5" className="bg-primary text-white">
      {title}
    </Card.Header>
    <Card.Body>{children}</Card.Body>
  </Card>
);

export default TaskListCard;
