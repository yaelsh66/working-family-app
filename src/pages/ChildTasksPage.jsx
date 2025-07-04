// src/pages/ChildPage.jsx
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { useAuth } from '../context/AuthContext';
import { updateTaskAssignment, getTasksForChild, getTasksForFamily  } from '../api/firebaseTasks';

import TaskDraggable from '../components/TaskDraggable';
import AmountBox from '../components/AmountBox';

function ChildTasksPage() {
  const { user, loading } = useAuth();
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [error, setError] = useState('');

  const assignedTotal = assignedTasks.reduce((sum, task) => sum + (task.time || 0), 0);



  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const allTasks = await getTasksForFamily(user.familyId, user.token);
        const myTasks = await getTasksForChild(user.uid, user.familyId, user.token);

        const assignedIds = new Set(myTasks.map(t => t.id));
        const unassigned = allTasks.filter(t => !assignedIds.has(t.id));

        setAssignedTasks(myTasks);
        setAvailableTasks(unassigned);
      } catch (err) {
        console.error('Failed to load tasks:', err);
        setError('Could not load tasks.');
      }
    };

    fetchData();
  }, [user]);

 const onDragEnd = async (result) => {
  const { source, destination } = result;
  if (!destination) return;

  // 🛑 Dropped in the same spot
  if (
    source.droppableId === destination.droppableId &&
    source.index === destination.index
  ) {
    return;
  }

  // Clone both lists so we don't mutate state directly
  const assignedClone = [...assignedTasks];
  const availableClone = [...availableTasks];

  // Determine which lists we're moving from/to
  const sourceList =
    source.droppableId === 'assigned' ? assignedClone : availableClone;
  const destList =
    destination.droppableId === 'assigned' ? assignedClone : availableClone;

  const [movedTask] = sourceList.splice(source.index, 1);
  destList.splice(destination.index, 0, movedTask);

  // Update state
  if (source.droppableId === 'assigned') {
    setAssignedTasks(sourceList);
  } else {
    setAvailableTasks(sourceList);
  }

  if (destination.droppableId === 'assigned') {
    setAssignedTasks(destList);
  } else {
    setAvailableTasks(destList);
  }

  // Firestore update
  const newAssignedTo =
    destination.droppableId === 'assigned'
      ? [...(movedTask.assignedTo || []), user.uid]
      : (movedTask.assignedTo || []).filter((uid) => uid !== user.uid);

  try {
    await updateTaskAssignment(movedTask.id, newAssignedTo, user.token);
  } catch (err) {
    console.error('Failed to update task:', err);
  }
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
        <Alert variant="warning">🚫 Please log in.</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <h2 className="mb-4">👦 {user.email}'s Tasks</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <DragDropContext onDragEnd={onDragEnd}>
        <Row>
          <Col md={6}>
            <h4>Assigned Tasks</h4>
            <Droppable droppableId="assigned">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {assignedTasks.map((task, idx) => (
                    <TaskDraggable key={task.id} task={task} index={idx} isAssigned={true} />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </Col>

          <Col md={6}>
            <h4>Available Tasks</h4>
            <Droppable droppableId="available">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {availableTasks.map((task, idx) => (
                    <TaskDraggable key={task.id} task={task} index={idx} isAssigned={false} />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </Col>
        </Row>
      </DragDropContext>
      

<AmountBox
  label="Future Potential"
  amount={assignedTotal}
  variant="info"
  size="large"
  icon="💡"
/>
    </Container>
  );
}

export default ChildTasksPage;
